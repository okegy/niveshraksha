"use client";

// Voice dictation for the analyzer using the browser's Web Speech API.
// No model is trained or shipped by us; recognition is handled by the
// browser engine (Chrome/Edge route audio to the vendor's speech service —
// the UI must disclose that). Unsupported browsers simply hide the button.

import { useCallback, useEffect, useRef, useState } from "react";
import { Mic, MicOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/lib/i18n";

type SpeechRecognitionLike = {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  start: () => void;
  stop: () => void;
  onresult: ((event: { resultIndex: number; results: ArrayLike<{ 0: { transcript: string }; isFinal: boolean }> }) => void) | null;
  onend: (() => void) | null;
  onerror: ((event: { error: string }) => void) | null;
};

type SpeechWindow = Window &
  typeof globalThis & {
    SpeechRecognition?: new () => SpeechRecognitionLike;
    webkitSpeechRecognition?: new () => SpeechRecognitionLike;
  };

const LOCALE_BY_LANGUAGE: Record<string, string> = {
  en: "en-IN",
  ta: "ta-IN",
  hi: "hi-IN",
  te: "te-IN",
  ml: "ml-IN",
  kn: "kn-IN",
};

export function VoiceDictation({
  onTranscript,
  targetId,
}: {
  onTranscript: (text: string) => void;
  targetId: string;
}) {
  const { language, t } = useLanguage();
  const [supported, setSupported] = useState(false);
  const [listening, setListening] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);

  useEffect(() => {
    const w = window as SpeechWindow;
    // One-time browser feature detection; can't be done during SSR render.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSupported(Boolean(w.SpeechRecognition || w.webkitSpeechRecognition));
    return () => {
      recognitionRef.current?.stop();
    };
  }, []);

  const toggle = useCallback(() => {
    setError(null);
    if (listening) {
      recognitionRef.current?.stop();
      setListening(false);
      return;
    }
    const w = window as SpeechWindow;
    const Ctor = w.SpeechRecognition || w.webkitSpeechRecognition;
    if (!Ctor) return;

    const recognition = new Ctor();
    recognition.lang = LOCALE_BY_LANGUAGE[language] ?? "en-IN";
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.onresult = (event) => {
      let text = "";
      for (let i = event.resultIndex; i < event.results.length; i += 1) {
        text += event.results[i][0].transcript;
      }
      if (text.trim()) onTranscript(text.trim());
    };
    recognition.onerror = (event) => {
      if (event.error === "not-allowed" || event.error === "service-not-allowed") {
        setError("Microphone permission was denied. You can type the message instead.");
      } else if (event.error === "no-speech") {
        setError("No speech was heard. Try again a bit closer to the microphone.");
      } else {
        setError("Voice input failed. Please type the message instead.");
      }
      setListening(false);
    };
    recognition.onend = () => setListening(false);

    recognitionRef.current = recognition;
    try {
      recognition.start();
      setListening(true);
      document.getElementById(targetId)?.focus();
    } catch {
      setError("Voice input could not start. Please type the message instead.");
      setListening(false);
    }
  }, [language, listening, onTranscript, targetId]);

  if (!supported) return null;

  return (
    <div className="flex flex-col gap-1">
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={toggle}
        aria-pressed={listening}
        aria-label={listening ? "Stop voice input" : "Speak the message instead of typing"}
        className="w-fit"
      >
        {listening ? (
          <MicOff className="mr-2 h-4 w-4 text-red-600" aria-hidden />
        ) : (
          <Mic className="mr-2 h-4 w-4 text-teal-600" aria-hidden />
        )}
        {listening ? "Stop voice input" : "Speak instead of typing"}
      </Button>
      <p className="text-xs text-slate-500 dark:text-slate-400">
        {listening ? "Listening… speak now. " : ""}
        Voice is handled by your browser&apos;s speech engine, not by NiveshRaksha — check your
        browser&apos;s speech privacy notice. {t("language_label")}: {LOCALE_BY_LANGUAGE[language] ?? "en-IN"}
      </p>
      {error && (
        <p role="alert" className="text-xs text-red-600 dark:text-red-400">
          {error}
        </p>
      )}
    </div>
  );
}
