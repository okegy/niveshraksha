"use client";

import { useState } from "react";
import { AlertTriangle, CheckCircle2, HelpCircle, Loader2, Search, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ApiError, api, type VerificationResult } from "@/lib/api";

export default function VerifyPage() {
  const [name, setName] = useState("");
  const [regNo, setRegNo] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<VerificationResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() && !regNo.trim()) return;

    setIsLoading(true);
    setError(null);
    setResult(null);
    try {
      const data = await api.verifyAdvisor({ name: name || undefined, registration_number: regNo || undefined });
      setResult(data);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Verification failed unexpectedly. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-4 sm:p-6">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">Verify an Advisor</h1>
          <p className="text-slate-600 dark:text-slate-400 mt-2">
            Check whether someone claiming to be a registered advisor appears in the official records.
          </p>
        </div>

        <Card className="border-slate-200 dark:border-slate-800 shadow-sm mb-8">
          <form onSubmit={handleVerify}>
            <CardHeader>
              <CardTitle>Advisor details</CardTitle>
              <CardDescription>
                Enter the SEBI registration number or name you were given. A registration number gives the most reliable match.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <Label htmlFor="regNo">SEBI Registration Number (e.g., INA000000000)</Label>
                  <button
                    type="button"
                    onClick={() => setRegNo("INA000000001")}
                    className="text-xs text-teal-700 dark:text-teal-400 underline hover:no-underline"
                  >
                    Try an example
                  </button>
                </div>
                <Input
                  id="regNo"
                  placeholder="INA..."
                  value={regNo}
                  onChange={(e) => setRegNo(e.target.value)}
                  autoComplete="off"
                />
              </div>
              <div className="flex items-center space-x-2" aria-hidden>
                <hr className="flex-1 border-slate-200 dark:border-slate-800" />
                <span className="text-slate-400 text-sm font-medium">OR</span>
                <hr className="flex-1 border-slate-200 dark:border-slate-800" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="name">Name / entity name</Label>
                <Input
                  id="name"
                  placeholder="Enter name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  autoComplete="off"
                />
              </div>
              <Alert className="border-amber-300 dark:border-amber-900 bg-amber-50 dark:bg-amber-950/30">
                <AlertTriangle className="h-4 w-4 text-amber-600" aria-hidden />
                <AlertTitle className="text-sm text-amber-800 dark:text-amber-500">Demo mode</AlertTitle>
                <AlertDescription className="text-xs text-amber-900/80 dark:text-amber-400/90">
                  This checks a clearly-labelled synthetic fixture, not live regulator data. Always confirm on the official SEBI website before deciding.
                </AlertDescription>
              </Alert>
            </CardContent>
            <CardFooter>
              <Button
                type="submit"
                disabled={(!name.trim() && !regNo.trim()) || isLoading}
                className="w-full bg-teal-600 hover:bg-teal-700 text-white min-h-[48px]"
              >
                {isLoading ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden /> Checking records...</>
                ) : (
                  <><Search className="mr-2 h-4 w-4" aria-hidden /> Verify credentials</>
                )}
              </Button>
            </CardFooter>
          </form>
        </Card>

        {error && (
          <Alert variant="destructive" role="alert" className="mb-4">
            <AlertTriangle className="h-5 w-5" aria-hidden />
            <AlertTitle>Verification unavailable</AlertTitle>
            <AlertDescription className="mt-2">{error}</AlertDescription>
          </Alert>
        )}

        {result && !isLoading && (
          <div className="space-y-4" aria-live="polite">
            {result.status === "verified" ? (
              <Alert className="border-teal-600/50 bg-teal-50 dark:bg-teal-950/20">
                <CheckCircle2 className="h-5 w-5 text-teal-600" aria-hidden />
                <AlertTitle className="text-lg font-semibold text-teal-700 dark:text-teal-400">
                  Match found
                </AlertTitle>
                <AlertDescription className="mt-2 text-slate-700 dark:text-slate-300">
                  {result.matched_name && <p className="font-medium">Matched record: {result.matched_name}</p>}
                  <p className="mt-1">Match quality: {result.match_quality}</p>
                  <div className="mt-4 text-xs space-y-1 text-slate-500 dark:text-slate-400">
                    <p>
                      Source:{" "}
                      <a href={result.source_url} target="_blank" rel="noopener noreferrer" className="underline inline-flex items-center gap-1">
                        {result.source_name} <ExternalLink className="h-3 w-3" aria-hidden />
                      </a>
                    </p>
                    <p>Last checked: {new Date(result.retrieved_at).toLocaleString()}</p>
                  </div>
                </AlertDescription>
              </Alert>
            ) : (
              <Alert className="border-amber-600/50 bg-amber-50 dark:bg-amber-950/20">
                <HelpCircle className="h-5 w-5 text-amber-600" aria-hidden />
                <AlertTitle className="text-lg font-semibold text-amber-800 dark:text-amber-500">
                  Could not verify
                </AlertTitle>
                <AlertDescription className="mt-2 text-slate-700 dark:text-slate-300">
                  We could not find this entity in the records we searched.
                  <span className="block mt-3 font-semibold text-amber-900 dark:text-amber-400">
                    Important: &ldquo;not found&rdquo; is not proof of fraud — and it is not proof of legitimacy either.
                  </span>
                  Anyone giving investment advice for money must be SEBI-registered. Do not send money or share documents until you have verified their registration yourself on the official SEBI website.
                  <div className="mt-4 text-xs space-y-1 text-slate-500 dark:text-slate-400">
                    <p>
                      Source searched:{" "}
                      <a href={result.source_url} target="_blank" rel="noopener noreferrer" className="underline inline-flex items-center gap-1">
                        {result.source_name} <ExternalLink className="h-3 w-3" aria-hidden />
                      </a>
                    </p>
                    <p>Last checked: {new Date(result.retrieved_at).toLocaleString()}</p>
                  </div>
                </AlertDescription>
              </Alert>
            )}

            <Alert className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
              <AlertTriangle className="h-4 w-4 text-slate-500" aria-hidden />
              <AlertTitle className="text-sm">Uncertainty we must state honestly</AlertTitle>
              <AlertDescription className="text-xs text-slate-600 dark:text-slate-400">
                {result.uncertainty_note}
              </AlertDescription>
            </Alert>

            <a
              href="https://www.sebi.gov.in/sebiweb/other/OtherAction.do?doRecognisedFpi=yes&intmId=13"
              target="_blank"
              rel="noopener noreferrer"
              className="block"
            >
              <Button variant="outline" className="w-full min-h-[48px] border-teal-600 text-teal-700 hover:bg-teal-50 dark:text-teal-400">
                <ExternalLink className="mr-2 h-4 w-4" aria-hidden />
                Open the official SEBI intermediaries search
              </Button>
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
