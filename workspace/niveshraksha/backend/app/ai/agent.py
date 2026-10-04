"""Agentic Raksha Guide workflow.

Pipeline (deterministic authority preserved):
  user message
    → 1. deterministic refusal patterns (advice requests: refuse with citations)
    → 2. TOOL SELECTION (agentic step):
         - scam-phrase/danger shape detected → call ScamAnalyzer tool, ground the
           answer in its deterministic flags
         - registration number shape (INA/INH…) → call advisor-verification tool
         - otherwise → knowledge-base retrieval
    → 3. LLM synthesis over tool/retrieval CONTEXT (only if a provider is
         available); output passes the no-advice validator
    → 4. fallback: extractive answer from retrieved docs
  → redaction → response with citations + provenance metadata
"""
from __future__ import annotations

import re
from typing import Any

from ..analyzers.language_detect import detect_script_language
from ..analyzers.scam_rules import ScamAnalyzer
from ..chat.raksha_guide import get_guide
from ..security.redaction import redact_text
from ..sources import registry
from .llm_adapter import provider_status, synthesize

_analyzer = ScamAnalyzer()

_REG_NO = re.compile(r"\b(INA|INH)\d{9}\b", re.I)
_DANGER_SHAPE = re.compile(
    r"\b(guaranteed|return|otp|upi\s*pin|password|kyc|freeze|suspend|unlock|withdrawal|"
    r"ipo|allotment|send money|gpay|phonepe|paytm|investment|profit|scheme|slots?)\b", re.I)


def _validate_no_advice(text: str) -> bool:
    lowered = text.lower()
    prohibited = ["you should buy", "you should sell", "we recommend buying", "we recommend selling",
                  "price target", "strong buy", "you should hold", "guaranteed profit"]
    return not any(p in lowered for p in prohibited)


def _context_from_docs(guide: Any, question: str) -> str:
    hits = guide.retrieve(question, top_k=3)
    return "\n\n".join(f"[{d.title} — {d.source_name}]\n{d.body}" for d, _ in hits) or \
        "No relevant knowledge-base documents found."


PAGE_HINTS: dict[str, str] = {
    "/": "The user is on the SENTINEL-X home portal (scan bar, threat feed).",
    "/analyze": "The user is on the message/URL/screenshot analyzer page.",
    "/verify": "The user is on the advisor-verification page (demo fixture, always labelled).",
    "/pause": "The user is on the 30-second behavioural pause checklist.",
    "/learn": "The user is on the education hub (7 lessons, 12 languages).",
    "/report": "The user is on the Evidence Locker (redacted, consent-gated, 72 h drafts).",
    "/about": "The user is on the About page (methodology, sources, limitations).",
    "/settings": "The user is on Settings (palette, avatars, voice, encrypted history).",
    "/result": "The user is viewing a stored analysis result.",
}


def guide_answer(question: str, language: str = "en", page_context: str = "") -> dict[str, Any]:
    guide = get_guide()
    tool_used: str | None = None
    tool_result: dict[str, Any] | None = None

    # 1. Deterministic refusals always win.
    base = guide.answer(question)
    if base.get("refused"):
        base["detected_language"] = detect_script_language(question)
        base["agent"] = {"tools": [], "llm": "not_used (refusal is deterministic)"}
        return base

    # 2. Agentic tool selection.
    reg_match = _REG_NO.search(question)
    if reg_match:
        tool_used = "verify_advisor"
        reg = reg_match.group(0)
        status, match_quality, matched = registry.search_advisor(registration_number=reg)
        tool_result = {
            "text": (
                f"Registration number {reg} was checked against the demo advisor fixture: "
                f"status '{status}' (match quality {match_quality})."
                + (f" Matched record: {matched.get('name')}." if matched else "")
                + " This fixture is NOT official regulator data — verify on sebi.gov.in before any decision."
            ),
            "citations": [{
                "document_id": "verify-advisor-101",
                "source_name": "SEBI Registered Intermediaries Database",
                "source_url": registry.SEBI_INTERMEDIARIES_URL,
                "retrieved_at": "2026-10-04", "freshness": "static_reference",
                "title": "How to verify an investment advisor",
            }],
        }
    elif _DANGER_SHAPE.search(question) and len(question) > 120:
        tool_used = "analyze_message"
        flags = _analyzer.analyze_text(question)
        tier = _analyzer.risk_tier(flags)
        tool_result = {
            "text": (
                f"I ran the message through the deterministic red-flag engine: risk level "
                f"'{tier.value}', {len(flags)} indicator(s) found."
                + (f" Triggered: {', '.join(f'{f.label} (matched: \"{f.matched_text}\")' for f in flags[:4])}."
                   if flags else " No known red-flag pattern matched — that is not proof of safety.")
                + " Do not send money or share OTPs while you verify independently on official sources."
            ),
            "citations": [c for c in [guide.docs_by_id("warning-signs-catalog")] if c],
        }

    # 3. LLM synthesis over grounded context (only when a provider is live).
    context = tool_result["text"] if tool_result else _context_from_docs(guide, question)
    page_hint = PAGE_HINTS.get(page_context or "", "")
    if page_hint:
        context = f"{context}\n\n[PAGE CONTEXT] {page_hint}"
    citations = tool_result["citations"] if tool_result else base.get("citations", [])
    llm_meta: str | dict[str, Any] = "not_available (deterministic extractive answer used)"
    answer = tool_result["text"] if tool_result else base["answer"]

    providers = provider_status()
    if any(p.get("available") for p in providers):
        llm = synthesize(question, context, language)
        if llm and _validate_no_advice(llm["text"]):
            answer = llm["text"]
            llm_meta = {"provider": llm["provider"], "model": llm["model"], "validated": True}
        elif llm:
            llm_meta = "rejected (failed no-advice validation; extractive answer used)"

    return {
        "answer": redact_text(answer),
        "refused": base.get("refused", False),
        "refusal_kind": base.get("refusal_kind"),
        "citations": citations,
        "uncertainty": (
            "Answers come only from the cited sources and deterministic tools. This is general "
            "safety guidance, not legal, financial, or regulatory advice."
        ),
        "retrieval": {"method": "agentic_tools" if tool_used else "multilingual_tfidf",
                      "score": base.get("retrieval", {}).get("score")},
        "latency_ms": base.get("latency_ms", 0),
        "detected_language": detect_script_language(question),
        "agent": {"tools": [tool_used] if tool_used else [], "llm": llm_meta,
                  "providers": [{k: v for k, v in p.items() if k != "checked_at"} for p in providers]},
    }
