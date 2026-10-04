# Privacy Policy & Design — NiveshRaksha

## What we collect

**Nothing that identifies you.** There are no accounts, no trackers, no analytics, no third-party scripts.

| Data | Collected? | Where | Lifetime |
|---|---|---|---|
| Message/URL you analyze | Processed in memory; stored only as a **redacted result snapshot** | `analysis_sessions` (SQLite) | 72 h, then hard-deleted by retention sweep |
| Evidence draft content | Only if you tick the consent checkbox; **redacted first** | `incident_drafts` | 72 h, or instantly on your delete |
| Draft without consent | Never leaves your browser | — | — |
| Education progress | Your browser's localStorage only | your device | until you clear it |
| Language / accessibility prefs | Your browser's localStorage only | your device | until you clear it |
| Source-status snapshots | Source name/URL/status/checksum — no user data | `source_records` | audit trail |
| Server logs | JSON event logs scrubbed through the redaction filter | stdout | deployment-dependent |

## Redaction before storage

Anything persisted passes `app/security/redaction.py`, which removes:

- PAN (`ABCDE1234F` pattern) → `[PAN REDACTED]`
- Aadhaar (grouped 12 digits) → `[AADHAAR REDACTED]`
- Indian mobile numbers (contiguous and spaced, optional +91) → `[PHONE REDACTED]`
- Email addresses → `[EMAIL REDACTED]`
- UPI IDs (`name@bank`) → `[UPI ID REDACTED]`
- Card/account-shaped digit runs → `[CARD/ACCOUNT REDACTED]`
- OTP/PIN codes following those words → `[REDACTED]`

The same pipeline scrubs every log record (`app/security/logging_setup.py`), so a message fragment reaching a log line cannot carry these identifiers.

## Consent & deletion

- Storage is **opt-in by explicit checkbox** — unticked means the server never persists your draft (asserted by tests).
- Deletion is real: the row is physically deleted, not flagged (asserted by tests).
- Auto-expiry runs opportunistically on every write; expired rows are hard-deleted.

## v3 additions

| Data | Handling |
|---|---|
| Voice recordings (chat mic) | Sent from the browser to our backend → Sarvam STT, **never stored** on our side; processed by Sarvam AI under their privacy notice (disclosed in the UI) |
| TTS audio | Generated per request from Guide text, streamed to the browser, never cached server-side |
| Opt-in chat history | Fernet-encrypted at rest with a key derived from PBKDF2(browser session token + server secret). The token is never stored server-side — a lost token means unreadable history (by design). Auto-expires in 72 h; delete-all in Settings |
| Screenshot OCR | Processed fully in memory by a local on-device engine (RapidOCR); images never stored; extracted text redacted before persisting any result snapshot |
| Community threat reports | Kept in demo-session memory only (not the database), scored by the deterministic engine, labelled as community content |

## What we never do

- Never ask for OTPs, PINs, passwords, card numbers, or remote-access permission.
- Never store raw uploads (the demo accepts no uploads at all).
- Never share data with third parties — there is no outbound call carrying user content anywhere in the codebase.
- Never present your data to an LLM — no LLM is in the request path.

## Your controls

- Delete any draft from `/report` at any time.
- Clear `nr_language`, `nr_a11y`, `nr_learn_progress`, `nr_session_id` from localStorage to wipe device-local state.
- Results fetched by ID expire and 404 after retention (`/result/[id]` explains this honestly).

## Demo caveat

This is a hackathon demo. Do not paste real documents, real Aadhaar/PAN, or anything you wouldn't publish. The redaction is defense-in-depth, not a compliance certification (no DPDP audit has been performed).
