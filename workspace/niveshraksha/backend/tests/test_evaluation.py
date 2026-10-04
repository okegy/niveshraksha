"""Runs the fixed synthetic evaluation dataset through the red-flag engine.

This is the measurable FP/FN harness referenced in docs/EVALUATION_PLAN.md:
- A false negative is a case whose expected flags did not fire.
- A false positive is a flag firing on a case that expects none.
"""
import json
from pathlib import Path

import pytest

from app.analyzers.scam_rules import ScamAnalyzer
from app.analyzers.url_rules import UrlAnalyzer
from app.models import RiskLevel
from app.sources import registry

CASES_PATH = Path(__file__).resolve().parents[2] / "evaluation" / "synthetic_cases.json"
dataset = json.loads(CASES_PATH.read_text(encoding="utf-8"))["cases"]

text_analyzer = ScamAnalyzer()
url_analyzer = UrlAnalyzer()

LEVELS = {lv.value: lv for lv in RiskLevel}


def _run(case):
    if case["input_type"] == "url":
        return url_analyzer.analyze_url(case["content"]), url_analyzer.risk_tier
    if case["input_type"] == "verify":
        status, _, _ = registry.search_advisor(registration_number=case["content"]["registration_number"])
        return status, None
    flags = text_analyzer.analyze_text(case["content"])
    return flags, lambda f: text_analyzer.risk_tier(f)


@pytest.mark.parametrize("case", dataset, ids=lambda c: c["id"])
def test_evaluation_case(case):
    result, tier_fn = _run(case)

    if case["input_type"] == "verify":
        assert result == case["expected_status"]
        return

    tier = tier_fn(result)
    expected_tier = LEVELS[case["expected_risk_level"]]
    fired = {f.code for f in result}
    expected = set(case["expected_flag_codes"])

    # False negatives: expected flags that did not fire.
    missed = expected - fired
    assert not missed, f"FALSE NEGATIVE {case['id']}: missing flags {missed}"

    # False positives: any flag at all where the case expects none.
    if not expected:
        assert not fired, f"FALSE POSITIVE {case['id']}: unexpected flags {fired}"

    assert tier == expected_tier, f"{case['id']}: got {tier.value}, expected {case['expected_risk_level']}"
