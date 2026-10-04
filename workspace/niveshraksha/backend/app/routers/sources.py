import hashlib
import json

from fastapi import APIRouter, Request

from ..security.ratelimit import client_key, limiter
from ..sources import registry
from ..storage import list_source_records, record_source_snapshot

router = APIRouter()


@router.get("/status")
async def source_status(http_request: Request):
    """Transparency endpoint: what sources exist, their mode, and freshness.

    Every served snapshot is checksummed and appended to source_records, so
    the provenance shown on /about is auditable rather than claimed.
    """
    limiter.check(client_key(http_request))
    sources = registry.all_source_statuses()
    checksum = hashlib.sha256(
        json.dumps(sources, sort_keys=True, default=str).encode("utf-8")
    ).hexdigest()[:64]
    for s in sources:
        record_source_snapshot(
            source_name=s["source_name"], source_url=s["source_url"],
            status=s["status"], checksum=checksum,
        )
    return {
        "sources": sources,
        "snapshot_checksum": checksum,
        "policy": (
            "Demo mode uses clearly-labelled synthetic fixtures. No unofficial dataset is presented "
            "as regulator data, and live regulator queries are only performed against documented, "
            "approved official endpoints."
        ),
    }


@router.get("/records")
async def source_records(http_request: Request, limit: int = 20):
    """Audit trail of served source snapshots (most recent first)."""
    limiter.check(client_key(http_request))
    rows = list_source_records(limit=min(max(limit, 1), 100))
    return {
        "records": [
            {
                "source_name": r.source_name,
                "source_url": r.source_url,
                "retrieved_at": r.retrieved_at,
                "status": r.status,
                "checksum": r.checksum,
            }
            for r in rows
        ]
    }
