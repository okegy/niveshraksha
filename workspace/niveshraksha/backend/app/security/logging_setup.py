"""Structured logging with PII scrubbing.

Every log record passes through a filter that redacts identifiers and
secret-shaped values before output, so message content that reaches a log
line (e.g. via an exception) cannot leak PII.
"""
import json
import logging
import sys
from datetime import UTC, datetime

from .redaction import scrub_for_logs


class RedactingFilter(logging.Filter):
    def filter(self, record: logging.LogRecord) -> bool:
        # Format first with the original args (so %-types stay valid), then
        # scrub the finished string — filters that rewrite record.args corrupt
        # %d/%s interpolation and crash log emission.
        try:
            message = record.getMessage()
        except Exception:
            message = str(record.msg)
        record.msg = scrub_for_logs(message)
        record.args = None
        return True


class JsonFormatter(logging.Formatter):
    def format(self, record: logging.LogRecord) -> str:
        payload = {
            "ts": datetime.now(UTC).isoformat(),
            "level": record.levelname,
            "logger": record.name,
            "event": record.getMessage(),
        }
        if record.exc_info:
            payload["error"] = str(record.exc_info[1])
        return json.dumps(payload, ensure_ascii=False)


def configure_logging() -> None:
    handler = logging.StreamHandler(sys.stdout)
    handler.setFormatter(JsonFormatter())
    handler.addFilter(RedactingFilter())
    root = logging.getLogger()
    root.handlers = [handler]
    root.setLevel(logging.INFO)
    # Quiet noisy third-party loggers.
    for name in ("uvicorn.access",):
        logging.getLogger(name).handlers = [handler]
