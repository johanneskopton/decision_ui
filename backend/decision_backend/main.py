from fastapi import FastAPI

from decision_backend.model import RawModel
from decision_backend.decision_support_wrapper import DecisionSupportWrapper

app = FastAPI()


@app.get("/api/v1/decision_support")
async def root(model: RawModel):

    dsw = DecisionSupportWrapper(model)
    dsw.run()
    hist = dsw.get_hist()
    r_script = dsw.get_r_script()
    estimates = dsw.get_estimates()

    return {
        "hist": hist,
        "r_script": r_script,
        "estimates": estimates
    }
