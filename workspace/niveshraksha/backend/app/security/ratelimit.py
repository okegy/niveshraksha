"""Abuse prevention: a minimal in-memory sliding-window rate limiter.

Sufficient for a single-process hackathon demo. For multi-worker deployments
this must move to a shared store (e.g. Redis) — documented in SECURITY.md.
"""
import threading
import time
from collections import defaultdict, deque

from fastapi import HTTPException, Request

WINDOW_SECONDS = 60
MAX_REQUESTS = 30


class SlidingWindowLimiter:
    def __init__(self, max_requests: int = MAX_REQUESTS, window: int = WINDOW_SECONDS):
        self.max_requests = max_requests
        self.window = window
        self._hits: dict[str, deque] = defaultdict(deque)
        self._lock = threading.Lock()

    def check(self, key: str) -> None:
        now = time.monotonic()
        with self._lock:
            q = self._hits[key]
            while q and now - q[0] > self.window:
                q.popleft()
            if len(q) >= self.max_requests:
                raise HTTPException(
                    status_code=429, detail="Too many requests. Please wait a minute and try again."
                )
            q.append(now)


limiter = SlidingWindowLimiter()


def client_key(request: Request) -> str:
    # Behind a trusted proxy you would use X-Forwarded-For with care; for the
    # local demo the direct client host is the right key.
    return request.client.host if request.client else "anonymous"
