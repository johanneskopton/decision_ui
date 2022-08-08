import json
import os
import pandas as pd
import numpy as np
import jinja2
import subprocess

from decision_backend.translator import Translator
from decision_backend.model import RawModel

test_dir = os.path.dirname(__file__)
test_data_dir = os.path.join(test_dir, "data")

templateLoader = jinja2.FileSystemLoader(searchpath=test_data_dir)
templateEnv = jinja2.Environment(loader=templateLoader)

model_path = "model.json"
model_dict = json.load(open(os.path.join(test_data_dir, model_path), "r"))
model = RawModel(**model_dict)


def test_create_translator():
    translator = Translator(model, 100)
    assert len(translator.model.nodes) == 15


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


def test_extract_estimates():
    translator = Translator(model, 100)
    translator.extract_estimates()
    assert type(translator.estimates_df) == pd.DataFrame
    print(translator.estimates_df.loc[:, "upper"])
    assert (translator.estimates_df.loc[:, "lower"] == [
        30000, 1.8, 40, 0.2]).all()
    assert (translator.estimates_df.loc[:, "upper"] == [
        50000, 2.4, 50, 0.5]).all()
    assert np.isnan(translator.estimates_df.loc[0, "median"])


def test_translate_math_node():
    translator = Translator(model, 100)
    r_line = translator._translate_node("Profit")
    assert r_line == "Profit <- Revenue - Cost"


def test_translate_sum_node():
    translator = Translator(model, 100)
    r_line = translator._translate_node("Cost")
    assert r_line == "Cost <- Variable_Cost + Fixed_Cost"


def test_translate_chance_event_node():
    translator = Translator(model, 100)
    r_line = translator._translate_node("Selling_Price")
    target = "Selling_Price <- chance_event(0.1, 1, Selling_Price_Base)"
    assert r_line == target


def test_translate_display_node():
    translator = Translator(model, 100)
    r_line = translator._translate_node("ProfitResult")
    assert r_line == "ProfitResult <- Profit"


def test_translate_subgraph():
    translator = Translator(model, 100)
    subgraph = translator._translate_subgraph("ProfitResult")
    print(subgraph)
    target = "\
Yield_t <- Yield_kg / 1000\n\
Variable_Cost <- Yield_t * Cost_Per_Yield\n\
Cost <- Variable_Cost + Fixed_Cost\n\
Yield_t <- Yield_kg / 1000\n\
Selling_Price <- chance_event(0.1, 1, Selling_Price_Base)\n\
Revenue <- Selling_Price * Yield_t\n\
Profit <- Revenue - Cost\n\
ProfitResult <- Profit\n"
    assert subgraph == target


def test_write_script():
    translator = Translator(model, 100)
    translator.translate_to_files()
    r_script_template_file = "model.R"
    r_script_template = templateEnv.get_template(r_script_template_file)
    r_script_target = r_script_template.render(
        estimates_path=translator.estimates_file.name,
        results_path=translator.results_file.name,
        evpi_path=translator.evpi_file.name)
    r_script = open(translator.r_script_file.name, "r").read()

    csv_target = open(os.path.join(
        test_data_dir, "model.csv"), "r").read()
    csv = open(translator.estimates_file.name, "r").read()

    translator.clean()

    assert r_script == r_script_target
    assert csv == csv_target


def test_execute_r_mc():
    translator = Translator(model, 100)
    translator.translate_to_files()

    subprocess.run(["Rscript", translator.r_script_file.name])
    df = pd.read_csv(translator.results_file.name)
    target_columns = {'y.ProfitResult',
                      'y.ProfitAltResult',
                      }

    translator.clean()

    assert set(df.columns) == target_columns
