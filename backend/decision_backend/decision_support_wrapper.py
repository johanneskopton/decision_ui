import subprocess

import pandas as pd
import numpy as np

from decision_backend.translator import Translator
from decision_backend.model import RawModel


class DecisionSupportWrapper:
    def __init__(self, raw_model: RawModel):
        self.translator = Translator(raw_model)
        self.translator.write_script()

    def run(self):
        subprocess.run(["Rscript", self.translator.r_script_file.name])

    def get_hist(self):
        df = pd.read_csv(self.translator.results_file.name)
        res = dict()
        for column in df:
            mc_runs = list(df[column])
            hist = np.histogram(mc_runs, bins=20, density=True)
            res[column] = {
                "values": hist[0].tolist(),
                "bins": hist[1].tolist(),
            }
        return res

    def get_r_script(self):
        return open(self.translator.r_script_file.name, "r").read()

    def get_estimates(self):
        return open(self.translator.estimates_file.name, "r").read()
