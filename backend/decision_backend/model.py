from pydantic import BaseModel
from typing import List, TypedDict


class RawModel(BaseModel):
    nodes: List
    connections: List
    panning: TypedDict("panning", {"x": int, "y": int})
    scaling: float
