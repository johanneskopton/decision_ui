import json
import os
import pandas as pd
import numpy as np
from decision_backend.translator import Translator

fp = "data/model2.json"
test_dir = os.path.dirname(__file__)

model = json.load(open(os.path.join(test_dir, fp), "r"))


def test_create_translator():
    translator = Translator(model)
    assert len(translator.model["nodes"]) == 12


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
    translator.extract_estimates()
    assert type(translator.estimates_df) == pd.DataFrame
    print(translator.estimates_df.loc[:, "upper"])
    assert (translator.estimates_df.loc[:, "lower"] == [
        30000, 1.8, 40, 0.2]).all()
    assert (translator.estimates_df.loc[:, "upper"] == [
        50000, 2.4, 50, 0.5]).all()
    assert np.isnan(translator.estimates_df.loc[0, "median"])


def test_translate_math_node():
    translator = Translator(model)
    r_line = translator._translate_node("Profit")
    assert r_line == "Profit <- Revenue - Cost"


def test_translate_sum_node():
    translator = Translator(model)
    r_line = translator._translate_node("Cost")
    assert r_line == "Cost <- Variable_Cost + Fixed_Cost"


def test_translate_chance_event_node():
    translator = Translator(model)
    r_line = translator._translate_node("Selling_Price")
    target = "Selling_Price <- chance_event(0.1, 1, Selling_Price_Base)"
    assert r_line == target


def test_translate_display_node():
    translator = Translator(model)
    r_line = translator._translate_node("ProfitResult")
    assert r_line == "ProfitResult <- Profit"
