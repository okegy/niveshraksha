# Model Card — NiveshRaksha assistive classifiers

## Model 1: `tfidf_logreg_synthetic_v1` (active)

| Field | Value |
|---|---|
| Task | Binary scam-likeness scoring (assistance signal only) |
| Architecture | TF-IDF (word 1–2 grams + char 3–5 grams) → LogisticRegression (C=4.0, max_iter=1000) |
| Training data | 100% synthetic, generated from this project's authored multilingual templates/lexicons (`app/ml/corpus.py`), seeded and reproducible |
| Languages covered by training data | en, ta, hi, te, ml, kn, bn, mr, gu, or, pa, as |
| Intended use | Prioritising/explaining indicators; never the decision-maker |
| Out-of-scope use | Any autonomous risk decision; real-world deployment without a labelled field dataset |
| Calibration | **Not calibrated** — probabilities are raw LR outputs; honestly reported as `calibrated: false` in every response |
| Known limitations | Measures template-space behaviour, not real-world accuracy; code-mixed text (Hinglish/Tanglish) only partially covered; regex-avoidant scam wording will be missed |
| Ethical considerations | No real user data used in training; no demographic attributes processed; errors fail safe to rules-only |

## Model 2: `anmolshrivastav/indicbert-scam-classifier-v2` (adapter ready, not loaded)

| Field | Value |
|---|---|
| Source | Hugging Face model card — https://huggingface.co/anmolshrivastav/indicbert-scam-classifier-v2 |
| Audit status | Card reviewed for intended use and limitations; **weights not downloaded in this build** (hermetic demo rule: `NIVESHRAKSHA_ALLOW_MODEL_DOWNLOAD=1` required) |
| License | To be confirmed from the model card at download time — recorded before any use (adapter refuses to claim readiness until then) |
| Integration | `app/ml/classifiers.py::IndicBERTAdapter` — returns `ready` with label mapping, or `unavailable` with the exact reason |
| Reported in responses | `ml_metadata.indicbert.status` so judges/users see model availability honestly |
| Risks if enabled | Multilingual model labels do not guarantee per-language quality; per-language evaluation (Section 8 of the master prompt) must pass before any language claims model support |

## Decision authority (unchanged)

Risk levels come **only** from deterministic rules (`app/analyzers/`). Model output is advisory metadata, labelled `decision_role: "assistance_only"` in every response.
