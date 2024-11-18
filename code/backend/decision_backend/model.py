from pydantic import BaseModel
from typing import List
from typing_extensions import TypedDict


Connection = TypedDict("connection", {"id": str, "from": str, "to": str})


class StrippedNode(BaseModel):
    type: str
    id: str
    name: str
    variable_name: str
    options: dict
    interfaces: List


class RawNode(BaseModel):
    type: str
    id: str
    name: str
    options: List
    state: TypedDict("state")
    interfaces: List
    position: TypedDict("position", {"x": float, "y": float})
    width: int
    twoColumn: bool
    customClasses: str


class StrippedModel(BaseModel):
    nodes: List[StrippedNode]
    connections: List[Connection]


class RawModel(BaseModel):
    nodes: List[RawNode]
    connections: List[Connection]
    panning: TypedDict("panning", {"x": float, "y": float})
    scaling: float
