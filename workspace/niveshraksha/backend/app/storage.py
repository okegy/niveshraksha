"""Privacy-minimal persistence.

SQLite for the hackathon demo (zero-config, single file). The schema matches
docs/DATABASE_SCHEMA.sql so swapping to PostgreSQL is a connection-string
change. Retention: analysis sessions and incident drafts auto-expire
(72h default); expired rows are purged on access and by a periodic sweep.
Nothing is stored without the caller's explicit consent flag.

Datetime convention: naive UTC inside the database (SQLite compares ISO
strings lexically, and mixed aware/naive bindings break that); `_aware()`
re-attaches UTC on the way out.
"""
import os
import uuid
from datetime import UTC, datetime, timedelta
from typing import overload

from sqlalchemy import DateTime, String, Text, create_engine, delete, select
from sqlalchemy.orm import DeclarativeBase, Mapped, Session, mapped_column

RETENTION_HOURS = int(os.environ.get("NIVESHRAKSHA_RETENTION_HOURS", "72"))
_DEFAULT_DB = os.path.join(os.path.dirname(__file__), "..", "data", "niveshraksha.db")
DB_PATH = os.environ.get("NIVESHRAKSHA_DB_PATH", _DEFAULT_DB)
DATABASE_URL = os.environ.get(
    "NIVESHRAKSHA_DATABASE_URL", f"sqlite:///{os.path.abspath(DB_PATH)}"
)

engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {},
)


class Base(DeclarativeBase):
    pass


def utcnow() -> datetime:
    """Naive UTC — the database clock convention."""
    return datetime.now(UTC).replace(tzinfo=None)


@overload
def aware(dt: datetime) -> datetime: ...


@overload
def aware(dt: datetime | None) -> datetime | None: ...


def aware(dt: datetime | None) -> datetime | None:
    if dt is not None and dt.tzinfo is None:
        return dt.replace(tzinfo=UTC)
    return dt


class AnalysisSession(Base):
    __tablename__ = "analysis_sessions"
    id: Mapped[str] = mapped_column(String(36), primary_key=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=utcnow)
    input_type: Mapped[str] = mapped_column(String(16))  # message | url
    risk_level: Mapped[str] = mapped_column(String(32))
    rules_triggered: Mapped[str] = mapped_column(Text)  # comma-joined rule codes
    result_snapshot: Mapped[str] = mapped_column(Text)  # redacted JSON result
    expires_at: Mapped[datetime] = mapped_column(DateTime)


class IncidentDraft(Base):
    __tablename__ = "incident_drafts"
    id: Mapped[str] = mapped_column(String(36), primary_key=True)
    user_session_id: Mapped[str] = mapped_column(String(64))
    redacted_content: Mapped[str] = mapped_column(Text)
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=utcnow)
    expires_at: Mapped[datetime] = mapped_column(DateTime)
    deleted_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)


class SourceRecord(Base):
    """Provenance log: every source the product references, its mode/status
    and a checksum of the served snapshot — the audit trail for /about."""
    __tablename__ = "source_records"
    id: Mapped[str] = mapped_column(String(36), primary_key=True)
    source_name: Mapped[str] = mapped_column(String(200))
    source_url: Mapped[str] = mapped_column(String(500))
    retrieved_at: Mapped[datetime] = mapped_column(DateTime, default=utcnow)
    status: Mapped[str] = mapped_column(String(64))
    checksum: Mapped[str] = mapped_column(String(64))


def init_db() -> None:
    os.makedirs(os.path.dirname(os.path.abspath(DB_PATH)), exist_ok=True)
    Base.metadata.create_all(engine)


# Create tables at import time as well: TestClient exercises the app without
# running lifespan events, and a missing table must never be the reason an
# analysis fails.
init_db()


def _expiry() -> datetime:
    return utcnow() + timedelta(hours=RETENTION_HOURS)


def purge_expired() -> int:
    """Hard-delete rows past retention. Called opportunistically on writes."""
    now = utcnow()
    with Session(engine) as session:
        a = session.execute(delete(AnalysisSession).where(AnalysisSession.expires_at < now))
        d = session.execute(delete(IncidentDraft).where(IncidentDraft.expires_at < now))
        session.commit()
        return (a.rowcount or 0) + (d.rowcount or 0)


def save_analysis(input_type: str, risk_level: str, rules_triggered: list, result_json: str) -> str:
    purge_expired()
    analysis_id = str(uuid.uuid4())
    with Session(engine) as session:
        session.add(AnalysisSession(
            id=analysis_id, input_type=input_type, risk_level=risk_level,
            rules_triggered=",".join(rules_triggered), result_snapshot=result_json,
            expires_at=_expiry(),
        ))
        session.commit()
    return analysis_id


def get_analysis(analysis_id: str) -> AnalysisSession | None:
    with Session(engine) as session:
        row = session.get(AnalysisSession, analysis_id)
        if row is None or row.expires_at < utcnow():
            return None
        session.expunge(row)
        row.created_at = aware(row.created_at)
        row.expires_at = aware(row.expires_at)
        return row


def save_incident_draft(user_session_id: str, redacted_content: str, notes: str | None) -> str:
    purge_expired()
    draft_id = str(uuid.uuid4())
    with Session(engine) as session:
        session.add(IncidentDraft(
            id=draft_id, user_session_id=user_session_id, redacted_content=redacted_content,
            notes=notes, expires_at=_expiry(),
        ))
        session.commit()
    return draft_id


def list_incident_drafts(user_session_id: str) -> list[IncidentDraft]:
    purge_expired()
    with Session(engine) as session:
        rows = session.scalars(select(IncidentDraft).where(
            IncidentDraft.user_session_id == user_session_id,
            IncidentDraft.deleted_at.is_(None),
        )).all()
        out = []
        for r in rows:
            session.expunge(r)
            r.created_at = aware(r.created_at)
            r.expires_at = aware(r.expires_at)
            out.append(r)
        return out


def get_incident_draft(draft_id: str, user_session_id: str) -> IncidentDraft | None:
    with Session(engine) as session:
        row = session.get(IncidentDraft, draft_id)
        if row is None or row.user_session_id != user_session_id or row.deleted_at is not None:
            return None
        session.expunge(row)
        row.created_at = aware(row.created_at)
        row.expires_at = aware(row.expires_at)
        return row


def delete_incident_draft(draft_id: str, user_session_id: str) -> bool:
    """Physically drop content — deletion must be real, not a flag."""
    with Session(engine) as session:
        row = session.get(IncidentDraft, draft_id)
        if row is None or row.user_session_id != user_session_id or row.deleted_at is not None:
            return False
        session.execute(delete(IncidentDraft).where(IncidentDraft.id == draft_id))
        session.commit()
        return True


def record_source_snapshot(source_name: str, source_url: str, status: str, checksum: str) -> None:
    """Append a provenance row for a served source-status snapshot."""
    with Session(engine) as session:
        session.add(SourceRecord(
            id=str(uuid.uuid4()),
            source_name=source_name[:200],
            source_url=source_url[:500],
            status=status[:64],
            checksum=checksum,
        ))
        session.commit()


def list_source_records(limit: int = 100) -> list[SourceRecord]:
    with Session(engine) as session:
        rows = session.scalars(
            select(SourceRecord).order_by(SourceRecord.retrieved_at.desc()).limit(limit)
        ).all()
        out = []
        for r in rows:
            session.expunge(r)
            r.retrieved_at = aware(r.retrieved_at)
            out.append(r)
        return out
