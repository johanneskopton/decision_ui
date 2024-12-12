import os
import subprocess
import jinja2
import logging
import pandas as pd

from typing import NamedTuple

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
from decision_backend.baklava.common.schema import (
    BaklavaModel,
    DecisionSupportEVPIResult,
    DecisionSupportHistogramResult,
)
from decision_backend.baklava.translate.variables import VariableManager

logger = logging.getLogger(__name__)

DSUI_R_SCRIPT_PATH = os.environ.get("DSUI_R_SCRIPT_PATH", "Rscript")
DSUI_R_MAX_RUNTIME = int(os.environ.get("DSUI_R_MAX_RUNTIME", "10"))  # in seconds
DSUI_R_MAX_MCRUNS = int(os.environ.get("DSUI_R_MAX_MCRUNS", "100000"))
DSUI_R_MAX_BINS = int(os.environ.get("DSUI_MAX_HISTOGRAM_BINS", "200"))


class RuntimeInput(NamedTuple):

    r_script: str
    estimates_df: pd.DataFrame


class ExecutionError(Exception):

    def __init__(self, reason, r_script, estimates, stderr):
        self.reason = reason
        self.r_script = r_script
        self.estimates = estimates
        self.stderr = stderr


def _load_jinja_template():
    template_dir = os.path.join(os.path.dirname(__file__), "../templates")
    templateLoader = jinja2.FileSystemLoader(searchpath=template_dir)
    templateEnv = jinja2.Environment(loader=templateLoader)
    return templateEnv.get_template("mc.R")


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


def run_baklava_model(model: BaklavaModel, mc_runs: int, bins: int, do_evpi: bool):
    with open_files_context() as files:
        # generate R input
        try:
            runtime_input = _build_r_runtime_input(model, files, min(DSUI_R_MAX_MCRUNS, mc_runs), do_evpi)

            # write input files
            write_estimates_csv_file(runtime_input.estimates_df, files.estimates_file)
            write_r_script_file(runtime_input.r_script, files.r_script_file)
        except Exception as e:
            raise ExecutionError(f"Error while generating input files for R: " + str(e), None, None, None)

        # execute r
        try:
            result = subprocess.run(
                [DSUI_R_SCRIPT_PATH, files.r_script_file.name],
                capture_output=True,
                text=True,
                timeout=DSUI_R_MAX_RUNTIME,
            )
        except subprocess.TimeoutExpired as e:
            raise ExecutionError(
                f"R process killed after maximum allowed runtime of {DSUI_R_MAX_RUNTIME} seconds.",
                runtime_input.r_script,
                runtime_input.estimates_df.to_csv(),
                None,
            )
        except Exception as e:
            raise ExecutionError(
                f"Error while executing R-script: " + str(e),
                runtime_input.r_script,
                runtime_input.estimates_df.to_csv(),
                None,
            )

        # check r reported any errors
        if result.stderr:
            raise ExecutionError(
                f"R process reported an error when executing the R-script.",
                runtime_input.r_script,
                runtime_input.estimates_df.to_csv(),
                result.stderr,
            )

        # read output files
        try:
            if do_evpi:
                return DecisionSupportEVPIResult(evpi=read_evpi_file(files.evpi_file.name))

            return DecisionSupportHistogramResult(
                estimates=runtime_input.estimates_df.to_csv(),
                r_script=runtime_input.r_script,
                hist=read_results_file(files.results_file.name, max(10, min(DSUI_R_MAX_BINS, bins))),
            )
        except Exception as e:
            raise ExecutionError(
                f"Error while reading R result files: " + str(e),
                runtime_input.r_script,
                runtime_input.estimates_df.to_csv(),
                result.stderr,
            )
