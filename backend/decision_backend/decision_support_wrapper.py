import subprocess

import pandas as pd
import numpy as np

from decision_backend.translator import Translator
from decision_backend.model import RawModel


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
        subprocess.run(["Rscript", self.translator.r_script_file.name])

    def get_hist(self):
        df = pd.read_csv(self.translator.results_file.name)
        res = dict()
        res["density"] = dict()
        combined_df = pd.concat([df[col] for col in df.columns])
        _, combined_edges = np.histogram(list(combined_df), bins=100)
        res["bins"] = combined_edges.tolist()
        for column in df:
            mc_runs = list(df[column])
            hist_vals, _ = np.histogram(
                mc_runs, bins=combined_edges, density=True)
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
        return(res)

    def get_r_script(self):
        return open(self.translator.r_script_file.name, "r").read()

    def get_estimates(self):
        return open(self.translator.estimates_file.name, "r").read()

    def clean(self):
        self.translator.clean()
