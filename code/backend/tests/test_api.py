# pylint: disable=redefined-outer-name

import os
import json

from fastapi.testclient import TestClient
import pytest

from decision_backend.main import create_app


@pytest.fixture(scope="module")
def client():
    """Generate test api client"""
    with TestClient(create_app()) as c:
        yield c


@pytest.fixture(scope="module")
def test_user():
    """Generate user login info"""
    return {"username": "test@test.com", "password": "test"}


def _do_login(client, test_user) -> str:
    response = client.post("/api/auth/jwt/login", data=test_user)
    assert response.status_code == 200
    token = response.json()["access_token"]
    assert token is not None
    return token


def test_register(client):
    """Test registering user account."""
    response = client.post("/api/auth/register", json={"email": "test@test.com", "password": "test"})
    if response.status_code == 400:
        # user already exists
        assert response.json()["detail"] == "REGISTER_USER_ALREADY_EXISTS"
    else:
        # user was successfully created
        assert response.status_code == 201


def test_login(client, test_user):
    """Test logging in with user credentials."""
    token = _do_login(client, test_user)
    assert token is not None


def test_api(client, test_user):
    """Check that the Monte Carlo simulation API route returns some result."""
    token = _do_login(client, test_user)

    example_dir = os.path.join(os.path.dirname(__file__), "fixtures/examples/1_minimal_model")
    with open(os.path.join(example_dir, "graph.json"), "r", encoding="utf8") as f:
        model = json.load(f)

    response = client.post("/api/v1/monte_carlo", data=json.dumps(model), headers={"Authorization": f"Bearer {token}"})

    assert response.status_code == 200
    c = json.loads(response.content)
    assert isinstance(c["histogram_data"]["values"]["Result_Node"], list)
    assert isinstance(c["histogram_data"]["bins"], list)
    assert isinstance(c["r_script"], str)
    assert isinstance(c["estimates_csv"], str)
