"use client";

import { useEffect, useState } from "react";
import { ExternalLink, ShieldCheck } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { api, type SourceStatusItem } from "@/lib/api";

const METHOD_STEPS = [
  {
    title: "1. Detect — deterministic rules only",
    body: "Your text or link is checked against a fixed set of red-flag rules (guaranteed returns, urgency pressure, credential requests, lookalike domains, and more). Every rule is a plain pattern with a published explanation, so any flag can be audited. No AI model decides your risk level.",
  },
  {
    title: "2. Explain — evidence, not verdicts",
    body: "Each flag shows what was detected, why it can be risky, and the exact text that triggered it. Flags are labelled 'potential warning signs' — the tool never claims something is definitely a scam.",
  },
  {
    title: "3. Verify — official sources, honest uncertainty",
    body: "Advisor checks are designed to hit official records. In this demo they run against a clearly-labelled synthetic fixture, and every result says so. 'Not found' is always presented as 'could not verify', never as 'fraudulent'.",
  },
  {
    title: "4. Protect — pause, document, report",
    body: "A behavioural pause checklist slows down urgent decisions, the Evidence Locker prepares redacted drafts, and reporting always routes you to official portals (cybercrime.gov.in, SEBI SCORES). Nothing is ever submitted on your behalf.",
  },
];

const LIMITATIONS = [
  "Rule-based detection cannot catch new or subtle scam patterns — a clean result never proves a message is safe.",
  "English and Tamil coverage of scam phrasing is incomplete; scammers constantly change wording.",
  "The advisor database in this demo is synthetic. Live regulator integration must be added before real-world use.",
  "URL checks are static; we never open the page, so a link with no static red flags can still be dangerous.",
  "We cannot detect fraud in images (screenshots of profits, forged certificates) beyond text you paste.",
];

const ATTRIBUTIONS = [
  {
    name: "Created by Akash Kishore",
    detail:
      "Design, architecture, rule engine, AI layer, and interface built from the ground up for this project. Open-source building blocks (Next.js, FastAPI, Tailwind CSS, scikit-learn, and others) are acknowledged in the repository's NOTICE file.",
  },
];

export default function AboutPage() {
  const [sources, setSources] = useState<SourceStatusItem[] | null>(null);
  const [policy, setPolicy] = useState("");

  useEffect(() => {
    api
      .getSourceStatus()
      .then((d) => {
        setSources(d.sources);
        setPolicy(d.policy);
      })
      .catch(() => setSources([]));
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-4 sm:p-6">
      <div className="max-w-3xl mx-auto">
        <div
          className="mb-6 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 p-4 text-sm text-slate-700 dark:text-slate-300 flex items-center gap-3"
          role="note"
        >
          <ShieldCheck className="h-6 w-6 text-teal-600 dark:text-teal-400 shrink-0" aria-hidden />
          <p>
            <strong>NiveshRaksha is NOT affiliated with SEBI, RBI, NPCI, or any regulator, bank, or
            government body.</strong> All advisor data in this demo is a clearly-labelled synthetic
            fixture. No endorsement is claimed or implied.
          </p>
        </div>
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-3">
            <ShieldCheck className="h-8 w-8 text-teal-600" aria-hidden /> About NiveshRaksha
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-2">
            An investor-resilience tool for the Sangyan Hackathon. Its goal is narrower and more honest than &quot;fraud detection&quot;: help you pause, verify through official sources, and take safe next steps.
          </p>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>How it works</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {METHOD_STEPS.map((s) => (
              <div key={s.title}>
                <h3 className="font-semibold text-slate-900 dark:text-slate-100">{s.title}</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">{s.body}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Source policy &amp; live status</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-slate-600 dark:text-slate-400">{policy || "Loading source policy..."}</p>
            <ul className="mt-4 space-y-3">
              {(sources ?? []).map((s) => (
                <li key={s.source_url} className="text-sm border rounded-lg p-3 bg-white dark:bg-slate-900">
                  <a href={s.source_url} target="_blank" rel="noopener noreferrer" className="font-medium text-teal-700 dark:text-teal-400 inline-flex items-center gap-1 hover:underline">
                    {s.source_name} <ExternalLink className="h-3 w-3" aria-hidden />
                  </a>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Mode: {s.mode} · Status: {s.status}
                    {s.last_checked ? ` · Last checked: ${new Date(s.last_checked).toLocaleString()}` : ""}
                  </p>
                </li>
              ))}
              {sources && sources.length === 0 && (
                <li className="text-sm text-slate-500">Source status unavailable — the backend may be offline.</li>
              )}
            </ul>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-3">
              NiveshRaksha is not affiliated with SEBI, RBI, or any government body, and never presents unofficial data as regulator data.
            </p>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Known limitations</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="list-disc pl-5 space-y-2 text-sm text-slate-600 dark:text-slate-400">
              {LIMITATIONS.map((l, i) => (
                <li key={i}>{l}</li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Privacy in one paragraph</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-slate-600 dark:text-slate-400 space-y-2">
            <p>
              The tool is privacy-minimal by design: no accounts, no trackers. Analysis results and evidence drafts are stored only with your explicit consent, are redacted before storage (PAN, Aadhaar, phone numbers, emails, UPI IDs, card-shaped numbers), and are auto-deleted after 72 hours — or immediately when you press delete. Logs are scrubbed with the same redaction rules. Sensitive input fields always show a privacy notice beside them.
            </p>
            <p>
              This is a hackathon demo: do not paste real documents, and never share real OTPs, PINs, or passwords with anyone — including us. We would never ask.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Open-source attribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3 text-sm">
              {ATTRIBUTIONS.map((a) => (
                <li key={a.name}>
                  <h3 className="font-semibold text-slate-900 dark:text-slate-100">{a.name}</h3>
                  <p className="text-slate-600 dark:text-slate-400">{a.detail}</p>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
