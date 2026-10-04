"use client";

import Link from "next/link";
import { useState } from "react";
import { AlertTriangle, Check, Copy, ShieldAlert, ShieldCheck, FileLock2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  const ml = (result as { ml_metadata?: { model?: string; scam_probability?: number; decision_role?: string; calibrated?: boolean; indicbert?: { status?: string } } }).ml_metadata;

  return (
    <div className="space-y-4" aria-live="polite">
      <div
        role="status"
        className={`-mx-4 sm:-mx-6 px-4 sm:px-6 py-5 border-y-2 ${p.tone} border-l-8 motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-top-2`}
      >
        <div className="max-w-5xl mx-auto flex items-start gap-3">
          <span className="motion-safe:animate-in motion-safe:zoom-in-50">{p.icon}</span>
          <div>
            <p className={`text-xl font-bold ${p.titleClass}`}>{p.label}</p>
            <p className="mt-1 text-sm text-slate-700 dark:text-slate-300">{result.summary}</p>
          </div>
        </div>
      </div>

      {result.note && (
        <p className="text-xs text-slate-500 dark:text-slate-400">{result.note}</p>
      )}

      {ml?.model && ml.model !== "unavailable" && (
        <Card className="border-slate-200 dark:border-slate-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">How the classifier assist reads this</CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-slate-600 dark:text-slate-400 space-y-1">
            <p>
              Assistive model <span className="font-medium">{ml.model}</span> estimates a{" "}
              {Math.round((ml.scam_probability ?? 0) * 100)}% similarity to known scam patterns.
            </p>
            <p>
              This score is <span className="font-medium">assistance only</span>
              {ml.calibrated === false && " and is not calibrated against real-world data"} — the risk
              level above is decided solely by the deterministic rules.
            </p>
            {ml.indicbert && (
              <p>Multilingual IndicBERT classifier: {ml.indicbert.status}.</p>
            )}
          </CardContent>
        </Card>
      )}

      {result.detected_language && result.input_type !== "url" && (
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Script detected in your text: <span className="font-medium uppercase">{result.detected_language}</span> —
          scam-phrase coverage is strongest for English and Tamil; other languages still get the
          structural checks (payments, credentials, urgency).
        </p>
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
                    <p className="mt-2 max-w-full break-words">
                      <mark className="text-xs font-mono bg-amber-200/80 dark:bg-amber-500/30 text-slate-900 dark:text-amber-100 rounded px-2 py-1">
                        &ldquo;{flag.matched_text}&rdquo;
                      </mark>
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
            {(result.what_we_verified ?? []).length > 0 ? (
              <>
                <p className="mt-3 text-xs font-medium text-slate-600 dark:text-slate-300">What we did verify:</p>
                <ul className="mt-1 space-y-1 text-xs text-teal-700 dark:text-teal-400">
                  {result.what_we_verified!.map((s, idx) => (
                    <li key={idx}>
                      {s.source_name}: {s.status}
                      {s.retrieved_at ? ` · ${new Date(s.retrieved_at).toLocaleString()}` : ""}
                    </li>
                  ))}
                </ul>
              </>
            ) : (
              <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">
                Nothing was verified against external sources in this run.
              </p>
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
          <ShareLink analysisId={result.analysis_id} />
        )}
      </div>
    </div>
  );
}

function ShareLink({ analysisId }: { analysisId: string }) {
  const [copied, setCopied] = useState(false);
  const url = typeof window === "undefined" ? "" : `${window.location.origin}/result/${analysisId}`;
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = url;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      ta.remove();
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <span className="self-center flex items-center gap-2 text-sm text-slate-500">
      <Link href={`/result/${analysisId}`} className="underline hover:text-slate-700">
        Stable link to this result
      </Link>
      <button
        type="button"
        onClick={copy}
        aria-label="Copy result link to clipboard"
        className="inline-flex items-center gap-1 px-2 py-1 rounded border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800"
      >
        {copied ? <Check className="h-3 w-3 text-teal-600" aria-hidden /> : <Copy className="h-3 w-3" aria-hidden />}
        {copied ? "Copied" : "Copy"}
      </button>
    </span>
  );
}
