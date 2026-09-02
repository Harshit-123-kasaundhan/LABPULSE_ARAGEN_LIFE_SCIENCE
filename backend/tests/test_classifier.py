import pytest
from backend.mcp_server.core.classifier import classify_value

# Mock thresholds for testing
mock_thresholds = {
    "critical_low": 10.0,
    "low": 20.0,
    "high": 30.0,
    "critical_high": 40.0,
    "unit": "units"
}

def test_classify_normal():
    status, flag, rule, deviation = classify_value(25.0, mock_thresholds)
    assert status == "Normal"
    assert flag == "in_range"
    assert deviation is None
    
    # Boundary exactly on low/high is Normal
    status, _, _, _ = classify_value(20.0, mock_thresholds)
    assert status == "Normal"
    status, _, _, _ = classify_value(30.0, mock_thresholds)
    assert status == "Normal"

def test_classify_warning():
    status, flag, rule, deviation = classify_value(15.0, mock_thresholds)
    assert status == "Warning"
    assert flag == "low"
    assert deviation.direction == "low"
    assert deviation.distance_from_bound == 5.0
    
    status, flag, rule, deviation = classify_value(35.0, mock_thresholds)
    assert status == "Warning"
    assert flag == "high"
    assert deviation.direction == "high"
    assert deviation.distance_from_bound == 5.0

def test_classify_critical():
    status, flag, rule, deviation = classify_value(5.0, mock_thresholds)
    assert status == "Critical"
    assert flag == "low"
    
    status, flag, rule, deviation = classify_value(45.0, mock_thresholds)
    assert status == "Critical"
    assert flag == "high"
    
    # Boundary exactly on critical bounds is Critical
    status, _, _, _ = classify_value(10.0, mock_thresholds)
    assert status == "Critical"
    status, _, _, _ = classify_value(40.0, mock_thresholds)
    assert status == "Critical"
    
def test_classify_no_critical_bounds():
    thresholds_no_crit = {
        "critical_low": None,
        "low": 20.0,
        "high": 30.0,
        "critical_high": None,
        "unit": "units"
    }
    
    status, flag, rule, deviation = classify_value(5.0, thresholds_no_crit)
    assert status == "Warning"  # Doesn't reach critical since not defined
    assert flag == "low"
    
    status, flag, rule, deviation = classify_value(45.0, thresholds_no_crit)
    assert status == "Warning"  
    assert flag == "high"
