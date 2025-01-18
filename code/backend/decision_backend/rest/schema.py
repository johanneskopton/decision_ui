"""REST schema models"""

from typing import List, Mapping, Sequence
from uuid import UUID

from fastapi_users import schemas
from pydantic import BaseModel


class ExecutionErrorMessage(BaseModel):
    """An error message related to the execution of R."""

    reason: str
    r_script: str
    estimates: str
    stderr: str


class DecisionModelBase(BaseModel):
    """The model, its name and whether is was saved."""

    name: str
    saved: int
    content: str


class DecisionModelCreate(DecisionModelBase):
    """Schema when saving a model."""


class DecisionModel(DecisionModelBase):
    """Schema when retrieving a model from the database."""

    id: int
    owner_id: UUID

    class Config:
        """unknown"""

        from_attributes = True


class UserRead(schemas.BaseUser[UUID]):
    """Schema of a user."""


class UserCreate(schemas.BaseUserCreate):
    """Schema when registering a new user."""

    decision_models: List[DecisionModel] = []

    class Config:
        """unknown"""

        from_attributes = True


class UserUpdate(schemas.BaseUserUpdate):
    """Schema when updating a user"""


class HistogramData(BaseModel):
    """Describes histogram data of multiple distributions."""

    values: Mapping[str, Sequence[float]]
    """Varible to density values of histogram (y-axis)."""

    bins: Sequence[float]
    """Boundaries for all bins (x-axis)."""


class DecisionSupportHistogramResult(BaseModel):
    """Response model for a Monte Carlo request"""

    histogram_data: HistogramData
    r_script: str
    estimates_csv: str


class DecisionSupportEVPIResult(BaseModel):
    """Response model for a EVPI request"""

    evpi: Mapping[str, Mapping[str, float]]
