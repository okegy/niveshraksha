"use client";

import React from "react";
import { ShieldAlert, Clock } from "lucide-react";

interface ScamReportProps {
  target: string;
  category: string;
  riskScore: number;
  reportedAt: string;
}

export function ScamReportCard({ target, category, riskScore, reportedAt }: ScamReportProps) {
  const isHigh = riskScore > 75;

  return (
    <div className="relative backdrop-blur-lg bg-black/60 border border-emerald-500/20 rounded-xl p-5 hover:border-emerald-500/50 transition-all duration-300">
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center gap-2">
          <ShieldAlert className={isHigh ? "text-red-500" : "text-amber-500"} size={20} />
          <span className="text-xs font-mono tracking-wide uppercase px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800">
            {category}
          </span>
        </div>
        <div className="flex items-center text-xs text-slate-400 gap-1 font-mono">
          <Clock size={12} />
          {reportedAt}
        </div>
      </div>

      <div className="font-mono text-sm text-slate-200 truncate mb-4">{target}</div>

      <div className="flex justify-between items-center pt-3 border-t border-slate-800">
        <span className="text-xs text-slate-400">Risk Score</span>
        <span className={`font-mono text-sm font-bold ${isHigh ? "text-red-400" : "text-amber-400"}`}>
          {riskScore}/100
        </span>
      </div>
    </div>
  );
}
