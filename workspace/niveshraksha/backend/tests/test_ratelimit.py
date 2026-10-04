"""Unit tests for the sliding-window rate limiter (no global state)."""
import pytest
from fastapi import HTTPException

from app.security.ratelimit import SlidingWindowLimiter


def test_allows_requests_under_limit():
    limiter = SlidingWindowLimiter(max_requests=3)
    limiter.check("ip-1")
    limiter.check("ip-1")
    limiter.check("ip-1")  # third request inside window is the last allowed


def test_blocks_over_limit_and_isolates_clients():
    limiter = SlidingWindowLimiter(max_requests=2)
    limiter.check("ip-1")
    limiter.check("ip-1")
    with pytest.raises(HTTPException) as exc:
        limiter.check("ip-1")
    assert exc.value.status_code == 429
    # A different client key is unaffected.
    limiter.check("ip-2")


def test_window_expiry_restores_capacity(monkeypatch):
    limiter = SlidingWindowLimiter(max_requests=1)
    limiter.check("ip-1")
    with pytest.raises(HTTPException):
        limiter.check("ip-1")
    # Simulate the window rolling over.
    monkeypatch.setattr("app.security.ratelimit.time.monotonic", lambda: 1e9)
    limiter.check("ip-1")
