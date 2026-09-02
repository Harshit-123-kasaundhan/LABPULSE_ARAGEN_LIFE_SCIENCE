import json
import logging
from datetime import datetime, timezone
from typing import List, Dict, Any

from ..mcp_server.models.schemas import (
    AnalyzeLabsRequest, 
    AnalyzeLabsResponse, 
    EnrichedResult
)
from ..mcp_server.core.config import config
from .mcp_client import mcp_client

logger = logging.getLogger(__name__)

async def analyze_labs_orchestrator(request: AnalyzeLabsRequest) -> AnalyzeLabsResponse:
    """
    Orchestrates the Classify -> Route -> Explain pipeline by calling MCP tools.
    """
    
    # 1. Classify Phase (Deterministic)
    classified_results = []
    for req_result in request.results:
        # Call classify_lab_result tool
        args = {
            "test_name": req_result.test_name,
            "value": req_result.value,
            "unit": req_result.unit
        }
        res_str = await mcp_client.call_tool("classify_lab_result", args)
        classified_results.append(json.loads(res_str))
        
    # 2. Route Phase (Deterministic)
    # Call route_results tool
    args = {
        "results": classified_results
    }
    route_str = await mcp_client.call_tool("route_results", args)
    route_data = json.loads(route_str)
    
    summary = route_data["summary"]
    ordered_results_raw = route_data["ordered_results"]
    
    # 3. Explain Phase (LLM per result)
    enriched_results: List[EnrichedResult] = []
    patient_context_dict = request.patient_context.model_dump() if request.patient_context else None
    
    for r in ordered_results_raw:
        # Call explain_result tool
        args = {
            "test_name": r["test_name"],
            "value": r["value"],
            "status": r["status"],
            "flag": r["flag"],
            "range_data": r.get("reference_range"),
            "deviation": r.get("deviation"),
            "patient_context": patient_context_dict
        }
        
        explain_str = await mcp_client.call_tool("explain_result", args)
        explain_data = json.loads(explain_str)
        
        # Merge classify + explain
        merged = {**r, **explain_data}
        enriched_results.append(EnrichedResult(**merged))
        
    # 4. Construct Final Response
    results_by_severity = {
        "critical": [r for r in enriched_results if r.status == "Critical"],
        "warning": [r for r in enriched_results if r.status == "Warning"],
        "normal": [r for r in enriched_results if r.status == "Normal"],
        "unknown": [r for r in enriched_results if r.status == "Unknown"]
    }
    
    return AnalyzeLabsResponse(
        summary=summary,
        results_by_severity=results_by_severity,
        ordered_results=enriched_results,
        generated_at=datetime.now(timezone.utc).isoformat(),
        model=config.GROQ_MODEL
    )
