"""Test Baklava model to R-code translation"""

# pylint: disable=protected-access

import json
import os


from decision_backend.baklava.common.schema import BaklavaModel
from decision_backend.baklava.model.parser import ModelParser
from decision_backend.baklava.translate.model import translate_model
from decision_backend.baklava.translate.variables import VariableManager, _generate_variable_name


FIXTURES_DIRECTORY = os.path.join(os.path.dirname(__file__), "fixtures")


def test_example_translations():
    """Check each example by translating it and verifying it matches the stored fixture translation."""
    for example_name in os.listdir(os.path.join(FIXTURES_DIRECTORY, "examples")):
        model_path = os.path.join(FIXTURES_DIRECTORY, "examples", example_name, "graph.json")
        translation_path = os.path.join(FIXTURES_DIRECTORY, "examples", example_name, "translation.R")

        # load files
        with open(model_path, "r", encoding="utf8") as f:
            model_json = json.load(f)

        with open(translation_path, "r", encoding="utf8") as f:
            translation_txt = f.read()

        model_parser = ModelParser(BaklavaModel(**model_json))
        variables = VariableManager(model_parser)
        model_function = translate_model(model_parser, variables)

        print(repr(model_function))
        print(repr(translation_txt))

        assert model_function == translation_txt


def test_create_variable_name():
    """Test removal of special characters and adding number suffix to generate unique variable names."""

    name = _generate_variable_name("a a", {})
    assert name == "a_a"

    name = _generate_variable_name("a a ", {})
    assert name == "a_a"

    name = _generate_variable_name("a a_", {})
    assert name == "a_a_"

    name = _generate_variable_name('a"§$%&/()=', {})
    assert name == "a"

    name = _generate_variable_name("a", {"a"})
    assert name == "a_2"

    name = _generate_variable_name("a", {"a", "a_2"})
    assert name == "a_3"
