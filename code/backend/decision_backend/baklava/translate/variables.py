import collections
from itertools import chain
import re
import logging

from typing import Iterator, Mapping, Set

from decision_backend.baklava.common.constants import (
    RESULT_NODE_TYPE,
    SUBGRAPH_INPUT_NODE_TYPE,
    SUBGRAPH_INSTANCE_NODE_TYPE_PREFIX,
    SUBGRAPH_OUTPUT_NODE_TYPE,
)
from decision_backend.baklava.model.parser import GraphParser, ModelParser
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


class VariableManager:
    """Maps Baklava subgraphs, nodes and interfaces to R variables."""

    def __init__(self, model: ModelParser):
        self.node_id_to_name: Mapping[str, str] = {}
        self.intf_id_to_name: Mapping[str, str] = {}
        self.graph_id_to_name: Mapping[str, str] = {}
        self.names_per_graph: Mapping[str, Set[str]] = {}
        self._register_all(model)

    def _make_unique(self, graph: GraphParser, name: str):
        # logger.debug(f"current names in graph are {self.names_per_graph[graph_id]}")
        generated_name = _generate_variable_name(name, self.names_per_graph[graph.get_id()])
        self.names_per_graph[graph.get_id()].add(generated_name)
        return generated_name

    def _register_graph_variable(self, graph: GraphParser, name: str):
        logger.debug(f"register function '{name}' for subgraph with id '{graph.get_id()}'")
        self.graph_id_to_name[graph.get_id()] = name

    def _register_node_variable(self, node: BaklavaNode, name: str):
        logger.debug(f"register variable '{name}' for node with id '{node.id}'")
        self.node_id_to_name[node.id] = name

    def _register_interface_variable(self, intf: BakalvaNodeInterface, name: str):
        logger.debug(f"register variable '{name}' for node interface with id '{intf.id}'")
        self.intf_id_to_name[intf.id] = name

    def _register_subgraph(self, graph: GraphParser, output_node_type: str):
        for node in graph.iterate_nodes():
            # register input value as name for subgraph input/output node
            if node.type == SUBGRAPH_OUTPUT_NODE_TYPE:
                self._register_node_variable(node, self._make_unique(graph, node.inputs["name"].value))
                continue

            # register name for result nodes
            if node.type == output_node_type:
                self._register_node_variable(node, self._make_unique(graph, node.title))
                continue

            # register name for subgraph instance node
            if node.type.startswith(SUBGRAPH_INSTANCE_NODE_TYPE_PREFIX):
                self._register_node_variable(node, self._make_unique(graph, node.title + "_List"))

            # register names for node interfaces
            for intf_name, intf in node.outputs.items():

                # subgraph instances node interfaces
                if node.type.startswith(SUBGRAPH_INSTANCE_NODE_TYPE_PREFIX):
                    if intf_name == "_calculationResults":
                        continue
                    # use output variable name inside subgraph
                    output_name = self.get_variable_name_for_node(
                        graph.find_subgraph_input_output_node_for_interface(intf_name)
                    )
                    self._register_interface_variable(intf, f"{self.get_variable_name_for_node(node)}${output_name}")
                    continue

                # subgraph input node interfaces
                if node.type == SUBGRAPH_INPUT_NODE_TYPE:
                    self._register_interface_variable(intf, self._make_unique(graph, node.inputs["name"].value))
                    continue

                # regular node interface
                self._register_interface_variable(intf, self._make_unique(graph, f"{node.title}_{intf_name}"))

    def _register_all(self, model: ModelParser):
        # initialize empty main graph names (TODO: add R reserved words)
        main_graph_id = model.get_main_graph().get_id()
        self.names_per_graph[main_graph_id] = set()

        # register function names in main graph
        for subgraph in model.iterate_subgraphs():
            if not subgraph.get_name():
                raise AttributeError(f"subgraph with id '{subgraph.get_id()}' does not have a name")
            self._register_graph_variable(subgraph, self._make_unique(model.get_main_graph(), subgraph.get_name()))

        # register nodes inside each subgraph
        for subgraph in model.iterate_subgraphs():
            # copy global names to subgraph
            self.names_per_graph[subgraph.get_id()] = set(self.names_per_graph[main_graph_id])
            self._register_subgraph(subgraph, SUBGRAPH_OUTPUT_NODE_TYPE)

        # main graph
        self._register_subgraph(model.get_main_graph(), RESULT_NODE_TYPE)

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
