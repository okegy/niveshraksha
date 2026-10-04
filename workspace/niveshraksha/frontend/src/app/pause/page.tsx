"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Hand, AlertCircle, CheckCircle2 } from "lucide-react";

const QUESTIONS = [
  {
    key: "pressure" as const,
    question: "Am I feeling rushed?",
    detail:
      "Scammers create false urgency (\"limited time offer\", \"last 2 slots\"). Legitimate investments don't disappear in an hour.",
  },
  {
    key: "verified" as const,
    question: "Have I verified the source independently?",
    detail:
      "Never trust an ID card sent on WhatsApp. Did you check the SEBI website yourself, by typing its address — not by clicking a link they sent?",
  },
  {
    key: "personalInfo" as const,
    question: "Are they asking for credentials?",
    detail:
      "No genuine advisor or broker will ask for your OTP, UPI PIN, or to install remote-access apps (like AnyDesk). Any such request is a stop sign.",
  },
];

export default function PausePage() {
  const [checkedItems, setCheckedItems] = useState({ pressure: false, verified: false, personalInfo: false });
  const allChecked = Object.values(checkedItems).every(Boolean);

  return (
    <div className="min-h-[70vh] flex items-center justify-center p-4 sm:p-6">
      <div className="max-w-xl w-full">
        <Card className="border-amber-200 bg-amber-50 dark:bg-slate-900 dark:border-amber-900/50 shadow-lg">
          <CardHeader className="text-center pb-2">
            <div className="mx-auto bg-amber-100 dark:bg-amber-900/30 w-16 h-16 rounded-full flex items-center justify-center mb-4">
              <Hand className="h-8 w-8 text-amber-600 dark:text-amber-500" aria-hidden />
            </div>
            <CardTitle className="text-2xl text-amber-900 dark:text-amber-500">Take a 30-second pause</CardTitle>
            <CardDescription className="text-amber-800/70 dark:text-amber-400/70 text-base mt-2">
              Before you proceed with any payment or investment, answer these three questions honestly.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-3 mt-4">
            {QUESTIONS.map((q) => (
              <label
                key={q.key}
                className={`flex items-start gap-3 p-4 rounded-lg border-2 cursor-pointer transition-colors ${
                  checkedItems[q.key]
                    ? "border-amber-500 bg-white dark:bg-slate-800"
                    : "border-transparent bg-white/60 dark:bg-slate-800/60"
                }`}
              >
                <input
                  type="checkbox"
                  checked={checkedItems[q.key]}
                  onChange={(e) => setCheckedItems((prev) => ({ ...prev, [q.key]: e.target.checked }))}
                  className="mt-1 h-5 w-5 accent-amber-600"
                  aria-label={q.question}
                />
                <span>
                  <span className="block font-medium text-slate-900 dark:text-slate-100">{q.question}</span>
                  <span className="text-sm text-slate-600 dark:text-slate-400">{q.detail}</span>
                </span>
              </label>
            ))}
          </CardContent>

          <CardFooter className="flex flex-col space-y-4 pt-6">
            {allChecked ? (
              <div className="w-full flex items-start gap-2 text-sm text-teal-700 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/30 border border-teal-200 dark:border-teal-900 rounded-lg p-3" aria-live="polite">
                <CheckCircle2 className="h-4 w-4 mt-0.5 shrink-0" aria-hidden />
                <span>
                  Good — that pause is the habit that protects your money. Next, run the message through the checker or verify the advisor, before any payment.
                </span>
              </div>
            ) : (
              <div className="w-full flex items-center justify-center text-sm text-slate-500">
                <AlertCircle className="h-4 w-4 mr-2" aria-hidden />
                <span>Acknowledge all three points to continue.</span>
              </div>
            )}
            <div className="grid grid-cols-2 gap-3 w-full">
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
          </CardFooter>
        </Card>

        <p className="text-xs text-slate-500 dark:text-slate-400 text-center mt-4">
          This checklist never connects to or controls any brokerage account. It is a thinking aid, nothing more.
        </p>
      </div>
    </div>
  );
}
