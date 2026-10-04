"use client";

import Link from "next/link";
import {
  AlertTriangle,
  FileLock2,
  Hand,
  Lock,
  MessageSquareWarning,
  Search,
  ShieldCheck,
  Sparkles,
  UserCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/lib/i18n";

const HOW_IT_WORKS = [
  { icon: MessageSquareWarning, title: "1. Check", body: "Paste a suspicious message or link. Deterministic rules flag the warning signs with exact evidence.", href: "/analyze" },
  { icon: UserCheck, title: "2. Verify", body: "Check the advisor's SEBI registration against records — with honest uncertainty, never verdicts.", href: "/verify" },
  { icon: Hand, title: "3. Pause", body: "Feeling pressured? A 30-second checklist breaks the urgency before money moves.", href: "/pause" },
  { icon: FileLock2, title: "4. Report", body: "Prepare a redacted evidence draft and file it on official portals — nothing is sent for you.", href: "/report" },
];

const MOCK_SCAM = "SEBI-approved premium group! Guaranteed 40% monthly return. Only 2 slots left — pay today to unlock the IPO allocation. Send PAN and UPI screenshot with the OTP.";
const HIGHLIGHTS = [
  { text: "SEBI-approved", label: "impersonation" },
  { text: "Guaranteed 40% monthly return", label: "guaranteed returns" },
  { text: "Only 2 slots left", label: "urgency" },
  { text: "unlock the IPO allocation", label: "advance-fee" },
  { text: "Send PAN and UPI screenshot", label: "document request" },
];

function MockScamMessage() {
  // Renders the synthetic demo message with the exact spans the rules flag,
  // highlighted — the same evidence the analyzer returns, previewed on the hero.
  let parts: { text: string; label?: string }[] = [{ text: MOCK_SCAM }];
  for (const h of HIGHLIGHTS) {
    parts = parts.flatMap((p) => {
      if (p.label || !p.text.includes(h.text)) return [p];
      const [before, after] = p.text.split(h.text);
      return [
        ...(before ? [{ text: before }] : []),
        { text: h.text, label: h.label },
        ...(after ? [{ text: after }] : []),
      ];
    });
  }
  return (
    <div className="glass-card p-5 text-left max-w-md w-full" aria-label="Example of a flagged scam message (synthetic)">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-9 h-9 rounded-full bg-slate-300 dark:bg-slate-700" aria-hidden />
        <div>
          <p className="text-sm font-medium text-slate-900 dark:text-slate-100">+91 ••••• 43210</p>
          <p className="text-[11px] text-slate-500">Telegram · synthetic example</p>
        </div>
      </div>
      <p className="text-sm leading-relaxed text-slate-800 dark:text-slate-200">
        {parts.map((p, i) =>
          p.label ? (
            <mark key={i} className="bg-amber-200/80 dark:bg-amber-500/30 text-slate-900 dark:text-amber-200 rounded px-1 py-0.5 mr-1" title={`Flagged: ${p.label}`}>
              {p.text}
              <span className="ml-1 text-[10px] font-semibold text-amber-700 dark:text-amber-400">⚠ {p.label}</span>
            </mark>
          ) : (
            <span key={i}>{p.text}</span>
          ),
        )}
      </p>
      <div className="mt-4 flex items-center gap-2 text-xs text-teal-700 dark:text-teal-400 font-medium">
        <Sparkles className="h-4 w-4" aria-hidden />
        This is what the analyzer flags — in milliseconds, in 12 languages.
      </div>
    </div>
  );
}

export default function Home() {
  const { t } = useLanguage();

  return (
    <div className="flex flex-col items-center p-4 sm:p-6">
      {/* Hero */}
      <section className="w-full max-w-5xl flex flex-col lg:flex-row items-center gap-10 py-10">
        <div className="flex-1 text-center lg:text-left">
          <h2 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100 mb-4">
            {t("landing_title")}
          </h2>
          <p className="text-lg text-slate-600 dark:text-slate-400 mb-8 max-w-xl mx-auto lg:mx-0">
            {t("landing_sub")}
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
            <Link href="/analyze">
              <Button className="w-full sm:w-auto bg-teal-600 hover:bg-teal-700 text-white min-h-[48px] px-6 text-base">
                <Search className="mr-2 h-4 w-4" aria-hidden /> {t("analyze_now")}
              </Button>
            </Link>
            <Link href="/verify">
              <Button
                variant="outline"
                className="w-full sm:w-auto min-h-[48px] px-6 text-base border-teal-600 text-teal-700 hover:bg-teal-50 dark:text-teal-400"
              >
                <ShieldCheck className="mr-2 h-4 w-4" aria-hidden /> {t("verify_now")}
              </Button>
            </Link>
          </div>
          {/* Trust signals bar */}
          <div className="mt-8 flex flex-wrap gap-2 justify-center lg:justify-start text-xs">
            {[
              { icon: ShieldCheck, label: "Sangyan Hackathon project" },
              { icon: Lock, label: "No investment advice, ever" },
              { icon: UserCheck, label: "No account needed" },
              { icon: FileLock2, label: "Nothing stored without consent" },
            ].map(({ icon: Icon, label }) => (
              <span
                key={label}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/70 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300"
              >
                <Icon className="h-3.5 w-3.5 text-teal-600 dark:text-teal-400" aria-hidden />
                {label}
              </span>
            ))}
          </div>
        </div>

        <div className="flex-1 flex justify-center w-full">
          <MockScamMessage />
        </div>
      </section>

      {/* How it works */}
      <section aria-label="How it works" className="w-full max-w-5xl py-8">
        <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100 text-center mb-6">How it works</h3>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {HOW_IT_WORKS.map(({ icon: Icon, title, body, href }) => (
            <Link
              key={title}
              href={href}
              className="glass-card p-5 hover:shadow-lg transition-shadow group"
            >
              <Icon className="h-7 w-7 text-teal-600 dark:text-teal-400 mb-3 group-hover:scale-110 transition-transform" aria-hidden />
              <h4 className="font-semibold text-slate-900 dark:text-slate-100 mb-1">{title}</h4>
              <p className="text-xs text-slate-600 dark:text-slate-400">{body}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* Secondary actions as proper cards */}
      <section className="w-full max-w-3xl grid gap-4 sm:grid-cols-3 mt-4">
        {[
          { href: "/pause", icon: Hand, title: "Feeling pressured?", body: "Take the 30-second pause" },
          { href: "/report", icon: FileLock2, title: "Prepare evidence", body: "Build a redacted incident draft" },
          { href: "/learn", icon: AlertTriangle, title: "Learn warning signs", body: "7 lessons in 12 languages" },
        ].map(({ href, icon: Icon, title, body }) => (
          <Link
            key={href}
            href={href}
            className="glass-card p-4 flex items-start gap-3 hover:shadow-lg transition-shadow"
          >
            <div className="bg-teal-50 dark:bg-slate-800 rounded-lg p-2">
              <Icon className="h-5 w-5 text-teal-600 dark:text-teal-400" aria-hidden />
            </div>
            <div>
              <p className="font-medium text-sm text-slate-900 dark:text-slate-100">{title}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">{body} →</p>
            </div>
          </Link>
        ))}
      </section>

      {/* Disclaimer */}
      <div className="mt-12 mb-6 bg-amber-50/90 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 p-6 rounded-lg max-w-3xl text-left w-full">
        <h4 className="font-semibold text-amber-800 dark:text-amber-500 mb-2">{t("disclaimer_title")}</h4>
        <p className="text-amber-900/80 dark:text-amber-400/80 text-sm">{t("disclaimer_body")}</p>
      </div>
    </div>
  );
}
