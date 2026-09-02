from typing import Dict, Any, Optional

# The canonical adult reference range table
# Fields: (critical_low, normal_low, normal_high, critical_high, unit)
REFERENCE_RANGES: Dict[str, Dict[str, Any]] = {
    "Hemoglobin": {
        "critical_low": 7.0,
        "low": 12.0,
        "high": 17.5,
        "critical_high": 20.0,
        "unit": "g/dL"
    },
    "WBC": {
        "critical_low": 2.0,
        "low": 4.0,
        "high": 11.0,
        "critical_high": 30.0,
        "unit": "10³/µL"
    },
    "Platelets": {
        "critical_low": 50.0,
        "low": 150.0,
        "high": 450.0,
        "critical_high": 1000.0,
        "unit": "10³/µL"
    },
    "Glucose": {
        "critical_low": 50.0,
        "low": 70.0,
        "high": 99.0,
        "critical_high": 400.0,
        "unit": "mg/dL"
    },
    "Creatinine": {
        "critical_low": None,
        "low": 0.6,
        "high": 1.3,
        "critical_high": 4.0,
        "unit": "mg/dL"
    },
    "Sodium": {
        "critical_low": 120.0,
        "low": 135.0,
        "high": 145.0,
        "critical_high": 160.0,
        "unit": "mmol/L"
    },
    "Potassium": {
        "critical_low": 2.5,
        "low": 3.5,
        "high": 5.1,
        "critical_high": 6.5,
        "unit": "mmol/L"
    },
    "Calcium": {
        "critical_low": 6.0,
        "low": 8.6,
        "high": 10.2,
        "critical_high": 13.0,
        "unit": "mg/dL"
    }
}

# Alias map to map common variations to the canonical test name
ALIASES: Dict[str, str] = {
    "hgb": "Hemoglobin",
    "hb": "Hemoglobin",
    "wbc count": "WBC",
    "white blood cells": "WBC",
    "plt": "Platelets",
    "glucose (fasting)": "Glucose",
    "fasting glucose": "Glucose",
    "creat": "Creatinine",
    "cr": "Creatinine",
    "na": "Sodium",
    "k": "Potassium",
    "ca": "Calcium"
}

def get_canonical_name(test_name: str) -> str:
    """Normalizes the test name using the alias map."""
    cleaned = test_name.strip().lower()
    canonical = ALIASES.get(cleaned)
    if canonical:
        return canonical
    # If not in alias map, return it title cased
    return test_name.strip().title()

def get_reference_range(test_name: str) -> Optional[Dict[str, Any]]:
    """Returns the reference range dict for a test, if known."""
    return REFERENCE_RANGES.get(get_canonical_name(test_name))
