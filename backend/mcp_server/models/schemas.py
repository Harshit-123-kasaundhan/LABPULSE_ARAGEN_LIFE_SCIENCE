from pydantic import BaseModel, Field
from typing import List, Optional, Literal

# --- Common Types ---
StatusType = Literal["Normal", "Warning", "Critical", "Unknown"]
FlagType = Literal["in_range", "low", "high", "unknown"]
ReferenceSourceType = Literal["local_dict", "llm_lookup", "none"]

# --- Input Schemas ---
class LabResultInput(BaseModel):
    test_name: str = Field(..., description="Name of the test, e.g., 'Hemoglobin'")
    value: float = Field(..., description="Numeric value of the test result")
    unit: str = Field(..., description="Unit of the test result, e.g., 'g/dL'")

class PatientContext(BaseModel):
    age: Optional[int] = None
    sex: Optional[Literal["male", "female", "unspecified"]] = None

class AnalyzeLabsRequest(BaseModel):
    patient_context: Optional[PatientContext] = None
    results: List[LabResultInput] = Field(..., min_length=1, max_length=25)

# --- Classifier / Explain Models ---
class ReferenceRange(BaseModel):
    low: Optional[float] = None
    high: Optional[float] = None
    unit: str

class Thresholds(BaseModel):
    critical_low: Optional[float] = None
    low: Optional[float] = None
    high: Optional[float] = None
    critical_high: Optional[float] = None

class DeviationMetrics(BaseModel):
    direction: Optional[Literal["low", "high"]] = None
    distance_from_bound: Optional[float] = None
    percent_from_bound: Optional[float] = None

class ClassifiedResult(BaseModel):
    test_name: str
    value: float
    unit: str
    status: StatusType
    flag: FlagType
    reference_range: Optional[ReferenceRange] = None
    thresholds: Optional[Thresholds] = None
    deviation: Optional[DeviationMetrics] = None
    reference_source: ReferenceSourceType
    unit_mismatch: bool = False
    rule_applied: str

class ExplainedResult(BaseModel):
    explanation: str
    clinical_significance: str
    next_steps: List[str]
    explanation_status: Literal["ok", "unavailable"]
    model: str

class EnrichedResult(ClassifiedResult, ExplainedResult):
    pass

# --- Output Schemas ---
class SummaryCounts(BaseModel):
    critical: int = 0
    warning: int = 0
    normal: int = 0
    unknown: int = 0
    total: int = 0

class ResultsBySeverity(BaseModel):
    critical: List[EnrichedResult] = []
    warning: List[EnrichedResult] = []
    normal: List[EnrichedResult] = []
    unknown: List[EnrichedResult] = []

class AnalyzeLabsResponse(BaseModel):
    summary: SummaryCounts
    results_by_severity: ResultsBySeverity
    ordered_results: List[EnrichedResult]
    generated_at: str
    model: str
    disclaimer: str = "Illustrative demonstration — reference ranges are example adult values and this is not medical advice."

class HealthResponse(BaseModel):
    status: str
    mcp_server: Literal["reachable", "unreachable"]
