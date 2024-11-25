import numpy as np
import re
import pandas as pd
import os
import tempfile
import jinja2
import logging

from typing import Mapping, Any

from decision_backend.translation.nodes import node_implementations
from decision_backend.translation.model import StrippedModel, RawModel, ExtendedNode, RawNodeInterface, RawConnection
from decision_backend.translation.constants import RESULT_NODE_TYPE, ESTIMATE_NODE_TYPE

logger = logging.getLogger(__name__)

PRECISION = 5

src_dir = os.path.dirname(__file__)
template_dir = os.path.join(src_dir, "templates")

templateLoader = jinja2.FileSystemLoader(searchpath=template_dir)
templateEnv = jinja2.Environment(loader=templateLoader)


class Translator:
    def __init__(self, model: RawModel, mc_runs: int, do_evpi=False):
        self.model = self._strip_model(model)
        self.mc_runs = mc_runs
        self.do_evpi = do_evpi

        self.estimates_df = None
        self.r_script = None

        self.r_script_file = None
        self.estimates_file = None
        self.results_file = None

    def _get_node_by_variable_name(self, variable_name):
        for node in self.model.nodes:
            if node.variable_name == variable_name:
                return node
        raise ValueError("Node '{}' does not exists.".format(variable_name))

    def _get_source_node_from_connection(self, connection: RawConnection) -> ExtendedNode:
        for node in self.model.nodes:
            for _, output in node.outputs.items():
                if output.id == connection.from_:
                    return node

    def _get_connection_from_input(self, input: RawNodeInterface) -> RawConnection:
        for connection in self.model.connections:
            if connection.to == input.id:
                return connection


    @staticmethod
    def _process_numeric(x):
        return np.around(x, PRECISION)

    @staticmethod
    def _create_variable_name(name, names=set()):
        name = re.sub(r" ", "_", name)
        name = re.sub(r"[^a-zA-Z0-9\_]", "", name)
        name = name.strip("_")
        base_name = name
        i = 2
        while name in names:
            name = base_name + "_{}".format(i)
            i += 1
        return name

    def extract_estimates(self):
        self.estimates_df = pd.DataFrame(
            columns=[
                "label",
                "variable",
                "distribution",
                "lower",
                "median",
                "upper",
            ]
        )
        for node in self.model.nodes:
            if node.type != ESTIMATE_NODE_TYPE:
                continue
            distribution = node.inputs["distribution"].value
            if distribution == "constant":
                value = node.inputs["value"].value
                lower = value
                upper = value
            else:
                lower = node.inputs["lower"].value
                upper = node.inputs["upper"].value
            lower, upper = self._process_numeric([lower, upper])
            variable_name = node.variable_name
            label = node.title
            variable = {
                "label": label,
                "variable": variable_name,
                "lower": lower,
                "upper": upper,
                "distribution": distribution,
            }
            variable = pd.DataFrame([variable])
            self.estimates_df = pd.concat(
                [self.estimates_df, variable], ignore_index=True
            )

    def translate_to_files(self):
        self.estimates_file = tempfile.NamedTemporaryFile(
            "w+t", delete=False, suffix=".csv", prefix="decision_ui_estimate_"
        )
        self.results_file = tempfile.NamedTemporaryFile(
            "w+t", delete=False, suffix=".csv", prefix="decision_ui_result_"
        )
        self.evpi_file = tempfile.NamedTemporaryFile(
            "w+t", delete=False, suffix=".csv", prefix="decision_ui_evpi_"
        )
        self.r_script_file = tempfile.NamedTemporaryFile(
            "w+t", delete=False, suffix=".R", prefix="decision_ui_script_"
        )
        logger.debug("results file %s", str(self.results_file))
        self.extract_estimates()
        self.create_r_script(
            self.estimates_file.name, self.results_file.name, self.evpi_file.name
        )
        try:
            self.r_script_file.write(self.r_script)
            self.r_script_file.flush()
            self.estimates_df.to_csv(self.estimates_file.name)
            self.estimates_file.flush()
            self.results_file.flush()
            self.evpi_file.flush()
        finally:
            self.r_script_file.close()
            self.estimates_file.close()
            self.results_file.close()
            self.evpi_file.close()

    def clean(self):
        os.unlink(self.r_script_file.name)
        os.unlink(self.estimates_file.name)
        os.unlink(self.results_file.name)
        os.unlink(self.evpi_file.name)

    def create_r_script(self, estimates_file, results_file, evpi_file):
        """Generates the R script from the the model function and a jinja2 template.
        Needs extract_estimates to be run first!
        """
        mc_template = templateEnv.get_template("mc.R")

        n_estimates = len(self.estimates_df)
        n_prob_estimates = (self.estimates_df["distribution"] != "constant").sum(
            axis=0
        )

        first_out_var = None
        for node in self.model.nodes:
            if node.type == RESULT_NODE_TYPE:
                first_out_var = node.variable_name
                break

        res_str = mc_template.render(
            estimates_path=estimates_file,
            model_function=self._get_model_function(),
            results_path=results_file,
            evpi_path=evpi_file,
            is_estimate=n_estimates > 0,
            do_evpi=n_prob_estimates > 0 and self.do_evpi,
            first_out_var=first_out_var,
            mc_runs=self.mc_runs,
        )
        self.r_script = res_str

    def _translate_node(self, variable_name):
        node = self._get_node_by_variable_name(variable_name)

        input_variables: Mapping[str, Any] = {}
        for input_name, input in node.inputs.items():
            connection = self._get_connection_from_input(input)
            if connection is None:
                term = np.around(input.value, 7)
            else:
                source_node = self._get_source_node_from_connection(connection)
                term = source_node.variable_name
            input_variables[input_name] = term

        # input_variable_names.update(node.inputs)
        # translate based on node type
        print(input_variables)
        r_right_side = node_implementations[node.type](input_variables)

        if type(r_right_side) == str:
            r_line = "{} <- {}".format(variable_name, r_right_side)
        elif type(r_right_side) == tuple:
            r_line = "{} <- {}\n{}{}".format(
                variable_name, r_right_side[0], variable_name, r_right_side[1]
            )

        return r_line

    def _translate_subgraph(self, variable_name):
        """Translate the subgraph that leads to `variable name`.
        Leave out the nodes, that are already defined.
        """
        res_str = ""
        node = self._get_node_by_variable_name(variable_name)
        if node.type == ESTIMATE_NODE_TYPE:
            return res_str

        res_str = self._translate_node(variable_name) + "\n" + res_str

        for _, input in node.inputs.items():
            connection = self._get_connection_from_input(input)

            if connection is None:
                continue

            source_node = self._get_source_node_from_connection(connection)

            subsubgraph = self._translate_subgraph(source_node.variable_name)
            res_str = subsubgraph + res_str

        return res_str

    def _get_model_function(self):
        res_str = "model_function <- function(){\n"
        defined_nodes = set()
        output_var_str = ""

        for node in self.model.nodes:
            if node.type != RESULT_NODE_TYPE:
                continue

            subgraph_str = self._translate_subgraph(node.variable_name)

            stripped_subgraph_str = ""
            for line in subgraph_str.splitlines():
                line_variable_name = line.split(" <- ")[0]
                if line_variable_name not in defined_nodes:
                    stripped_subgraph_str += line + "\n"
                    defined_nodes.add(line_variable_name)

            subgraph_str = stripped_subgraph_str
            subgraph_str = "# {}\n".format(node.variable_name) + subgraph_str
            # indent subgraph r code
            subgraph_str = "\n".join(
                ["\t" + line for line in subgraph_str.splitlines()]
            )
            subgraph_str += "\n"
            res_str += subgraph_str
            res_str += "\n"
            output_var_str += "{var_name}={var_name}, ".format(
                var_name=node.variable_name
            )

        output_var_str = output_var_str[:-2]
        res_str += "\t# generate list of output variables\n"
        res_str += "\treturn(list({}))".format(output_var_str)
        res_str += "\n}"
        return res_str

    def _strip_model(self, model: RawModel) -> StrippedModel:
        variable_names = set()

        # remove node output values
        # which should not be present due to cleaning in frontend
        extended_nodes = []
        for node in model.graph.nodes:
            for output in node.outputs.values():
                output.value = None

            variable_name = self._create_variable_name(node.title, variable_names)
            variable_names.add(variable_name)
            extended_nodes.append(ExtendedNode(**node.model_dump(), variable_name=variable_name))

        return StrippedModel(nodes=extended_nodes, connections=model.graph.connections)

    def __str__(self):
        return self.model.json()
