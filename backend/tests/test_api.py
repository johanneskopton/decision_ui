import os
import json

from fastapi.testclient import TestClient

from decision_backend.main import app

client = TestClient(app)

test_dir = os.path.dirname(__file__)
test_data_dir = os.path.join(test_dir, "data")

model_path = "model.json"
model = json.load(open(os.path.join(test_data_dir, model_path), "r"))


def test_api():
    response = client.post("/api/v1/decision_support", data=json.dumps(model))
    c = json.loads(response.content)
    assert type(c["hist"]["y.ProfitResult"]["values"]) == list
    assert type(c["r_script"]) == str
    assert type(c["estimates"]) == str
