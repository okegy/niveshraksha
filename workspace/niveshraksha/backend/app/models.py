from datetime import datetime
from enum import StrEnum

from pydantic import BaseModel, Field


class RiskLevel(StrEnum):
    high = "high"
    review_carefully = "review_carefully"
    no_obvious_red_flags = "no_obvious_red_flags"


class RedFlag(BaseModel):
    code: str
    label: str
    explanation: str
    matched_text: str
    severity: str = Field(description="high | medium | low — heuristic weight, never a probability")


class VerifiedSource(BaseModel):
    source_name: str
    source_url: str
    status: str = Field(description="verified | not_checked_in_demo | unavailable")
    retrieved_at: datetime | None = None


class AnalysisRequest(BaseModel):
    content: str = Field(min_length=1, max_length=10000)
    language: str = Field(default="en", pattern="^(en|ta|hi|te|ml|kn)$")


class AnalysisResponse(BaseModel):
    analysis_id: str
    risk_level: RiskLevel
    summary: str
    red_flags: list[RedFlag]
    what_we_verified: list[VerifiedSource]
    safe_next_steps: list[str]
    limitations: list[str]
    created_at: datetime


class UrlAnalysisRequest(BaseModel):
    url: str = Field(min_length=1, max_length=2048)
    language: str = Field(default="en", pattern="^(en|ta|hi|te|ml|kn)$")


class UrlAnalysisResponse(BaseModel):
    analysis_id: str
    risk_level: RiskLevel
    summary: str
    red_flags: list[RedFlag]
    safe_next_steps: list[str]
    limitations: list[str]
    created_at: datetime
    note: str = "This check is a static pattern review. The page was not opened or fetched."


class AdvisorVerificationRequest(BaseModel):
    name: str | None = Field(default=None, max_length=200)
    registration_number: str | None = Field(default=None, max_length=50)
    firm_name: str | None = Field(default=None, max_length=200)


class VerificationResponse(BaseModel):
    status: str = Field(description="verified | not_found | unavailable — 'not_found' is NOT proof of fraud")
    source_name: str
    source_url: str
    retrieved_at: datetime
    match_quality: str
    matched_name: str | None = None
    uncertainty_note: str


class IncidentDraftRequest(BaseModel):
    user_session_id: str = Field(max_length=64)
    content: str = Field(min_length=1, max_length=10000)
    notes: str | None = Field(default=None, max_length=2000)
    consent_storage: bool = Field(
        default=False, description="Explicit consent required before anything is stored"
    )


class IncidentDraftResponse(BaseModel):
    draft_id: str
    redacted_content: str
    notes: str | None
    created_at: datetime
    expires_at: datetime
    retention_note: str


class EducationModule(BaseModel):
    id: str
    title: str
    description: str
    content: list[str]
    source_ids: list[str] = []


class SourceStatus(BaseModel):
    source_name: str
    source_url: str
    status: str
    mode: str = Field(description="live | mock | static")
    last_checked: datetime | None = None
