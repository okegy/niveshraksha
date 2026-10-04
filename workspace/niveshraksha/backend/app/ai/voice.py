"""Sarvam AI voice services (STT: Saarika, TTS: Bulbul) — server-side proxy.

The API key lives only in the backend environment; the frontend talks to our
own endpoints so the key is never exposed. Failures degrade gracefully: voice
features show an honest "unavailable" state and text flows keep working.
"""
from __future__ import annotations

import base64
import json
import os
import urllib.error
import urllib.request

SARVAM_BASE = "https://api.sarvam.ai"
TTS_MODEL = "bulbul:v3"
STT_MODEL = "saarika:v2.5"


def _key() -> str | None:
    return os.environ.get("SARVAM_API_KEY") or None


def status() -> dict:
    key = _key()
    if not key:
        return {"service": "sarvam_voice", "available": False, "reason": "SARVAM_API_KEY not configured"}
    # A tiny TTS probe validates the key without burning much quota.
    ok, reason = _tts_probe(key)
    return {"service": "sarvam_voice", "available": ok, "reason": reason, "tts_model": TTS_MODEL, "stt_model": STT_MODEL}


def _tts_probe(key: str) -> tuple[bool, str]:
    try:
        audio = text_to_speech("ok", "en-IN", key_override=key)
        return (audio is not None and len(audio) > 100), "ok" if audio else "empty audio"
    except Exception as e:
        return False, str(e)[:200]


def text_to_speech(text: str, language: str = "en-IN", key_override: str | None = None) -> bytes | None:
    key = key_override or _key()
    if not key:
        raise RuntimeError("SARVAM_API_KEY not configured")
    req = urllib.request.Request(
        f"{SARVAM_BASE}/text-to-speech",
        data=json.dumps({
            "inputs": [text[:1500]],
            "target_language_code": language,
            "speaker": "priya",  # bulbul:v3 speaker set (anushka is v2-only)
            "model": TTS_MODEL,
        }).encode(),
        headers={"api-subscription-key": key, "Content-Type": "application/json"},
        method="POST",
    )
    try:
        with urllib.request.urlopen(req, timeout=60) as r:
            data = json.loads(r.read().decode())
            audios = data.get("audios") or []
            if not audios:
                raise RuntimeError("Sarvam returned no audio")
            return base64.b64decode(audios[0])
    except urllib.error.HTTPError as e:
        raise RuntimeError(f"Sarvam TTS HTTP {e.code}: {e.read().decode()[:200]}") from e


def speech_to_text(wav_bytes: bytes, language_code: str = "unknown") -> str:
    key = _key()
    if not key:
        raise RuntimeError("SARVAM_API_KEY not configured")
    boundary = "----nrvoiceboundary"
    lang = "unknown" if language_code not in ("en-IN", "hi-IN", "ta-IN", "te-IN", "kn-IN", "ml-IN", "bn-IN", "mr-IN", "gu-IN", "or-IN", "pa-IN") else language_code
    parts = [
        f'--{boundary}\r\nContent-Disposition: form-data; name="model"\r\n\r\n{STT_MODEL}\r\n'.encode(),
        f'--{boundary}\r\nContent-Disposition: form-data; name="language_code"\r\n\r\n{lang}\r\n'.encode(),
        f'--{boundary}\r\nContent-Disposition: form-data; name="file"; filename="audio.wav"\r\n'
        f"Content-Type: audio/wav\r\n\r\n".encode() + wav_bytes + b"\r\n",
        f"--{boundary}--\r\n".encode(),
    ]
    body = b"".join(parts)
    req = urllib.request.Request(
        f"{SARVAM_BASE}/speech-to-text",
        data=body,
        headers={"api-subscription-key": key, "Content-Type": f"multipart/form-data; boundary={boundary}"},
        method="POST",
    )
    try:
        with urllib.request.urlopen(req, timeout=90) as r:
            data = json.loads(r.read().decode())
            return data.get("transcript", "").strip()
    except urllib.error.HTTPError as e:
        raise RuntimeError(f"Sarvam STT HTTP {e.code}: {e.read().decode()[:200]}") from e
