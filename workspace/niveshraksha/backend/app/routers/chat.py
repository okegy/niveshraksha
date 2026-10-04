from typing import Any

from fastapi import APIRouter, Header, HTTPException, Request
from pydantic import BaseModel, Field

from ..ai import chat_history
from ..ai.agent import guide_answer
from ..ai.llm_adapter import provider_status
from ..security.ratelimit import client_key, limiter

router = APIRouter()


class ChatRequest(BaseModel):
    message: str = Field(min_length=1, max_length=1000)
    language: str = Field(default="en", pattern="^(en|ta|hi|te|ml|kn|bn|mr|gu|or|pa|as)$")
    # Opt-in private history: encrypted at rest, only with explicit consent.
    save_history: bool = Field(default=False)


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
    detected_language: str = "en"
    agent: dict[str, Any] = Field(default_factory=dict)


@router.post("/message", response_model=ChatResponse)
async def chat_message(payload: ChatRequest, http_request: Request):
    """Agentic Raksha Guide: deterministic refusals → tool selection
    (analyzer / advisor-verification) → optional LLM synthesis (validated,
    never authoritative) → cited answer. Untrusted content is data, never
    instructions."""
    limiter.check(client_key(http_request))
    result = guide_answer(payload.message, payload.language)
    reply = result.get("answer")
    if reply is None:
        raise HTTPException(status_code=500, detail="Assistant could not compose a reply. Please try again.")

    if payload.save_history:
        try:
            chat_history.save_turn(
                http_request.headers.get("x-session-token", ""),
                "user", payload.message, {}, payload.language,
            )
            chat_history.save_turn(
                http_request.headers.get("x-session-token", ""),
                "guide", reply,
                {"citations": result.get("citations", []), "refused": result.get("refused", False)},
                payload.language,
            )
        except Exception:
            # History is best-effort and opt-in; answering must never fail
            # because of it.
            pass

    return ChatResponse(
        reply=reply,
        refused=result["refused"],
        refusal_kind=result["refusal_kind"],
        citations=result["citations"],
        uncertainty=result["uncertainty"],
        retrieval=result["retrieval"],
        latency_ms=result["latency_ms"],
        detected_language=result.get("detected_language", "en"),
        agent=result.get("agent", {}),
    )


@router.get("/history")
async def get_history(http_request: Request, x_session_token: str = Header(default="")):
    """Decrypted private history for THIS browser token only. A wrong/lost
    token returns an empty list — there is deliberately no recovery path."""
    limiter.check(client_key(http_request))
    if not x_session_token:
        return {"messages": [], "note": "No session token presented."}
    try:
        msgs = chat_history.load_history(x_session_token)
        return {"messages": msgs, "encrypted_at_rest": True}
    except Exception:
        raise HTTPException(status_code=500, detail="History could not be loaded.") from None


@router.delete("/history")
async def clear_history(http_request: Request, x_session_token: str = Header(default="")):
    limiter.check(client_key(http_request))
    if not x_session_token:
        raise HTTPException(status_code=422, detail="No session token presented.")
    deleted = chat_history.delete_history(x_session_token)
    return {"deleted": deleted, "note": "All encrypted history rows for this token removed."}


@router.get("/status")
async def agent_status(http_request: Request):
    """Honest availability of the agentic layer's providers (keys never exposed)."""
    limiter.check(client_key(http_request))
    return {"providers": provider_status(), "decision_authority": "deterministic_rules"}
