"""Translations for each individual node type."""

# pylint: disable=too-few-public-methods

import string
from typing import Any, List, Mapping
import numpy as np

from decision_backend.baklava.common.constants import SUBGRAPH_OUTPUT_NODE_TYPE, TYPE_CONSTRAINT_NODE_TYPE
from decision_backend.baklava.model.parser import (
    GraphParser,
)
from decision_backend.baklava.common.schema import BaklavaNode
from decision_backend.baklava.translate.variables import VariableManager


def _prepare_node_input_values(graph: GraphParser, node: BaklavaNode, variables: VariableManager) -> Mapping[str, Any]:
    input_variables: Mapping[str, Any] = {}
    for intf_name, intf in node.inputs.items():
        connection = graph.get_connection_from_input_interface(intf)

        # input is arbitrary (e.g. select choice)
        value = intf.value

        # input is numeric
        if isinstance(value, (int, float, complex)):
            value = np.around(value, 7)

        # input is connected to source node
        if connection:
            source_node_output_intf = graph.get_source_node_interface_from_connection(connection)
            value = variables.get_variable_name_for_node_interface(source_node_output_intf)

        input_variables[intf_name] = value
    return input_variables


class NodeTranslator:
    """Abstract class representing a node translation function."""

    def __call__(self, graph: GraphParser, node: BaklavaNode, variables: VariableManager) -> List[str]:
        """Return a list of R code lines representing the node."""
        raise NotImplementedError()


class SubgraphInstanceNodeTranslator(NodeTranslator):
    """Translate a subgraph instance node into a function call."""

    def __call__(self, graph: GraphParser, node: BaklavaNode, variables: VariableManager) -> List[str]:
        subgraph = graph.find_subgraph_for_node(node)
        function_name = variables.get_function_name_for_subgraph(subgraph)
        node_variable = variables.get_variable_name_for_node(node)

        arguments = {}
        for intf_name, intf in node.inputs.items():
            # find variable name of connecting output interface
            connection = graph.get_connection_from_input_interface(intf)
            source_node_output_intf = graph.get_source_node_interface_from_connection(connection)
            value = variables.get_variable_name_for_node_interface(source_node_output_intf)

            # find variable name of subgraph input node
            input_node = graph.find_subgraph_input_output_node_for_interface(intf_name)
            arguments[variables.get_variable_name_for_node_interface(input_node.outputs["placeholder"])] = value

        sorted_argument_list = [arguments[k] for k in sorted(arguments.keys())]
        return [f"{node_variable} <- {function_name}({", ".join(sorted_argument_list)})"]


class SubgraphOutputNodeTranslator(NodeTranslator):
    """Subgraph output node translator"""

    def __call__(self, graph: GraphParser, node: BaklavaNode, variables: VariableManager) -> List[str]:
        input_values = _prepare_node_input_values(graph, node, variables)
        return [f"{variables.get_variable_name_for_node(node)} <- {input_values["placeholder"]}"]


class PassthroughNodeTranslator(NodeTranslator):
    """Passthrough translator used for Type Contraint nodes. Will not generate any R-code."""

    def __call__(self, graph: GraphParser, node: BaklavaNode, variables: VariableManager) -> List[str]:
        return []


class OneOutputNodeTranslator(NodeTranslator):
    """Abstract node translator that only has a single output."""

    def __call__(self, graph: GraphParser, node: BaklavaNode, variables: VariableManager) -> List[str]:
        input_values = _prepare_node_input_values(graph, node, variables)
        right_side = self.translate_one_output(input_values)
        variable_name = variables.get_variable_name_for_node_interface(next(iter(node.outputs.values())))
        return [f"{variable_name} <- {right_side}"]

    def translate_one_output(self, values: Mapping[str, Any]) -> str:
        """Translation function that needs to implemented by specific node type with one output variable."""
        raise NotImplementedError()


class ResultNodeTranslator(NodeTranslator):
    """Result node translator"""

    def __call__(self, graph: GraphParser, node: BaklavaNode, variables: VariableManager) -> List[str]:
        values = _prepare_node_input_values(graph, node, variables)
        return [f"{variables.get_variable_name_for_node(node)} <- {values["sample"]}"]


class MathNodeTranslator(OneOutputNodeTranslator):
    """Math node translator"""

    OPERATORS = {"add": "+", "subtract": "-", "multiply": "*", "divide": "/"}

    def translate_one_output(self, values: Mapping[str, Any]):
        operator = self.OPERATORS[values["operation"]]
        return f"{values["a"]} {operator} {values["b"]}"


class ComparisonNodeTranslator(OneOutputNodeTranslator):
    """Comparison node translator"""

    def translate_one_output(self, values: Mapping[str, Any]):
        return f"({values["a"]} {values["operation"]} {values["b"]}) * 1"


class FunctionNodeTranslator(OneOutputNodeTranslator):
    """Function node translator"""

    SUPPORTED_FUNCTIONS = [
        "abs",
        "ceiling",
        "cos",
        "exp",
        "floor",
        "log",
        "log10",
        "round",
        "sin",
        "sqrt",
        "tan",
        "trunc",
    ]

    def translate_one_output(self, values: Mapping[str, Any]):
        if values["operation"] not in self.SUPPORTED_FUNCTIONS:
            raise RuntimeError(f"operation '{values["operation"]}' not supported")
        return f"{values["operation"]}({values["x"]})"


class SumNodeTranslator(OneOutputNodeTranslator):
    """ "Sum node translator"""

    def translate_one_output(self, values: Mapping[str, Any]):
        res_str = values["a"]
        for i in string.ascii_lowercase[1:]:
            if i not in values:
                break
            if values[i] != 0:
                res_str += f" + {values[i]}"
        return res_str


class ChanceEventNodeTranslator(OneOutputNodeTranslator):
    """Chance event node translator"""

    def translate_one_output(self, values: Mapping[str, Any]):
        return f"chance_event({values["chance"]}, {values["value_if"]}, {values["value_if_not"]})"


class ValueVarierNodeTranslator(OneOutputNodeTranslator):
    """Value varier node translator"""

    def translate_one_output(self, values: Mapping[str, Any]):
        if values["trend"] == 0:
            return f"vv(var_mean={values["var_mean"]}, var_CV={values["var_cv"]}, n={values["n"]})"

        return (
            "vv("
            + f"var_mean={values["var_mean"]}, "
            + f"var_CV={values["var_cv"]}, "
            + f"n={values["n"]}, "
            + f"{values["trend_type"]}_trend={values["trend"]}"
            + ")"
        )


class ToSeriesNodeTranslator(NodeTranslator):
    """To series node translator"""

    def __call__(self, graph: GraphParser, node: BaklavaNode, variables: VariableManager) -> List[str]:
        values = _prepare_node_input_values(graph, node, variables)
        variable_name = variables.get_variable_name_for_node_interface(next(iter(node.outputs.values())))

        if values["timestep_method"] == "every":
            return [f"{variable_name} <- rep({values["x"]}, {values["n"]})"]
        if values["timestep_method"] == "as defined":
            timestep = values["timestep"]
            if type(timestep) in [int, float, np.int64]:
                return [
                    f"{variable_name} <- rep(0, {values["n"]})",
                    f"{variable_name}[{values["timestep"] + 1}] <- {values["x"]}",
                ]

            return [
                f"{variable_name} <- rep(0, {values["n"]})",
                f"[{values["timestep"]}+1] <- {values["x"]}",
            ]
        raise RuntimeError(f"Unknown timestep_method '{values["timestep_method"]}'")


class NetPresentValueNodeTranslator(OneOutputNodeTranslator):
    """Net present value node translator"""

    def translate_one_output(self, values: Mapping[str, Any]):
        return f"discount({values["x"]}, {values["discount"]}, calculate_NPV=TRUE)"


NODE_TYPE_TO_TRANSLATOR_MAP_IMPLEMENTATIONS: Mapping[str, NodeTranslator] = {
    "Math": MathNodeTranslator(),
    "Sum": SumNodeTranslator(),
    "Function": FunctionNodeTranslator(),
    "Comparison": ComparisonNodeTranslator(),
    "Result": ResultNodeTranslator(),
    "ChanceEvent": ChanceEventNodeTranslator(),
    "ToSeries": ToSeriesNodeTranslator(),
    "NetPresentValue": NetPresentValueNodeTranslator(),
    "ValueVarier": ValueVarierNodeTranslator(),
    TYPE_CONSTRAINT_NODE_TYPE: PassthroughNodeTranslator(),
    SUBGRAPH_OUTPUT_NODE_TYPE: SubgraphOutputNodeTranslator(),
}
