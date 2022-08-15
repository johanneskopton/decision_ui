from fastapi import Depends
from fastapi_users.db import SQLAlchemyUserDatabase
from fastapi_users.db import SQLAlchemyBaseUserTable
from sqlalchemy.ext.declarative import DeclarativeMeta, declarative_base
from sqlalchemy.orm import sessionmaker
from sqlalchemy import create_engine
from sqlalchemy import Boolean, Column, ForeignKey, Integer, String
from sqlalchemy.orm import relationship
from sqlalchemy_utils import UUIDType


DATABASE_URL = "sqlite:///./test.db"

Base: DeclarativeMeta = declarative_base()

engine = create_engine(
    DATABASE_URL, connect_args={"check_same_thread": False}
)
SessionLocal = sessionmaker(
    autocommit=False, autoflush=False, bind=engine)


class User(SQLAlchemyBaseUserTable[int], Base):
    id = Column(Integer, primary_key=True)
    decision_models = relationship("DecisionModel", back_populates="owner")


class DecisionModel(Base):
    __tablename__ = "decision_model"
    id = Column(Integer, primary_key=True, index=True)
    content = Column(String)
    is_active = Column(Boolean, default=True)
    owner_id = Column(UUIDType, ForeignKey("user.id"))

    owner = relationship("User", back_populates="decision_models")


"""
def create_db_and_tables():
    with engine.begin() as conn:
        conn.run(Base.metadata.create_all)
"""


def get_session():
    with SessionLocal() as session:
        yield session


def get_user_db(session=Depends(get_session)):
    yield SQLAlchemyUserDatabase(session, User)
