"""Configuration of FastApi authentication backend"""

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
DSUI_JWT_LIFETIME = int(os.environ.get("DSUI_JWT_LIFETIME", "600"))  # 600 seconds = 10 minutes


class UserManager(UUIDIDMixin, BaseUserManager[User, uuid.UUID]):
    """Implementation of FastApi user manager"""

    reset_password_token_secret = DSUI_SECRET
    verification_token_secret = DSUI_SECRET

    async def on_after_register(self, user: User, request: Optional[Request] = None):
        logger.info("user %s has registered", str(user.id))


def initialize_user_authentication():
    """Initialize the user authentication backend using the JWT strategy."""

    logger.debug("jwt token lifetime is %d seconds", DSUI_JWT_LIFETIME)

    if DSUI_SECRET == "default_secret":  # nosec
        logger.warning("No secret provided! Please specify environment variable DSUI_SECRET with a custom secret!")

    async def get_user_manager(user_db: SQLAlchemyUserDatabase = Depends(get_user_db)):
        yield UserManager(user_db)

    def get_jwt_strategy() -> JWTStrategy:
        return JWTStrategy(secret=DSUI_SECRET, lifetime_seconds=DSUI_JWT_LIFETIME)

    auth_backend = AuthenticationBackend(
        name="jwt",
        transport=BearerTransport(tokenUrl="auth/jwt/login"),
        get_strategy=get_jwt_strategy,
    )

    return FastAPIUsers[User, uuid.UUID](get_user_manager, [auth_backend])
