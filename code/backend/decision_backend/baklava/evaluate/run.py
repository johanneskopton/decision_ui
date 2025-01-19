"""Method to call Rscript binary."""

import logging
import os
import subprocess  # nosec

from typing import NamedTuple

import jinja2
import pandas as pd

from decision_backend.baklava.model.parser import ModelParser
from decision_backend.baklava.translate.estimates import build_estimates_df
from decision_backend.baklava.evaluate.files import (
    FilesContext,
    open_files_context,
    prepare_filepaths,
    read_evpi_file,
    read_results_file,
    write_estimates_csv_file,
    write_r_script_file,
)
from decision_backend.baklava.translate.model import translate_model
from decision_backend.baklava.common.schema import BaklavaModel
from decision_backend.baklava.translate.variables import VariableManager
from decision_backend.env import DSUI_R_MAX_BINS, DSUI_R_MAX_MCRUNS, DSUI_R_SCRIPT_PATH
from decision_backend.rest.schema import DecisionSupportEVPIResult, DecisionSupportHistogramResult

logger = logging.getLogger(__name__)


class RuntimeInput(NamedTuple):
    """Runtime input values required for running Rscript."""

    r_script: str
    estimates_df: pd.DataFrame


class ExecutionError(Exception):
    """Execution error that is raised in case of Rscript error."""

    def __init__(self, reason, r_script=None, estimates=None, stderr=None):
        self.reason = reason
        self.r_script = r_script
        self.estimates = estimates
        self.stderr = stderr


def _load_jinja_template():
    template_dir = os.path.join(os.path.dirname(__file__), "../templates")
    template_loader = jinja2.FileSystemLoader(searchpath=template_dir)
    template_env = jinja2.Environment(loader=template_loader, autoescape=False)  # nosec
    return template_env.get_template("mc.R")


def _build_r_runtime_input(
    model: BaklavaModel,
    files: FilesContext,
    mc_runs: int,
    do_evpi: bool,
) -> RuntimeInput:
    """Generates the R script from the the model function and a jinja2 template."""
    model_parser = ModelParser(model)
    variables = VariableManager(model_parser)

    model_function = translate_model(model_parser, variables)
    estimates_df = build_estimates_df(model_parser.get_main_graph(), variables)

    n_prob_estimates = (estimates_df["distribution"] != "const").sum(axis=0)
    filepaths = prepare_filepaths(files)

    jinja_template = _load_jinja_template()
    r_script = jinja_template.render(
        estimates_path=filepaths.estimates_fp,
        model_function=model_function,
        results_path=filepaths.results_fp,
        evpi_path=filepaths.evpi_fp,
        is_estimate=len(estimates_df) > 0,
        do_evpi=n_prob_estimates > 0 and do_evpi,
        mc_runs=mc_runs,
    )

    return RuntimeInput(r_script, estimates_df)


def run_baklava_model(model: BaklavaModel, mc_runs: int, bins: int, timeout: float, do_evpi: bool):
    """Execute the R-script for a Baklava model."""
    with open_files_context() as files:
        # generate R input
        try:
            runtime_input = _build_r_runtime_input(model, files, min(DSUI_R_MAX_MCRUNS, mc_runs), do_evpi)

            # write input files
            write_estimates_csv_file(runtime_input.estimates_df, files.estimates_file)
            write_r_script_file(runtime_input.r_script, files.r_script_file)
        except Exception as e:
            raise ExecutionError(f"Error while generating input files for R: {str(e)}") from e

        # execute r
        try:
            result = subprocess.run(  # nosec
                [DSUI_R_SCRIPT_PATH, files.r_script_file.name],
                capture_output=True,
                text=True,
                timeout=timeout,
                check=False,
            )
        except subprocess.TimeoutExpired as e:
            raise ExecutionError(
                f"R process killed after maximum allowed runtime of {timeout} seconds.",
                runtime_input.r_script,
                runtime_input.estimates_df.to_csv(),
            ) from e
        except Exception as e:
            raise ExecutionError(
                f"Error while executing R-script: {str(e)}",
                runtime_input.r_script,
                runtime_input.estimates_df.to_csv(),
            ) from e

        # check r reported any errors
        if result.stderr:
            raise ExecutionError(
                "R process reported an error when executing the R-script.",
                runtime_input.r_script,
                runtime_input.estimates_df.to_csv(),
                result.stderr,
            )

        # read output files
        try:
            if do_evpi:
                return DecisionSupportEVPIResult(evpi=read_evpi_file(files.evpi_file.name))

            return DecisionSupportHistogramResult(
                estimates_csv=runtime_input.estimates_df.to_csv(),
                r_script=runtime_input.r_script,
                histogram_data=read_results_file(files.results_file.name, max(10, min(DSUI_R_MAX_BINS, bins))),
            )
        except Exception as e:
            raise ExecutionError(
                f"Error while reading R result files: {str(e)}",
                runtime_input.r_script,
                runtime_input.estimates_df.to_csv(),
                result.stderr,
            ) from e
