from pydantic import BaseModel, Field, ConfigDict

from typing import List, Any, Mapping, Optional, Sequence


class BaklavaConnection(BaseModel):
    """Represents connection between nodes"""

    id: str
    """Unique identifier for a connection as UUID"""

    from_: str = Field(alias="from")
    """The UUID of the node the connection is from"""

    to: str
    """The UUID of the node the connection goes to"""

    model_config = ConfigDict(populate_by_name=True)


class BakalvaNodeInterface(BaseModel):
    """Interface of a node"""

    id: str
    """Unique identifier for a node interface as UUID"""

    value: Optional[Any] = None
    """The value of the node interface as specified by the user in the frontend editor"""

    templateId: Optional[str] = None
    """Not sure yet"""


class BaklavaPosition(BaseModel):
    """2d-Position"""

    x: float
    y: float


class BaklavaNode(BaseModel):
    """A node"""

    id: str
    """Unique identifier of a node as UUID"""

    inputs: Mapping[str, BakalvaNodeInterface]
    """The map of input options (the key corresponds to the interface name)"""

    outputs: Mapping[str, BakalvaNodeInterface]
    """The map of output options (the key corresponds to the interface name)"""

    position: BaklavaPosition
    """The 2d-position of the node as visualized in the frontend editor"""

    title: str
    """The title of the node in the editor"""

    twoColumn: bool
    """Whether input and output options are visualized using two columns"""

    type: str
    """The type of the node as declared in the frontend code"""

    width: float
    """The size of the node in pixel as visualized in the fronted editor"""

    graphState: "Optional[BaklavaGraph]" = None
    """The execution state of the subgraph instance referenced by this node"""

    graphInterfaceId: Optional[str] = None
    """Only if this is a subgraph input/output node. Value matches interface name in a subgraph instance node."""


class BaklavaGraphInputOutput(BaseModel):
    """Subgraph input output references."""

    id: str
    """Id that is used as interface name in subgraph instance nodes."""

    name: str
    """Name of the input/output as provided by the user in the name field."""

    nodeId: str
    """The id of the input/output node of the subgraph."""

    nodeInterfaceId: str
    """Matches templateId of the input/output node interface."""


class BaklavaGraph(BaseModel):
    """A graph"""

    id: Optional[str] = None

    """The name of the graph (if it is a subgraph)"""
    name: Optional[str] = None

    nodes: List[BaklavaNode]
    """The list of nodes of the graph"""

    connections: List[BaklavaConnection]
    """The list of connections between nodes of the graph"""

    panning: Optional[BaklavaPosition] = None
    """Unknown, probably the frontend editor panning state"""

    scaling: Optional[float] = None
    """Unknown, probably the frontend editor scale state"""

    inputs: List[BaklavaGraphInputOutput]
    """Graph inputs (if graph is a subgraph)"""

    outputs: List[BaklavaGraphInputOutput]
    """Graph outputs (if graph is a subgraph)"""


class BaklavaModel(BaseModel):
    """The Baklava model"""

    graph: BaklavaGraph
    """The main graph of the model"""

    graphTemplates: List[BaklavaGraph]
    """Subgraphs of the model"""


class HistogramData(BaseModel):
    """Describes histogram data of multiple distributions."""

    values: Mapping[str, Sequence[float]]
    """Varible to density values of histogram (y-axis)."""

    bins: Sequence[float]
    """Boundaries for all bins (x-axis)."""


class DecisionSupportHistogramResult(BaseModel):

    histogram_data: HistogramData
    r_script: str
    estimates_csv: str


class DecisionSupportEVPIResult(BaseModel):

    evpi: Mapping[str, Mapping[str, float]]
