"use client";

import { useCallback, useSyncExternalStore } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLanguage, type DictKey } from "@/lib/i18n";
import { cn } from "@/lib/utils";

const NAV_ITEMS: { href: string; key: DictKey }[] = [
  { href: "/analyze", key: "nav_analyze" },
  { href: "/verify", key: "nav_verify" },
  { href: "/pause", key: "nav_pause" },
  { href: "/learn", key: "nav_learn" },
  { href: "/report", key: "nav_report" },
  { href: "/about", key: "nav_about" },
];

// ---------------------------------------------------------------------------
// Accessibility preferences (large text / reduced motion) as an external
// localStorage store, mirrored through useSyncExternalStore — SSR-safe.
// ---------------------------------------------------------------------------

type A11yPrefs = { largeText: boolean; reducedMotion: boolean };
const A11Y_KEY = "nr_a11y";
const a11yListeners = new Set<() => void>();

// useSyncExternalStore requires a stable snapshot: returning a fresh object
// per call triggers an infinite re-render loop in the browser.
let cachedA11y: A11yPrefs = { largeText: false, reducedMotion: false };

function readA11y(): A11yPrefs {
  try {
    const raw = window.localStorage.getItem(A11Y_KEY);
    if (raw) {
      const parsed = { largeText: false, reducedMotion: false, ...JSON.parse(raw) };
      if (
        parsed.largeText !== cachedA11y.largeText ||
        parsed.reducedMotion !== cachedA11y.reducedMotion
      ) {
        cachedA11y = parsed;
      }
    }
  } catch {
    /* malformed — keep current cache */
  }
  return cachedA11y;
}

function writeA11y(prefs: A11yPrefs) {
  cachedA11y = prefs;
  window.localStorage.setItem(A11Y_KEY, JSON.stringify(prefs));
  a11yListeners.forEach((notify) => notify());
}

function subscribeA11y(listener: () => void) {
  a11yListeners.add(listener);
  return () => a11yListeners.delete(listener);
}

const SERVER_A11Y: A11yPrefs = { largeText: false, reducedMotion: false };

function useA11y() {
  return useSyncExternalStore(subscribeA11y, readA11y, () => SERVER_A11Y);
}

export function SiteHeader() {
  const { language, setLanguage, t } = useLanguage();
  const pathname = usePathname();
  const a11y = useA11y();

  const toggleLargeText = useCallback(() => {
    const current = readA11y();
    writeA11y({ ...current, largeText: !current.largeText });
  }, []);

  const toggleReducedMotion = useCallback(() => {
    const current = readA11y();
    writeA11y({ ...current, reducedMotion: !current.reducedMotion });
  }, []);

  const rootClass = cn(
    a11y.largeText && "text-[1.15rem]",
    a11y.reducedMotion && "[&_*]:!animate-none [&_*]:!transition-none",
  );

  return (
    <div className={rootClass}>
      <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-3">
          <Link href="/" className="text-xl sm:text-2xl font-bold text-teal-700 dark:text-teal-400">
            NiveshRaksha
          </Link>

          <div className="flex flex-wrap items-center gap-2">
            <nav aria-label="Main" className="flex flex-wrap items-center gap-1 text-sm">
              {NAV_ITEMS.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "px-3 py-2 rounded-md min-h-[40px] flex items-center transition-colors",
                    pathname === item.href
                      ? "bg-teal-50 dark:bg-slate-800 text-teal-800 dark:text-teal-300 font-medium"
                      : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800",
                  )}
                >
                  {t(item.key)}
                </Link>
              ))}
            </nav>

            <label className="sr-only" htmlFor="lang-select">
              {t("language_label")}
            </label>
            <select
              id="lang-select"
              value={language}
              onChange={(e) => setLanguage(e.target.value as typeof language)}
              className="h-[40px] rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-2 text-sm text-slate-700 dark:text-slate-200 focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-teal-500/50 outline-none"
            >
              <option value="en">English</option>
              <option value="ta">தமிழ்</option>
              <option value="hi">हिंदी</option>
              <option value="te">తెలుగు</option>
              <option value="ml">മലയാളം</option>
              <option value="kn">ಕನ್ನಡ</option>
            </select>

            <div className="hidden md:flex items-center rounded-md border border-slate-200 dark:border-slate-700" role="group" aria-label="Accessibility">
              <button
                type="button"
                onClick={toggleLargeText}
                aria-pressed={a11y.largeText}
                title="Large text mode"
                className={cn(
                  "px-3 py-2 h-[40px] text-sm font-semibold",
                  a11y.largeText
                    ? "bg-teal-600 text-white"
                    : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800",
                )}
              >
                A+
              </button>
              <button
                type="button"
                onClick={toggleReducedMotion}
                aria-pressed={a11y.reducedMotion}
                title="Reduce motion"
                className={cn(
                  "px-3 py-2 h-[40px] text-sm",
                  a11y.reducedMotion
                    ? "bg-teal-600 text-white"
                    : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800",
                )}
              >
                <span aria-hidden>◧</span>
                <span className="sr-only">Reduce motion</span>
              </button>
            </div>
          </div>
        </div>
      </header>
    </div>
  );
}
