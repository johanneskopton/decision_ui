from fastapi_users import schemas
from pydantic import BaseModel
from typing import List
from uuid import UUID


class ExecutionErrorMessage(BaseModel):
    reason: str
    r_script: str
    estimates: str
    stderr: str


class DecisionModelBase(BaseModel):
    name: str
    saved: int
    content: str


class DecisionModelCreate(DecisionModelBase):
    pass


class DecisionModel(DecisionModelBase):
    id: int
    owner_id: UUID

    class Config:
        from_attributes = True


class UserRead(schemas.BaseUser[UUID]):
    pass


class UserCreate(schemas.BaseUserCreate):
    decision_models: List[DecisionModel] = []

    class Config:
        from_attributes = True


class UserUpdate(schemas.BaseUserUpdate):
    pass
