# UI Screen Map

All routes implemented in `frontend/src/app/*` and verified against the running app.

| Route | Purpose | Key elements | States handled |
|---|---|---|---|
| `/` | Calm landing | Tagline, two primary cards (Check a Message / Verify an Advisor), quick links to pause/report/learn, safety disclaimer | Static; bilingual chrome; disclaimer always visible |
| `/analyze` | Primary analysis workflow | Tabs: Message / URL; privacy notice; synthetic-example buttons; dual submit buttons | Loading, error (network/429/500), empty "awaiting input", inline result |
| `/result/[id]` | Stable deep-link to a stored analysis | Same result view as inline; retention-expiry copy on 404 | Loading, honest 404, full result |
| `/verify` | Advisor/entity check | Registration-number field, name field, demo-mode note | Loading, error, match found (with matched name + source + time), not-found (symmetric honesty), uncertainty card always |
| `/pause` | Behavioural pause | Three acknowledged questions; continue actions unlock only when all checked | Locked, acknowledged (green guidance), links to analyze/verify |
| `/learn` | Education hub | 7 module cards × 6 languages; per-device progress; offline banner | Loading, offline fallback lesson, completed-state styling |
| `/report` | Evidence locker | Composer + consent checkbox, redaction preview, saved drafts list (export/delete), official reporting routes | Created-with-consent, local-only (no consent), locker unavailable, empty list |
| `/about` | Transparency | Methodology, source policy + live status, limitations, privacy paragraph, attribution | Sources loaded / sources unavailable |

Global chrome: header (brand, 6-item nav, language select, A+ / reduce-motion toggles), footer with standing non-advice disclaimer.

Deliberately absent: login/signup, pricing, trading charts, testimonials, notification prompts.
