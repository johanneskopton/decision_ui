import json
import os
import pandas as pd
import numpy as np
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


def test_extract_estimates():
    translator = Translator(model)
    translator._extract_estimates()
    assert type(translator.estimates_df) == pd.DataFrame
    assert (translator.estimates_df.loc[:, "lower"] == [0, 0, 0.7]).all()
    assert (translator.estimates_df.loc[:, "upper"] == [1, 1.3, 1.5]).all()
    assert np.isnan(translator.estimates_df.loc[0, "median"])


def test_translate_math_node():
    translator = Translator(model)
    r_line = translator._translate_node("Profit")
    assert r_line == "Profit <- Revenue - Cost"


def test_translate_sum_node():
    translator = Translator(model)
    r_line = translator._translate_node("Cost")
    print(r_line)
    assert r_line == "Profit <- Revenue - Cost"
