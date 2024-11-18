import numpy as np
import re
import pandas as pd
import os
import tempfile
import jinja2
import logging

from decision_backend.node_translator import node_implementations
from decision_backend.model import StrippedModel

logger = logging.getLogger(__name__)

PRECISION = 5

src_dir = os.path.dirname(__file__)
template_dir = os.path.join(src_dir, "templates")

templateLoader = jinja2.FileSystemLoader(searchpath=template_dir)
templateEnv = jinja2.Environment(loader=templateLoader)


class Translator:
    def __init__(self, model, mc_runs, do_evpi=False):
        self.model = self._strip_model(model)
        self.mc_runs = mc_runs
        self.do_evpi = do_evpi

        self.estimates_df = None
        self.r_script = None

        self.r_script_file = None
        self.estimates_file = None
        self.results_file = None

    def _get_interface_by_name(self, node, interface_name):
        for interface in node.interfaces:
            if interface["name"] == interface_name:
                return interface

    def _get_node_by_variable_name(self, variable_name):
        for node in self.model.nodes:
            if node.variable_name == variable_name:
                return node
        raise ValueError("Node '{}' does not exists.".format(variable_name))

    def _get_connection_from_interface(self, interface_id, direction="to"):
        for connection in self.model.connections:
            if connection[direction] == interface_id:
                return connection

    def _get_node_from_result_interface(self, interface_id):
        for node in self.model.nodes:
            result_interface = self._get_interface_by_name(node, "Result")
            if result_interface is None:
                continue
            if result_interface["id"] == interface_id:
                return node

    @staticmethod
    def _process_numeric(x):
        return np.around(x, PRECISION)

    @staticmethod
    def _create_variable_name(name, names=set()):
        name = re.sub(r' ', "_", name)
        name = re.sub(r'[^a-zA-Z0-9\_]', "", name)
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
                "upper", ])
        for node in self.model.nodes:
            if node.type != "Estimate":
                continue
            distribution = node.options["Probability distribution"]
            if distribution == "deterministic":
                # rename, since in decisionSupport it is incomprehensibly
                # called "const"
                distribution = "const"
                # set upper and lower to the value since in decisionSupport
                # it needs to be this way..
                value = node.options["value"]
                lower = value
                upper = value
            else:
                lower = node.options["lower"]
                upper = node.options["upper"]
            lower, upper = self._process_numeric([lower, upper])
            variable_name = node.variable_name
            label = node.name
            variable = {
                "label": label,
                "variable": variable_name,
                "lower": lower,
                "upper": upper,
                "distribution": distribution
            }
            variable = pd.DataFrame([variable])
            self.estimates_df = pd.concat(
                [self.estimates_df, variable], ignore_index=True)

    def translate_to_files(self):
        self.estimates_file = tempfile.NamedTemporaryFile(
            "w+t", delete=False, suffix=".csv", prefix="decision_ui_estimate_")
        self.results_file = tempfile.NamedTemporaryFile(
            "w+t", delete=False, suffix=".csv", prefix="decision_ui_result_")
        self.evpi_file = tempfile.NamedTemporaryFile(
            "w+t", delete=False, suffix=".csv", prefix="decision_ui_evpi_")
        self.r_script_file = tempfile.NamedTemporaryFile(
            "w+t", delete=False, suffix=".R", prefix="decision_ui_script_")
        logger.debug("results file %s", str(self.results_file))
        self.extract_estimates()
        self.create_r_script(
            self.estimates_file.name,
            self.results_file.name,
            self.evpi_file.name)
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
        """ Generates the R script from the the model function and a jinja2 template.
        Needs extract_estimates to be run first!
        """
        mc_template = templateEnv.get_template("mc.R")

        n_estimates = len(self.estimates_df)
        n_prob_estimates = (
            self.estimates_df["distribution"] != "const").sum(axis=0)

        for node in self.model.nodes:
            if node.type == "Result":
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
            mc_runs=self.mc_runs
        )
        self.r_script = res_str

    def _translate_node(self, variable_name):
        node = self._get_node_by_variable_name(variable_name)
        input_variable_names = dict()
        for interface in node.interfaces:
            if interface["name"] == "Result":
                continue
            connection = self._get_connection_from_interface(interface["id"])
            if connection is None:
                term = np.around(interface["value"], 7)
            else:
                input_result_interface_id = connection["from"]
                source_node = self._get_node_from_result_interface(
                    input_result_interface_id)
                term = source_node.variable_name
            input_variable_names[interface["name"]] = term
        input_variable_names.update(node.options)
        node_type = node.type
        r_right_side = node_implementations[node_type](input_variable_names)
        if type(r_right_side) == str:
            r_line = "{} <- {}".format(variable_name, r_right_side)
        elif type(r_right_side) == tuple:
            r_line = "{} <- {}\n{}{}".format(variable_name,
                                             r_right_side[0],
                                             variable_name,
                                             r_right_side[1])
        return r_line

    def _translate_subgraph(self, variable_name):
        """ Translate the subgraph that leads to `variable name`.
        Leave out the nodes, that are already defined.
        """
        res_str = ""
        node = self._get_node_by_variable_name(variable_name)
        if node.type == "Estimate":
            return res_str
        res_str = self._translate_node(variable_name) + "\n" + res_str
        node = self._get_node_by_variable_name(variable_name)
        for interface in node.interfaces:
            if interface["name"] == "Result":
                continue
            connection = self._get_connection_from_interface(interface["id"])
            if connection is None:
                continue
            input_result_interface_id = connection["from"]
            source_node = self._get_node_from_result_interface(
                input_result_interface_id)
            source_node_variable_name = source_node.variable_name
            subsubgraph = self._translate_subgraph(source_node_variable_name)
            res_str = subsubgraph + res_str
        return res_str

    def _get_model_function(self):
        res_str = "model_function <- function(){\n"
        defined_nodes = set()
        output_var_str = ""
        for node in self.model.nodes:
            node_variable_name = node.variable_name
            if node.type != "Result":
                continue
            subgraph_str = self._translate_subgraph(
                node_variable_name)
            stripped_subgraph_str = ""
            for line in subgraph_str.splitlines():
                line_variable_name = line.split(" <- ")[0]
                if line_variable_name not in defined_nodes:
                    stripped_subgraph_str += line + "\n"
                    defined_nodes.add(line_variable_name)
            subgraph_str = stripped_subgraph_str
            subgraph_str = "# {}\n".format(node_variable_name) + subgraph_str
            # indent subgraph r code
            subgraph_str = "\n".join(
                ["\t" + line for line in subgraph_str.splitlines()])
            subgraph_str += "\n"
            res_str += subgraph_str
            res_str += "\n"
            output_var_str += "{var_name}={var_name}, ".format(
                var_name=node_variable_name)
        output_var_str = output_var_str[:-2]
        res_str += "\t# generate list of output variables\n"
        res_str += "\treturn(list({}))".format(output_var_str)
        res_str += "\n}"
        return res_str

    def _strip_model(self, model):
        model = model.dict()
        target_interfaces = set([c["to"] for c in model["connections"]])
        variable_names = set()
        for node in model["nodes"]:
            del node["position"]
            del node["state"]
            del node["width"]
            del node["twoColumn"]
            del node["customClasses"]
            if node["type"] in ["Display", "Result"]:
                node["options"] = []
            for i, interface in enumerate(node["interfaces"]):
                new_interface = {
                    "name": interface[0], "id": interface[1]["id"]}
                if interface[0] == "Result" \
                        or interface[1]["id"] in target_interfaces:
                    if "value" in interface[1].keys():
                        del interface[1]["value"]
                else:
                    new_interface["value"] = interface[1]["value"]
                node["interfaces"][i] = new_interface
            new_options = dict()
            for i, option in enumerate(node["options"]):
                new_options[option[0]] = option[1]
            node["options"] = new_options
            node["variable_name"] = self._create_variable_name(
                node["name"], variable_names)
            variable_names.add(node["variable_name"])
        del model["panning"]
        del model["scaling"]

        return StrippedModel(**model)

    def __str__(self):
        return self.model.json()
