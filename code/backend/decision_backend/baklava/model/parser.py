from typing import Generator, List, Mapping
from decision_backend.baklava.common.constants import SUBGRAPH_INSTANCE_NODE_TYPE_PREFIX
from decision_backend.baklava.common.schema import (
    BakalvaNodeInterface,
    BaklavaConnection,
    BaklavaGraph,
    BaklavaModel,
    BaklavaNode,
)


class GraphParser:

    def __init__(self, model: BaklavaModel, graph: BaklavaGraph):
        self.graph = graph
        self.model = model

    def get_id(self):
        return self.graph.id

    def get_name(self):
        return self.graph.name

    def iterate_nodes(self):
        for node in self.graph.nodes:
            yield node

    def find_subgraph_for_node(self, node: BaklavaNode) -> BaklavaGraph:
        target_graph_id = node.type.replace(SUBGRAPH_INSTANCE_NODE_TYPE_PREFIX + "-", "")
        for graph in self.model.graphTemplates:
            if graph.id == target_graph_id:
                return GraphParser(self.model, graph)
        raise AttributeError(f"model does not have a template graph with id '{target_graph_id}'")

    def get_source_node_from_connection(self, connection: BaklavaConnection) -> BaklavaNode:
        """Return the source node of a connection."""
        for node in self.graph.nodes:
            for _, output in node.outputs.items():
                if output.id == connection.from_:
                    return node

    def get_source_node_interface_from_connection(self, connection: BaklavaConnection) -> BaklavaNode:
        """Return the source node of a connection."""
        for node in self.graph.nodes:
            for _, intf in node.outputs.items():
                if intf.id == connection.from_:
                    return intf

    def get_connection_from_input_interface(self, intf: BakalvaNodeInterface) -> BaklavaConnection:
        """Return the connection for an input interface."""
        for connection in self.graph.connections:
            if connection.to == intf.id:
                return connection

    def find_connected_nodes(self, node: BaklavaNode) -> Generator[None, None, BaklavaNode]:
        for intf in node.inputs.values():
            connection = self.get_connection_from_input_interface(intf)

            if connection is None:
                continue

            yield self.get_source_node_from_connection(connection)

    def find_output_nodes(self, output_node_type: str) -> Generator[None, None, BaklavaNode]:
        for node in self.graph.nodes:
            if node.type == output_node_type:
                yield node

    def get_depth_first_node_order(self, node: BaklavaNode) -> List[BaklavaNode]:
        stack: List[BaklavaNode] = [node]
        order: List[BaklavaNode] = []

        while stack:
            node = stack.pop()
            stack.extend(self.find_connected_nodes(node))
            order.append(node)

        return order

    def get_output_name_for_node_connection(
        self, node: BaklavaNode, connection: BaklavaConnection
    ) -> BakalvaNodeInterface:
        for name, intf in node.outputs.items():
            if intf.id == connection.from_:
                return name


class ModelParser:

    def __init__(self, model: BaklavaModel):
        self.model = model
        self.graph_parsers: Mapping[str, GraphParser] = {}

    def _get_graph_parser(self, graph: BaklavaGraph):
        if graph.id not in self.graph_parsers:
            self.graph_parsers[graph.id] = GraphParser(self.model, graph)
        return self.graph_parsers[graph.id]

    def get_main_graph(self) -> GraphParser:
        return self._get_graph_parser(self.model.graph)

    def iterate_subgraphs(self) -> Generator[None, None, GraphParser]:
        for graph in self.model.graphTemplates:
            yield self._get_graph_parser(graph)
