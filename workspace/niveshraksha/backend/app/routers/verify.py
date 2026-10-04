from datetime import UTC, datetime

from fastapi import APIRouter, HTTPException, Request

from ..models import AdvisorVerificationRequest, VerificationResponse
from ..security.ratelimit import client_key, limiter
from ..sources import registry

router = APIRouter()

UNCERTAINTY_NOT_FOUND = (
    "This result comes from a DEMO FIXTURE with synthetic records — it is NOT official regulator data. "
    "'Not found' here does not mean the advisor is fraudulent, and it does not mean they are genuine. "
    "Verify the registration number yourself on the official SEBI website before trusting anyone with money."
)
UNCERTAINTY_VERIFIED = (
    "Matched against a DEMO FIXTURE with synthetic records — this is NOT official regulator data and is "
    "for demonstration only. Always confirm on the official SEBI intermediaries database before deciding."
)


@router.post("/advisor", response_model=VerificationResponse)
async def verify_advisor(request: AdvisorVerificationRequest, http_request: Request):
    limiter.check(client_key(http_request))
    if not (request.name or request.registration_number or request.firm_name):
        raise HTTPException(
            status_code=422,
            detail="Provide at least one of: name, registration number, or firm name.",
        )

    status, match_quality, matched = registry.search_advisor(
        name=request.name, registration_number=request.registration_number, firm_name=request.firm_name
    )

    return VerificationResponse(
        status=status,
        source_name=registry.all_source_statuses()[0]["source_name"],
        source_url=registry.SEBI_INTERMEDIARIES_URL,
        retrieved_at=datetime.now(UTC),
        match_quality=match_quality,
        matched_name=matched.get("name") if matched else None,
        uncertainty_note=UNCERTAINTY_VERIFIED if status == "verified" else UNCERTAINTY_NOT_FOUND,
    )


# Entity verification is the same adapter today (intermediaries registry);
# kept as a separate path so company/firm sources can plug in later.
@router.post("/entity", response_model=VerificationResponse)
async def verify_entity(request: AdvisorVerificationRequest, http_request: Request):
    return await verify_advisor(request, http_request)
