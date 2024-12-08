import pandas as pd

from decision_backend.baklava.common.constants import ESTIMATE_NODE_TYPE
from decision_backend.baklava.common.schema import BaklavaGraph
from decision_backend.baklava.translate.values import round_to_precision
from decision_backend.baklava.translate.variables import VariableGenerator


def build_estimates_df(graph: BaklavaGraph, variables: VariableGenerator) -> pd.DataFrame:
    """Return a pandas dataframe representing the estimates CSV table given the graph."""
    df = pd.DataFrame(
        columns=[
            "label",
            "variable",
            "distribution",
            "lower",
            "median",
            "upper",
        ]
    )
    for node in graph.nodes:

        if node.type != ESTIMATE_NODE_TYPE:
            continue

        distribution = node.inputs["distribution"].value
        if distribution == "deterministic":
            distribution = "const"
            value = node.inputs["value"].value
            lower = value
            upper = value
        else:
            lower = node.inputs["lower"].value
            upper = node.inputs["upper"].value

        row = pd.DataFrame(
            [
                {
                    "label": node.title,
                    "variable": variables.get_variable_name_for_node_interface(next(iter(node.outputs.values()))),
                    "lower": round_to_precision(lower),
                    "upper": round_to_precision(upper),
                    "distribution": distribution,
                }
            ]
        )

        df = pd.concat([df, row], ignore_index=True)
    return df
