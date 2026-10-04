# Evaluation Plan — measuring the red-flag engine honestly

## Dataset

`workspace/niveshraksha/evaluation/synthetic_cases.json` — a **fixed** set of 10 synthetic cases covering the master brief's required scenarios:

| # | Case | Expected |
|---|---|---|
| 1 | Guaranteed-return scam (EN) | high |
| 2 | Regulator impersonation | high |
| 3 | Normal educational message | no_obvious_red_flags |
| 4 | Suspicious URL | high |
| 5 | Advisor verification not found | not_found (+ uncertainty surfaced) |
| 6 | Legitimate-looking advisor claim | review_carefully |
| 7 | Tamil scam message | high |
| 8 | OTP request | high |
| 9 | False-positive guard (bank awareness text) | no_obvious_red_flags |
| 10 | Prompt injection inside scam text | high, with injection treated as data |

All cases are fictional. Case 9 and case 6 exist specifically to catch **false positives**; cases 1–8 to catch **false negatives**.

## Harness

`backend/tests/test_evaluation.py` runs the dataset on every test run:

- **False negative** = an expected flag did not fire → test fails naming the case and missing codes.
- **False positive** = any flag fires where none is expected → test fails naming the case and unexpected codes.
- Risk tier must match the expected tier exactly.

Run:

```bash
cd workspace/niveshraksha/backend && python -m pytest tests/test_evaluation.py -v
```

## Current results

As of this build: **10/10 evaluation cases pass inside the 66-test backend suite** (0 false positives, 0 false negatives on the fixed set). The full suite also asserts:

- no prohibited advice tokens in any API response (`test_api.py::assert_no_advice`),
- honest-uncertainty copy on every verification answer,
- redaction of PAN/Aadhaar/phone/email/UPI/card patterns before storage,
- physical deletion of drafts and consent-less non-storage,
- no network socket ever opened by the URL analyzer.

## Known measurement limits

- The dataset is small and fixed; it measures regression safety, not real-world accuracy. Real-world FP/FN rates need labelled field data we do not have.
- Rule coverage is strongest for the English + common Tamil phrasings in the dataset; scam wording drifts constantly.
- Tier thresholds (high/medium/low severity) are design judgements documented in `RISK_RULES.md`, not learned values.

## Expansion protocol

New scam pattern observed → (1) write the case as a new synthetic entry with expected flags, (2) add/extend the rule, (3) re-run the whole suite, (4) update `RISK_RULES.md`. A pattern without a failing-first test does not get merged.
