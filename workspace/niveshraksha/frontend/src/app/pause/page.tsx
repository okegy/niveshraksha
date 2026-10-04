"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Hand, AlertCircle, CheckCircle2 } from "lucide-react";
import { GuideAvatar } from "@/components/avatars";

const QUESTIONS = [
  {
    key: "pressure" as const,
    question: "Am I feeling rushed?",
    detail:
      "Scammers create false urgency (\"limited time offer\", \"last 2 slots\"). Legitimate investments don't disappear in an hour.",
    reactions: [
      "That rushed feeling is the scam working exactly as designed. Genuine investments will still be there tomorrow — that's what makes them genuine.",
      "They invented that deadline, not the market. Nothing legitimate disappears in an hour.",
    ],
  },
  {
    key: "verified" as const,
    question: "Have I verified the source independently?",
    detail:
      "Never trust an ID card sent on WhatsApp. Did you check the SEBI website yourself, by typing its address — not by clicking a link they sent?",
    reactions: [
      "Typing the address yourself beats any link or screenshot they send — that one habit stops most advisor scams.",
      "A real registration survives a direct search on sebi.gov.in. A fake one survives only in screenshots.",
    ],
  },
  {
    key: "personalInfo" as const,
    question: "Are they asking for credentials?",
    detail:
      "No genuine advisor or broker will ask for your OTP, UPI PIN, or to install remote-access apps (like AnyDesk). Any such request is a stop sign.",
    reactions: [
      "Right — no bank, broker, or regulator will ever ask for an OTP or PIN. Anyone who does is telling you exactly who they are.",
      "Remote-access apps are how they empty accounts while you watch. By ticking this, you just closed that door.",
    ],
  },
];

// Deterministic rotation so reactions feel varied but never reshuffle
// mid-session.
const pick = (arr: string[], seed: number) => arr[seed % arr.length];

export default function PausePage() {
  const [checkedItems, setCheckedItems] = useState({ pressure: false, verified: false, personalInfo: false });
  const [secondsLeft, setSecondsLeft] = useState(30);
  const [tickCount, setTickCount] = useState(0);
  const allChecked = Object.values(checkedItems).every(Boolean);

  // The master prompt's "30-second pause": a visible timer that starts on
  // arrival and simply reaches zero — it never blocks the checkboxes.
  const timerRunning = secondsLeft > 0;
  useEffect(() => {
    if (!timerRunning) return;
    const id = setInterval(() => setSecondsLeft((v) => Math.max(0, v - 1)), 1000);
    return () => clearInterval(id);
  }, [timerRunning]);

  const toggle = (key: keyof typeof checkedItems) => {
    setCheckedItems((prev) => {
      const next = { ...prev, [key]: !prev[key] };
      if (!prev[key]) setTickCount((c) => c + 1); // rotate reactions per acknowledgement
      return next;
    });
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4 sm:p-6">
      <div className="max-w-xl w-full">
        <Card className="border-amber-200 bg-amber-50 dark:bg-slate-900 dark:border-amber-900/50 shadow-lg">
          <CardHeader className="text-center pb-2">
            <div className="mx-auto bg-amber-100 dark:bg-amber-900/30 w-16 h-16 rounded-full flex items-center justify-center mb-4">
              <Hand className="h-8 w-8 text-amber-600 dark:text-amber-500" aria-hidden />
            </div>
            <CardTitle className="text-2xl text-amber-900 dark:text-amber-500">Take a 30-second pause</CardTitle>
            <p
              className="mt-2 text-3xl font-bold tabular-nums text-amber-700 dark:text-amber-400"
              role="timer"
              aria-live="off"
            >
              {secondsLeft > 0 ? `0:${String(secondsLeft).padStart(2, "0")}` : "0:00 — pause complete"}
            </p>
            <CardDescription className="text-amber-800/70 dark:text-amber-400/70 text-base mt-2">
              Before you proceed with any payment or investment, answer these three questions honestly.
              The Guide will walk through them with you.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-3 mt-4">
            {QUESTIONS.map((q, idx) => (
              <div key={q.key} className="space-y-2">
                <label
                  className={`flex items-start gap-3 p-4 rounded-lg border-2 cursor-pointer transition-colors ${
                    checkedItems[q.key]
                      ? "border-amber-500 bg-white dark:bg-slate-800"
                      : "border-transparent bg-white/60 dark:bg-slate-800/60"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={checkedItems[q.key]}
                    onChange={() => toggle(q.key)}
                    className="mt-1 h-5 w-5 accent-amber-600"
                    aria-label={q.question}
                  />
                  <span>
                    <span className="block font-medium text-slate-900 dark:text-slate-100">{q.question}</span>
                    <span className="text-sm text-slate-600 dark:text-slate-400">{q.detail}</span>
                  </span>
                </label>

                {/* Human-like Guide reaction — appears when the box is ticked */}
                {checkedItems[q.key] && (
                  <div className="flex gap-2 pl-2 motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-1">
                    <GuideAvatar avatar="shield" size={26} />
                    <div
                      className="rounded-xl rounded-bl-sm px-3 py-2 text-xs border max-w-[90%] bg-white dark:bg-slate-900 border-teal-200 dark:border-teal-900 text-slate-700 dark:text-slate-300"
                      aria-live="polite"
                    >
                      {pick(q.reactions, tickCount + idx)}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </CardContent>

          <CardFooter className="flex flex-col space-y-4 pt-6">
            {allChecked ? (
              <div
                className="w-full flex items-start gap-2 text-sm text-teal-700 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/30 border border-teal-200 dark:border-teal-900 rounded-lg p-3"
                aria-live="polite"
              >
                <CheckCircle2 className="h-4 w-4 mt-0.5 shrink-0" aria-hidden />
                <span>
                  {secondsLeft > 0
                    ? `You paused ${30 - secondsLeft} seconds and thought it through — that's the whole habit: Pause. Verify. Protect. Now put it to work below.`
                    : "You took the full pause and thought it through — that's the whole habit: Pause. Verify. Protect. Now put it to work below."}
                </span>
              </div>
            ) : (
              <div className="w-full flex items-center justify-center text-sm text-slate-500">
                <AlertCircle className="h-4 w-4 mr-2" aria-hidden />
                <span>Acknowledge all three points to continue.</span>
              </div>
            )}
            <div
              className={`grid grid-cols-2 gap-3 w-full transition-all duration-500 ${
                allChecked ? "opacity-100 translate-y-0 motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-2" : "opacity-50"
              }`}
            >
              <Link href="/analyze" className="w-full">
                <Button
                  className={`w-full py-6 text-base ${allChecked ? "bg-amber-600 hover:bg-amber-700 text-white" : "opacity-50 cursor-not-allowed pointer-events-none"}`}
                  disabled={!allChecked}
                  tabIndex={allChecked ? 0 : -1}
                >
                  Check the message
                </Button>
              </Link>
              <Link href="/verify" className="w-full">
                <Button
                  variant="outline"
                  className={`w-full py-6 text-base ${allChecked ? "" : "opacity-50 cursor-not-allowed pointer-events-none"}`}
                  disabled={!allChecked}
                  tabIndex={allChecked ? 0 : -1}
                >
                  Verify the advisor
                </Button>
              </Link>
            </div>
            {!allChecked && (
              <p className="text-xs text-slate-500 dark:text-slate-400 text-center">
                Feeling pressured right now? Open the Raksha Guide (bottom-right corner) — it can talk
                through this with you before you decide anything.
              </p>
            )}
          </CardFooter>
        </Card>

        <p className="text-xs text-slate-500 dark:text-slate-400 text-center mt-4">
          This checklist never connects to or controls any brokerage account. It is a thinking aid, nothing more.
        </p>
      </div>
    </div>
  );
}
