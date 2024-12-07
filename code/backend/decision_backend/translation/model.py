from pydantic import BaseModel, Field

from typing import List, Any, Mapping, Optional


class RawConnection(BaseModel):
    """Represents connection between nodes"""

    id: str
    """Unique identifier for a connection as UUID"""

    from_: str = Field(alias="from")
    """The UUID of the node the connection is from"""

    to: str
    """The UUID of the node the connection goes to"""


class RawNodeInterface(BaseModel):
    """Interface of a node"""

    id: str
    """Unique identifier for a node interface as UUID"""

    value: Optional[Any] = None
    """The value of the node interface as specified by the user in the frontend editor"""


class RawPosition(BaseModel):
    """2d-Position"""

    x: float
    y: float


class RawNode(BaseModel):
    """A node"""

    id: str
    """Unique identifier of a node as UUID"""

    inputs: Mapping[str, RawNodeInterface]
    """The map of input options (the key corresponds to the interface name)"""

    outputs: Mapping[str, RawNodeInterface]
    """The map of output options (the key corresponds to the interface name)"""

    position: RawPosition
    """The 2d-position of the node as visualized in the frontend editor"""

    title: str
    """The title of the node in the editor"""

    twoColumn: bool
    """Whether input and output options are visualized using two columns"""

    type: str
    """The type of the node as declared in the frontend code"""

    width: int
    """The size of the node in pixel as visualized in the fronted editor"""

    graphState: "Optional[RawGraph]"
    """The execution state of the subgraph instance referenced by this node"""


class RawGraph(BaseModel):
    """A graph"""

    nodes: List[RawNode]
    """The list of nodes of the graph"""

    connections: List[RawConnection]
    """The list of connections between nodes of the graph"""

    panning: RawPosition
    """Unknown, probably the frontend editor panning state"""

    scaling: float
    """Unknown, probably the frontend editor scale state"""


class RawModel(BaseModel):
    """The model"""

    graph: RawGraph
    """The main graph of the model"""

    graphTemplates: List[RawGraph]
    """Unknown"""


class ExtendedNode(RawNode):
    """A extended version of the node for further processing."""

    variable_name: str
    """The variable name that is used in the R script"""


class StrippedModel(BaseModel):
    """A stripped down version of the model for further processing."""

    nodes: List[ExtendedNode]
    connections: List[RawConnection]
