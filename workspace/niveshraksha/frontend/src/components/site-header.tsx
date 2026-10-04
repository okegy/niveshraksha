"use client";

import { useCallback, useEffect, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, Moon, X } from "lucide-react";
import { useLanguage, type DictKey } from "@/lib/i18n";
import { applyPalette, useSettings } from "@/lib/settings";
import { cn } from "@/lib/utils";

const NAV_ITEMS: { href: string; key: DictKey | string; label?: string }[] = [
  { href: "/analyze", key: "nav_analyze" },
  { href: "/verify", key: "nav_verify" },
  { href: "/chat", key: "nav_chat", label: "Raksha Guide" },
  { href: "/pause", key: "nav_pause" },
  { href: "/learn", key: "nav_learn" },
  { href: "/report", key: "nav_report" },
  { href: "/settings", key: "settings", label: "Settings" },
  { href: "/about", key: "nav_about" },
];

// ---------------------------------------------------------------------------
// Accessibility + appearance preferences (large text / reduced motion / dark)
// as an external localStorage store mirrored through useSyncExternalStore —
// SSR-safe with a cached snapshot.
// ---------------------------------------------------------------------------

type A11yPrefs = { largeText: boolean; reducedMotion: boolean; darkMode: boolean };
const A11Y_KEY = "nr_a11y";
const a11yListeners = new Set<() => void>();

let cachedA11y: A11yPrefs = { largeText: false, reducedMotion: false, darkMode: false };

function readA11y(): A11yPrefs {
  try {
    const raw = window.localStorage.getItem(A11Y_KEY);
    if (raw) {
      const parsed = { largeText: false, reducedMotion: false, darkMode: false, ...JSON.parse(raw) };
      if (
        parsed.largeText !== cachedA11y.largeText ||
        parsed.reducedMotion !== cachedA11y.reducedMotion ||
        parsed.darkMode !== cachedA11y.darkMode
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

const SERVER_A11Y: A11yPrefs = { largeText: false, reducedMotion: false, darkMode: false };

function useA11y() {
  return useSyncExternalStore(subscribeA11y, readA11y, () => SERVER_A11Y);
}

// Route matching: subroutes like /result/[id] must highlight their parent;
// "/" matches only exactly.
function isActive(pathname: string, href: string) {
  return href === "/" ? pathname === "/" : pathname.startsWith(href);
}

export function SiteHeader() {
  const { language, setLanguage, t } = useLanguage();
  const pathname = usePathname();
  const a11y = useA11y();
  const [settings] = useSettings();
  const [menuOpen, setMenuOpen] = useState(false);

  // Apply the user's palette site-wide on every change (and on mount).
  useEffect(() => {
    applyPalette(settings.palette);
  }, [settings.palette]);

  const toggleLargeText = useCallback(() => {
    const current = readA11y();
    writeA11y({ ...current, largeText: !current.largeText });
  }, []);

  const toggleReducedMotion = useCallback(() => {
    const current = readA11y();
    writeA11y({ ...current, reducedMotion: !current.reducedMotion });
  }, []);

  const toggleDarkMode = useCallback(() => {
    const current = readA11y();
    writeA11y({ ...current, darkMode: !current.darkMode });
  }, []);

  // Sync the .dark class to <html> whenever the preference changes (and on mount).
  useEffect(() => {
    document.documentElement.classList.toggle("dark", a11y.darkMode);
  }, [a11y.darkMode]);

  const rootClass = cn(
    a11y.largeText && "text-[1.15rem]",
    a11y.reducedMotion && "[&_*]:!animate-none [&_*]:!transition-none",
  );

  const navLink = (item: (typeof NAV_ITEMS)[number], onNavigate?: () => void) => (
    <Link
      key={item.href}
      href={item.href}
      onClick={onNavigate}
      className={cn(
        "px-3 py-2 rounded-md min-h-[40px] flex items-center transition-colors",
        isActive(pathname, item.href)
          ? "bg-teal-50 dark:bg-slate-800 text-teal-800 dark:text-teal-300 font-medium"
          : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800",
      )}
    >
      {item.label ?? t(item.key as DictKey)}
    </Link>
  );

  return (
    <div className={rootClass}>
      <header className="bg-white/90 dark:bg-slate-900/90 backdrop-blur border-b border-slate-200 dark:border-slate-800 shadow-sm sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-3">
          <Link href="/" className="text-xl sm:text-2xl font-bold text-teal-700 dark:text-teal-400">
            NiveshRaksha
          </Link>

          <div className="hidden lg:flex items-center gap-2">
            <nav aria-label="Main" className="flex items-center gap-1 text-sm">
              {NAV_ITEMS.map((item) => navLink(item))}
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
              <option value="bn">বাংলা</option>
              <option value="mr">मराठी</option>
              <option value="gu">ગુજરાતી</option>
              <option value="or">ଓଡ଼ିଆ</option>
              <option value="pa">ਪੰਜਾਬੀ</option>
              <option value="as">অসমীয়া</option>
            </select>

            <div
              className="flex items-center rounded-md border border-slate-200 dark:border-slate-700"
              role="group"
              aria-label="Appearance and accessibility"
            >
              <button
                type="button"
                onClick={toggleDarkMode}
                aria-pressed={a11y.darkMode}
                title="Toggle dark mode"
                className={cn(
                  "px-2.5 py-2 h-[40px]",
                  a11y.darkMode
                    ? "bg-teal-600 text-white"
                    : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800",
                )}
              >
                <Moon className="h-4 w-4" aria-hidden />
                <span className="sr-only">Toggle dark mode</span>
              </button>
              <button
                type="button"
                onClick={toggleLargeText}
                aria-pressed={a11y.largeText}
                title="Large text mode"
                className={cn(
                  "px-2.5 py-2 h-[40px] text-sm font-semibold border-l border-slate-200 dark:border-slate-700",
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
                  "px-2.5 py-2 h-[40px] border-l border-slate-200 dark:border-slate-700",
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

          {/* Mobile: hamburger */}
          <button
            type="button"
            className="lg:hidden p-2 rounded-md text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
            aria-expanded={menuOpen}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            onClick={() => setMenuOpen((v) => !v)}
          >
            {menuOpen ? <X className="h-6 w-6" aria-hidden /> : <Menu className="h-6 w-6" aria-hidden />}
          </button>
        </div>

        {menuOpen && (
          <nav
            aria-label="Main mobile"
            className="lg:hidden border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-3 flex flex-col gap-1"
          >
            {NAV_ITEMS.map((item) => navLink(item, () => setMenuOpen(false)))}
            <div className="flex items-center gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
              <select
                aria-label={t("language_label")}
                value={language}
                onChange={(e) => setLanguage(e.target.value as typeof language)}
                className="h-[40px] rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-2 text-sm flex-1"
              >
                <option value="en">English</option>
                <option value="ta">தமிழ்</option>
                <option value="hi">हिंदी</option>
                <option value="te">తెలుగు</option>
                <option value="ml">മലയാളം</option>
                <option value="kn">ಕನ್ನಡ</option>
                <option value="bn">বাংলা</option>
                <option value="mr">मराठी</option>
                <option value="gu">ગુજરાતી</option>
                <option value="or">ଓଡ଼ିଆ</option>
                <option value="pa">ਪੰਜਾਬੀ</option>
                <option value="as">অসমীয়া</option>
              </select>
              <button
                type="button"
                onClick={toggleDarkMode}
                aria-pressed={a11y.darkMode}
                className={cn(
                  "px-3 py-2 h-[40px] rounded-md border text-sm",
                  a11y.darkMode
                    ? "bg-teal-600 text-white border-teal-600"
                    : "border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300",
                )}
              >
                <Moon className="h-4 w-4 inline mr-1" aria-hidden /> Dark
              </button>
              <button
                type="button"
                onClick={toggleLargeText}
                aria-pressed={a11y.largeText}
                className={cn(
                  "px-3 py-2 h-[40px] rounded-md border text-sm font-semibold",
                  a11y.largeText
                    ? "bg-teal-600 text-white border-teal-600"
                    : "border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300",
                )}
              >
                A+
              </button>
            </div>
          </nav>
        )}
      </header>

      {/* Demo-mode honesty banner */}
      <div className="bg-amber-100/90 dark:bg-amber-950/40 border-b border-amber-300 dark:border-amber-900 text-amber-900 dark:text-amber-400 text-xs px-4 py-1.5 text-center">
        🔬 Demo mode — advisor data is a synthetic fixture. No live regulator API. Verify on sebi.gov.in before any decision.
      </div>
    </div>
  );
}
