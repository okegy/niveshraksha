# NiveshRaksha Architecture

## 1. High-Level Architecture
NiveshRaksha follows a modular client-server architecture with strict separation of concerns for safety and privacy.

### 1.1 Components
- **Frontend (Next.js)**: Responsible for UI, local state, form validation, and offline-friendly education delivery. Communicates via typed API clients.
- **Backend (FastAPI)**: Serves REST endpoints for analysis, verification, and incident management.
- **Database (PostgreSQL)**: Stores ephemeral session data and redacted incident drafts.

## 2. Core Modules
- **Analyzers**: Deterministic rules engines for text and URL scam detection (No opaque AI decision-making for critical flags).
- **Verifiers**: Adapters connecting to official sources (or mock fixtures) for SEBI advisor and entity verification.
- **Security & Privacy**: Interceptors for data redaction, rate limiting, and SSRF prevention.

## 3. Data Flow
1. **Input**: User pastes message/URL or uploads an image.
2. **Privacy Filter**: PII/sensitive data is redacted locally or at the edge before storage/logging.
3. **Analysis Engine**: Deterministic rules flag urgency, guaranteed returns, or phishing patterns.
4. **Verification Engine**: Entities/URLs are checked against official databases.
5. **Response Compilation**: Risk level, triggered indicators, source provenance, and safe next steps are compiled into a strict Pydantic model.
6. **Presentation**: The UI displays the response progressively without alarmist design.

## 4. Threat Model & Mitigations
- **SSRF**: URL checker blocks private IP ranges and local hostnames.
- **Prompt Injection**: LLMs (if used for text extraction) are constrained; outputs are validated strictly via Zod/Pydantic.
- **Data Leaks**: No raw PAN/Aadhaar stored; incident locker requires explicit consent and auto-expires data.
