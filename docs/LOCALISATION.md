# Localisation — NiveshRaksha

## Language inventory

| Code | Language | UI chrome | Education (7 modules) | Rule phrases | Eval set | Status |
|---|---|---|---|---|---|---|
| en | English | ✅ | ✅ | ✅ (structured patterns) | ✅ | validated |
| ta | Tamil | ✅ | ✅ | ✅ | ✅ | validated |
| hi | Hindi | ✅ | ✅ | ✅ | ✅ | validated |
| te | Telugu | ✅ | ✅ | ✅ | ✅ | validated |
| ml | Malayalam | ✅ | ✅ | ✅ | ✅ | validated |
| kn | Kannada | ✅ | ✅ | ✅ | ✅ | validated |
| bn | Bengali | ✅ | ✅ | ✅ | ✅ | validated (synthetic) |
| mr | Marathi | ✅ | ✅ | ✅ | ✅ | validated (synthetic) |
| gu | Gujarati | ✅ | ✅ | ✅ | ✅ | validated (synthetic) |
| or | Odia | ✅ | ✅ | ✅ | ✅ | validated (synthetic) |
| pa | Punjabi | ✅ | ✅ | ✅ | ✅ | validated (synthetic) |
| as | Assamese | ✅ | ✅ | ✅ | ✅ | validated (synthetic) |
| ur | Urdu | ❌ | ❌ | ❌ | ❌ | **not supported — not claimed** (RTL + content quality not evaluated) |

"Validated (synthetic)" means the language passes its evaluation set built from authored templates — a necessary gate, not a real-world quality claim (see MODEL_EVALUATION.md).

## Where each piece lives

- **UI chrome strings**: `frontend/src/lib/i18n.tsx` (`dict` + `LANGUAGE_OPTIONS`), persisted per device in localStorage, SSR-safe external store.
- **Education content**: `content/<code>/modules.json` — 7 modules each, served by `GET /api/v1/education/modules?language=<code>`; unknown codes get an explicit 404.
- **Rule phrases**: `app/ml/corpus.py::SCAM_LEXICON` → compiled into deterministic phrase rules in `app/analyzers/scam_rules.py`; each language must pass `tests/test_model_eval.py` before inclusion.
- **Language registry API**: `GET /api/v1/languages` returns the full list with `validated` flags — the product's UI never claims more than this endpoint says.

## Rules for adding a language

1. Author the education modules and UI strings.
2. Add the scam lexicon (hook/push/credential/payment/threat/doc) to `SCAM_LEXICON`.
3. Add per-language evaluation cases; the harness must pass (F1 ≥ 0.90, ≤ 2 FP).
4. Flip `validated: true` in the languages registry only after (3).
5. Update LOCALISATION.md, CONTENT_SOURCES.md, and NOTICE.md if content sources changed.

Urdu additionally requires RTL layout support (`dir="rtl"` handling), a Nastaliq-compatible font pass, and native-speaker content review before any release.
