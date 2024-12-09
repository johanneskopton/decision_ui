import tempfile
import os

from contextlib import contextmanager
from typing import NamedTuple

import pandas as pd
import numpy as np


class FilesContext(NamedTuple):
    estimates_file: tempfile.NamedTemporaryFile
    r_script_file: tempfile.NamedTemporaryFile
    results_file: tempfile.NamedTemporaryFile
    evpi_file: tempfile.NamedTemporaryFile


class FilePaths(NamedTuple):
    estimates_fp: str
    r_script_fp: str
    results_fp: str
    evpi_fp: str


def prepare_filepaths(files: FilesContext) -> FilePaths:

    r_script_fp = files.r_script_file.name
    estimates_fp = files.estimates_file.name
    results_fp = files.results_file.name
    evpi_fp = files.evpi_file.name

    if os.name == "nt":
        r_script_fp = r_script_fp.replace("\\", "\\\\")
        estimates_fp = estimates_fp.replace("\\", "\\\\")
        results_fp = results_fp.replace("\\", "\\\\")
        evpi_fp = evpi_fp.replace("\\", "\\\\")

    return FilePaths(estimates_fp, r_script_fp, results_fp, evpi_fp)


def write_estimates_csv_file(estimates_df: pd.DataFrame, file: tempfile.NamedTemporaryFile):
    try:
        estimates_df.to_csv(file.name)
        file.flush()
    finally:
        file.close()


def write_r_script_file(r_script: str, file: tempfile.NamedTemporaryFile):
    try:
        file.write(r_script)
        file.flush()
    finally:
        file.close()


def read_results_file(result_fp: str):
    df = pd.read_csv(result_fp)
    res = dict()
    res["density"] = dict()
    combined_df = pd.concat([df[col] for col in df.columns])
    combined_df = combined_df[combined_df.notnull()]
    _, combined_edges = np.histogram(list(combined_df), bins=100)
    res["bins"] = combined_edges.tolist()
    for column in df:
        mc_runs = list(df[column])
        hist_vals, _ = np.histogram(mc_runs, bins=combined_edges, density=True)
        res["density"][column] = hist_vals.tolist()
    return res


def read_evpi_file(evpi_fp: str):
    try:
        df = pd.read_csv(evpi_fp)
    except pd.errors.EmptyDataError:
        return []
    res = []
    for i, row in df.iterrows():
        res.append(row.to_dict())
    return res


@contextmanager
def open_files_context():
    estimates_file = tempfile.NamedTemporaryFile("w+t", delete=False, suffix=".csv", prefix="decision_ui_estimate_")
    r_script_file = tempfile.NamedTemporaryFile("w+t", delete=False, suffix=".R", prefix="decision_ui_script_")
    results_file = tempfile.NamedTemporaryFile("w+t", delete=False, suffix=".csv", prefix="decision_ui_result_")
    evpi_file = tempfile.NamedTemporaryFile("w+t", delete=False, suffix=".csv", prefix="decision_ui_evpi_")

    yield FilesContext(estimates_file, r_script_file, results_file, evpi_file)

    estimates_file.close()
    r_script_file.close()
    results_file.close()
    evpi_file.close()

    os.unlink(estimates_file.name)
    os.unlink(r_script_file.name)
    os.unlink(results_file.name)
    os.unlink(evpi_file.name)
