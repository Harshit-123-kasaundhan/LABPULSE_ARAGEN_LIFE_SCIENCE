from typing import Dict, Any, Optional
from ..services.llm_client import llm_client

def lookup_reference_range(test_name: str) -> Optional[Dict[str, Any]]:
    """
    Uses the primary LLM (Groq) with fallback to look up typical adult
    reference ranges for unknown tests.
    """
    prompt = f"""
Provide typical adult reference ranges for the clinical lab test: '{test_name}'.
Return ONLY a JSON object with this exact schema. Do not add any extra text or markdown outside the JSON. Use null for missing critical bounds.
{{
  "critical_low": number or null,
  "low": number,
  "high": number,
  "critical_high": number or null,
  "unit": "string"
}}
"""

    result_json, _provider, _model = llm_client.generate_json(prompt)
    
    if result_json and "low" in result_json and "high" in result_json and "unit" in result_json:
        # validate numbers
        try:
            return {
                "critical_low": float(result_json["critical_low"]) if result_json.get("critical_low") is not None else None,
                "low": float(result_json["low"]),
                "high": float(result_json["high"]),
                "critical_high": float(result_json["critical_high"]) if result_json.get("critical_high") is not None else None,
                "unit": str(result_json["unit"])
            }
        except (ValueError, TypeError):
            return None
            
    return None
