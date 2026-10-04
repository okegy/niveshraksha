import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from .routers import analyze, chat, education, languages, report, screenshot, sources, verify
from .security.logging_setup import configure_logging
from .storage import init_db

configure_logging()
logger = logging.getLogger("niveshraksha")


@asynccontextmanager
async def lifespan(_: FastAPI):
    init_db()
    logger.info("NiveshRaksha API started — safety analysis only, no investment advice.")
    yield


app = FastAPI(
    title="NiveshRaksha API",
    version="1.0.0",
    description=(
        "Investor safety API: rule-based red-flag analysis, advisor verification against "
        "clearly-labelled demo fixtures, and privacy-first incident drafts. "
        "This API never provides investment advice."
    ),
    lifespan=lifespan,
)

# CORS: the Next.js dev server and any deployed frontend origin.
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_methods=["GET", "POST", "DELETE"],
    allow_headers=["Content-Type"],
)

app.include_router(analyze.router, prefix="/api/v1/analyze", tags=["analyze"])
app.include_router(screenshot.router, prefix="/api/v1/analyze", tags=["analyze"])
app.include_router(verify.router, prefix="/api/v1/verify", tags=["verify"])
app.include_router(report.router, prefix="/api/v1/reports", tags=["reports"])
app.include_router(education.router, prefix="/api/v1/education", tags=["education"])
app.include_router(sources.router, prefix="/api/v1/sources", tags=["sources"])
app.include_router(chat.router, prefix="/api/v1/chat", tags=["chat"])
app.include_router(languages.router, prefix="/api/v1/languages", tags=["languages"])


@app.exception_handler(Exception)
async def safe_error_handler(request: Request, exc: Exception):
    """Never leak internals to clients; log the scrubbed error instead."""
    logger.error("Unhandled error on %s: %s", request.url.path, str(exc))
    return JSONResponse(
        status_code=500,
        content={"detail": "Something went wrong while processing your request. Please try again."},
    )


@app.get("/health")
def health_check():
    return {"status": "ok"}


@app.get("/ready")
def ready_check():
    return {"status": "ready", "service": "niveshraksha", "mode": "demo-fixtures"}
