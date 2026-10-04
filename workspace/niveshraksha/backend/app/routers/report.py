from datetime import UTC, datetime

from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel, Field

from ..models import IncidentDraftRequest, IncidentDraftResponse
from ..security.ratelimit import client_key, limiter
from ..security.redaction import redact_text
from ..storage import (
    RETENTION_HOURS,
    delete_incident_draft,
    get_incident_draft,
    list_incident_drafts,
    save_incident_draft,
)

router = APIRouter()

RETENTION_NOTE = (
    f"Stored only with your consent, redacted, and auto-deleted after {RETENTION_HOURS} hours. "
    "You can delete it at any time from this page."
)

REPORTING_ROUTES = [
    {
        "name": "National Cyber Crime Reporting Portal",
        "url": "https://cybercrime.gov.in",
        "use": "Online financial fraud / cybercrime complaints",
    },
    {
        "name": "Cyber Crime Helpline 1930",
        "url": "tel:1930",
        "use": "Immediate phone reporting for money already transferred",
    },
    {
        "name": "SEBI Scores — complaint against registered intermediaries",
        "url": "https://scores.sebi.gov.in",
        "use": "Grievance against a SEBI-registered entity",
    },
]


class PreviewRequest(BaseModel):
    content: str = Field(min_length=1, max_length=10000)


class PreviewResponse(BaseModel):
    redacted_content: str
    note: str


@router.post("/preview", response_model=PreviewResponse)
async def redaction_preview(payload: PreviewRequest, http_request: Request):
    """Live redaction preview: applies the exact storage redaction pipeline to
    the given text and returns it. Nothing is stored, logged, or kept — the
    request body is dropped when the response is sent. This powers the
    report page's privacy demo without duplicating patterns client-side."""
    limiter.check(client_key(http_request))
    return PreviewResponse(
        redacted_content=redact_text(payload.content),
        note=(
            "Live preview of the same pipeline applied before any storage. "
            "Nothing is saved from this request."
        ),
    )


@router.post("/draft", response_model=IncidentDraftResponse)
async def create_draft(request: IncidentDraftRequest, http_request: Request):
    limiter.check(client_key(http_request))
    if not request.consent_storage:
        # Privacy by default: nothing is stored unless the user ticked consent.
        now = datetime.now(UTC)
        return IncidentDraftResponse(
            draft_id="local-only",
            redacted_content=redact_text(request.content),
            notes=request.notes,
            created_at=now,
            expires_at=now,
            retention_note=(
                "Storage consent was not given — this draft was NOT saved. "
                "Copy or export it now; nothing is stored on the server."
            ),
        )

    draft_id = save_incident_draft(
        user_session_id=request.user_session_id,
        redacted_content=redact_text(request.content),
        notes=redact_text(request.notes) if request.notes else None,
    )
    row = get_incident_draft(draft_id, request.user_session_id)
    if row is None:  # pragma: no cover — the row was just written
        raise HTTPException(status_code=500, detail="Draft could not be retrieved after creation.")
    return IncidentDraftResponse(
        draft_id=draft_id,
        redacted_content=row.redacted_content,
        notes=row.notes,
        created_at=row.created_at,
        expires_at=row.expires_at,
        retention_note=RETENTION_NOTE,
    )


@router.get("/draft")
async def list_drafts(http_request: Request, user_session_id: str):
    limiter.check(client_key(http_request))
    rows = list_incident_drafts(user_session_id)
    return {
        "drafts": [
            {
                "draft_id": r.id,
                "redacted_content": r.redacted_content,
                "notes": r.notes,
                "created_at": r.created_at,
                "expires_at": r.expires_at,
            }
            for r in rows
        ],
        "reporting_routes": REPORTING_ROUTES,
    }


@router.get("/draft/{draft_id}", response_model=IncidentDraftResponse)
async def get_draft(draft_id: str, http_request: Request, user_session_id: str):
    limiter.check(client_key(http_request))
    row = get_incident_draft(draft_id, user_session_id)
    if row is None:
        raise HTTPException(status_code=404, detail="Draft not found, already deleted, or expired.")
    return IncidentDraftResponse(
        draft_id=row.id,
        redacted_content=row.redacted_content,
        notes=row.notes,
        created_at=row.created_at,
        expires_at=row.expires_at,
        retention_note=RETENTION_NOTE,
    )


@router.delete("/draft/{draft_id}")
async def delete_draft(draft_id: str, http_request: Request, user_session_id: str):
    limiter.check(client_key(http_request))
    if not delete_incident_draft(draft_id, user_session_id):
        raise HTTPException(status_code=404, detail="Draft not found or already deleted.")
    return {"deleted": True, "note": "Draft contents permanently removed."}


@router.get("/routes")
async def reporting_routes():
    return {"routes": REPORTING_ROUTES}
