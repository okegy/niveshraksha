"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/lib/i18n";

export default function Home() {
  const { t } = useLanguage();

  return (
    <div className="flex flex-col items-center p-6 text-center">
      <h2 className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl text-slate-900 dark:text-slate-100 mb-6">
        {t("landing_title")}
      </h2>
      <p className="mt-4 text-lg sm:text-xl text-slate-600 dark:text-slate-400 max-w-2xl mb-12">
        {t("landing_sub")}
      </p>

      <div className="grid gap-6 sm:grid-cols-2 max-w-3xl w-full">
        <div className="bg-white dark:bg-slate-900 rounded-xl shadow-md p-8 border hover:shadow-lg transition">
          <h3 className="text-2xl font-semibold mb-3">{t("card_analyze_title")}</h3>
          <p className="text-slate-600 dark:text-slate-400 mb-6 min-h-[60px]">{t("card_analyze_body")}</p>
          <Link href="/analyze" className="block">
            <Button className="w-full bg-teal-600 hover:bg-teal-700 text-white py-6 text-lg rounded-lg">
              {t("analyze_now")}
            </Button>
          </Link>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-xl shadow-md p-8 border hover:shadow-lg transition">
          <h3 className="text-2xl font-semibold mb-3">{t("card_verify_title")}</h3>
          <p className="text-slate-600 dark:text-slate-400 mb-6 min-h-[60px]">{t("card_verify_body")}</p>
          <Link href="/verify" className="block">
            <Button
              variant="outline"
              className="w-full py-6 text-lg rounded-lg border-teal-600 text-teal-700 hover:bg-teal-50 dark:border-teal-400 dark:text-teal-400 dark:hover:bg-slate-800"
            >
              {t("verify_now")}
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3 max-w-3xl w-full mt-8 text-sm">
        <Link href="/pause" className="bg-white dark:bg-slate-900 rounded-lg border p-4 hover:shadow transition text-slate-700 dark:text-slate-300">
          Feeling pressured? Take the 30-second pause →
        </Link>
        <Link href="/report" className="bg-white dark:bg-slate-900 rounded-lg border p-4 hover:shadow transition text-slate-700 dark:text-slate-300">
          Prepare an evidence draft for reporting →
        </Link>
        <Link href="/learn" className="bg-white dark:bg-slate-900 rounded-lg border p-4 hover:shadow transition text-slate-700 dark:text-slate-300">
          Learn the warning signs (English/தமிழ்) →
        </Link>
      </div>

      <div className="mt-12 bg-amber-50 border border-amber-200 dark:bg-amber-950/30 dark:border-amber-900 p-6 rounded-lg max-w-3xl text-left">
        <h4 className="font-semibold text-amber-800 dark:text-amber-500 mb-2">{t("disclaimer_title")}</h4>
        <p className="text-amber-900/80 dark:text-amber-400/80 text-sm">{t("disclaimer_body")}</p>
      </div>
    </div>
  );
}
