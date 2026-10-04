"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { ExternalLink, Loader2, Send, ShieldCheck, Ban } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { ApiError, api } from "@/lib/api";
import { useLanguage } from "@/lib/i18n";

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
}

function ChatAvatar({ typing }: { typing: boolean }) {
  return (
    <div
      aria-hidden
      className={`shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-teal-500/90 to-cyan-600/90 flex items-center justify-center shadow-md ${
        typing ? "animate-pulse" : ""
      }`}
    >
      <ShieldCheck className="h-6 w-6 text-white" />
    </div>
  );
}

const SUGGESTIONS = [
  "How do I verify an investment advisor?",
  "What should I do after sending money to a scammer?",
  "What is an OTP and who may ask for it?",
  "How do I preserve evidence of a scam?",
  "Which stock gives the highest return?",
];

export default function ChatPage() {
  const { language } = useLanguage();
  const [messages, setMessages] = useState<Turn[]>([]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const send = async (text: string) => {
    const question = text.trim();
    if (!question || typing) return;
    setError(null);
    setMessages((prev) => [...prev, { role: "user", text: question }]);
    setInput("");
    setTyping(true);
    try {
      const reply = await api.chatMessage({ message: question, language });
      setMessages((prev) => [
        ...prev,
        {
          role: "guide",
          text: reply.reply,
          refused: reply.refused,
          citations: reply.citations,
          uncertainty: reply.uncertainty,
          latency_ms: reply.latency_ms,
        },
      ]);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "The assistant is unreachable right now. Please try again.");
    } finally {
      setTyping(false);
      requestAnimationFrame(() => scrollRef.current?.scrollTo({ top: 999999, behavior: "smooth" }));
    }
  };

  return (
    <div className="min-h-[80vh] p-4 sm:p-6">
      <div className="max-w-3xl mx-auto">
        <div className="mb-6 flex items-center gap-4">
          <ChatAvatar typing={typing} />
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Raksha Guide</h1>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              A cited safety assistant. It explains warnings, verification, and official channels — never investment advice.
            </p>
          </div>
        </div>

        <Card className="glass-card">
          <CardContent className="p-4 sm:p-6">
            <div ref={scrollRef} className="max-h-[55vh] overflow-y-auto space-y-4 mb-4" aria-live="polite">
              {messages.length === 0 && !typing && (
                <div className="text-center py-8">
                  <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
                    Try one of these — including one the Guide must refuse:
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
                  <div key={i} className="flex justify-end">
                    <p className="max-w-[85%] bg-teal-600 text-white rounded-2xl rounded-br-sm px-4 py-2 text-sm">
                      {m.text}
                    </p>
                  </div>
                ) : (
                  <div key={i} className="flex gap-3">
                    <ChatAvatar typing={false} />
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
                  <ChatAvatar typing />
                  <Loader2 className="h-5 w-5 animate-spin text-teal-600 mt-2" aria-label="Raksha Guide is composing a reply" />
                </div>
              )}

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
                type="submit"
                disabled={!input.trim() || typing}
                className="bg-teal-600 hover:bg-teal-700 text-white min-h-[48px] px-4"
                aria-label="Send question"
              >
                <Send className="h-4 w-4" aria-hidden />
              </Button>
            </form>
            <p className="text-[11px] text-slate-400 mt-2">
              Answers come only from curated, cited sources. The Guide never recommends investments, predicts
              prices, or declares anyone genuine. See <Link href="/about" className="underline">About</Link> for the
              source policy.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
