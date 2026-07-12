from pydantic import BaseModel, Field
from typing import Dict, Any, List, Optional
import enum

class Severity(str, enum.Enum):
    ERROR = "ERROR"
    WARNING = "WARNING"
    REVIEW = "REVIEW"

class ValidationResult(BaseModel):
    rule_name: str
    severity: Severity
    confidence: float
    reason: str
    recommendation: str
    auto_fix: bool = False
    affected_fields: List[str] = Field(default_factory=list)
    requires_approval: bool = False
    metadata_fields: Dict[str, Any] = Field(default_factory=dict)
