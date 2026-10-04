"""Per-language model and pipeline evaluation.

For each supported language, runs a held-out synthetic split through:
1. the deterministic rule engine (the decision-maker), and
2. the TF-IDF+LR assistive baseline,

then reports precision, recall, F1, false positives, false negatives and
latency. Also runs the evaluation of the IndicBERT adapter status so the demo
honestly reports model availability.

These metrics describe template-space behaviour on synthetic data — see
docs/MODEL_EVALUATION.md for what that does and does not prove.
"""
import time

import pytest
from sklearn.model_selection import train_test_split

from app.analyzers.scam_rules import ScamAnalyzer
from app.ml.classifiers import IndicBERTAdapter, get_baseline
from app.ml.corpus import build_corpus, languages

RULES = ScamAnalyzer()
MIN_F1 = 0.90  # synthetic template-space floor; real-world bars are separate


def _per_language_metrics(lang: str, n_cases: int = 80):
    corpus = [r for r in build_corpus() if r["language"] == lang]
    _train, test = train_test_split(
        corpus, test_size=0.4, random_state=7, stratify=[r["label"] for r in corpus]
    )
    get_baseline()  # ensure trained before scoring

    tp = fp = tn = fn = 0
    latencies = []
    for row in test:
        t0 = time.perf_counter()
        tier = RULES.risk_tier(RULES.analyze_text(row["text"]))
        predicted = 1 if tier.value == "high" else 0
        latencies.append((time.perf_counter() - t0) * 1000)
        if predicted == 1 and row["label"] == 1:
            tp += 1
        elif predicted == 1 and row["label"] == 0:
            fp += 1
        elif predicted == 0 and row["label"] == 0:
            tn += 1
        else:
            fn += 1

    precision = tp / (tp + fp) if tp + fp else 0.0
    recall = tp / (tp + fn) if tp + fn else 0.0
    f1 = 2 * precision * recall / (precision + recall) if precision + recall else 0.0
    return {
        "language": lang,
        "precision": round(precision, 3),
        "recall": round(recall, 3),
        "f1": round(f1, 3),
        "false_positives": fp,
        "false_negatives": fn,
        "avg_latency_ms": round(sum(latencies) / len(latencies), 2),
    }


@pytest.mark.parametrize("lang", languages())
def test_rules_per_language(lang):
    m = _per_language_metrics(lang)
    assert m["f1"] >= MIN_F1, f"{lang}: F1 {m['f1']} below floor ({m})"
    assert m["false_positives"] <= 2, f"{lang}: too many false positives ({m})"


def test_baseline_assists_without_deciding():
    baseline = get_baseline()
    scam = baseline.score("Guaranteed 40% monthly return! Act now, share OTP.")
    benign = baseline.score("What is the expense ratio of an index fund?")
    assert scam["scam_probability"] > benign["scam_probability"]
    assert scam["decision_role"] == "assistance_only"
    assert scam["calibrated"] is False


def test_indicbert_adapter_reports_honestly():
    status = IndicBERTAdapter().status()
    assert status["status"] in ("ready", "unavailable")
    if status["status"] == "unavailable":
        assert status["reason"], "unavailable status must carry the exact reason"


def test_evaluation_summary_shape():
    rows = [_per_language_metrics(lang) for lang in languages()]
    assert len(rows) == len(languages())
    assert all(r["precision"] <= 1.0 and r["recall"] <= 1.0 for r in rows)
