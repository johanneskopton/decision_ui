import os

from fastapi import Depends
from fastapi_users.db import SQLAlchemyUserDatabase
from fastapi_users.db import SQLAlchemyBaseUserTableUUID
from typing import AsyncGenerator
from sqlalchemy.ext.declarative import DeclarativeMeta, declarative_base
from sqlalchemy.orm import sessionmaker
from sqlalchemy import Boolean, Column, ForeignKey, Integer, String
from sqlalchemy.orm import relationship
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from sqlalchemy_utils import UUIDType

DSUI_DATABASE_PATH = os.environ.get(
    "DSUI_DATABASE_PATH", "./decision-support-ui-backend.db"
)

DATABASE_URL = f"sqlite+aiosqlite:///{DSUI_DATABASE_PATH}"
Base: DeclarativeMeta = declarative_base()


engine = create_async_engine(DATABASE_URL)
async_session_maker = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)


class User(SQLAlchemyBaseUserTableUUID, Base):
    decision_models = relationship("DecisionModel", back_populates="owner")


class DecisionModel(Base):
    __tablename__ = "decision_model"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    saved = Column(Integer)
    content = Column(String)
    owner_id = Column(UUIDType, ForeignKey("user.id"))

    owner = relationship("User", back_populates="decision_models")


async def create_db_and_tables():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)


async def get_async_session() -> AsyncGenerator[AsyncSession, None]:
    async with async_session_maker() as session:
        yield session


async def get_user_db(session: AsyncSession = Depends(get_async_session)):
    yield SQLAlchemyUserDatabase(session, User)
