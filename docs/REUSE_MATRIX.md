# Reuse Matrix — what was taken, what was rebuilt, and why

Source under review: **SEBI_safe_space** (https://github.com/frharsh/SEBI_safe_space, MIT, commit `21f0ee2`). Full audit: `repository-audits/SEBI_safe_space.md`.

| Concept / code in source | Decision | Where it lives in NiveshRaksha | Rationale |
|---|---|---|---|
| Advisor JSON-lookup workflow | **Concept reused, code rewritten** | `backend/app/sources/registry.py` + clearly-labelled synthetic fixture | The idea of a checkable advisor registry is sound; the implementation was rebuilt for typed lookup, honest `not_found` semantics, and fixture labelling. |
| Mock-data fallback when API keys are absent | **Pattern reused** | `backend/app/sources/mock_advisors.json` + `/api/v1/sources/status` mode field | Matches our "fail safely, show provenance" requirement. |
| URL scanning feature | **Concept reused, implementation original** | `backend/app/analyzers/url_rules.py` | Original source called external APIs (VirusTotal etc.); we deliberately made the checker static/network-free to remove SSRF and demo-key dependencies. |
| Fraud report structuring | **Concept only** | Evidence Locker (`/report`, `app/routers/report.py`) | Rebuilt around consent, redaction, retention, and export. |
| Flask + vanilla JS frontend | **Rejected** | Next.js + FastAPI stack | Stack mandated by the product brief; also lets us ship typed clients and a11y primitives. |
| Any UI code / styling | **Rejected — rewritten from scratch** | `frontend/src/*` | Original look-and-feel required; no copied markup or CSS. |
| Any advisor data | **Rejected — synthetic only** | `mock_advisors.json` (fictional "Demo Kumar…") | Never present third-party data as regulator data. |

## License compliance checklist (MIT)

- [x] License file preserved and acknowledged — see `NOTICE.md`
- [x] Attribution given for the studied repository and its concepts
- [x] No verbatim code reuse requiring per-file headers
- [x] No endorsement implied; no SEBI/author affiliation claimed

## Third-party libraries (runtime)

Frontend: Next.js, React, Tailwind CSS, Base UI, lucide-react, tw-animate-css (MIT/ISC).
Backend: FastAPI, Pydantic, SQLAlchemy, Uvicorn (MIT/BSD).
Full acknowledgements: `NOTICE.md` in `workspace/niveshraksha/`.
