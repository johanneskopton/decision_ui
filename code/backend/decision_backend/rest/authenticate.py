import uuid
import logging
import os

from typing import Optional

from fastapi import Depends, Request
from fastapi_users import BaseUserManager, FastAPIUsers, UUIDIDMixin
from fastapi_users.authentication import (
    AuthenticationBackend,
    BearerTransport,
    JWTStrategy,
)
from fastapi_users.db import SQLAlchemyUserDatabase

from decision_backend.database.schema import User
from decision_backend.database.session import get_user_db

logger = logging.getLogger(__name__)

DSUI_SECRET = os.environ.get("DSUI_SECRET", "default_secret")
DSUI_JWT_TOKEN_LIFETIME = int(os.environ.get("JWT_TOKEN_LIFETIME", "1800"))  # 1800 seconds = 30 minutes


class UserManager(UUIDIDMixin, BaseUserManager[User, uuid.UUID]):
    reset_password_token_secret = DSUI_SECRET
    verification_token_secret = DSUI_SECRET

    async def on_after_register(self, user: User, request: Optional[Request] = None):
        logger.info(f"user {user.id} has registered")


def initialize_user_authentication():

    logger.debug(f"jwt token lifetime is {DSUI_JWT_TOKEN_LIFETIME} seconds")

    if DSUI_SECRET == "default_secret":
        logger.warning("No secret provided! Please specify environment variable DSUI_SECRET with a custom secret!")

    async def get_user_manager(user_db: SQLAlchemyUserDatabase = Depends(get_user_db)):
        yield UserManager(user_db)

    def get_jwt_strategy() -> JWTStrategy:
        return JWTStrategy(secret=DSUI_SECRET, lifetime_seconds=DSUI_JWT_TOKEN_LIFETIME)

    auth_backend = AuthenticationBackend(
        name="jwt",
        transport=BearerTransport(tokenUrl="auth/jwt/login"),
        get_strategy=get_jwt_strategy,
    )

    return FastAPIUsers[User, uuid.UUID](get_user_manager, [auth_backend])
