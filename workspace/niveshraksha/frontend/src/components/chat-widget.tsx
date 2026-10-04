"use client";

// Floating Raksha Guide on every page: context-aware helper drawer so users
// never have to leave what they're doing to ask something. Uses the same
// agentic endpoint as /chat (citations + refusals apply) and tells the
// backend which page the user is on so answers can reference it.

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ExternalLink, Send, X } from "lucide-react";
import { ApiError, api, getUserSessionId } from "@/lib/api";
import { useLanguage } from "@/lib/i18n";
import { useSettings } from "@/lib/settings";
import { GuideAvatar, UserAvatar } from "@/components/avatars";

interface Turn {
  role: "user" | "guide";
  text: string;
  refused?: boolean;
  citations?: { document_id: string; source_name: string; source_url: string }[];
}

const PAGE_GUIDES: Record<string, { name: string; blurb: string; sample: string }> = {
  "/": {
    name: "SENTINEL-X portal",
    blurb: "This is the scanning hub. Paste any suspicious link, wallet address, email, phone number, or message into the search bar — the engine tells you what patterns it recognises.",
    sample: "What can I scan here?",
  },
  "/analyze": {
    name: "the analyzer",
    blurb: "This page checks messages, links, and screenshots for scam patterns. Everything is deterministic — each flag shows the exact text that triggered it.",
    sample: "How does the screenshot check work?",
  },
  "/verify": {
    name: "advisor verification",
    blurb: "Here you can check whether an advisor's SEBI registration appears in records. Remember: 'not found' is not proof of fraud — always confirm on sebi.gov.in yourself.",
    sample: "What does 'could not verify' mean?",
  },
  "/pause": {
    name: "the pause checklist",
    blurb: "This page gives you 30 seconds to slow down before money moves. Answer the three questions honestly — nothing is stored or judged.",
    sample: "Why is pausing important?",
  },
  "/learn": {
    name: "the education hub",
    blurb: "Seven short lessons about scam warning signs, OTP safety, and reporting — in 12 languages, with an offline fallback.",
    sample: "Which lesson should I start with?",
  },
  "/report": {
    name: "the Evidence Locker",
    blurb: "This is where you prepare incident drafts. Sensitive identifiers are redacted live, nothing is stored unless you tick consent, and everything auto-deletes in 72 hours.",
    sample: "Is my draft really deleted?",
  },
  "/about": {
    name: "the About page",
    blurb: "This explains how the engine decides, where sources come from, and the product's limits — worth reading before trusting any result.",
    sample: "How accurate is the detection?",
  },
  "/settings": {
    name: "Settings",
    blurb: "Personalise the palette, avatars, voice replies, and your private encrypted history. Everything stays on this device.",
    sample: "Where is my data stored?",
  },
};

export function ChatWidget() {
  const pathname = usePathname();
  const { language } = useLanguage();
  const [settings] = useSettings();
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const [messages, setMessages] = useState<Turn[]>([]);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const guide = PAGE_GUIDES[pathname] ?? {
    name: "this page",
    blurb: "Ask me anything about staying safe from investment scams.",
    sample: "What should I do if I already sent money?",
  };

  // Fresh conversation per page — the widget is a helper, not the archive
  // (the encrypted archive lives at /chat). Reset on page change is UI state
  // clearing, not a fetch.
  const [pageKey, setPageKey] = useState(pathname);
  if (pageKey !== pathname) {
    setPageKey(pathname);
    setMessages([]);
    setError(null);
  }

  useEffect(() => {
    if (open) scrollRef.current?.scrollTo({ top: 999999, behavior: "smooth" });
  }, [messages, typing, open]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const send = useCallback(
    async (text: string) => {
      const question = text.trim();
      if (!question || typing) return;
      setError(null);
      setMessages((prev) => [...prev, { role: "user", text: question }]);
      setInput("");
      setTyping(true);
      try {
        const reply = await api.chatMessage(
          {
            message: question,
            language,
            save_history: settings.saveChatHistory,
            page_context: pathname,
          },
          getUserSessionId(),
        );
        setMessages((prev) => [
          ...prev,
          { role: "guide", text: reply.reply, refused: reply.refused, citations: reply.citations },
        ]);
      } catch (e) {
        setError(e instanceof ApiError ? e.message : "The assistant is unreachable right now.");
      } finally {
        setTyping(false);
      }
    },
    [language, pathname, settings.saveChatHistory, typing],
  );

  // The full chat page already exists — don't double-render the widget there.
  if (pathname.startsWith("/chat")) return null;

  return (
    <>
      {/* Floating launcher */}
      {!open && (
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label={`Open the Raksha Guide helper for ${guide.name}`}
          className="fixed bottom-5 right-5 z-50 rounded-full shadow-xl transition-transform hover:scale-105 focus-visible:ring-4 focus-visible:ring-teal-500/40"
        >
          <GuideAvatar avatar={settings.guideAvatar} size={56} />
          <span className="absolute -top-1 -right-1 h-3.5 w-3.5 rounded-full bg-teal-500 border-2 border-white dark:border-slate-950" aria-hidden />
        </button>
      )}

      {/* Drawer */}
      {open && (
        <div
          role="dialog"
          aria-label={`Raksha Guide helper — ${guide.name}`}
          className="fixed bottom-5 right-5 z-50 w-[min(380px,calc(100vw-2.5rem))] rounded-2xl border border-teal-500/25 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md shadow-2xl overflow-hidden"
        >
          <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-200 dark:border-slate-800 bg-teal-50/60 dark:bg-slate-800/60">
            <GuideAvatar avatar={settings.guideAvatar} size={36} typing={typing} />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">Raksha Guide</p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">helping with {guide.name}</p>
            </div>
            <Link
              href="/chat"
              onClick={() => setOpen(false)}
              aria-label="Open the full chat page"
              className="text-slate-400 hover:text-teal-700 dark:hover:text-teal-400"
            >
              <ExternalLink className="h-4 w-4" aria-hidden />
            </Link>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close helper"
              className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
            >
              <X className="h-4 w-4" aria-hidden />
            </button>
          </div>

          <div ref={scrollRef} className="px-4 py-3 max-h-[46vh] overflow-y-auto space-y-3" aria-live="polite">
            {messages.length === 0 && !typing && (
              <div className="flex gap-2">
                <GuideAvatar avatar={settings.guideAvatar} size={28} />
                <div className="rounded-xl rounded-bl-sm bg-teal-50 dark:bg-slate-800/70 border border-teal-100 dark:border-slate-700 px-3 py-2 text-xs text-slate-700 dark:text-slate-300">
                  <p>{guide.blurb}</p>
                  <button
                    type="button"
                    onClick={() => send(guide.sample)}
                    className="mt-2 underline text-teal-700 dark:text-teal-400 hover:no-underline"
                  >
                    {guide.sample}
                  </button>
                </div>
              </div>
            )}

            {messages.map((m, i) =>
              m.role === "user" ? (
                <div key={i} className="flex justify-end items-end gap-2">
                  <p
                    className="max-w-[85%] rounded-xl rounded-br-sm px-3 py-2 text-xs text-white"
                    style={{ background: "var(--nr-accent, #0d9488)" }}
                  >
                    {m.text}
                  </p>
                  <UserAvatar avatar={settings.userAvatar} size={26} />
                </div>
              ) : (
                <div key={i} className="flex gap-2">
                  <GuideAvatar avatar={settings.guideAvatar} size={28} />
                  <div className="max-w-[85%] space-y-1">
                    <div
                      className={`rounded-xl rounded-bl-sm px-3 py-2 text-xs border ${
                        m.refused
                          ? "bg-amber-50 border-amber-200 dark:bg-amber-950/30 dark:border-amber-900 text-slate-800 dark:text-slate-200"
                          : "bg-slate-50 dark:bg-slate-800/70 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200"
                      }`}
                    >
                      {m.refused && (
                        <p className="font-semibold text-amber-800 dark:text-amber-500 text-[10px] uppercase tracking-wide mb-0.5">
                          Out of scope — but here&apos;s what I can do
                        </p>
                      )}
                      {m.text}
                    </div>
                    {m.citations && m.citations.length > 0 && (
                      <p className="text-[10px] text-slate-400">
                        Sources:{" "}
                        {m.citations.map((c, j) => (
                          <a key={j} href={c.source_url} target="_blank" rel="noopener noreferrer" className="text-teal-700 dark:text-teal-400 hover:underline mr-2">
                            {c.source_name}
                          </a>
                        ))}
                      </p>
                    )}
                  </div>
                </div>
              ),
            )}

            {typing && (
              <div className="flex gap-2">
                <GuideAvatar avatar={settings.guideAvatar} size={28} typing />
                <span className="text-[11px] text-slate-400 mt-2">thinking…</span>
              </div>
            )}
            {error && <p role="alert" className="text-[11px] text-red-600 dark:text-red-400">{error}</p>}
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              send(input);
            }}
            className="flex items-center gap-2 px-3 pb-3"
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              aria-label="Ask the Raksha Guide about this page"
              placeholder={`Ask about ${guide.name}…`}
              className="flex-1 min-h-[40px] px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-teal-500"
            />
            <button
              type="submit"
              disabled={!input.trim() || typing}
              aria-label="Send"
              className="p-2.5 rounded-lg text-white disabled:opacity-40"
              style={{ background: "var(--nr-accent, #0d9488)" }}
            >
              <Send className="h-3.5 w-3.5" aria-hidden />
            </button>
          </form>
          <p className="px-3 pb-2 text-[10px] text-slate-400">
            Cited answers only · never investment advice ·{" "}
            <Link href="/chat" onClick={() => setOpen(false)} className="underline">
              full chat
            </Link>
          </p>
        </div>
      )}
    </>
  );
}
