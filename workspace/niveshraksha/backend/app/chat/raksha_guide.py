"""Raksha Guide — cited retrieval assistant.

Retrieval: pure-Python multilingual TF-IDF over the curated knowledge corpus
(`knowledge/knowledge_base.json`). Unicode-aware tokenisation works across all
Indic scripts, so retrieval needs no external embedding service and cannot
hallucinate: answers are composed from retrieved documents only, every answer
carries its citations (name, URL, retrieval date, freshness), and out-of-scope
questions get an explicit refusal with safe redirection.

Untrusted-content rule: user text and retrieved text are DATA, never
instructions. Refusal is deterministic (pattern-based), not model-based.

Production upgrade path (documented in docs/MODEL_CARD.md): swap the TF-IDF
retriever for sentence-transformer embeddings + a vector store (ChromaDB /
pgvector). The router contract does not change.
"""
import json
import math
import re
import time
from collections import Counter
from pathlib import Path
from typing import Any

KNOWLEDGE_PATH = Path(__file__).resolve().parents[3] / "knowledge" / "knowledge_base.json"

_WORD = re.compile(r"[\w]+", re.UNICODE)

# Deterministic refusal categories (advice requests the product must never serve).
REFUSAL_PATTERNS = [
    (re.compile(r"\b(which|what|best|top)\b.{0,40}\b(stocks?|shares?|mutual funds?|etfs?|coins?|crypto)\b.{0,30}\b(buy|purchase|invest)\b|\bbuy\b.{0,30}\b(stocks?|shares?|coin|crypto)\b", re.I),
     "advice_buy"),
    (re.compile(r"\b(highest|best|maximum)\s+(return|profit|growth)\b|\bwhich\b.{0,30}\bgives?\s+(the\s+)?(highest|best)\b", re.I),
     "advice_return"),
    (re.compile(r"\b(tomorrow|next week|today'?s?)\s+(price|target|prediction|forecast)\b|\bwill\s+\w+\s+(go\s+up|rise|fall|crash)\b", re.I),
     "advice_prediction"),
    (re.compile(r"\b(should\s+i\s+)?(sell|hold|exit)\s+(my\s+)?(shares?|stocks?|portfolio|mutual fund)\b", re.I),
     "advice_sell_hold"),
    (re.compile(r"\bguaranteed?\s+(return|profit|scheme|plan)\b.{0,40}\?", re.I),
     "advice_guarantee"),
    (re.compile(r"\b(is|is this|are they)\s+(this\s+)?(message|person|advisor|app|website|platform)\s+(safe|genuine|legit|real|fake|scam)\b", re.I),
     "verdict_request"),
]

REFUSAL_BY_KIND: dict[str, dict[str, Any]] = {
    "advice_buy": {
        "answer": "I can't recommend any security or tell you what to buy — that would be investment advice, and NiveshRaksha never gives it. What I can do is help you verify whether a person or platform is registered, explain common scam warning signs, and show you the official grievance channels.",
        "citations": ["warning-signs-catalog", "verify-advisor-101"],
    },
    "advice_return": {
        "answer": "I can't compare returns or promise the highest-return investment — no genuine investment can guarantee returns, and anyone promising that is showing you a classic scam warning sign.",
        "citations": ["warning-signs-catalog"],
    },
    "advice_prediction": {
        "answer": "I can't predict prices or market movements — nobody reliably can, and tools that claim to are a common fraud. I can help you check warning signs in a message or verify an advisor's registration instead.",
        "citations": ["warning-signs-catalog"],
    },
    "advice_sell_hold": {
        "answer": "I can't advise selling, holding, or exiting any investment — that is a personal decision that belongs with you and, if you need one, a SEBI-registered adviser you have verified yourself.",
        "citations": ["verify-advisor-101", "grievance-against-registered"],
    },
    "advice_guarantee": {
        "answer": "No genuine investment comes with guaranteed returns. Guaranteed-return promises are one of the most common scam warning signs regulators warn about.",
        "citations": ["warning-signs-catalog"],
    },
    "verdict_request": {
        "answer": "I can't declare a message, person, or platform safe or fake — that would be false certainty. I can point you to the exact verification steps and to the deterministic warning-sign check on the Analyze page, and the decision stays with you after verifying on official sources.",
        "citations": ["verify-advisor-101", "warning-signs-catalog"],
    },
}

# Greeting / meta questions answered from product docs.
_SMALL_TALK = re.compile(r"^\s*(hi|hello|hey|namaste|vanakkam|thanks?|thank you|what can you do|help)\b", re.I)
_META_ANSWER: dict[str, Any] = {
    "answer": "I'm the Raksha Guide. I can explain scam warning signs, how to verify a SEBI-registered advisor, what OTP and UPI PIN mean, how to preserve evidence after a fraud, and where to file official complaints — in your language. I cannot recommend investments, predict prices, or declare anyone genuine.",
    "citations": ["refusal-investment-advice", "multilingual-lesson-index"],
}


class _Doc:
    __slots__ = ("body", "category", "freshness", "id", "retrieved_at", "source_name", "source_url", "title", "tokens")

    def __init__(self, d: dict):
        self.id = d["id"]
        self.category = d["category"]
        self.title = d["title"]
        self.source_name = d["source_name"]
        self.source_url = d["source_url"]
        self.retrieved_at = d["retrieved_at"]
        self.freshness = d["freshness"]
        self.body = d["title"] + ". " + d["body"]
        self.tokens = _tokenize(self.body)


def _tokenize(text: str) -> list[str]:
    """Unicode-aware lowercase tokenisation — works for Latin and Indic scripts."""
    return [t.lower() for t in _WORD.findall(text) if len(t) > 1]


class RakshaGuide:
    def __init__(self) -> None:
        self.docs: list[_Doc] = []
        self._idf: dict[str, float] = {}
        self._doc_tfidf: list[Counter] = []
        self._load()

    def _load(self) -> None:
        with open(KNOWLEDGE_PATH, encoding="utf-8") as f:
            data = json.load(f)
        self.docs = [_Doc(d) for d in data["documents"]]
        df: Counter = Counter()
        for doc in self.docs:
            df.update(set(doc.tokens))
        n = max(len(self.docs), 1)
        self._idf = {t: math.log(n / df[t]) + 1.0 for t in df}
        self._doc_tfidf = [self._vector(doc.tokens) for doc in self.docs]

    def _vector(self, tokens: list[str]) -> Counter:
        tf = Counter(tokens)
        return Counter({t: c * self._idf.get(t, 1.0) for t, c in tf.items()})

    @staticmethod
    def _cosine(a: Counter, b: Counter) -> float:
        common = set(a) & set(b)
        if not common:
            return 0.0
        dot = sum(a[t] * b[t] for t in common)
        na = math.sqrt(sum(v * v for v in a.values()))
        nb = math.sqrt(sum(v * v for v in b.values()))
        return dot / (na * nb) if na and nb else 0.0

    def retrieve(self, query: str, top_k: int = 3) -> list[tuple[_Doc, float]]:
        qv = self._vector(_tokenize(query))
        scored = [(doc, self._cosine(qv, dv)) for doc, dv in zip(self.docs, self._doc_tfidf, strict=True)]
        scored.sort(key=lambda x: x[1], reverse=True)
        return [(d, s) for d, s in scored[:top_k] if s > 0.08]

    def answer(self, question: str, top_k: int = 3) -> dict[str, Any]:
        t0 = time.perf_counter()
        question = question[:1000]

        # 1. Deterministic refusal check — user text is untrusted data.
        for pattern, kind in REFUSAL_PATTERNS:
            if pattern.search(question):
                return self._compose(REFUSAL_BY_KIND[kind]["answer"], REFUSAL_BY_KIND[kind]["citations"], refused=True, refusal_kind=kind, latency_ms=(time.perf_counter() - t0) * 1000)

        if _SMALL_TALK.match(question) and len(question.split()) <= 6:
            return self._compose(_META_ANSWER["answer"], _META_ANSWER["citations"], refused=False, refusal_kind=None, latency_ms=(time.perf_counter() - t0) * 1000)

        # 2. Grounded retrieval — compose only from retrieved documents.
        hits = self.retrieve(question, top_k=top_k)
        if not hits:
            return self._compose(
                "I don't have reliable information about that in my knowledge base, so I won't guess. "
                "I can help with scam warning signs, advisor verification, OTP/UPI-PIN safety, evidence handling, "
                "and official complaint channels. For anything else, please use the official sources on the About page.",
                ["refusal-investment-advice"], refused=False, refusal_kind="out_of_knowledge",
                latency_ms=(time.perf_counter() - t0) * 1000,
            )

        # Compose an extractive answer from the top document with supporting lines.
        top_doc, top_score = hits[0]
        sentences = re.split(r"(?<=[.!?])\s+", top_doc.body)
        qtokens = set(_tokenize(question))
        ranked = sorted(sentences, key=lambda s: len(qtokens & set(_tokenize(s))), reverse=True)
        chosen = [s.strip() for s in ranked if s.strip()][:4]
        supporting = [d for d, _ in hits[1:2]]
        answer = " ".join(chosen)
        citation_ids = [top_doc.id] + [d.id for d in supporting]
        return self._compose(answer, citation_ids, refused=False, refusal_kind=None,
                             latency_ms=(time.perf_counter() - t0) * 1000, score=top_score)

    def _compose(self, answer: str, citation_ids: list[str], *, refused: bool, refusal_kind: str | None, latency_ms: float, score: float | None = None) -> dict[str, Any]:
        by_id = {d.id: d for d in self.docs}
        citations = []
        for cid in dict.fromkeys(citation_ids):
            d = by_id.get(cid)
            if d:
                citations.append({
                    "document_id": d.id,
                    "source_name": d.source_name,
                    "source_url": d.source_url,
                    "retrieved_at": d.retrieved_at,
                    "freshness": d.freshness,
                    "title": d.title,
                })
        return {
            "answer": answer,
            "refused": refused,
            "refusal_kind": refusal_kind,
            "citations": citations,
            "uncertainty": "Answers come only from the curated sources below. This is general safety guidance, not legal, financial, or regulatory advice.",
            "retrieval": {"method": "multilingual_tfidf", "score": round(score, 4) if score is not None else None},
            "latency_ms": round(latency_ms, 1),
        }


def _body_of(doc: _Doc) -> str:
    return doc.body


_guide: RakshaGuide | None = None


def get_guide() -> RakshaGuide:
    global _guide
    if _guide is None:
        _guide = RakshaGuide()
    return _guide
