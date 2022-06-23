import json
import os
from decision_backend.translator import Translator

fp = "data/model1.json"
test_dir = os.path.dirname(__file__)

model = json.load(open(os.path.join(test_dir, fp), "r"))


def test_create_translator():
    translator = Translator(model)
    assert len(translator.model["nodes"]) == 8


def test_create_variable_name():
    name = Translator._create_variable_name("a a")
    assert name == "a_a"

    name = Translator._create_variable_name("a a ")
    assert name == "a_a"

    name = Translator._create_variable_name("a a_")
    assert name == "a_a"

    name = Translator._create_variable_name("a\"§$%&/()=")
    assert name == "a"

    name = Translator._create_variable_name("a", {"a"})
    assert name == "a_2"

    name = Translator._create_variable_name("a", {"a", "a_2"})
    assert name == "a_3"


def test_strip_model():
    translator = Translator(model)
    node0 = translator.model["nodes"][0]
    assert set(node0.keys()) == {
        "type",
        "id",
        "interfaces",
        "options",
        "name",
        "variable_name"}
    assert set(translator.model.keys()) == {"nodes", "connections"}
