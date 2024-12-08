import string
from typing import Any, List, Mapping
import numpy as np

from decision_backend.baklava.common.constants import SUBGRAPH_OUTPUT_NODE_TYPE
from decision_backend.baklava.model.parser import (
    GraphParser,
)
from decision_backend.baklava.common.schema import BaklavaNode
from decision_backend.baklava.translate.variables import VariableGenerator


def prepare_node_input_values(graph: GraphParser, node: BaklavaNode, variables: VariableGenerator) -> Mapping[str, Any]:
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

    def __call__(self, graph: GraphParser, node: BaklavaNode, variables: VariableGenerator) -> List[str]:
        raise NotImplementedError()


class SubgraphNodeTranslator(NodeTranslator):

    def __call__(self, graph: GraphParser, node: BaklavaNode, variables: VariableGenerator) -> List[str]:
        subgraph = graph.find_subgraph_for_node(node)
        function_name = variables.get_function_name_for_subgraph(subgraph)

        node_variable = variables.get_variable_name_for_node(node)

        input_values = prepare_node_input_values(graph, node, variables)
        function_arguments = [input_values[k] for k in sorted(input_values.keys())]

        return [f"{node_variable} <- {function_name}({", ".join(function_arguments)})"]


class SubgraphOutputTranslator(SubgraphNodeTranslator):

    def __call__(self, graph: GraphParser, node: BaklavaNode, variables: VariableGenerator) -> List[str]:
        input_values = prepare_node_input_values(graph, node, variables)
        return [f"{variables.get_variable_name_for_node(node)} <- {input_values["placeholder"]}"]


class OneOutputNodeTranslator(NodeTranslator):

    def __call__(self, graph: GraphParser, node: BaklavaNode, variables: VariableGenerator) -> List[str]:
        input_values = prepare_node_input_values(graph, node, variables)
        right_side = self.translate_one_output(input_values)
        variable_name = variables.get_variable_name_for_node_interface(next(iter(node.outputs.values())))
        return [f"{variable_name} <- {right_side}"]

    def translate_one_output(self, input_values: Mapping[str, Any]) -> str:
        raise NotImplementedError()


class ResultNodeTranslator(OneOutputNodeTranslator):

    def __call__(self, graph: GraphParser, node: BaklavaNode, variables: VariableGenerator) -> List[str]:
        input_values = prepare_node_input_values(graph, node, variables)
        return [f"{variables.get_variable_name_for_node(node)} <- {input_values["value"]}"]


class TypeConstraintNodeTranslator(OneOutputNodeTranslator):

    def __call__(self, graph: GraphParser, node: BaklavaNode, variables: VariableGenerator) -> List[str]:
        input_values = prepare_node_input_values(graph, node, variables)
        variable_name = variables.get_variable_name_for_node_interface(next(iter(node.outputs.values())))
        input_name = input_values.get("value", input_values.get("sample", input_values.get("series")))
        return [f"{variable_name} <- {input_name}"]


class MathNodeTranslator(OneOutputNodeTranslator):

    OPERATORS = {"add": "+", "subtract": "-", "multiply": "*", "divide": "/"}

    def translate_one_output(self, input_values: Mapping[str, Any]):
        operator = self.OPERATORS[input_values["operation"]]
        return f"{input_values["a"]} {operator} {input_values["b"]}"


class ComparisonNodeTranslator(OneOutputNodeTranslator):

    def translate_one_output(self, input_values: Mapping[str, Any]):
        return f"({input_values["a"]} {input_values["operation"]} {input_values["b"]}) * 1"


class RoundNodeTranslator(OneOutputNodeTranslator):

    def translate_one_output(self, input_values: Mapping[str, Any]):
        return "{}({})".format(input_values["operation"], input_values["x"])


class SumNodeTranslator(OneOutputNodeTranslator):

    def translate_one_output(self, input_values: Mapping[str, Any]):
        res_str = input_values["a"]
        for i in string.ascii_lowercase[1:]:
            if i not in input_values:
                break
            if input_values[i] != 0:
                res_str += " + {}".format(input_values[i])
        return res_str


class ChanceEventNodeTranslator(OneOutputNodeTranslator):

    def translate_one_output(self, input_values: Mapping[str, Any]):
        return f"chance_event({input_values["chance"]}, {input_values["value_if"]}, {input_values["value_if_not"]})"


class ValueVarierNodeTranslator(OneOutputNodeTranslator):

    def translate_one_output(self, input_values: Mapping[str, Any]):
        if input_values["trend"] == 0:
            return "vv(var_mean={}, var_CV={}, n={})".format(
                input_values["var_mean"], input_values["var_cv"], input_values["n"]
            )
        else:
            return "vv(var_mean={}, var_CV={}, n={}, {}_trend={})".format(
                input_values["var_mean"],
                input_values["var_cv"],
                input_values["n"],
                input_values["trend_type"],
                input_values["trend"],
            )


class ToSeriesNodeTranslator(NodeTranslator):

    def __call__(self, graph: GraphParser, node: BaklavaNode, variables: VariableGenerator) -> List[str]:
        input_values = prepare_node_input_values(graph, node, variables)
        variable_name = variables.get_variable_name_for_node_interface(next(iter(node.outputs.values())))

        if input_values["timestep_method"] == "every":
            return [f"{variable_name} <- rep({input_values["x"]}, {input_values["n"]})"]
        elif input_values["timestep_method"] == "as defined":
            timestep = input_values["timestep"]
            if type(timestep) in [int, float, np.int64]:
                return [
                    f"{variable_name} <- rep(0, {input_values["n"]})",
                    f"[{input_values["timestep"] + 1}] <- {input_values["x"]}",
                ]
            else:
                return [
                    f"{variable_name} <- rep(0, {input_values["n"]})",
                    f"[{input_values["timestep"]}+1] <- {input_values["x"]}",
                ]


class NetPresentValueNodeTranslator(OneOutputNodeTranslator):

    def translate_one_output(self, input_values: Mapping[str, Any]):
        return f"discount({input_values["x"]}, {input_values["discount"]}, calculate_NPV=TRUE)"


NODE_TYPE_TO_TRANSLATOR_MAP_IMPLEMENTATIONS: Mapping[str, NodeTranslator] = {
    "Math": MathNodeTranslator(),
    "Sum": SumNodeTranslator(),
    "Round": RoundNodeTranslator(),
    "Comparison": ComparisonNodeTranslator(),
    "Result": ResultNodeTranslator(),
    "ChanceEvent": ChanceEventNodeTranslator(),
    "ToSeries": ToSeriesNodeTranslator(),
    "NetPresentValue": NetPresentValueNodeTranslator(),
    "TypeConstraint": TypeConstraintNodeTranslator(),
    SUBGRAPH_OUTPUT_NODE_TYPE: SubgraphOutputTranslator(),
}
