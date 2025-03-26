"""Database connection"""

import os
import logging

from typing import AsyncGenerator

from fastapi import Depends
from fastapi_users.db import SQLAlchemyUserDatabase

from sqlalchemy.orm import sessionmaker
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine

from decision_backend.database.schema import Base, User
from decision_backend.env import DSUI_DATABASE_PATH

logger = logging.getLogger(__name__)

# create directory where database is supposed to be stored if it does not exist yet
os.makedirs(os.path.dirname(DSUI_DATABASE_PATH), exist_ok=True)

DATABASE_URL = f"sqlite+aiosqlite:///{DSUI_DATABASE_PATH}"

_engine = create_async_engine(DATABASE_URL)
_async_session_maker = sessionmaker(_engine, class_=AsyncSession, expire_on_commit=False)


async def create_db_and_tables():
    """Add tables to database in case they do not exist."""
    logger.debug("create database and tables")
    async with _engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)


async def _get_async_session() -> AsyncGenerator[AsyncSession, None]:
    async with _async_session_maker() as session:
        yield session


async def get_user_db(session: AsyncSession = Depends(_get_async_session)):
    """Return user databaes access."""
    yield SQLAlchemyUserDatabase(session, User)


async def get_db():
    """Return database session."""
    db = _async_session_maker()
    try:
        yield db
    finally:
        await db.close()
