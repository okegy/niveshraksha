# NiveshRaksha - Demo Script

## 1. Setup & Context (1 min)
"Hi Judges, meet Rohan. He is a first-time retail investor who just received a WhatsApp message promising 'Guaranteed 40% monthly returns on a secret stock tip.' The message urges him to act now and share his OTP to register. Rohan is tempted but unsure."

## 2. Problem (30 sec)
"Scammers use urgency, guaranteed returns, and impersonation to bypass critical thinking. Existing platforms focus on *trading*—but there's no safe space to *pause and verify*."

## 3. The NiveshRaksha Solution (1 min)
*Open NiveshRaksha Landing Page*
"We built NiveshRaksha: a privacy-first platform designed to help investors identify red flags before they lose money."

*Action 1: Analyze Message*
"Rohan pastes the WhatsApp message here. Notice we redact sensitive info before analysis. He clicks 'Analyze Now'."
*Show Results:* "The system uses deterministic rules—no opaque AI hallucinations—to flag 'Guaranteed returns' and 'Urgency' as HIGH RISK."

## 4. Verification (1 min)
"The message claims to be from a 'SEBI Registered Advisor' with number INA123456789. Let's verify."
*Action 2: Verify Advisor*
"Rohan goes to 'Verify an Advisor', types the number, and clicks verify. It checks against official mock fixtures (simulating the SEBI database). Result: NOT FOUND. He just avoided a scam."

## 5. Behavioural Pause & Education (1 min)
"What if Rohan is still unsure? We built the '30-Second Pause' feature."
*Action 3: Show Pause Checklist*
"This interrupts the scammer's false urgency and forces active acknowledgment of risk."
*Action 4: Show Education Hub*
"Our localized Education Hub explains these tactics simply."

## 6. Architecture & Safety (30 sec)
"Under the hood: Next.js frontend, FastAPI backend. We prioritize privacy by redacting PII, do NOT store raw messages permanently, and strictly NEVER provide investment advice."

"NiveshRaksha: Pause. Verify. Protect."


---

## SENTINEL-X portal demo (v3 build)

The landing page is now the SENTINEL-X cyberpunk portal (matrix rain, glowing cards) powered by the same NiveshRaksha deterministic engine.

**60-second walkthrough:**

1. Land on `/` — matrix rain, LIVE threat feed ticker, "14,209 Scams Flagged Today" (demo counters, honestly labelled), 6 live threat cards.
2. Click the **Crypto Address Check** card → auto-scans `0x71C7…9739` → SUSPICIOUS + on-chain-unavailable honesty + "never share seed phrase" guidance.
3. Click **Report Fraud** → submit `http://fake-sbi-kyc-approval.xyz` + details → the engine scores it (e.g. 97/100 CRITICAL) and it appears instantly in the community feed.
4. Hero scan: paste `support-ticket-update@mail-security-check.com` → phishing-shape flag. Paste a phone number → Chakshu/Sanchar Saathi guidance.
5. Scroll to **SAFETY DISCLAIMER** — pattern checks only, clean ≠ safe, no SEBI affiliation.

**Screenshot-upload Tip-Group Profiler (new):** `/analyze` → Screenshot tab → upload a screenshot of a tip-group message → local OCR extracts the text (nothing stored) → deterministic flags + risk level returned. Try the synthetic screenshot from `docs/` or any scam-message screenshot.

**Backend endpoints powering it:** `POST /api/v1/analyze/query` (URL/crypto/email/Telegram/phone/text routing), `GET /api/v1/threatfeed/feed|stats`, `POST /api/v1/threatfeed/report` (engine-scored), `POST /api/v1/analyze/screenshot` (OCR-enabled).
