import pytest
from fastapi.testclient import TestClient
from unittest.mock import patch, AsyncMock
from backend.api.main import app

client = TestClient(app)

@pytest.fixture
def mock_mcp_client():
    with patch("backend.api.main.mcp_client") as mock:
        yield mock

def test_health(mock_mcp_client):
    mock_mcp_client.check_health = AsyncMock(return_value=True)
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok", "mcp_server": "reachable"}

def test_analyze_labs_validation_cap():
    payload = {
        "results": [{"test_name": f"Test{i}", "value": 10.0, "unit": "unit"} for i in range(30)]
    }
    response = client.post("/analyze_labs", json=payload)
    assert "at most 25 items" in response.json()["detail"][0]["msg"]

def test_analyze_labs_invalid_data():
    payload = {
        "results": [{"test_name": "A", "value": "not-a-number", "unit": "unit"}]
    }
    response = client.post("/analyze_labs", json=payload)
    assert response.status_code == 422 # Pydantic validation fails
