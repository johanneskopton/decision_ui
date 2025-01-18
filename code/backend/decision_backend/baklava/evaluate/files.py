"""Methods to save and load CSV files."""

import tempfile
import os

from contextlib import contextmanager
from typing import Mapping, NamedTuple, Sequence

import pandas as pd
import numpy as np

from decision_backend.baklava.common.schema import HistogramData


class FilesContext(NamedTuple):
    """Combines various temporary files"""

    estimates_file: tempfile.NamedTemporaryFile
    r_script_file: tempfile.NamedTemporaryFile
    results_file: tempfile.NamedTemporaryFile
    evpi_file: tempfile.NamedTemporaryFile


class FilePaths(NamedTuple):
    """Combines file paths of temporary files."""

    estimates_fp: str
    r_script_fp: str
    results_fp: str
    evpi_fp: str


def prepare_filepaths(files: FilesContext) -> FilePaths:
    """Prepare filepaths depending on operating system."""

    r_script_fp = files.r_script_file.name
    estimates_fp = files.estimates_file.name
    results_fp = files.results_file.name
    evpi_fp = files.evpi_file.name

    if os.name == "nt":
        # add extra path delimiter escape for Windows
        r_script_fp = r_script_fp.replace("\\", "\\\\")
        estimates_fp = estimates_fp.replace("\\", "\\\\")
        results_fp = results_fp.replace("\\", "\\\\")
        evpi_fp = evpi_fp.replace("\\", "\\\\")

    return FilePaths(estimates_fp, r_script_fp, results_fp, evpi_fp)


def write_estimates_csv_file(estimates_df: pd.DataFrame, file: tempfile.NamedTemporaryFile):
    """Write estimates csv file to disk."""
    try:
        estimates_df.to_csv(file.name)
        file.flush()
    finally:
        file.close()


def write_r_script_file(r_script: str, file: tempfile.NamedTemporaryFile):
    """Write r-code file to disk."""
    try:
        file.write(r_script)
        file.flush()
    finally:
        file.close()


def read_results_file(result_fp: str, bins=100) -> HistogramData:
    """Read and parse Monte Carlo results file."""
    df = pd.read_csv(result_fp)

    # combine data to determine suitable bins for all results
    combined_df = pd.concat([df[col] for col in df.columns])
    combined_df = combined_df[combined_df.notnull()]
    _, combined_bins = np.histogram(list(combined_df), bins=bins)

    # get individual histogram values for each result using combined bins
    values: Mapping[str, Sequence[float]] = {}
    for column in df:
        variable_name = str(column)[2:] if str(column).startswith("y.") else str(column)
        values[variable_name] = np.histogram(df[column], bins=combined_bins, density=True)[0].tolist()

    return HistogramData(values=values, bins=combined_bins.tolist())


def read_evpi_file(evpi_fp: str) -> Mapping[str, Mapping[str, float]]:
    """Read and parse EVPI results file."""
    try:
        df = pd.read_csv(evpi_fp)
    except pd.errors.EmptyDataError:
        return []
    return {row["variable"]: row.loc[df.columns != "variable"].to_dict() for _, row in df.iterrows()}


@contextmanager
def open_files_context():
    """Contextmanager to keep track of temporary files."""
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
