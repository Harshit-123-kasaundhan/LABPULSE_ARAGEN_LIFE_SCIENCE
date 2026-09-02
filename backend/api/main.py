import logging
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from ..mcp_server.models.schemas import AnalyzeLabsRequest, AnalyzeLabsResponse, HealthResponse
from ..mcp_server.core.config import config
from .mcp_client import mcp_client
from .agent import analyze_labs_orchestrator

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="Clinical Lab Results Analyzer")

# CORS setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=config.CORS_ORIGINS,
    allow_origin_regex=r"http://(localhost|127\.0\.0\.1)(:\d+)?",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/analyze_labs", response_model=AnalyzeLabsResponse)
async def analyze_labs(request: AnalyzeLabsRequest):
    """
    Validates request and orchestrates analysis via MCP tools.
    """
    # Enforce request cap
    if len(request.results) > config.MAX_RESULTS_PER_REQUEST:
        raise HTTPException(
            status_code=422, 
            detail=f"Maximum {config.MAX_RESULTS_PER_REQUEST} results per request"
        )
        
    try:
        # Check MCP server health before attempting orchestration
        is_healthy = await mcp_client.check_health()
        if not is_healthy:
             raise HTTPException(status_code=503, detail="Analysis service unavailable")
             
        response = await analyze_labs_orchestrator(request)
        return response
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Orchestration failed: {e}")
        # Could be MCP connection error, etc.
        raise HTTPException(status_code=503, detail="Analysis service unavailable")

@app.get("/health", response_model=HealthResponse)
async def health():
    """Returns the health status of the API and the underlying MCP server."""
    mcp_healthy = await mcp_client.check_health()
    return HealthResponse(
        status="ok",
        mcp_server="reachable" if mcp_healthy else "unreachable"
    )
