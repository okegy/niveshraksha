# Product Requirements Document (PRD) - NiveshRaksha

## 1. Product Identity
- **Name**: NiveshRaksha
- **Tagline**: "Pause. Verify. Protect."
- **Goal**: Help Indian investors identify suspicious financial communication, verify information through official sources, understand their rights, and take safe next steps.
- **Hackathon Track**: Digital Fraud and Scam Resilience (Primary), Misinformation and Financial Content Literacy, Investor Education for Bharat, Investor Awareness, Rights, and Grievance Redressal (Secondary).
- **Target Audience**: First-time retail investors, students, young professionals, senior citizens, regional-language users, and investor-awareness volunteers.

## 2. Non-Negotiable Safety Boundaries
- NEVER recommend buying/selling securities, predict prices/returns, or rank securities.
- NEVER claim absolute legitimacy without authoritative verification.
- NEVER ask for sensitive credentials (OTPs, UPI PINs, passwords, private keys).
- NEVER store unnecessary personal/financial data.
- MUST use safe language ("Potential warning sign", "Could not verify", etc.).

## 3. Core Features
1. **Scam Message Analyzer**: Analyzes text/screenshots for red flags (guaranteed returns, urgency, impersonation) with explainable risk levels.
2. **Suspicious URL Checker**: Multi-engine verification for phishing and lookalike domains.
3. **Advisor and Entity Verification**: Verifies SEBI registered advisors using official sources or mock fixtures.
4. **Evidence Locker**: Private, redactable incident draft creation for official reporting.
5. **Education Hub**: Short, localized (English/Tamil) lessons on scam warning signs, verification, and digital safety.
6. **Behavioural Pause Mode**: A 30-second checklist before proceeding with suspicious messages to interrupt urgency tactics.

## 4. UI / UX Principles
- Trustworthy, calm, fast, human, mobile-first design.
- No fear-based red flashing, dark patterns, or fake regulator logos.
- Progressive disclosure of risk explanations and official source provenance.
- Multilingual and accessibility support (Tamil/English, screen readers, large text).

## 5. Technology Stack
- **Frontend**: Next.js (TypeScript), Tailwind CSS, shadcn/ui, TanStack Query, React Hook Form, Zod.
- **Backend**: Python FastAPI, Pydantic, SQLAlchemy/SQLModel, PostgreSQL.
- **Infrastructure**: Docker Compose, no secrets in Git, structured logs.
