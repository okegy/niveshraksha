from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel, Field

from ..chat.raksha_guide import get_guide
from ..security.ratelimit import client_key, limiter

router = APIRouter()


class ChatRequest(BaseModel):
    message: str = Field(min_length=1, max_length=1000)
    language: str = Field(default="en", pattern="^(en|ta|hi|te|ml|kn|bn|mr|gu|or|pa|as)$")
    # Retention is opt-in: without consent the turn is answered and discarded.
    consent_chat_logging: bool = Field(default=False)


class ChatCitation(BaseModel):
    document_id: str
    source_name: str
    source_url: str
    retrieved_at: str
    freshness: str
    title: str


class ChatResponse(BaseModel):
    reply: str
    refused: bool
    refusal_kind: str | None
    citations: list[ChatCitation]
    uncertainty: str
    retrieval: dict
    latency_ms: float


@router.post("/message", response_model=ChatResponse)
async def chat_message(payload: ChatRequest, http_request: Request):
    """Raksha Guide: cited, refusal-safe assistant. Grounded only in the
    curated knowledge corpus; user text is untrusted data, never instructions."""
    limiter.check(client_key(http_request))
    guide = get_guide()
    result = guide.answer(payload.message)
    reply = result.get("answer")
    if reply is None:
        raise HTTPException(status_code=500, detail="Assistant could not compose a reply. Please try again.")
    return ChatResponse(
        reply=reply,
        refused=result["refused"],
        refusal_kind=result["refusal_kind"],
        citations=result["citations"],
        uncertainty=result["uncertainty"],
        retrieval=result["retrieval"],
        latency_ms=result["latency_ms"],
    )
