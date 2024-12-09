import os

from fastapi_users.db import SQLAlchemyBaseUserTableUUID

from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy import Column, ForeignKey, Integer, String, MetaData
from sqlalchemy.orm import relationship
from sqlalchemy_utils import UUIDType

Base = declarative_base()


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
