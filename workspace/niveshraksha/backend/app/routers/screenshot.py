"""Screenshot analysis: strict upload validation + optional OCR scoring.

Security & privacy posture:
- Images are validated by magic bytes (never trusted filenames/MIME headers),
  size-capped, and NEVER written to disk or persisted.
- When the OCR engine is available (RapidOCR, local onnxruntime — no cloud),
  the extracted text is run through the deterministic scam rules and returned
  with the result. The image itself is discarded after processing.
- OCR availability is reported honestly; without it the endpoint still
  validates and guides.
"""
from typing import Any

from fastapi import APIRouter, HTTPException, Request, UploadFile
from pydantic import BaseModel

from ..analyzers.scam_rules import ScamAnalyzer
from ..security.ratelimit import client_key, limiter

router = APIRouter()

MAX_BYTES = 5 * 1024 * 1024
ALLOWED_MAGICS = {
    "image/png": b"\x89PNG\r\n\x1a\n",
    "image/jpeg": b"\xff\xd8\xff",
}
ALLOWED_TYPES = ", ".join(sorted(ALLOWED_MAGICS))

_analyzer = ScamAnalyzer()
_ocr = None
_ocr_checked = False


def _get_ocr():
    """Lazy singletons; report honestly if the engine is missing."""
    global _ocr, _ocr_checked
    if not _ocr_checked:
        _ocr_checked = True
        try:
            from rapidocr_onnxruntime import RapidOCR

            _ocr = RapidOCR()
        except Exception:
            _ocr = None
    return _ocr


def _extract_text(image_bytes: bytes) -> str | None:
    ocr = _get_ocr()
    if ocr is None:
        return None
    try:
        result, _ = ocr(image_bytes)
        if not result:
            return ""
        return " ".join(line[1] for line in result)
    except Exception:
        return None


class ScreenshotResponse(BaseModel):
    accepted: bool
    content_type: str
    size_bytes: int
    ocr_available: bool
    extracted_text: str | None = None
    risk_level: str | None = None
    red_flags: list[dict[str, Any]] = []
    summary: str
    safe_next_steps: list[str]
    limitations: list[str]


def _detect_type(head: bytes) -> str | None:
    for ctype, magic in ALLOWED_MAGICS.items():
        if head.startswith(magic):
            return ctype
    return None


@router.post("/screenshot", response_model=ScreenshotResponse)
async def analyze_screenshot(http_request: Request, file: UploadFile):
    """Tip-Group Risk Profiler for screenshots: validate → OCR (local) →
    deterministic red-flag rules → explainable result. Nothing is stored."""
    limiter.check(client_key(http_request))
    image = await file.read(MAX_BYTES + 1)
    if len(image) > MAX_BYTES:
        raise HTTPException(
            status_code=413, detail="Image exceeds the 5 MB limit. Please send a smaller screenshot."
        )
    if not image:
        raise HTTPException(status_code=422, detail="Empty upload.")
    ctype = _detect_type(image)
    if ctype is None:
        raise HTTPException(status_code=415, detail=f"Only {ALLOWED_TYPES} screenshots are accepted.")

    extracted = _extract_text(image)
    # `image` goes out of scope here — never written anywhere.

    if extracted is None:
        return ScreenshotResponse(
            accepted=True,
            content_type=ctype,
            size_bytes=len(image),
            ocr_available=False,
            summary=(
                "Your screenshot passed safety validation and was not stored. "
                "The OCR engine is not installed in this environment, so the text inside the "
                "image could not be read. You can paste the text into the Message tab instead."
            ),
            safe_next_steps=[
                "Paste the text from the screenshot into the Message tab — that check is fully available.",
                "Do not send money or share OTPs while the image is pending review.",
                "Treat profit or certificate images as unverified proof; such images are easily faked.",
            ],
            limitations=["OCR engine unavailable in this environment.", "Images are never stored."],
        )

    # OCR succeeded: score the extracted text with the deterministic rules.

    flags = _analyzer.analyze_text(extracted) if extracted.strip() else []
    tier = _analyzer.risk_tier(flags)
    clean_text = extracted.strip()
    summary = (
        f"OCR extracted {len(clean_text)} characters from the screenshot (read locally, nothing stored) "
        f"and the deterministic engine scored it: '{tier.value}'."
        if clean_text
        else "OCR ran but no readable text was found in the image. Nothing was stored."
    )
    return ScreenshotResponse(
        accepted=True,
        content_type=ctype,
        size_bytes=len(image),
        ocr_available=True,
        extracted_text=clean_text[:2000] or None,
        risk_level=tier.value,
        red_flags=[f.model_dump() for f in flags],
        summary=summary,
        safe_next_steps=(
            [
                "Do not send money or share OTPs/PINs mentioned or requested in the screenshot.",
                "Verify any registration or approval claims on the official SEBI website.",
                "For a deeper check, paste the text into the Message tab as well.",
            ]
            if flags
            else [
                "No known red-flag pattern matched the extracted text — that is not proof of safety.",
                "Cross-check any claims on official sources before acting.",
            ]
        ),
        limitations=[
            "OCR is imperfect: lookalike characters (I/l, 0/O) can distort words and may hide patterns.",
            "The image was processed in memory and never stored.",
        ],
    )
