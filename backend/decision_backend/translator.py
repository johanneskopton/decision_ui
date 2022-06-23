import numpy as np
import json
import re

PRECISION = 5


class Translator:
    def __init__(self, model):
        self.model = self._strip_model(model)

    def _get_interface_by_name(self, node, interface_name):
        for interface in node["interfaces"]:
            if interface["name"] == interface_name:
                return interface["value"]

    def _process_numeric(self, x):
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

    def _get_estimates(self):
        for node in self.model["nodes"]:
            if node["type"] != "UncertainInput":
                continue
            distribution = node["options"]["Probability distribution"]
            lower = self._get_interface_by_name(node, "lower")
            upper = self._get_interface_by_name(node, "upper")
            lower, upper = self._process_numeric([lower, upper])
            name = node["name"]
            print(name, distribution, lower, upper)

    def _strip_model(self, model):
        target_interfaces = set([c["to"] for c in model["connections"]])
        variable_names = set()
        for node in model["nodes"]:
            del node["position"]
            del node["state"]
            del node["width"]
            del node["twoColumn"]
            del node["customClasses"]
            if node["type"] == "Display":
                node["options"] = []
            for i, interface in enumerate(node["interfaces"]):
                new_interface = {
                    "name": interface[0], "id": interface[1]["id"]}
                if interface[0] == "Result" \
                        or interface[1]["id"] in target_interfaces:
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

        return model

    def __str__(self):
        return (json.dumps(self.model, sort_keys=True, indent=4))
