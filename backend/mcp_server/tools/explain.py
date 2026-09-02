import json
from typing import Dict, Any, Optional
from ..services.llm_client import llm_client

def explain(
    test_name: str, 
    value: float, 
    status: str, 
    flag: str, 
    range_data: Optional[Dict[str, Any]], 
    deviation: Optional[Dict[str, Any]],
    patient_context: Optional[Dict[str, Any]] = None
) -> Dict[str, Any]:
    """
    Generates an explanation using the primary LLM (Groq) with fallback.
    """
    # Safe fallback if no provider is available or all calls fail
    fallback = {
        "explanation": "AI explanation is temporarily unavailable. The classification above is complete and unaffected.",
        "clinical_significance": "Unavailable",
        "next_steps": ["Consult appropriate reference materials"],
        "explanation_status": "unavailable",
        "model": "unavailable"
    }

    # Prompt construction based on PRD §7.2
    prompt = f"""
You are a clinical decision support assistant. Explain this lab result for a provider.

**Test:** {test_name}
**Value:** {value}
**Status:** {status} ({flag})
**Reference Range:** {json.dumps(range_data) if range_data else 'None'}
**Deviation Metrics:** {json.dumps(deviation) if deviation else 'None'}
**Patient Context:** {json.dumps(patient_context) if patient_context else 'None'}

**CRITICAL INSTRUCTIONS:**
1. Ground every statement in the provided numbers and range.
2. DO NOT change or dispute the provided `status` — explain it, don't reclassify.
3. Use clear, clinically appropriate language.
4. Keep `explanation` to 2-4 sentences.
5. Keep `next_steps` to 2-4 concrete, actionable items.
6. Return ONLY a JSON object with this exact schema:
{{
  "explanation": "string",
  "clinical_significance": "string",
  "next_steps": ["string", "string"]
}}
"""

    result_json, _provider, model = llm_client.generate_json(prompt, temperature=0.2)
    
    if result_json:
        return {
            "explanation": result_json.get("explanation", ""),
            "clinical_significance": result_json.get("clinical_significance", ""),
            "next_steps": result_json.get("next_steps", []),
            "explanation_status": "ok",
            "model": model
        }
    
    return fallback
