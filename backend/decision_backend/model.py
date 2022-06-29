from pydantic import BaseModel
from typing import List, TypedDict


Connection = TypedDict("connection", {"id": str, "from": str, "to": str})


class RawNode(BaseModel):
    type: str
    id: str
    name: str
    options: List
    state: TypedDict("state")
    interfaces: List
    position: TypedDict("position", {"x": int, "y": int})
    width: int
    twoColumn: bool
    customClasses: str


class RawModel(BaseModel):
    nodes: List[RawNode]
    connections: List[Connection]
    panning: TypedDict("panning", {"x": int, "y": int})
    scaling: float
