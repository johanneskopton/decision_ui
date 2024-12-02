import subprocess
import logging
import os

import pandas as pd
import numpy as np

from decision_backend.translation.translator import Translator
from decision_backend.translation.model import RawModel

logger = logging.getLogger(__name__)

R_SCRIPT_PATH = os.environ.get("R_SCRIPT_PATH", "Rscript")


class ExecutionError(Exception):

    def __init__(self, r_script, estimates, stdout, stderr):
        self.r_script = r_script
        self.estimates = estimates
        self.stdout = stdout
        self.stderr = stderr


class DecisionSupportWrapper:
    def __init__(
        self,
        raw_model: RawModel,
        mc_runs: int,
        do_evpi: bool = False,
    ):
        self.translator = Translator(raw_model, mc_runs, do_evpi)
        self.translator.translate_to_files()

    def run(self):
        logger.debug("run R script")
        result = subprocess.run(
            [R_SCRIPT_PATH, self.translator.r_script_file.name],
            capture_output=True,
            text=True,
        )
        if result.stderr:
            raise ExecutionError(
                self.get_r_script(), self.get_estimates(), result.stdout, result.stderr
            )

    def get_hist(self):
        df = pd.read_csv(self.translator.results_file.name)
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

    def get_evpi(self):
        try:
            df = pd.read_csv(self.translator.evpi_file.name)
        except pd.errors.EmptyDataError:
            return []
        res = []
        for i, row in df.iterrows():
            res.append(row.to_dict())
        return res

    def get_r_script(self):
        return open(self.translator.r_script_file.name, "r").read()

    def get_estimates(self):
        return open(self.translator.estimates_file.name, "r").read()

    def clean(self):
        self.translator.clean()
