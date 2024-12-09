import logging

from typing import List, Set, Tuple


from decision_backend.baklava.common.constants import (
    ESTIMATE_NODE_TYPE,
    RESULT_NODE_TYPE,
    SUBGRAPH_INPUT_NODE_TYPE,
    SUBGRAPH_OUTPUT_NODE_TYPE,
    SUBGRAPH_INSTANCE_NODE_TYPE_PREFIX,
)
from decision_backend.baklava.model.parser import (
    GraphParser,
    ModelParser,
)
from decision_backend.baklava.common.schema import BaklavaGraph, BaklavaNode
from decision_backend.baklava.translate.nodes import (
    NODE_TYPE_TO_TRANSLATOR_MAP_IMPLEMENTATIONS,
    SubgraphInstanceNodeTranslator,
)
from decision_backend.baklava.translate.variables import VariableManager

logger = logging.getLogger(__name__)


class GraphTranslationState:
    """Keeps track of which graph nodes have already been translated, such nodes are not translated multiple times."""

    def __init__(self, variables: VariableManager, input_node_type: str, output_node_type: str):
        self.variables = variables
        self.input_node_type = input_node_type
        self.output_node_type = output_node_type

        self.translated_node_ids: Set[str] = set()
        self.translations: List[str] = []
        self.input_variables: Set[str] = set()
        self.output_variables: Set[str] = set()

    def needs_translation(self, node: BaklavaNode) -> bool:
        if node.type == self.input_node_type:
            for intf in node.outputs.values():
                self.input_variables.add(self.variables.get_variable_name_for_node_interface(intf))
            return False

        if node.type == self.output_node_type:
            self.output_variables.add(self.variables.get_variable_name_for_node(node))
            return True

        return node.id not in self.translated_node_ids

    def add_translation(self, node: BaklavaNode, translations: List[str]):
        if node.id in self.translated_node_ids:
            raise AttributeError("cannot add translation for node that is already defined")
        self.translated_node_ids.add(node.id)
        self.translations.extend(translations)

    def add_line(self, line: str):
        self.translations.append(line)

    def get_translations(self) -> List[str]:
        return self.translations

    def get_input_variables(self):
        return self.input_variables

    def get_output_variables(self):
        return self.output_variables


def _translate_node(graph: BaklavaGraph, node: BaklavaNode, variables: VariableManager) -> List[str]:
    """Translate a node by calling the respective node translator function registered for the node type."""

    # check whether node is a subgraph instance node (its type is a combination of a prefix and the id of the subgraph)
    # e.g. __baklava_GraphNode-3ea04bc5-c33a-484b-86d9-cffed4ad45db
    if node.type.startswith(SUBGRAPH_INSTANCE_NODE_TYPE_PREFIX):
        return SubgraphInstanceNodeTranslator()(graph, node, variables)

    # node is a regular node
    if node.type not in NODE_TYPE_TO_TRANSLATOR_MAP_IMPLEMENTATIONS:
        raise AttributeError(f"no node translation registered for type '{node.type}'")

    return NODE_TYPE_TO_TRANSLATOR_MAP_IMPLEMENTATIONS[node.type](graph, node, variables)


def translate_graph(
    graph: GraphParser, variables: VariableManager, input_node_type: str, output_node_type: str
) -> GraphTranslationState:
    """Translate a graph by translating the node dependency tree of each output node."""
    state = GraphTranslationState(variables, input_node_type, output_node_type)

    for output_node in graph.find_output_nodes(output_node_type):
        state.add_line("# " + output_node.title)
        order = graph.get_depth_first_node_order(output_node)

        for node in reversed(order):
            if state.needs_translation(node):
                state.add_translation(node, _translate_node(graph, node, variables))

        state.add_line("")
    return state


def translate_model(model: ModelParser) -> Tuple[str, VariableManager]:
    """Translate a bakalva model into a model function."""
    variables = VariableManager(model)
    result = "model_function <- function(){\n"

    for graph in model.iterate_subgraphs():
        state = translate_graph(graph, variables, SUBGRAPH_INPUT_NODE_TYPE, SUBGRAPH_OUTPUT_NODE_TYPE)

        function_name = variables.get_function_name_for_subgraph(graph)
        result += f"\t# subgraph {graph.get_name()}\n"
        result += f"\t{function_name} <- function({", ".join(state.get_input_variables())}){{\n"
        result += "".join(f"\t\t{line}\n" for line in state.get_translations())
        result += "\t\treturn(list({}))\n".format(", ".join([f"{n}={n}" for n in state.get_output_variables()]))
        result += "\t}\n\n"

    state = translate_graph(model.get_main_graph(), variables, ESTIMATE_NODE_TYPE, RESULT_NODE_TYPE)

    result += "".join(f"\t{line}\n" for line in state.get_translations())
    result += "\t# generate list of output variables\n"
    result += "\treturn(list({}))\n".format(", ".join([f"{n}={n}" for n in state.get_output_variables()]))
    result += "}\n"

    logger.info("Translated model function:\n\n" + result)
    return result, variables
