"use client";

import Link from "next/link";
import { AlertTriangle, ShieldAlert, ShieldCheck, FileLock2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import type { AnalysisResult } from "@/lib/api";

const RISK_PRESENTATION = {
  high: {
    label: "High Risk",
    tone: "border-red-600/50 bg-red-50 dark:bg-red-950/20",
    icon: <ShieldAlert className="h-5 w-5 text-red-600" aria-hidden />,
    titleClass: "text-red-700 dark:text-red-400",
  },
  review_carefully: {
    label: "Review Carefully",
    tone: "border-amber-600/50 bg-amber-50 dark:bg-amber-950/20",
    icon: <AlertTriangle className="h-5 w-5 text-amber-600" aria-hidden />,
    titleClass: "text-amber-800 dark:text-amber-500",
  },
  no_obvious_red_flags: {
    label: "No Obvious Red Flags",
    tone: "border-teal-600/50 bg-teal-50 dark:bg-teal-950/20",
    icon: <ShieldCheck className="h-5 w-5 text-teal-600" aria-hidden />,
    titleClass: "text-teal-700 dark:text-teal-400",
  },
} as const;

const SEVERITY_CHIP = {
  high: "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300",
  medium: "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300",
  low: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
} as const;

export function ResultView({ result }: { result: AnalysisResult }) {
  const p = RISK_PRESENTATION[result.risk_level];

  return (
    <div className="space-y-4" aria-live="polite">
      <Alert variant={result.risk_level === "high" ? "destructive" : "default"} className={p.tone}>
        {p.icon}
        <AlertTitle className={`text-lg font-semibold ${p.titleClass}`}>{p.label}</AlertTitle>
        <AlertDescription className="mt-2 text-slate-700 dark:text-slate-300">
          {result.summary}
        </AlertDescription>
      </Alert>

      {result.note && (
        <p className="text-xs text-slate-500 dark:text-slate-400">{result.note}</p>
      )}

      {result.red_flags.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center">
              <AlertTriangle className="mr-2 h-4 w-4 text-amber-500" aria-hidden />
              What was detected
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-4">
              {result.red_flags.map((flag, idx) => (
                <li key={idx} className="bg-slate-50 dark:bg-slate-900 p-3 rounded-md border">
                  <div className="flex flex-wrap items-center gap-2">
                    <h4 className="font-semibold text-slate-900 dark:text-slate-100">{flag.label}</h4>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${SEVERITY_CHIP[flag.severity]}`}>
                      potential warning sign · {flag.severity}
                    </span>
                  </div>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">{flag.explanation}</p>
                  {flag.matched_text && (
                    <p className="mt-2 text-xs font-mono bg-slate-100 dark:bg-slate-800 rounded px-2 py-1 inline-block max-w-full break-words">
                      &ldquo;{flag.matched_text}&rdquo;
                    </p>
                  )}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Safe next steps</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="list-disc pl-5 space-y-2 text-sm text-slate-700 dark:text-slate-300">
              {result.safe_next_steps.map((step, idx) => (
                <li key={idx}>{step}</li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">What we could not verify</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="list-disc pl-5 space-y-2 text-sm text-slate-700 dark:text-slate-300">
              <li>No official source was contacted for this analysis — it is a rule-based check of the text or link only.</li>
              <li>Advisor or company claims must be verified separately on the official SEBI website.</li>
            </ul>
            {(result.what_we_verified ?? []).length > 0 && (
              <ul className="mt-3 space-y-2 text-xs text-slate-500 dark:text-slate-400">
                {result.what_we_verified!.map((s, idx) => (
                  <li key={idx}>
                    {s.source_name}: {s.status}
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="border-slate-200 dark:border-slate-800">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Limitations &amp; disclaimer</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="list-disc pl-5 space-y-1 text-xs text-slate-600 dark:text-slate-400">
            {result.limitations.map((lim, idx) => (
              <li key={idx}>{lim}</li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <div className="flex flex-wrap gap-3">
        <Link href="/report">
          <Button variant="outline" className="border-teal-600 text-teal-700 hover:bg-teal-50 dark:text-teal-400">
            <FileLock2 className="mr-2 h-4 w-4" aria-hidden />
            Save to Evidence Locker
          </Button>
        </Link>
        {result.analysis_id && result.analysis_id !== "local-only" && (
          <Link href={`/result/${result.analysis_id}`} className="self-center text-sm text-slate-500 underline hover:text-slate-700">
            Stable link to this result
          </Link>
        )}
      </div>
    </div>
  );
}
