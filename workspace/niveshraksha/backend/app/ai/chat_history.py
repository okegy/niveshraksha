"""Encrypted chat-history helpers.

Key derivation: Fernet key = PBKDF2-HMAC-SHA256(session_token, server_secret,
200k iters). The session token never touches the database; rows store only a
non-reversible key_id prefix for lookup. Losing the browser token = losing
access to the history (by design — the user holds the only key).
"""
import base64
import hashlib
import json
import os
import uuid
from datetime import timedelta
from typing import Any

from cryptography.fernet import Fernet, InvalidToken
from sqlalchemy.orm import Session

from ..storage import ChatMessage, aware, engine, purge_expired, utcnow

_SECRET = os.environ.get("CHAT_HISTORY_SERVER_SECRET", "nr-demo-secret")
_ITER = 200_000


def _fernet(session_token: str) -> Fernet:
    digest = hashlib.pbkdf2_hmac(
        "sha256", session_token.encode(), _SECRET.encode(), _ITER
    )
    return Fernet(base64.urlsafe_b64encode(digest))


def key_id(session_token: str) -> str:
    return hashlib.sha256(f"{_SECRET}:{session_token}".encode()).hexdigest()[:32]


def save_turn(session_token: str, role: str, content: str, meta: dict[str, Any], language: str) -> str:
    purge_expired()
    f = _fernet(session_token)
    msg_id = str(uuid.uuid4())
    with Session(engine) as db:
        db.add(ChatMessage(
            id=msg_id,
            user_key_id=key_id(session_token),
            role=role[:12],
            encrypted_content=f.encrypt(content[:8000].encode()).decode(),
            encrypted_meta=f.encrypt(json.dumps(meta, default=str)[:4000].encode()).decode(),
            language=language[:8],
            expires_at=utcnow() + timedelta(hours=72),
        ))
        db.commit()
    return msg_id


def load_history(session_token: str, limit: int = 50) -> list[dict[str, Any]]:
    purge_expired()
    f = _fernet(session_token)
    from sqlalchemy import select
    with Session(engine) as db:
        rows = db.scalars(
            select(ChatMessage)
            .where(ChatMessage.user_key_id == key_id(session_token))
            .order_by(ChatMessage.created_at.desc())
            .limit(limit)
        ).all()
        out: list[dict[str, Any]] = []
        for r in reversed(rows):
            try:
                content = f.decrypt(r.encrypted_content.encode()).decode()
                meta = json.loads(f.decrypt(r.encrypted_meta.encode()).decode())
            except InvalidToken:
                continue  # wrong token — skip silently, history stays private
            out.append({
                "id": r.id, "role": r.role, "content": content, "meta": meta,
                "language": r.language, "created_at": aware(r.created_at).isoformat() if r.created_at else None,
            })
        return out


def delete_history(session_token: str) -> int:
    from sqlalchemy import delete
    with Session(engine) as db:
        result = db.execute(delete(ChatMessage).where(ChatMessage.user_key_id == key_id(session_token)))
        db.commit()
        return result.rowcount or 0
