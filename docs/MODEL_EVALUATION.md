# Model & Pipeline Evaluation

Run: `cd workspace/niveshraksha/backend && python -m pytest tests/test_model_eval.py -v`

## What is measured

For each supported language, a held-out synthetic split runs through the deterministic rule engine (the decision-maker) and reports:

- Precision, Recall, F1 (high-risk detection)
- False positives / false negatives (each FP/FN is a hard test failure)
- Average latency per analysis

The assistive TF-IDF+LR baseline and the IndicBERT adapter status are asserted separately.

## Current results (synthetic template-space, 12 languages)

All 12 language evaluation sets pass: F1 ≥ 0.90 floor with ≤ 2 false positives per language, average rule latency in the low-millisecond range. The evaluation harness is parametrised over `app/ml/corpus.py::languages()`, so a new language cannot ship without passing its own set.

## Per-language precision/recall/F1 table

The harness prints the metrics per language on `-v`; the numbers below are the shape of the report (see TEST_REPORT.md for the run count):

| Language | P | R | F1 | FP | FN | Verdict |
|---|---|---|---|---|---|---|
| en / ta / hi / te / ml / kn | ≥0.90 | ≥0.90 | ≥0.90 | ≤2 | 0 allowed to fail build | validated |
| bn / mr / gu / or / pa / as | ≥0.90 | ≥0.90 | ≥0.90 | ≤2 | 0 allowed to fail build | validated (synthetic only) |
| ur (Urdu) | — | — | — | — | — | **not validated — not claimed** |
| Hinglish / code-mixed | partial | partial | — | — | — | partial: EN+romanised patterns cover common cases; dedicated set is future work |

## What this proves — and what it does not

**Proves:** the rule set behaves consistently on its own authored evaluation templates; regressions fail CI; no language is marketed as supported without a passing per-language set (the master prompt's core multilingual rule).

**Does not prove:** real-world precision/recall — synthetic templates cannot represent the diversity of actual scam traffic. Before any real-world claim: a labelled field dataset per language (thousands of messages), calibration against it, and explanation-faithfulness review are required. Latency here excludes network; production latency depends on deployment.

## Evaluation roadmap

1. Collect consented, anonymised, labelled scam messages per language.
2. Recalibrate the assistive model; re-run FP analysis with human review.
3. Add OCR evaluation once screenshot text extraction ships.
4. Add translation-adequacy scoring if a translation layer is introduced.
