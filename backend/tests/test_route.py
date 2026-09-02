import pytest
from backend.mcp_server.tools.route import route

def test_route_results():
    results = [
        {"test_name": "A", "status": "Normal"},
        {"test_name": "B", "status": "Critical"},
        {"test_name": "C", "status": "Warning"},
        {"test_name": "D", "status": "Unknown"},
        {"test_name": "E", "status": "Normal"},
    ]
    
    res = route(results)
    
    assert res["summary"]["critical"] == 1
    assert res["summary"]["warning"] == 1
    assert res["summary"]["normal"] == 2
    assert res["summary"]["unknown"] == 1
    assert res["summary"]["total"] == 5
    
    ordered = res["ordered_results"]
    assert len(ordered) == 5
    assert ordered[0]["status"] == "Critical"
    assert ordered[1]["status"] == "Warning"
    assert ordered[2]["status"] == "Normal"
    assert ordered[3]["status"] == "Normal"
    assert ordered[4]["status"] == "Unknown"
    
def test_route_empty():
    res = route([])
    assert res["summary"]["total"] == 0
    assert len(res["ordered_results"]) == 0
