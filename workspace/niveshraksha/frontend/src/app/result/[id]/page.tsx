"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, AlertTriangle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ResultView } from "@/components/result-view";
import { ApiError, api, type AnalysisResult } from "@/lib/api";

export default function ResultPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    api
      .getAnalysis(id)
      .then((data) => {
        if (!cancelled) setResult(data);
      })
      .catch((e) => {
        if (!cancelled) setError(e instanceof ApiError ? e.message : "Could not load this result.");
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-4 sm:p-6">
      <div className="max-w-3xl mx-auto">
        <Link href="/analyze">
          <Button variant="ghost" className="mb-6 -ml-4 text-slate-500 hover:text-slate-900">
            <ArrowLeft className="mr-2 h-4 w-4" aria-hidden /> New check
          </Button>
        </Link>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">Analysis Result</h1>
          <p className="text-slate-500 text-sm mt-2">Result ID: {id}</p>
        </div>

        {isLoading && (
          <Card className="flex flex-col items-center justify-center text-center p-8">
            <Loader2 className="h-10 w-10 animate-spin text-teal-600 mb-4" aria-hidden />
            <p className="text-slate-600 dark:text-slate-300">Loading result...</p>
          </Card>
        )}

        {error && (
          <Alert variant="destructive" role="alert">
            <AlertTriangle className="h-5 w-5" aria-hidden />
            <AlertTitle>Result unavailable</AlertTitle>
            <AlertDescription className="mt-2">
              {error} Results are kept only for a short retention window and then permanently deleted — this is a privacy feature, not a malfunction.
            </AlertDescription>
          </Alert>
        )}

        {result && <ResultView result={result} />}
      </div>
    </div>
  );
}
