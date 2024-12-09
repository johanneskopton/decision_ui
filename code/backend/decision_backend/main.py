import logging
import os

from typing import List

from sqlalchemy.orm import Session
from fastapi import Depends, FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from decision_backend.baklava.evaluate.run import ExecutionError, run_baklava_model
from decision_backend.users import auth_backend, current_active_user
from decision_backend.users import fastapi_users
from decision_backend.schemas import UserCreate, UserRead, UserUpdate
from decision_backend.db import User, create_db_and_tables
from decision_backend.baklava.common.schema import (
    BaklavaModel,
    DecisionSupportEVPIResult,
    DecisionSupportHistogramResult,
)
from decision_backend import crud, schemas
from decision_backend.db import async_session_maker


logging.basicConfig(
    level=os.environ.get("DSUI_LOG_LEVEL", "INFO"),
    format="%(asctime)s %(levelname)s:%(name)s:%(message)s",
)

logger = logging.getLogger(__name__)

app = FastAPI()


# Dependency
async def get_db():
    db = async_session_maker()
    try:
        yield db
    finally:
        await db.close()


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
    tags=["auth"],
)
app.include_router(
    fastapi_users.get_register_router(UserRead, UserCreate),
    prefix="/api/auth",
    tags=["auth"],
)
app.include_router(
    fastapi_users.get_reset_password_router(),
    prefix="/api/auth",
    tags=["auth"],
)
app.include_router(
    fastapi_users.get_verify_router(UserRead),
    prefix="/api/auth",
    tags=["auth"],
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


@app.post("/api/v1/monte_carlo")
def monte_carlo(model: BaklavaModel, user: User = Depends(current_active_user)) -> DecisionSupportHistogramResult:
    return run_baklava_model(model, 50000, do_evpi=False)


@app.post("/api/v1/evpi")
def evpi(model: BaklavaModel, user: User = Depends(current_active_user)) -> DecisionSupportEVPIResult:
    return run_baklava_model(model, 1000, do_evpi=True)


@app.post("/api/v1/decision_model/", response_model=schemas.DecisionModel)
async def create_item_for_user(
    decision_model: schemas.DecisionModelCreate,
    db: Session = Depends(get_db),
    user: User = Depends(current_active_user),
):
    return await crud.create_user_decision_model(db=db, decision_model=decision_model, user=user)


@app.get(
    "/api/v1/decision_models/",
    response_model=List[schemas.DecisionModel],
)
async def read_decision_models(db: Session = Depends(get_db), user: User = Depends(current_active_user)):
    return await crud.get_user_decision_models(db, user)


@app.delete("/api/v1/decision_models/{decision_model_id}")
async def delete_decision_model(
    decision_model_id: int,
    db: Session = Depends(get_db),
    user: User = Depends(current_active_user),
):
    return await crud.delete_decision_model(db, user, decision_model_id)


@app.on_event("startup")
async def on_startup():
    # Not needed if you setup a migration system like Alembic
    await create_db_and_tables()
