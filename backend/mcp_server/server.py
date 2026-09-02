from mcp.server.fastmcp import FastMCP
from typing import List, Dict, Any, Optional
import uvicorn

# Import tools
from .tools.classify import classify
from .tools.route import route
from .tools.explain import explain
from .tools.reference import lookup_reference_range
from .core.config import config

mcp = FastMCP("LabAnalyzer", port=config.MCP_SERVER_PORT)

# Register tools
@mcp.tool()
def classify_lab_result(test_name: str, value: float, unit: str) -> dict:
    """Classifies a lab result against known ranges. Returns JSON dict."""
    return classify(test_name, value, unit)

@mcp.tool()
def route_results(results: list) -> dict:
    """Routes and orders results by severity. Expects list of dicts."""
    return route(results)

@mcp.tool()
def explain_result(
    test_name: str, 
    value: float, 
    status: str, 
    flag: str, 
    range_data: Optional[dict] = None, 
    deviation: Optional[dict] = None,
    patient_context: Optional[dict] = None
) -> dict:
    """Generates an explanation."""
    return explain(test_name, value, status, flag, range_data, deviation, patient_context)

@mcp.tool()
def reference_range_lookup(test_name: str) -> Optional[dict]:
    """Looks up reference ranges for unknown tests using LLM."""
    return lookup_reference_range(test_name)

if __name__ == "__main__":
    # Start FastMCP server with SSE (streamable HTTP)
    # The FastMCP framework can run as an ASGI app.
    # Note: Using run() as standard for FastMCP SSE.
    mcp.run(transport="sse")
