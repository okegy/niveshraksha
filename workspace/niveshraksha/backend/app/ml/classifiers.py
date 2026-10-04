"""Assistive scam classifiers.

Design contract (per the master prompt and SAFETY rules):
- Deterministic rules remain the ONLY decision-maker for risk levels.
- ML scores are advisory metadata: they may prioritise or explain, never decide.
- The classical baseline (TF-IDF + logistic regression) trains on the synthetic
  multilingual corpus in app/ml/corpus.py at first use and is calibrated only
  in the sense that its probabilities come from sklearn's LR (not Platt/isotonic
  calibrated against real data — honestly reported as uncalibrated).
- IndicBERTAdapter is an interface for the audited Hugging Face model
  (anmolshrivastav/indicbert-scam-classifier-v2). It reports "unavailable" with
  the exact reason when transformers/model weights are absent, so the demo
  degrades gracefully instead of pretending.
"""
from __future__ import annotations

import threading
from typing import Any

from .corpus import build_corpus

_lock = threading.Lock()
_baseline: TfidfBaseline | None = None


class TfidfBaseline:
    """TF-IDF (word 1-2 grams, char 3-5 grams) + LogisticRegression."""

    def __init__(self) -> None:
        from sklearn.feature_extraction.text import TfidfVectorizer
        from sklearn.linear_model import LogisticRegression
        from sklearn.pipeline import FeatureUnion, Pipeline

        self.pipeline = Pipeline([
            ("features", FeatureUnion([
                ("word", TfidfVectorizer(analyzer="word", ngram_range=(1, 2), min_df=1,
                                         token_pattern=r"(?u)\b\w+\b")),
                ("char", TfidfVectorizer(analyzer="char_wb", ngram_range=(3, 5), min_df=2)),
            ])),
            ("clf", LogisticRegression(max_iter=1000, C=4.0)),
        ])
        corpus = build_corpus()
        self.pipeline.fit([r["text"] for r in corpus], [r["label"] for r in corpus])
        self.trained_rows = len(corpus)

    def score(self, text: str) -> dict[str, Any]:
        proba = float(self.pipeline.predict_proba([text[:2000]])[0][1])
        return {
            "model": "tfidf_logreg_synthetic_v1",
            "scam_probability": round(proba, 4),
            "decision_role": "assistance_only",
            "calibrated": False,
        }


class IndicBERTAdapter:
    """Adapter for anmolshrivastav/indicbert-scam-classifier-v2.

    Checks availability lazily; never downloads without an explicit env flag
    (NIVESHRAKSHA_ALLOW_MODEL_DOWNLOAD=1) so demo runs stay hermetic.
    """

    MODEL_ID = "anmolshrivastav/indicbert-scam-classifier-v2"

    def status(self) -> dict[str, Any]:
        try:
            import transformers  # noqa: F401
        except ImportError:
            return {"model": self.MODEL_ID, "status": "unavailable",
                    "reason": "transformers library not installed in this environment"}
        import os
        if os.environ.get("NIVESHRAKSHA_ALLOW_MODEL_DOWNLOAD") != "1":
            return {"model": self.MODEL_ID, "status": "unavailable",
                    "reason": "model weights not downloaded; set NIVESHRAKSHA_ALLOW_MODEL_DOWNLOAD=1 to fetch"}
        try:
            from transformers import AutoModelForSequenceClassification, AutoTokenizer
            AutoTokenizer.from_pretrained(self.MODEL_ID)
            model = AutoModelForSequenceClassification.from_pretrained(self.MODEL_ID)
            return {"model": self.MODEL_ID, "status": "ready",
                    "labels": list(model.config.id2label.values())}
        except Exception as exc:  # network, disk, or licence gate failure
            return {"model": self.MODEL_ID, "status": "unavailable", "reason": str(exc)[:200]}


def get_baseline() -> TfidfBaseline:
    global _baseline
    if _baseline is None:
        with _lock:
            if _baseline is None:
                _baseline = TfidfBaseline()
    return _baseline


def assistive_score(text: str) -> dict[str, Any]:
    """Return advisory model metadata for an analysis response.

    Never raises: any failure degrades to model_unavailable metadata, because
    the deterministic engine alone decides risk.
    """
    try:
        result = get_baseline().score(text)
        result["indicbert"] = IndicBERTAdapter().status()
        return result
    except Exception as exc:  # pragma: no cover — defensive
        return {"model": "unavailable", "reason": str(exc)[:200], "decision_role": "assistance_only"}
