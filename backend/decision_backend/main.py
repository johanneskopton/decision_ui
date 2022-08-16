from typing import List
from sqlalchemy.orm import Session
from fastapi import Depends, FastAPI
from fastapi.middleware.cors import CORSMiddleware

from decision_backend.users import auth_backend, current_active_user
from decision_backend.users import fastapi_users
from decision_backend.schemas import UserCreate, UserRead, UserUpdate
from decision_backend.db import User, create_db_and_tables
from decision_backend.model import RawModel
from decision_backend.decision_support_wrapper import DecisionSupportWrapper
from decision_backend import crud, schemas
from decision_backend.db import async_session_maker
import uuid

# db.Base.metadata.create_all(bind=engine)

app = FastAPI()


# Dependency
async def get_db():
    db = async_session_maker()
    try:
        yield db
    finally:
        await db.close()


origins = [
    "http://localhost:8080",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.include_router(
    fastapi_users.get_auth_router(auth_backend),
    prefix="/api/auth/jwt",
    tags=["auth"]
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


@app.post("/api/v1/monte_carlo")
def monte_carlo(model: RawModel, user: User = Depends(current_active_user)):

    dsw = DecisionSupportWrapper(model, 50000)
    dsw.run()
    hist = dsw.get_hist()
    r_script = dsw.get_r_script()
    estimates = dsw.get_estimates()
    # evpi = dsw.get_evpi()
    dsw.clean()

    return {
        "hist": hist,
        "r_script": r_script,
        "estimates": estimates,
        # "evpi": evpi
    }


@app.post("/api/v1/evpi")
def evpi(model: RawModel, user: User = Depends(current_active_user)):

    dsw = DecisionSupportWrapper(model, 1000, do_evpi=True)
    dsw.run()
    # hist = dsw.get_hist()
    # r_script = dsw.get_r_script()
    # estimates = dsw.get_estimates()
    evpi = dsw.get_evpi()
    dsw.clean()

    return {
        # "hist": hist,
        # "r_script": r_script,
        # "estimates": estimates,
        "evpi": evpi
    }


@app.post(
    "/api/v1/decision_model/",
    response_model=schemas.DecisionModel
)
async def create_item_for_user(
    decision_model: schemas.DecisionModelCreate,
    db: Session = Depends(get_db),
    user: User = Depends(current_active_user)
):
    return await crud.create_user_decision_model(db=db,
                                                 decision_model=decision_model,
                                                 user=user
                                                 )


@app.get(
    "/api/v1/decision_models/",
    response_model=List[schemas.DecisionModel],
)
async def read_decision_models(db: Session = Depends(get_db),
                               user: User = Depends(current_active_user)
                               ):
    res = await crud.get_user_decision_models(db, user)
    print(res)
    return(res)


# @app.get(
#    "/api/v1/decision_models/",
#    response_model=List[schemas.DecisionModel],
# )
# async def read_decision_models(skip: int = 0,
#                               limit: int = 100,
#                               db: Session = Depends(get_db)
#                               ):
#    decision_models = await crud.get_decision_models(db,
#                                                     skip=skip,
#                                                     limit=limit)
#    print(decision_models)
#    return decision_models


@app.on_event("startup")
async def on_startup():
    # Not needed if you setup a migration system like Alembic
    await create_db_and_tables()
