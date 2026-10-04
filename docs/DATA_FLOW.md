# Data Flow — NiveshRaksha

## 1. Message analysis

```
User pastes text (browser)
  └─ POST /api/v1/analyze/message {content ≤10k, language}
       ├─ rate limiter (30 req/min/IP)  ── 429 on flood
       ├─ ScamAnalyzer.analyze_text()   ── regex rules → RedFlag[] (code, explanation, matched span, severity)
       ├─ risk_tier()                   ── the ONLY place a level is decided
       ├─ redact_text() on matched spans ── PII stripped from the snapshot
       ├─ save_analysis()               ── analysis_sessions row, expires_at = now + 72 h
       └─ 200 {analysis_id, risk_level, red_flags[], safe_next_steps[], limitations[], created_at}
            └─ browser renders ResultView; deep link /result/<id>
```

No LLM, no outbound network call, no raw text persisted (only the redacted result snapshot).

## 2. URL check

```
User pastes URL
  └─ POST /api/v1/analyze/url
       ├─ UrlAnalyzer.analyze_url()  ── pure string analysis (urllib.parse + regex)
       │    NO socket is ever opened (tripwire-tested)
       └─ same persistence/redaction path as above, note: "page was not opened"
```

## 3. Advisor verification

```
User submits name/reg-no
  └─ POST /api/v1/verify/advisor
       ├─ sources.registry.search_advisor() ── demo fixture (synthetic, labelled)
       ├─ status: verified | not_found ; match_quality: exact | partial | ambiguous | none
       └─ 200 {status, source_name, source_url, retrieved_at, match_quality, uncertainty_note}
            └─ UI ALWAYS renders the uncertainty card (demo-fixture warning)
```

Swapping in the live SEBI database later means implementing one adapter in `sources/` — routers and UI contracts unchanged.

## 4. Evidence locker

```
User writes draft
  └─ POST /api/v1/reports/draft {content, notes, consent_storage}
       ├─ consent_storage=false → redacted text returned, NOTHING persisted (draft_id="local-only")
       └─ consent_storage=true  → redact_text() → incident_drafts row (expires 72 h)
            ├─ GET  /api/v1/reports/draft?user_session_id=…   → own drafts only
            ├─ DELETE /api/v1/reports/draft/{id}?user_session_id=… → physical delete
            └─ GET  /api/v1/reports/routes                    → official portals only
```

## 5. Education & transparency

```
GET /api/v1/education/modules?language=en|ta|hi|te|ml|kn
  └─ content/<lang>/modules.json (7 modules each); unknown language → 404 (no silent fallback)

GET /api/v1/sources/status
  └─ registry.all_source_statuses() → snapshot checksummed (sha256) and appended to source_records
GET /api/v1/sources/records  ── audit trail of served snapshots
```

## Storage model (SQLite demo; Postgres-ready schema)

`analysis_sessions(id, created_at, input_type, risk_level, rules_triggered, result_snapshot, expires_at)`
`incident_drafts(id, user_session_id, redacted_content, notes, created_at, expires_at, deleted_at→always NULL; deletion is physical)`
`source_records(id, source_name, source_url, retrieved_at, status, checksum)`

Retention sweep (`purge_expired`) hard-deletes expired rows on every write. Full SQL: `DATABASE_SCHEMA.sql`.

## What never happens

- User text is never sent to any model or third-party API.
- Nothing is persisted without consent (drafts) or beyond 72 h (analyses/drafts).
- No log line can carry unredacted PII (logging filter applies the same redaction pipeline).
