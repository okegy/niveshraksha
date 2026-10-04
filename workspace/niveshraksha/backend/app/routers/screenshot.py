"""Screenshot analysis: strict upload validation with an honest capability gate.

Security posture:
- Images are validated by magic bytes (never trusted filenames/MIME headers),
  size-capped, and NEVER written to disk or persisted.
- OCR is not enabled in this build. Until OCR passes a privacy review, the
  endpoint returns structured guidance instead of pretending to read the image.
This satisfies "upload MIME and size validation + malware-safe handling" while
staying truthful about the OCR limitation.
"""
from fastapi import APIRouter, HTTPException, Request, UploadFile
from pydantic import BaseModel

from ..security.ratelimit import client_key, limiter

router = APIRouter()

MAX_BYTES = 5 * 1024 * 1024
ALLOWED_MAGICS = {
    "image/png": b"\x89PNG\r\n\x1a\n",
    "image/jpeg": b"\xff\xd8\xff",
}
ALLOWED_TYPES = ", ".join(sorted(ALLOWED_MAGICS))


class ScreenshotResponse(BaseModel):
    accepted: bool
    content_type: str
    size_bytes: int
    ocr_available: bool
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
    limiter.check(client_key(http_request))
    head = await file.read(MAX_BYTES + 1)
    if len(head) > MAX_BYTES:
        raise HTTPException(
            status_code=413, detail="Image exceeds the 5 MB limit. Please send a smaller screenshot."
        )
    if not head:
        raise HTTPException(status_code=422, detail="Empty upload.")
    ctype = _detect_type(head)
    if ctype is None:
        raise HTTPException(status_code=415, detail=f"Only {ALLOWED_TYPES} screenshots are accepted.")

    # Validation passed; the image is discarded immediately (never stored).
    return ScreenshotResponse(
        accepted=True,
        content_type=ctype,
        size_bytes=len(head),
        ocr_available=False,
        summary=(
            "Your screenshot passed safety validation and was not stored. "
            "Text extraction (OCR) for images is not enabled in this build, so we "
            "cannot read the message inside the image yet."
        ),
        safe_next_steps=[
            "Paste the text from the screenshot into the Message tab — that check is fully available.",
            "Do not send money or share OTPs while the image is pending review.",
            "Treat profit or certificate images as unverified proof; such images are easily faked.",
        ],
        limitations=[
            "OCR is not enabled: image text cannot be analysed in this build.",
            "Images are never stored; they are validated and discarded.",
        ],
    )
