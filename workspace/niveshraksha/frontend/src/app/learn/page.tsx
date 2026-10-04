"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  BookOpen,
  CheckCircle,
  ExternalLink,
  FileText,
  Landmark,
  Loader2,
  MessageSquareWarning,
  Scale,
  UserCheck,
  WifiOff,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { api, type EducationModule } from "@/lib/api";
import { useLanguage } from "@/lib/i18n";

const MODULE_ICONS = [MessageSquareWarning, UserCheck, Landmark, Scale, FileText, BookOpen, AlertTriangle];

const OFFLINE_FALLBACK: Record<string, EducationModule[]> = {
  en: [
    {
      id: "offline-1",
      title: "Scam Warning Signs (offline copy)",
      description: "Core rules that work without internet.",
      content: [
        "Guaranteed returns: No genuine investment guarantees high returns.",
        "Urgency: 'Act now' or 'Limited slots' is a pressure tactic.",
        "Never share OTPs, UPI PINs, or passwords — with anyone.",
      ],
      source_ids: [],
    },
  ],
  ta: [
    {
      id: "offline-1",
      title: "மோசடி எச்சரிக்கை அறிகுறிகள் (ஆஃப்லைன் நகல்)",
      description: "இணையம் இல்லாதபோதும் பயன்படும் அடிப்படை விதிகள்.",
      content: [
        "உத்தரவாதமான வருமானம்: எந்த உண்மையான முதலீடும் அதிக வருமானத்தை உத்தரவாதம் செய்யாது.",
        "அவசரம்: 'இப்போதே செயல்படுங்கள்' என்பது ஒரு அழுத்த தந்திரம்.",
        "OTP, UPI PIN, கடவுச்சொற்களை யாருடனும் பகிர வேண்டாம்.",
      ],
      source_ids: [],
    },
  ],
};

const PROGRESS_KEY = "nr_learn_progress";

export default function LearnPage() {
  const { language } = useLanguage();
  const [modules, setModules] = useState<EducationModule[]>([]);
  const [offline, setOffline] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [completed, setCompleted] = useState<Record<string, boolean>>({});

  useEffect(() => {
    // Reading device-local progress once on mount is a legitimate external
    // sync; React can't observe localStorage without an effect.
    try {
      const raw = window.localStorage.getItem(PROGRESS_KEY);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (raw) setCompleted(JSON.parse(raw));
    } catch {
      /* ignore malformed progress */
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    // The loading indicator must reset synchronously when language changes.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsLoading(true);
    api
      .getEducationModules(language)
      .then((d) => {
        if (!cancelled) {
          setModules(d.modules);
          setOffline(false);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setModules(OFFLINE_FALLBACK[language] ?? OFFLINE_FALLBACK.en);
          setOffline(true);
        }
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [language]);

  const toggleComplete = useCallback((id: string) => {
    setCompleted((prev) => {
      const next = { ...prev, [id]: !prev[id] };
      try {
        window.localStorage.setItem(PROGRESS_KEY, JSON.stringify(next));
      } catch {
        /* storage unavailable — progress just won't persist */
      }
      return next;
    });
  }, []);

  const doneCount = modules.filter((m) => completed[m.id]).length;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-4 sm:p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 flex items-center">
              <BookOpen className="mr-3 h-8 w-8 text-teal-600" aria-hidden />
              Education Hub
            </h1>
            <p className="text-slate-600 dark:text-slate-400 mt-2">
              Short, plain-language lessons to keep your money safe. Educational content only — never investment advice.
            </p>
            {modules.length > 0 && (
              <p className="text-sm text-teal-700 dark:text-teal-400 mt-2" aria-live="polite">
                Progress: {doneCount} of {modules.length} modules completed
              </p>
            )}
          </div>
          <Link href="/pause">
            <Button variant="outline" className="border-amber-500 text-amber-700 hover:bg-amber-50 dark:border-amber-700 dark:text-amber-500 dark:hover:bg-amber-950">
              Take the 30-second pause
            </Button>
          </Link>
        </div>

        {offline && (
          <div className="mb-6 flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 dark:bg-amber-950/30 dark:border-amber-900 p-4 text-sm text-amber-900 dark:text-amber-400">
            <WifiOff className="h-4 w-4 mt-0.5 shrink-0" aria-hidden />
            <span>Offline mode: showing a built-in copy of the most important lesson. Full lessons return when the service is reachable.</span>
          </div>
        )}

        {isLoading ? (
          <Card className="flex flex-col items-center justify-center text-center p-8">
            <Loader2 className="h-10 w-10 animate-spin text-teal-600 mb-4" aria-hidden />
            <p className="text-slate-600 dark:text-slate-300">Loading lessons...</p>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            {modules.map((mod, idx) => {
              const Icon = MODULE_ICONS[idx % MODULE_ICONS.length];
              const isDone = !!completed[mod.id];
              return (
                <Card
                  key={mod.id}
                  className={`shadow-sm border-2 ${isDone ? "border-teal-300 dark:border-teal-800 bg-teal-50/40 dark:bg-teal-950/10" : "border-slate-200 dark:border-slate-800"}`}
                >
                  <CardHeader className="pb-2">
                    <div className="mb-2 bg-white dark:bg-slate-800 w-12 h-12 rounded-full flex items-center justify-center shadow-sm">
                      <Icon className="h-6 w-6 text-teal-600 dark:text-teal-400" aria-hidden />
                    </div>
                    <CardTitle className="text-xl">{mod.title}</CardTitle>
                    <CardDescription className="text-slate-700 dark:text-slate-300 font-medium">
                      {mod.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="mt-2 space-y-3">
                      {mod.content.map((point, i) => (
                        <li key={i} className="flex items-start text-sm text-slate-600 dark:text-slate-400">
                          <span className="mr-2 mt-0.5">•</span>
                          <span>{point}</span>
                        </li>
                      ))}
                    </ul>
                    <label className="mt-4 flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isDone}
                        onChange={() => toggleComplete(mod.id)}
                        className="size-4 accent-teal-600"
                        aria-label={`Mark "${mod.title}" as completed`}
                      />
                      I&apos;ve read this
                      <span className="text-xs text-slate-400">(stored on this device only)</span>
                    </label>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        <div className="mt-12 bg-white dark:bg-slate-900 rounded-xl p-8 border shadow-sm text-center">
          <h2 className="text-2xl font-bold mb-4">Are you a victim of financial fraud?</h2>
          <p className="text-slate-600 dark:text-slate-400 mb-6 max-w-2xl mx-auto">
            Report it immediately. The golden hour matters — money moved to fraudsters can sometimes be intercepted if reported fast.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="https://cybercrime.gov.in/" target="_blank" rel="noopener noreferrer">
              <Button className="w-full sm:w-auto bg-slate-900 text-white hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-200">
                Visit cybercrime.gov.in <ExternalLink className="ml-2 h-4 w-4" aria-hidden />
              </Button>
            </a>
            <a href="tel:1930">
              <Button variant="outline" className="w-full sm:w-auto min-h-[48px]">
                Call helpline 1930
              </Button>
            </a>
            <Link href="/report">
              <Button variant="outline" className="w-full sm:w-auto min-h-[48px] border-teal-600 text-teal-700 dark:text-teal-400">
                <CheckCircle className="mr-2 h-4 w-4" aria-hidden /> Prepare evidence draft
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
