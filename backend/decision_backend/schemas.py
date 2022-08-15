from fastapi_users import schemas
from pydantic import BaseModel
from typing import List


class DecisionModelBase(BaseModel):
    content: str


class DecisionModelCreate(DecisionModelBase):
    pass


class DecisionModel(DecisionModelBase):
    id: int
    owner_id: int
    is_active: bool


class UserRead(schemas.BaseUser[int]):
    pass


class UserCreate(schemas.BaseUserCreate):
    items: List[DecisionModel] = []

    class Config:
        orm_mode = True


class UserUpdate(schemas.BaseUserUpdate):
    pass
