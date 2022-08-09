from fastapi import Depends, FastAPI
from fastapi.middleware.cors import CORSMiddleware
from decision_backend.users import auth_backend, current_active_user, fastapi_users
from decision_backend.schemas import UserCreate, UserRead, UserUpdate
from decision_backend.db import User, create_db_and_tables

from decision_backend.model import RawModel
from decision_backend.decision_support_wrapper import DecisionSupportWrapper

app = FastAPI()


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
def monte_carlo(model: RawModel):

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
def evpi(model: RawModel):

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


@app.get("/api/authenticated-route")
async def authenticated_route(user: User = Depends(current_active_user)):
    return {"message": f"Hello {user.email}!"}


@app.on_event("startup")
async def on_startup():
    # Not needed if you setup a migration system like Alembic
    await create_db_and_tables()
