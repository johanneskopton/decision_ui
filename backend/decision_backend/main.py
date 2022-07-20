from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from decision_backend.model import RawModel
from decision_backend.decision_support_wrapper import DecisionSupportWrapper

app = FastAPI()


origins = [
    "http://localhost:8080",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.post("/api/v1/decision_support")
def root(model: RawModel):

    dsw = DecisionSupportWrapper(model)
    dsw.run()
    hist = dsw.get_hist()
    r_script = dsw.get_r_script()
    estimates = dsw.get_estimates()
    dsw.clean()

    return {
        "hist": hist,
        "r_script": r_script,
        "estimates": estimates
    }
