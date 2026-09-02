from typing import Dict, Any, Tuple
from ..core.classifier import classify_value
from ..data.reference_ranges import get_reference_range
from ..models.schemas import ClassifiedResult, ReferenceRange, Thresholds

def classify(test_name: str, value: float, unit: str) -> Dict[str, Any]:
    """
    Classifies a single lab result against known reference ranges.
    Returns a dict that maps to ClassifiedResult.
    """
    # 1. Lookup test
    range_data = get_reference_range(test_name)
    reference_source = "local_dict"
    
    if not range_data:
        # Fallback to optional LLM tool if available, or return Unknown
        # For simplicity in this synchronous tool context, we will import reference.py
        # but in a real decoupled system the agent might orchestrate it. 
        # The PRD mentions classify calls it internally.
        from .reference import lookup_reference_range
        range_data = lookup_reference_range(test_name)
        if range_data:
            reference_source = "llm_lookup"
        else:
            return {
                "test_name": test_name,
                "value": value,
                "unit": unit,
                "status": "Unknown",
                "flag": "unknown",
                "reference_range": None,
                "thresholds": None,
                "deviation": None,
                "reference_source": "none",
                "unit_mismatch": False,
                "rule_applied": "No validated reference range available."
            }

    # 2. Check Unit
    expected_unit = range_data.get("unit")
    unit_mismatch = (expected_unit and unit.strip().lower() != expected_unit.strip().lower())

    # 3. Classify
    status, flag, rule, deviation = classify_value(value, range_data)
    
    # 4. Construct response
    ref_range = ReferenceRange(
        low=range_data.get("low"), 
        high=range_data.get("high"), 
        unit=expected_unit or unit
    )
    
    thresholds = Thresholds(
        critical_low=range_data.get("critical_low"),
        low=range_data.get("low"),
        high=range_data.get("high"),
        critical_high=range_data.get("critical_high")
    )
    
    result = ClassifiedResult(
        test_name=test_name,
        value=value,
        unit=unit,
        status=status,
        flag=flag,
        reference_range=ref_range,
        thresholds=thresholds,
        deviation=deviation,
        reference_source=reference_source,
        unit_mismatch=unit_mismatch,
        rule_applied=rule
    )
    
    return result.model_dump()
