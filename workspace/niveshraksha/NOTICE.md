# NOTICE — Third-party components and attribution

NiveshRaksha is an original product built for the Sangyan Investor Resilience Hackathon. This file records the open-source work it builds on, as required by the respective licenses.

## Studied repositories

### SEBI_safe_space — https://github.com/frharsh/SEBI_safe_space
- License: MIT (https://github.com/frharsh/SEBI_safe_space/blob/main/LICENSE)
- Commit reviewed: `21f0ee2b51a9e1b9182c9b28721df2cec9d59e43`
- Use: high-level inspiration for advisor-verification workflow and mock-data patterns. **No code was copied verbatim.** NiveshRaksha was rebuilt on an original Next.js + FastAPI architecture with its own rule engine, redaction pipeline, and UI system.
- Attribution: this notice acknowledges the repository per the MIT license. It is not endorsed by, or affiliated with, its authors.

## Frontend libraries

| Component | License | Use |
|---|---|---|
| Next.js | MIT | React application framework |
| React / React DOM | MIT | UI runtime |
| Tailwind CSS | MIT | Utility CSS |
| Base UI (`@base-ui/react`) | MIT | Accessible unstyled primitives |
| shadcn/ui (generated components, adapted) | MIT | Component patterns |
| lucide-react | ISC | Icons |
| tw-animate-css | MIT | Animation utilities |

## Backend libraries

| Component | License | Use |
|---|---|---|
| FastAPI | MIT | HTTP framework |
| Pydantic | MIT | Validation models |
| SQLAlchemy | MIT | Persistence layer |
| Uvicorn | BSD-3-Clause | ASGI server |
| pytest | MIT | Test framework |

## v2 build additions

- SEBI_safe_space remains the only studied investor-safety repository; all v2 additions (Raksha Guide, ML baseline, lexicons) are original work. Full third-party repo audit table: docs/REUSE_MATRIX.md.
- scikit-learn (BSD-3-Clause) used for the assistive TF-IDF+LR baseline.
- The IndicBERT scam-classifier model (anmolshrivastav/indicbert-scam-classifier-v2) is NOT bundled or downloaded in this build; if enabled later, its license and model card must be recorded here first.

## Data

- All advisors in `backend/app/sources/mock_advisors.json` are **synthetic, fictional records** created for the demo. They do not describe real persons or firms and are not regulator data.
- Education content in `content/` is original writing informed by publicly available investor-awareness themes (SEBI/RBI public education pages linked in `docs/OFFICIAL_SOURCES.md`). No regulator text was copied.

## Trademarks

SEBI, RBI, and all financial-institution names are used only nominatively (e.g., "verify against the SEBI database"). No affiliation or endorsement is claimed or implied.
