import collections
from itertools import chain
import re
import logging

from typing import Iterator, Mapping, Set

from decision_backend.baklava.common.constants import (
    SUBGRAPH_INPUT_NODE_TYPE,
    SUBGRAPH_INSTANCE_NODE_TYPE_PREFIX,
    SUBGRAPH_OUTPUT_NODE_TYPE,
)
from decision_backend.baklava.model.parser import GraphParser
from decision_backend.baklava.common.schema import BakalvaNodeInterface, BaklavaGraph, BaklavaNode

logger = logging.getLogger(__name__)


def _generate_variable_name(title: str, existing_names: Set[str]) -> str:
    """Return a unique variable name given the node title."""
    cleaned_name = re.sub(r" ", "_", title.strip())
    cleaned_name = re.sub(r"[^a-zA-Z0-9\_]", "", cleaned_name)

    base_name = cleaned_name
    unique_name = cleaned_name
    i = 2
    while unique_name in existing_names:
        unique_name = base_name + f"_{i}"
        i += 1

    return unique_name


def _find_subgraph_interface_name(node: BaklavaNode, output_name: str):
    # TODO: read from graph template instead of graphState
    for output in node.graphState.outputs:
        if output.id == output_name:
            return output.name
    raise AttributeError(f"subgraph output interface with name '{output_name}' not found in outputs")


class VariableGenerator:
    """Maps Baklava nodes to R variables."""

    def __init__(
        self,
        node_id_to_name: Mapping[str, str] = None,
        intf_id_to_name: Mapping[str, str] = None,
        graph_id_to_name: Mapping[str, str] = None,
        names: Set[str] = None,
    ):
        self.node_id_to_name: Mapping[str, str] = {} if node_id_to_name is None else node_id_to_name
        self.intf_id_to_name: Mapping[str, str] = {} if intf_id_to_name is None else intf_id_to_name
        self.graph_id_to_name: Mapping[str, str] = {} if graph_id_to_name is None else graph_id_to_name
        self.names: Set[str] = set() if names is None else names

    def _make_unique(self, name):
        logger.debug(f"current names are {self.names}")
        generated_name = _generate_variable_name(name, self.names)
        self.names.add(generated_name)
        return generated_name

    def _register_graph(self, graph: GraphParser, name: str):
        logger.debug(f"register function '{name}' for subgraph with id '{graph.get_id()}'")
        self.graph_id_to_name[graph.get_id()] = name

    def _register_node(self, node: BaklavaNode, name: str):
        logger.debug(f"register variable '{name}' for node with id '{node.id}'")
        self.node_id_to_name[node.id] = name

    def _register_interface(self, intf: BakalvaNodeInterface, name: str):
        logger.debug(f"register variable '{name}' for node interface with id '{intf.id}'")
        self.intf_id_to_name[intf.id] = name

    def register_subgraphs(self, graphs: Iterator[GraphParser]):
        print("register")
        for graph in graphs:
            if not graph.get_name():
                raise AttributeError(f"graph with id '{graph.get_id()}' does not have a name")
            self._register_graph(graph, self._make_unique(graph.get_name()))

    def register_nodes(self, nodes: Iterator[BaklavaNode], output_node_type: str):
        for node in nodes:
            # register input value as name for subgraph output node
            if node.type == SUBGRAPH_OUTPUT_NODE_TYPE:
                self._register_node(node, self._make_unique(node.inputs["name"].value))
                continue

            # register name for result nodes
            if node.type == output_node_type:
                self._register_node(node, self._make_unique(node.title))
                continue

            if node.type.startswith(SUBGRAPH_INSTANCE_NODE_TYPE_PREFIX):
                self._register_node(node, self._make_unique(node.title))

            # register names for regular nodes interfaces
            for intf_name, intf in node.outputs.items():

                # subgraph instances node interfaces
                if node.type.startswith(SUBGRAPH_INSTANCE_NODE_TYPE_PREFIX):
                    if intf_name == "_calculationResults":
                        continue
                    output_name = _find_subgraph_interface_name(node, intf_name)
                    # TODO: find name of output node in subgraph
                    self._register_interface(intf, f"{self.get_variable_name_for_node(node)}${output_name}")
                    continue

                # subgraph input node interfaces
                if node.type == SUBGRAPH_INPUT_NODE_TYPE:
                    self._register_interface(intf, self._make_unique(node.inputs["name"].value))
                    continue

                self._register_interface(intf, self._make_unique(f"{node.title}_{intf_name}"))

    def get_function_name_for_subgraph(self, graph: GraphParser) -> str:
        if graph.get_id() in self.graph_id_to_name:
            return self.graph_id_to_name[graph.get_id()]
        raise KeyError(f"subgraph with id '{graph.get_id()}' does not have a function name assigned to it")

    def get_variable_name_for_node_interface(self, intf: BakalvaNodeInterface) -> str:
        """Returns the variable assigned to the node."""
        if intf.id in self.intf_id_to_name:
            return self.intf_id_to_name[intf.id]
        raise KeyError(f"node interface with id '{intf.id}' does not have a variable name assigned to it")

    def get_variable_name_for_node(self, node: BaklavaNode) -> str:
        if node.id in self.node_id_to_name:
            return self.node_id_to_name[node.id]
        raise KeyError(f"node with id '{node.id}' does not have a variable name assigned to it")

    def clone(self):
        return VariableGenerator(
            dict(self.node_id_to_name), dict(self.intf_id_to_name), dict(self.graph_id_to_name), set(self.names)
        )

    """
    def getNodeForVariableName(self, name: str):
        if name in self.name_to_node_id:
            node_id = self.name_to_node_id[name]
            if node_id in self.node_id_to_node:
                return self.node_id_to_node[self.name_to_node_id[name]]
            raise KeyError(f"variable name '{name}' is assigned to node with id '{node_id}' but node is not available")
        raise KeyError(f"unknown variable name '{name}'")
    """
