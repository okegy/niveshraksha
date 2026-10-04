"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  Cpu,
  FileSearch,
  Lock,
  Search,
  ShieldCheck,
  X,
} from "lucide-react";
import MatrixRain from "@/components/ui/matrix-code";
import { GlowingShadow } from "@/components/ui/glowing-shadow";
import { ScamReportCard } from "@/components/ui/scam-card";
import { ApiError, api } from "@/lib/api";
import type { RedFlag } from "@/lib/api";

interface QueryResult {
  query_type: string;
  risk_level: string;
  red_flags: RedFlag[];
  guidance: string[];
}

interface FeedEntry {
  target: string;
  category: string;
  risk_score: number;
  reported_at: string;
  source: string;
}

const RISK_TONE: Record<string, { label: string; text: string; border: string }> = {
  high: { label: "CRITICAL", text: "text-red-400", border: "border-red-500/40" },
  review_carefully: { label: "SUSPICIOUS", text: "text-amber-400", border: "border-amber-500/40" },
  no_obvious_red_flags: { label: "NO OBVIOUS FLAGS", text: "text-emerald-400", border: "border-emerald-500/40" },
};

const EXAMPLES: Record<string, string> = {
  phishing: "http://sebi.kyc-update.xyz/verify-account",
  crypto: "0x71C7656EC7ab88b098defB751B7401B5f6d89739",
  identity: "support-ticket-update@mail-security-check.com",
};

export default function SentinelPortal() {
  const [query, setQuery] = useState("");
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState<QueryResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [feed, setFeed] = useState<FeedEntry[]>([]);
  const [stats, setStats] = useState<{ scams_flagged_today: number; addresses_audited: number; community_reports_this_session: number } | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [reportForm, setReportForm] = useState({ target: "", details: "", category: "Phishing" });
  const [reportResult, setReportResult] = useState<{ risk_score: number; risk_level: string; note: string } | null>(null);
  const resultRef = useRef<HTMLDivElement>(null);

  const refreshFeed = useCallback(() => {
    api.threatFeed().then((d) => setFeed(d.entries)).catch(() => {});
    api.threatStats().then(setStats).catch(() => {});
  }, []);

  useEffect(() => {
    refreshFeed();
    const id = setInterval(refreshFeed, 30_000);
    return () => clearInterval(id);
  }, [refreshFeed]);

  const runScan = useCallback(
    async (q: string) => {
      const text = q.trim();
      if (!text || scanning) return;
      setScanning(true);
      setError(null);
      setResult(null);
      try {
        const res = await api.analyzeQuery(text);
        setResult(res);
        requestAnimationFrame(() => resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }));
      } catch (e) {
        setError(e instanceof ApiError ? e.message : "Scan failed. Please try again.");
      } finally {
        setScanning(false);
      }
    },
    [scanning],
  );

  const submitReport = async () => {
    setError(null);
    setReportResult(null);
    try {
      const res = await api.submitThreatReport(reportForm);
      setReportResult(res);
      refreshFeed();
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Submission failed. Please try again.");
    }
  };

  return (
    <div className="relative min-h-screen bg-slate-950 text-slate-100 overflow-x-hidden">
      <MatrixRain fontSize={16} color="#00ff66" fadeOpacity={0.07} speed={1.2} />

      <div className="relative z-10 max-w-7xl mx-auto px-4 py-8">
        {/* Portal header: ticker + stats + Report CTA (app-wide nav stays above) */}
        <header className="flex flex-wrap justify-between items-center gap-3 mb-12 border-b border-emerald-900/40 pb-5 backdrop-blur-md bg-black/40 px-6 rounded-2xl">
          <div className="flex items-center gap-3">
            <Cpu className="text-emerald-400 animate-pulse" size={28} aria-hidden />
            <span className="text-2xl font-black tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-green-400 via-emerald-500 to-green-600">
              SENTINEL-X
            </span>
            <span className="hidden md:inline text-[10px] font-mono text-emerald-600 border border-emerald-900 rounded px-1.5 py-0.5">
              powered by NiveshRaksha engine
            </span>
          </div>

          {/* Threat feed ticker */}
          <div className="hidden lg:flex items-center gap-2 min-w-0 flex-1 mx-6 overflow-hidden" aria-hidden>
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping shrink-0" />
            <div className="relative whitespace-nowrap overflow-hidden max-w-xs font-mono text-xs text-emerald-500/80">
              {feed[0] ? `⚑ ${feed[0].target.slice(0, 48)} · score ${feed[0].risk_score}` : "LIVE FEED ACTIVE"}
            </div>
          </div>

          <div className="flex items-center gap-4 font-mono text-xs text-slate-400">
            {stats && (
              <span className="hidden sm:inline">
                <span className="text-emerald-400 font-bold">{stats.scams_flagged_today.toLocaleString()}</span> Scams Flagged Today
              </span>
            )}
            <button
              type="button"
              onClick={() => setModalOpen(true)}
              className="px-4 py-2 rounded-lg bg-emerald-950 border border-emerald-500/40 text-emerald-300 hover:bg-emerald-900/50 transition min-h-[40px]"
            >
              Report Fraud
            </button>
          </div>
        </header>

        {/* Hero & central search */}
        <section className="text-center my-16 max-w-3xl mx-auto">
          <h1 className="text-4xl sm:text-5xl font-black tracking-tight mb-4 text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 via-green-400 to-emerald-600">
            VERIFY SCAMS &amp; PHISHING THREATS
          </h1>
          <p className="text-slate-400 font-mono text-sm mb-2">
            Paste URL, Crypto Address, Phone Number, or Telegram Handle — analyzed by the
            deterministic NiveshRaksha engine. No AI verdicts, no false certainty.
          </p>
          <p className="text-emerald-600 font-mono text-xs mb-8">Pause. Verify. Protect.</p>

          <div className="relative mb-6">
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-emerald-400">
              <Search size={22} aria-hidden />
            </div>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") runScan(query);
              }}
              placeholder="Paste link, wallet address, email, phone or domain..."
              aria-label="Query to verify"
              className="w-full pl-12 pr-32 py-4 rounded-xl bg-black/80 border-2 border-emerald-500/40 text-slate-100 placeholder-slate-500 font-mono text-sm focus:outline-none focus:border-emerald-400 transition shadow-[0_0_20px_rgba(0,255,102,0.15)]"
            />
            <button
              type="button"
              onClick={() => runScan(query)}
              disabled={scanning || !query.trim()}
              className="absolute right-2 top-2 bottom-2 px-6 bg-emerald-500 text-black font-mono font-bold rounded-lg hover:bg-emerald-400 transition disabled:opacity-40 min-h-[40px]"
            >
              {scanning ? "..." : "SCAN"}
            </button>
          </div>
          {error && (
            <p role="alert" className="font-mono text-xs text-red-400 mb-4">
              {error}
            </p>
          )}
        </section>

        {/* Scan result panel */}
        {result && (
          <section ref={resultRef} aria-live="polite" className="mb-16">
            <div className={`backdrop-blur-md bg-black/60 border-2 ${RISK_TONE[result.risk_level]?.border ?? "border-emerald-500/20"} rounded-xl p-6`}>
              <div className="flex flex-wrap justify-between items-center gap-3 mb-4">
                <span className={`font-mono text-sm font-bold px-3 py-1 rounded border ${RISK_TONE[result.risk_level]?.border} ${RISK_TONE[result.risk_level]?.text}`}>
                  {RISK_TONE[result.risk_level]?.label ?? result.risk_level}
                </span>
                <span className="font-mono text-xs text-slate-400 uppercase">
                  type: {result.query_type} · {result.red_flags.length} indicator(s)
                </span>
              </div>
              {result.red_flags.length > 0 ? (
                <ul className="space-y-3 mb-4">
                  {result.red_flags.map((f, i) => (
                    <li key={i} className="border border-slate-800 rounded-lg p-3 bg-black/40">
                      <p className="font-mono text-sm text-slate-200">
                        <span className={f.severity === "high" ? "text-red-400" : "text-amber-400"}>⚠ {f.label}</span>
                        {f.matched_text && <span className="block text-xs text-slate-500 mt-1">matched: &quot;{f.matched_text}&quot;</span>}
                      </p>
                      <p className="text-xs text-slate-400 mt-1">{f.explanation}</p>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="font-mono text-sm text-emerald-400 mb-4">
                  No known red-flag pattern matched — that is NOT proof of safety.
                </p>
              )}
              <ul className="list-disc pl-5 space-y-1 text-xs text-slate-400">
                {result.guidance.map((g, i) => (
                  <li key={i}>{g}</li>
                ))}
              </ul>
              <Link href="/analyze" className="inline-block mt-4 font-mono text-xs text-emerald-400 underline hover:text-emerald-300">
                Open the full analyzer (message, URL, screenshot) →
              </Link>
            </div>
          </section>
        )}

        {/* Quick verification modules */}
        <section className="grid md:grid-cols-3 gap-6 mb-16" aria-label="Quick verification modules">
          <GlowingShadow className="w-full">
            <button type="button" onClick={() => { setQuery(EXAMPLES.phishing); runScan(EXAMPLES.phishing); }} className="flex flex-col items-center text-center w-full">
              <FileSearch className="text-emerald-400 mb-3" size={36} aria-hidden />
              <h3 className="font-mono text-lg font-bold text-white mb-2">Phishing URL Audit</h3>
              <p className="text-xs text-slate-400">Check fake domains, brand-in-subdomain tricks and phishing-shaped links.</p>
            </button>
          </GlowingShadow>
          <GlowingShadow className="w-full">
            <button type="button" onClick={() => { setQuery(EXAMPLES.crypto); runScan(EXAMPLES.crypto); }} className="flex flex-col items-center text-center w-full">
              <Lock className="text-emerald-400 mb-3" size={36} aria-hidden />
              <h3 className="font-mono text-lg font-bold text-white mb-2">Crypto Address Check</h3>
              <p className="text-xs text-slate-400">Address-shape validation and drainer-awareness guidance (no on-chain calls in demo).</p>
            </button>
          </GlowingShadow>
          <GlowingShadow className="w-full">
            <button type="button" onClick={() => { setQuery(EXAMPLES.identity); runScan(EXAMPLES.identity); }} className="flex flex-col items-center text-center w-full">
              <AlertTriangle className="text-emerald-400 mb-3" size={36} aria-hidden />
              <h3 className="font-mono text-lg font-bold text-white mb-2">Identity / Fake Email Check</h3>
              <p className="text-xs text-slate-400">Lookalike providers, disposable mail and phishing-shaped domains.</p>
            </button>
          </GlowingShadow>
        </section>

        {/* Live threat stream */}
        <section className="mb-12" aria-label="Live cyber threat stream">
          <div className="flex justify-between items-center mb-6 border-b border-slate-800 pb-3">
            <h2 className="text-xl font-mono font-bold text-emerald-400 flex items-center gap-2">
              <ShieldCheck size={22} aria-hidden /> LATEST THREAT VERIFICATIONS
            </h2>
            <span className="text-xs font-mono text-slate-400">Real-time sync · synthetic seed + community reports</span>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {feed.map((e, i) => (
              <ScamReportCard
                key={`${e.target}-${i}`}
                target={e.target}
                category={e.category}
                riskScore={e.risk_score}
                reportedAt={e.reported_at}
              />
            ))}
          </div>
        </section>

        {/* Disclaimer */}
        <div className="mb-8 backdrop-blur-md bg-black/60 border border-amber-500/30 rounded-xl p-5 text-left">
          <h4 className="font-mono text-sm font-bold text-amber-400 mb-2">SAFETY DISCLAIMER</h4>
          <p className="text-xs text-slate-400 font-mono">
            SENTINEL-X runs the NiveshRaksha deterministic engine: pattern-level checks only. A
            clean result is not proof of safety; a flag is not proof of fraud. Not affiliated with
            SEBI/RBI. No investment advice, ever. Feed counters are demo-scale placeholders.
          </p>
        </div>
      </div>

      {/* Fraud submission modal */}
      {modalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-label="Report fraud"
          onClick={(e) => {
            if (e.target === e.currentTarget) setModalOpen(false);
          }}
        >
          <div className="backdrop-blur-md bg-black/80 border border-green-500/20 rounded-2xl max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-mono text-lg font-bold text-emerald-400">REPORT FRAUD</h3>
              <button type="button" onClick={() => setModalOpen(false)} aria-label="Close report dialog" className="text-slate-400 hover:text-white">
                <X size={20} aria-hidden />
              </button>
            </div>
            {reportResult ? (
              <div className="space-y-4">
                <p className="font-mono text-sm text-emerald-400">
                  Scored: {reportResult.risk_score}/100 ({reportResult.risk_level})
                </p>
                <p className="text-xs text-slate-400">{reportResult.note}</p>
                <div className="flex gap-3">
                  <button type="button" onClick={() => { setReportResult(null); setModalOpen(false); }} className="px-4 py-2 rounded-lg bg-emerald-500 text-black font-mono text-sm font-bold">
                    Done
                  </button>
                  <Link href="/report" className="px-4 py-2 rounded-lg border border-emerald-500/40 text-emerald-300 font-mono text-sm">
                    Open Evidence Locker →
                  </Link>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label htmlFor="rep-target" className="font-mono text-xs text-slate-400 block mb-1">
                    URL / address / handle / phone number *
                  </label>
                  <input
                    id="rep-target"
                    value={reportForm.target}
                    onChange={(e) => setReportForm((f) => ({ ...f, target: e.target.value }))}
                    className="w-full px-3 py-2.5 rounded-lg bg-black/80 border border-emerald-500/30 text-slate-100 font-mono text-sm focus:outline-none focus:border-emerald-400"
                    placeholder="https://suspicious-site.xyz"
                  />
                </div>
                <div>
                  <label htmlFor="rep-category" className="font-mono text-xs text-slate-400 block mb-1">
                    Category
                  </label>
                  <select
                    id="rep-category"
                    value={reportForm.category}
                    onChange={(e) => setReportForm((f) => ({ ...f, category: e.target.value }))}
                    className="w-full px-3 py-2.5 rounded-lg bg-black/80 border border-emerald-500/30 text-slate-100 font-mono text-sm focus:outline-none focus:border-emerald-400"
                  >
                    {["Phishing", "Crypto Drainer", "Identity Theft", "Fake Store", "Tip Group", "Vishing", "Suspicious"].map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="rep-details" className="font-mono text-xs text-slate-400 block mb-1">
                    What happened? (scores the report)
                  </label>
                  <textarea
                    id="rep-details"
                    value={reportForm.details}
                    onChange={(e) => setReportForm((f) => ({ ...f, details: e.target.value }))}
                    rows={4}
                    className="w-full px-3 py-2.5 rounded-lg bg-black/80 border border-emerald-500/30 text-slate-100 font-mono text-sm focus:outline-none focus:border-emerald-400 resize-none"
                    placeholder="e.g. they promised guaranteed returns and asked for OTP to unlock withdrawal..."
                  />
                  <p className="text-[10px] text-slate-500 mt-1 font-mono">
                    Screenshots: use the Screenshot tab in the full analyzer for OCR-checked uploads.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={submitReport}
                  disabled={!reportForm.target.trim()}
                  className="w-full py-3 rounded-lg bg-emerald-500 text-black font-mono font-bold hover:bg-emerald-400 transition disabled:opacity-40 min-h-[48px]"
                >
                  SUBMIT REPORT
                </button>
                <p className="text-[10px] text-slate-500 font-mono">
                  Community reports are demo-session data scored by the deterministic engine. For an
                  official complaint, use the Evidence Locker → cybercrime.gov.in.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
