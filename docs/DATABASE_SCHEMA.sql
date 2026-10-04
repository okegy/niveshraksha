-- ===========================================================================
-- NiveshRaksha Database Schema
-- PostgreSQL (production target). The demo runs the equivalent schema on
-- SQLite via SQLAlchemy models in backend/app/storage.py — the mapping is 1:1
-- apart from SQLite's dynamic typing and the demo storing rule codes as a
-- comma-joined string instead of JSONB.
--
-- Privacy design: only redacted content is ever inserted; every user-facing
-- row carries expires_at and is hard-deleted by the retention sweep
-- (NIVESHRAKSHA_RETENTION_HOURS, default 72). Deletion of drafts is physical.
-- ===========================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Redacted result snapshots for deep links (/result/[id]). No raw user text.
CREATE TABLE analysis_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    input_type VARCHAR(16) NOT NULL CHECK (input_type IN ('message', 'url')),
    risk_level VARCHAR(32) NOT NULL CHECK (risk_level IN ('high', 'review_carefully', 'no_obvious_red_flags')),
    rules_triggered JSONB NOT NULL DEFAULT '[]',   -- sorted rule codes, e.g. ["GUARANTEED_RETURN"]
    result_snapshot JSONB NOT NULL,                -- redacted AnalysisResponse JSON
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL
);
CREATE INDEX idx_analysis_sessions_expires ON analysis_sessions (expires_at);

-- Consent-gated evidence drafts. Content is redacted BEFORE insert.
-- deleted_at is retained only as a forensic placeholder; the API deletes rows
-- physically, so it should always be NULL in practice.
CREATE TABLE incident_drafts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_session_id VARCHAR(64) NOT NULL,          -- random browser token, not an identity
    redacted_content TEXT NOT NULL,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    deleted_at TIMESTAMP WITH TIME ZONE            -- always NULL: deletion removes the row
);
CREATE INDEX idx_incident_drafts_session ON incident_drafts (user_session_id);
CREATE INDEX idx_incident_drafts_expires ON incident_drafts (expires_at);

-- Provenance/audit trail for every served source-status snapshot (checksummed).
CREATE TABLE source_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    source_name VARCHAR(200) NOT NULL,
    source_url VARCHAR(500) NOT NULL,
    retrieved_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    status VARCHAR(64) NOT NULL,                   -- mock_mode | reference_link_only | ...
    checksum CHAR(64) NOT NULL                     -- sha256 of the served snapshot payload
);
CREATE INDEX idx_source_records_time ON source_records (retrieved_at DESC);

-- ---------------------------------------------------------------------------
-- Education content is served from content/<lang>/modules.json (offline-friendly,
-- reviewable in git). If a deployment prefers database-backed content, use:
--
-- CREATE TABLE education_modules (
--     id VARCHAR(40) PRIMARY KEY,                -- e.g. 'module-1'
--     language VARCHAR(8) NOT NULL,              -- en | ta | hi | te | ml | kn
--     title TEXT NOT NULL,
--     body JSONB NOT NULL,                       -- description + content bullets
--     source_ids JSONB NOT NULL DEFAULT '[]',
--     version INTEGER NOT NULL DEFAULT 1,
--     UNIQUE (id, language)
-- );
-- ---------------------------------------------------------------------------

-- Retention sweep (run opportunistically on writes; a scheduled job is fine too):
--   DELETE FROM analysis_sessions WHERE expires_at < NOW();
--   DELETE FROM incident_drafts   WHERE expires_at < NOW();
