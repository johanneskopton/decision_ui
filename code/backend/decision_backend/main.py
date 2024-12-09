from contextlib import asynccontextmanager
import logging
import os

from typing import List

from sqlalchemy.orm import Session
from fastapi import Depends, FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi_users.authentication.transport.bearer import BearerResponse

from decision_backend.rest import schema
from decision_backend.baklava.evaluate.run import ExecutionError, run_baklava_model
from decision_backend.rest.authenticate import initialize_user_authentication
from decision_backend.rest.schema import UserCreate, UserRead, UserUpdate
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
    @asynccontextmanager
    async def lifespan(app: FastAPI):
        await create_db_and_tables()
        yield

    app = FastAPI(
        title="Decision Support UI Backend API",
        description="Stores user data and decision support models",
        version="0.0.1",
        lifespan=lifespan,
    )

    fastapi_users = initialize_user_authentication()
    current_active_user = fastapi_users.current_user(active=True)
    auth_backend = fastapi_users.authenticator.backends[0]

    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    app.include_router(
        fastapi_users.get_auth_router(auth_backend),
        prefix="/api/auth/jwt",
        tags=["authentication"],
    )

    @app.post("/api/auth/jwt/refresh", tags=["authentication"])
    async def refresh_login_token(user: User = Depends(current_active_user)) -> BearerResponse:
        return await auth_backend.login(auth_backend.get_strategy(), user)

    app.include_router(
        fastapi_users.get_register_router(UserRead, UserCreate),
        prefix="/api/auth",
        tags=["authentication"],
    )
    app.include_router(
        fastapi_users.get_users_router(UserRead, UserUpdate),
        prefix="/api/users",
        tags=["users"],
    )

    @app.exception_handler(ExecutionError)
    async def unicorn_exception_handler(request: Request, error: ExecutionError):
        return JSONResponse(
            status_code=500,
            content={
                "r_script": error.r_script,
                "estimates": error.estimates,
                "stdout": error.stdout,
                "stderr": error.stderr,
            },
        )

    @app.post("/api/v1/monte_carlo", tags=["models"])
    def monte_carlo(model: BaklavaModel, user: User = Depends(current_active_user)) -> DecisionSupportHistogramResult:
        return run_baklava_model(model, 50000, do_evpi=False)

    @app.post("/api/v1/evpi", tags=["models"])
    def evpi(model: BaklavaModel, user: User = Depends(current_active_user)) -> DecisionSupportEVPIResult:
        return run_baklava_model(model, 1000, do_evpi=True)

    @app.post("/api/v1/decision_model/", response_model=schema.DecisionModel, tags=["models"])
    async def create_item_for_user(
        decision_model: schema.DecisionModelCreate,
        db: Session = Depends(get_db),
        user: User = Depends(current_active_user),
    ):
        return await models.create_user_decision_model(db=db, decision_model=decision_model, user=user)

    @app.get("/api/v1/decision_models/", response_model=List[schema.DecisionModel], tags=["models"])
    async def read_decision_models(db: Session = Depends(get_db), user: User = Depends(current_active_user)):
        return await models.get_user_decision_models(db, user)

    @app.delete("/api/v1/decision_models/{decision_model_id}", tags=["models"])
    async def delete_decision_model(
        decision_model_id: int,
        db: Session = Depends(get_db),
        user: User = Depends(current_active_user),
    ):
        return await models.delete_decision_model(db, user, decision_model_id)

    return app
