"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Ban, ExternalLink, Loader2, Mic, MicOff, Send, Volume2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { ApiError, api, getUserSessionId } from "@/lib/api";
import { useLanguage } from "@/lib/i18n";
import { useSettings } from "@/lib/settings";
import { GuideAvatar, UserAvatar } from "@/components/avatars";

interface Citation {
  document_id: string;
  source_name: string;
  source_url: string;
  retrieved_at: string;
  freshness: string;
  title: string;
}

interface Turn {
  role: "user" | "guide";
  text: string;
  refused?: boolean;
  citations?: Citation[];
  uncertainty?: string;
  latency_ms?: number;
  agent?: Record<string, unknown>;
}

const LOCALE_BY_LANGUAGE: Record<string, string> = {
  en: "en-IN", ta: "ta-IN", hi: "hi-IN", te: "te-IN", ml: "ml-IN", kn: "kn-IN",
  bn: "bn-IN", mr: "mr-IN", gu: "gu-IN", or: "or-IN", pa: "pa-IN", as: "as-IN",
};

const SUGGESTIONS = [
  "How do I verify an investment advisor?",
  "What should I do after sending money to a scammer?",
  "What is an OTP and who may ask for it?",
  "Is this message a scam? Guaranteed 40% monthly return, only 2 slots left, send PAN and UPI screenshot to unlock withdrawal!",
  "Which stock gives the highest return?",
];

export default function ChatPage() {
  const { language } = useLanguage();
  const [settings] = useSettings();
  const [messages, setMessages] = useState<Turn[]>([]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [recording, setRecording] = useState(false);
  const [voiceNote, setVoiceNote] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const mediaRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const lastReplyRef = useRef<string>("");

  // Continue the private encrypted history when the user opted in.
  useEffect(() => {
    if (!settings.saveChatHistory) return;
    api
      .getChatHistory(getUserSessionId())
      .then((d) => {
        setMessages(
          d.messages.map((m) => ({
            role: m.role === "user" ? "user" : "guide",
            text: m.content,
            refused: Boolean((m.meta as { refused?: boolean })?.refused),
            citations: (m.meta as { citations?: Citation[] })?.citations,
          })),
        );
      })
      .catch(() => setVoiceNote("Could not load your saved history — starting a fresh conversation."));
  }, [settings.saveChatHistory]);

  const speak = async (text: string) => {
    try {
      const blob = await api.speakText(text, LOCALE_BY_LANGUAGE[language] ?? "en-IN");
      const audio = new Audio(URL.createObjectURL(blob));
      audio.play();
    } catch {
      setVoiceNote("Voice playback unavailable right now.");
    }
  };

  const send = async (text: string) => {
    const question = text.trim();
    if (!question || typing) return;
    setError(null);
    setMessages((prev) => [...prev, { role: "user", text: question }]);
    setInput("");
    setTyping(true);
    try {
      const reply = await api.chatMessage(
        { message: question, language, save_history: settings.saveChatHistory },
        getUserSessionId(),
      );
      setMessages((prev) => [
        ...prev,
        {
          role: "guide",
          text: reply.reply,
          refused: reply.refused,
          citations: reply.citations,
          uncertainty: reply.uncertainty,
          latency_ms: reply.latency_ms,
          agent: reply.agent,
        },
      ]);
      lastReplyRef.current = reply.reply;
      if (settings.voiceReplies) speak(reply.reply);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "The assistant is unreachable right now. Please try again.");
    } finally {
      setTyping(false);
      requestAnimationFrame(() => scrollRef.current?.scrollTo({ top: 999999, behavior: "smooth" }));
    }
  };

  const toggleMic = async () => {
    if (recording) {
      mediaRef.current?.stop();
      return;
    }
    setVoiceNote(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      chunksRef.current = [];
      recorder.ondataavailable = (e) => chunksRef.current.push(e.data);
      recorder.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop());
        setRecording(false);
        setTyping(true);
        try {
          const blob = new Blob(chunksRef.current, { type: "audio/wav" });
          const transcript = await api.transcribeAudio(blob, LOCALE_BY_LANGUAGE[language] ?? "en-IN");
          if (transcript) {
            await send(transcript);
          } else {
            setVoiceNote("No speech detected in the recording.");
            setTyping(false);
          }
        } catch (e) {
          setVoiceNote(e instanceof ApiError ? e.message : "Transcription failed.");
          setTyping(false);
        }
      };
      mediaRef.current = recorder;
      recorder.start();
      setRecording(true);
    } catch {
      setVoiceNote("Microphone permission denied or unavailable. You can type instead.");
    }
  };

  return (
    <div className="min-h-[80vh] p-4 sm:p-6">
      <div className="max-w-3xl mx-auto">
        <div className="mb-6 flex items-center gap-4">
          <GuideAvatar avatar={settings.guideAvatar} size={44} typing={typing} />
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Raksha Guide</h1>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              A cited safety assistant with agentic tools. It explains warnings, verifies advisors, and points to official channels — never investment advice.
            </p>
          </div>
        </div>

        <Card className="glass-card">
          <CardContent className="p-4 sm:p-6">
            <div ref={scrollRef} className="max-h-[55vh] overflow-y-auto space-y-4 mb-4" aria-live="polite">
              {messages.length === 0 && !typing && (
                <div className="text-center py-8">
                  <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
                    Try one of these — the last two show the agent&apos;s tools and its refusal behaviour:
                  </p>
                  <div className="flex flex-wrap gap-2 justify-center">
                    {SUGGESTIONS.map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => send(s)}
                        className="text-xs px-3 py-2 rounded-full border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {messages.map((m, i) =>
                m.role === "user" ? (
                  <div key={i} className="flex justify-end items-end gap-2">
                    <p className="max-w-[85%] rounded-2xl rounded-br-sm px-4 py-2 text-sm text-white" style={{ background: "var(--nr-accent, #0d9488)" }}>
                      {m.text}
                    </p>
                    <UserAvatar avatar={settings.userAvatar} size={32} />
                  </div>
                ) : (
                  <div key={i} className="flex gap-3">
                    <GuideAvatar avatar={settings.guideAvatar} size={36} />
                    <div className="max-w-[85%] space-y-2">
                      <div
                        className={`rounded-2xl rounded-bl-sm px-4 py-3 text-sm border ${
                          m.refused
                            ? "bg-amber-50 border-amber-200 dark:bg-amber-950/30 dark:border-amber-900 text-slate-800 dark:text-slate-200"
                            : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200"
                        }`}
                      >
                        {m.refused && (
                          <p className="flex items-center gap-1 font-semibold text-amber-800 dark:text-amber-500 mb-1 text-xs uppercase tracking-wide">
                            <Ban className="h-3 w-3" aria-hidden /> Out of scope — redirected
                          </p>
                        )}
                        {m.text}
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => speak(m.text)}
                          aria-label="Read this reply aloud"
                          className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-teal-700 dark:hover:text-teal-400"
                        >
                          <Volume2 className="h-3.5 w-3.5" aria-hidden /> Listen
                        </button>
                        {(m.agent as { tools?: string[] } | undefined)?.tools && (m.agent as { tools: string[] }).tools.length > 0 && (
                          <span className="text-[11px] text-slate-400">
                            🔧 used: {(m.agent as { tools: string[] }).tools.join(", ")}
                          </span>
                        )}
                      </div>
                      {m.citations && m.citations.length > 0 && (
                        <div className="text-xs space-y-1 pl-1">
                          <p className="font-medium text-slate-600 dark:text-slate-300">Sources:</p>
                          {m.citations.map((c) => (
                            <a
                              key={c.document_id}
                              href={c.source_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-1 text-teal-700 dark:text-teal-400 hover:underline"
                            >
                              {c.source_name}
                              <ExternalLink className="h-3 w-3" aria-hidden />
                              <span className="text-slate-400">· {c.freshness}</span>
                            </a>
                          ))}
                        </div>
                      )}
                      {m.uncertainty && (
                        <p className="text-[11px] text-slate-400">{m.uncertainty}</p>
                      )}
                    </div>
                  </div>
                ),
              )}

              {typing && (
                <div className="flex gap-3">
                  <GuideAvatar avatar={settings.guideAvatar} size={36} typing />
                  <Loader2 className="h-5 w-5 animate-spin text-teal-600 mt-2" aria-label="Raksha Guide is composing a reply" />
                </div>
              )}

              {voiceNote && <p className="text-xs text-amber-700 dark:text-amber-500">{voiceNote}</p>}

              {error && (
                <p role="alert" className="text-sm text-red-600 dark:text-red-400">
                  {error}
                </p>
              )}
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                send(input);
              }}
              className="flex items-end gap-2"
            >
              <Textarea
                aria-label="Ask the Raksha Guide"
                placeholder="Ask about scam signs, verification, OTP safety, evidence, or complaints…"
                className="min-h-[48px] max-h-32 resize-none"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    send(input);
                  }
                }}
              />
              <Button
                type="button"
                onClick={toggleMic}
                aria-pressed={recording}
                aria-label={recording ? "Stop recording and transcribe" : "Record a voice question"}
                className="min-h-[48px] px-3 border border-slate-200 dark:border-slate-700"
                variant="outline"
              >
                {recording ? <MicOff className="h-4 w-4 text-red-600" aria-hidden /> : <Mic className="h-4 w-4 text-teal-600" aria-hidden />}
              </Button>
              <Button
                type="submit"
                disabled={!input.trim() || typing}
                className="min-h-[48px] px-4 text-white"
                style={{ background: "var(--nr-accent, #0d9488)" }}
                aria-label="Send question"
              >
                <Send className="h-4 w-4" aria-hidden />
              </Button>
            </form>
            {recording && (
              <p className="text-xs text-red-600 dark:text-red-400 mt-2" role="status">
                Recording… speak now. Click the mic again to stop and transcribe.
              </p>
            )}
            <p className="text-[11px] text-slate-400 mt-2">
              {settings.saveChatHistory
                ? "🔒 Private history is ON: turns are encrypted at rest with your browser's session key and auto-delete after 72 hours."
                : "Private history is off — nothing from this chat is stored."}{" "}
              Answers come only from cited sources; the agent runs deterministic tools and never
              recommends investments. See <Link href="/about" className="underline">About</Link>.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
