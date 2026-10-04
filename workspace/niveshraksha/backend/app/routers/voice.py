"""Voice proxy — Sarvam STT/TTS with the key kept server-side only."""
from fastapi import APIRouter, HTTPException, Request, UploadFile
from fastapi.responses import Response
from pydantic import BaseModel, Field

from ..ai import voice as sarvam
from ..security.ratelimit import client_key, limiter

router = APIRouter()


class SpeakRequest(BaseModel):
    text: str = Field(min_length=1, max_length=1500)
    language: str = Field(
        default="en-IN",
        pattern="^(en-IN|hi-IN|ta-IN|te-IN|kn-IN|ml-IN|bn-IN|mr-IN|gu-IN|or-IN|pa-IN)$",
    )


@router.get("/status")
async def voice_status(http_request: Request):
    limiter.check(client_key(http_request))
    return sarvam.status()


@router.post("/transcribe")
async def transcribe(http_request: Request, file: UploadFile, language: str = "unknown"):
    """Browser-recorded audio → Sarvam STT → transcript. The audio is never
    stored; it lives only for the duration of the upstream call."""
    limiter.check(client_key(http_request))
    audio = await file.read(10 * 1024 * 1024 + 1)
    if len(audio) > 10 * 1024 * 1024:
        raise HTTPException(status_code=413, detail="Audio exceeds the 10 MB limit.")
    if len(audio) < 100:
        raise HTTPException(status_code=422, detail="Recording too short — please try again.")
    try:
        transcript = sarvam.speech_to_text(audio, language)
    except RuntimeError as e:
        raise HTTPException(status_code=503, detail=f"Voice transcription unavailable: {e}") from e
    return {"transcript": transcript}


@router.post("/speak")
async def speak(payload: SpeakRequest, http_request: Request):
    limiter.check(client_key(http_request))
    try:
        wav = sarvam.text_to_speech(payload.text, payload.language)
    except RuntimeError as e:
        raise HTTPException(status_code=503, detail=f"Voice synthesis unavailable: {e}") from e
    return Response(content=wav, media_type="audio/wav", headers={"Cache-Control": "no-store"})
