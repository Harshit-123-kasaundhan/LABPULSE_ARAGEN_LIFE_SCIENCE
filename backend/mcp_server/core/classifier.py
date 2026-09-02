from typing import Dict, Any, Tuple, Optional
from ..models.schemas import StatusType, FlagType, DeviationMetrics

def calculate_deviation(value: float, low: Optional[float], high: Optional[float]) -> Optional[DeviationMetrics]:
    """Calculates absolute and percentage deviation from normal bounds."""
    if low is not None and value < low:
        distance = round(low - value, 2)
        try:
            pct = round((distance / low) * 100, 1) if low != 0 else 0.0
        except (ZeroDivisionError, OverflowError):
            pct = 0.0
        return DeviationMetrics(direction="low", distance_from_bound=distance, percent_from_bound=pct)
    elif high is not None and value > high:
        distance = round(value - high, 2)
        try:
            pct = round((distance / high) * 100, 1) if high != 0 else 0.0
        except (ZeroDivisionError, OverflowError):
            pct = 0.0
        return DeviationMetrics(direction="high", distance_from_bound=distance, percent_from_bound=pct)
    return None

def classify_value(value: float, thresholds: Dict[str, Any]) -> Tuple[StatusType, FlagType, str, Optional[DeviationMetrics]]:
    """
    Core classification logic. Pure function.
    Returns: (status, flag, rule_applied_string, deviation_metrics)
    """
    crit_low = thresholds.get("critical_low")
    low = thresholds.get("low")
    high = thresholds.get("high")
    crit_high = thresholds.get("critical_high")

    deviation = calculate_deviation(value, low, high)

    # 1. Critical Low
    if crit_low is not None and value <= crit_low:
        rule = f"{value} <= critical_low ({crit_low}) => Critical (low)"
        return "Critical", "low", rule, deviation
        
    # 2. Critical High
    if crit_high is not None and value >= crit_high:
        rule = f"{value} >= critical_high ({crit_high}) => Critical (high)"
        return "Critical", "high", rule, deviation
        
    # 3. Warning Low
    if low is not None and value < low:
        rule_parts = [f"{value} < normal_low ({low})"]
        if crit_low is not None:
            rule_parts.append(f"but > critical_low ({crit_low})")
        rule = " ".join(rule_parts) + " => Warning (low)"
        return "Warning", "low", rule, deviation
        
    # 4. Warning High
    if high is not None and value > high:
        rule_parts = [f"{value} > normal_high ({high})"]
        if crit_high is not None:
            rule_parts.append(f"but < critical_high ({crit_high})")
        rule = " ".join(rule_parts) + " => Warning (high)"
        return "Warning", "high", rule, deviation

    # 5. Normal
    rule = f"{value} is within normal limits"
    if low is not None and high is not None:
        rule += f" ({low} - {high})"
    return "Normal", "in_range", rule, deviation
