from fastapi import FastAPI
import subprocess
import pandas as pd

from decision_backend.model import RawModel
from decision_backend.translator import Translator

app = FastAPI()


@app.get("/api/v1/decision_support")
async def root(model: RawModel):
    translator = Translator(model.dict())
    translator.write_script()

    subprocess.run(["Rscript", translator.r_script_file.name])
    df = pd.read_csv(translator.results_file.name)
    return {"message": df}
