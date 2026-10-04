# Content Sources — Education Hub

All educational copy in `content/<lang>/modules.json` is **original writing** for this project. It summarizes publicly available investor-awareness themes; no regulator text was copied. Modules link to official portals for readers to verify and act themselves.

## Official references behind each module

| source_id | Official source | Used for |
|---|---|---|
| `sebi-investor-education` | https://investor.sebi.gov.in — SEBI investor education portal | Warning signs, nomination awareness, misinformation literacy |
| `sebi-intermediaries-db` | https://www.sebi.gov.in/sebiweb/other/OtherAction.do?doRecognisedFpi=yes&intmId=13 | Advisor verification steps |
| `sebi-scores` | https://scores.sebi.gov.in | Complaint/grievance rights against registered intermediaries |
| `rbi-awareness` | https://www.rbi.org.in — RBI public awareness (card/OTP safety) | Safe digital payments, OTP/UPI-PIN basics |
| `cybercrime-portal` | https://cybercrime.gov.in + helpline 1930 | Complaint preparation, golden-hour reporting |

## Languages

English and Tamil launched first; Hindi, Telugu, Malayalam and Kannada added on request (`hi`, `te`, `ml`, `kn`). Each file holds the same 7 modules:

1. Scam warning signs
2. How to verify an advisor
3. Safe digital payments
4. Know your investor rights
5. Preparing a complaint
6. Nomination awareness
7. Spotting financial misinformation

Served via `GET /api/v1/education/modules?language=<code>`; unknown languages get an explicit 404 (no silent fallback). The frontend ships a built-in **offline fallback lesson** (per language) for the Learn hub when the backend is unreachable.

## Editorial rules

- Plain language; short sentences; no jargon without explanation.
- Never states or implies that any investment is safe or profitable.
- Always points to official portals for action; never submits anything on the user's behalf.
- No fabricated statistics, testimonials, or regulator logos.
