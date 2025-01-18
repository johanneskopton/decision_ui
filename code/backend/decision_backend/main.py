"""
Main web application

This module creates a fastapi app and configures its route.
"""

from contextlib import asynccontextmanager
import logging
import os

from typing import List

from sqlalchemy.orm import Session
from fastapi import Body, Depends, FastAPI, Query, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi_users.authentication.transport.bearer import BearerResponse

from decision_backend import __VERSION__
from decision_backend.env import (
    DSUI_CORS_HEADERS,
    DSUI_CORS_METHODS,
    DSUI_CORS_ORIGINS,
    DSUI_R_MAX_BINS,
    DSUI_R_MAX_MCRUNS,
)
from decision_backend.rest import schema
from decision_backend.baklava.evaluate.run import ExecutionError, run_baklava_model
from decision_backend.rest.authenticate import initialize_user_authentication
from decision_backend.rest.schema import ExecutionErrorMessage, UserCreate, UserRead, UserUpdate
from decision_backend.database.schema import User
from decision_backend.database.session import create_db_and_tables
from decision_backend.baklava.common.schema import (
    BaklavaModel,
    DecisionSupportEVPIResult,
    DecisionSupportHistogramResult,
)
from decision_backend.rest.crud import models
from decision_backend.database.session import get_db


logging.basicConfig(
    level=os.environ.get("DSUI_LOG_LEVEL", "INFO"),
    format="%(asctime)s %(levelname)s:%(name)s:%(message)s",
)
logging.getLogger("aiosqlite").setLevel(logging.INFO)  # disable debug logging of database connection

logger = logging.getLogger(__name__)


def create_app():
    """Return a new configured fastapi app."""

    @asynccontextmanager
    async def lifespan(_app: FastAPI):
        """Contextmanager that is called when the app is initialized and destroyed."""
        logger.debug("app is initializing")
        await create_db_and_tables()
        try:
            yield
        finally:
            logger.debug("app is stopped")
            # do cleanup stuff when app is destroyed

    app = FastAPI(
        title="Decision Support UI Backend API",
        description="Stores user data and decision support models",
        version=__VERSION__,
        lifespan=lifespan,
    )

    # initialize user authentication backend
    fastapi_users = initialize_user_authentication()
    current_active_user = fastapi_users.current_user(active=True)
    auth_backend = fastapi_users.authenticator.backends[0]

    # add CORS middleware
    app.add_middleware(
        CORSMiddleware,
        allow_origins=[DSUI_CORS_ORIGINS],
        allow_credentials=True,
        allow_methods=[DSUI_CORS_METHODS],
        allow_headers=[DSUI_CORS_HEADERS],
    )

    # add fastapi JWT authentication routes
    app.include_router(
        fastapi_users.get_auth_router(auth_backend),
        prefix="/api/auth/jwt",
        tags=["authentication"],
    )

    # add additional refresh route such that used can stay logged in indefinitely
    @app.post("/api/auth/jwt/refresh", tags=["authentication"])
    async def refresh_login_token(user: User = Depends(current_active_user)) -> BearerResponse:
        """Return a new token for users that are already logged in."""
        return await auth_backend.login(auth_backend.get_strategy(), user)

    # add fastapi user registration route
    app.include_router(
        fastapi_users.get_register_router(UserRead, UserCreate),
        prefix="/api/auth",
        tags=["authentication"],
    )

    # add fastapi user access routes
    app.include_router(
        fastapi_users.get_users_router(UserRead, UserUpdate),
        prefix="/api/users",
        tags=["users"],
    )

    # define how exceptions of type ExecutionError are serialized
    @app.exception_handler(ExecutionError)
    async def unicorn_exception_handler(_request: Request, error: ExecutionError):
        """Return serialized execution error as JSON response.

        Parameters
        ----------
        error: ExecutionError
            the error that was thrown somewhere in this app

        Returns
        -------
        JSONResponse
            the serialized error
        """
        return JSONResponse(
            status_code=500,
            content=ExecutionErrorMessage(
                reason=error.reason, r_script=error.r_script, estimates=error.estimates, stderr=error.stderr
            ),
        )

    # add route that performs Monte Carlo simulation in R
    @app.post(
        "/api/v1/monte_carlo",
        tags=["models"],
        summary="Perform Monte Carlo simulation for a Model",
        responses={
            200: {
                "description": """the result histograms loaded from the CSV file that was generated by the
                    decisionSupport package"""
            },
            500: {
                "description": """execution error that might be caused by a incorrect translation to R-code, exceeding
                    limits of the number of MC runs, or other R related errors""",
                "model": ExecutionErrorMessage,
            },
        },
    )
    def monte_carlo(
        model: BaklavaModel = Body(
            None, description="""the Baklava model that is translated into R-code and simulated"""
        ),
        mc_runs: int = Query(
            50000,
            description="""the number of Monte Carlo runs that are performed to generate the result histograms
          (minimum 1, maximum of environment variable `DSUI_R_MAX_MCRUNS`)""",
        ),
        bins: int = Query(
            100,
            description="""the number of histogram bins that are used to generate the result histograms
          (minimum of 1, maximum of environment variable `DSUI_R_MAX_BINS`)""",
        ),
        _user: User = Depends(current_active_user),
    ) -> DecisionSupportHistogramResult:
        """Perform and return the results of a Monte Carlo simulation for a Baklava model."""
        if mc_runs < 1 or mc_runs > DSUI_R_MAX_MCRUNS:
            raise ExecutionError(
                f"number of Monte Carlo runs needs to be between 1 and {DSUI_R_MAX_MCRUNS}", None, None, None
            )
        if bins < 1 or bins > DSUI_R_MAX_BINS:
            raise ExecutionError(
                f"number of histogram bins needs to be between 1 and {DSUI_R_MAX_BINS}", None, None, None
            )
        return run_baklava_model(model, mc_runs, bins, do_evpi=False)

    # add route that performs EVPI calculation in R
    @app.post(
        "/api/v1/evpi",
        tags=["models"],
        summary="Calculate EVPI for a Model",
        responses={
            200: {
                "description": """the evpi calculation results as a nested dictionary indexed by the names of all
                    result variables followed by the names of all estimate variables"""
            },
            500: {
                "description": """execution error that might be caused by a incorrect translation to R-code, exceeding
                    limits of the number of MC runs, or other R related errors""",
                "model": ExecutionErrorMessage,
            },
        },
    )
    def evpi(
        model: BaklavaModel = Body(
            None, description="""the Baklava model that is translated into R-code and simulated"""
        ),
        mc_runs: int = Query(
            1000,
            description="""the number of Monte Carlo runs that are performed to generate the EVPI results
          (minimum 1, maximum of environment variable `DSUI_R_MAX_MCRUNS`)""",
        ),
        _user: User = Depends(current_active_user),
    ) -> DecisionSupportEVPIResult:
        """Perform and return the results of an EVPI calculation for a Baklava model."""
        if mc_runs < 1 or mc_runs > DSUI_R_MAX_MCRUNS:
            raise ExecutionError(
                f"number of Monte Carlo runs needs to be between 1 and {DSUI_R_MAX_MCRUNS}", None, None, None
            )
        return run_baklava_model(model, mc_runs, 0, do_evpi=True)

    # add route that saves model to database
    @app.post("/api/v1/decision_model/", response_model=schema.DecisionModel, tags=["models"])
    async def create_item_for_user(
        decision_model: schema.DecisionModelCreate,
        db: Session = Depends(get_db),
        user: User = Depends(current_active_user),
    ):
        """Save Baklava model in the database."""
        return await models.create_user_decision_model(db=db, decision_model=decision_model, user=user)

    # add route that returns saved models
    @app.get("/api/v1/decision_models/", response_model=List[schema.DecisionModel], tags=["models"])
    async def read_decision_models(db: Session = Depends(get_db), user: User = Depends(current_active_user)):
        """Return all models for a user from the database."""
        return await models.get_user_decision_models(db, user)

    # add route that deletes a model
    @app.delete("/api/v1/decision_models/{decision_model_id}", tags=["models"])
    async def delete_decision_model(
        decision_model_id: int,
        db: Session = Depends(get_db),
        user: User = Depends(current_active_user),
    ):
        """Delete a single model from the database."""
        return await models.delete_decision_model(db, user, decision_model_id)

    return app
