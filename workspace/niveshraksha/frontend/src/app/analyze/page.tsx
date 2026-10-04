"use client";

import { useState } from "react";
import { AlertTriangle, EyeOff, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ShieldCheck } from "lucide-react";
import { ResultView } from "@/components/result-view";
import { VoiceDictation } from "@/components/voice-dictation";
import { ApiError, api, type AnalysisResult } from "@/lib/api";
import { useLanguage } from "@/lib/i18n";

const EXAMPLE_SCAM =
  "Congratulations! You are selected for our exclusive investment group. Guaranteed 40% monthly return. Only 3 slots left — invest today. Send the amount to my GPay and share the OTP to confirm registration.";

const EXAMPLE_URL = "http://sebi.kyc-update.xyz/verify-account";

export default function AnalyzePage() {
  const { language } = useLanguage();
  const [message, setMessage] = useState("");
  const [url, setUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const runAnalysis = async (kind: "message" | "url") => {
    setError(null);
    setResult(null);
    setIsLoading(true);
    try {
      const data =
        kind === "message"
          ? await api.analyzeMessage(message, language)
          : await api.analyzeUrl(url, language);
      setResult(data);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Analysis failed unexpectedly. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-4 sm:p-6">
      <div className="max-w-5xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">Check a Message or Link</h1>
          <p className="text-slate-600 dark:text-slate-400 mt-2">
            Paste suspicious messages or URLs to check for common scam warning signs.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-2">
          {/* Input Section */}
          <Card className="border-slate-200 dark:border-slate-800 shadow-sm self-start">
            <CardHeader>
              <CardTitle>Input</CardTitle>
              <CardDescription>We respect your privacy. Nothing is required from you except the text you choose to check — and identifiers like phone numbers or PAN get redacted before anything is stored.</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="text" className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-4">
                  <TabsTrigger value="text" className="min-h-[40px]">Message Text</TabsTrigger>
                  <TabsTrigger value="url" className="min-h-[40px]">URL</TabsTrigger>
                </TabsList>

                <TabsContent value="text">
                  <Textarea
                    id="message-input"
                    aria-label="Message to analyze"
                    placeholder="Paste the WhatsApp or Telegram message here..."
                    className="min-h-[200px] resize-none"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                  />
                  <div className="mt-4 flex flex-wrap items-start gap-3">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setMessage(EXAMPLE_SCAM)}
                      aria-label="Load a synthetic example scam message"
                    >
                      Load example (synthetic)
                    </Button>
                    <VoiceDictation
                      targetId="message-input"
                      onTranscript={(text) =>
                        setMessage((prev) => (prev ? `${prev} ${text}` : text))
                      }
                    />
                  </div>
                </TabsContent>

                <TabsContent value="url">
                  <Textarea
                    aria-label="URL to analyze"
                    placeholder="Paste the suspicious link here..."
                    className="min-h-[200px] resize-none"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                  />
                  <div className="mt-4 flex items-start gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setUrl(EXAMPLE_URL)}
                      aria-label="Load a synthetic example suspicious URL"
                    >
                      Load example (synthetic)
                    </Button>
                    <p className="text-xs text-slate-500 dark:text-slate-400 flex-1">
                      The link is checked by static pattern review only. We do not open the page.
                    </p>
                  </div>
                </TabsContent>
              </Tabs>

              <Alert className="mt-4 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                <EyeOff className="h-4 w-4 text-slate-500" aria-hidden />
                <AlertTitle className="text-sm">Privacy notice</AlertTitle>
                <AlertDescription className="text-xs text-slate-600 dark:text-slate-400">
                  Remove anything extra you don&apos;t want to share. Avoid pasting full bank statements or documents.
                </AlertDescription>
              </Alert>
            </CardContent>
            <CardFooter className="flex-col gap-2">
              <Button
                onClick={() => runAnalysis("message")}
                disabled={!message.trim() || isLoading}
                className="w-full bg-teal-600 hover:bg-teal-700 text-white min-h-[48px]"
              >
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden /> : null}
                Analyze Message
              </Button>
              <Button
                onClick={() => runAnalysis("url")}
                disabled={!url.trim() || isLoading}
                variant="outline"
                className="w-full min-h-[48px] border-teal-600 text-teal-700 hover:bg-teal-50 dark:text-teal-400"
              >
                Check URL
              </Button>
            </CardFooter>
          </Card>

          {/* Results Section */}
          <div className="flex flex-col space-y-4">
            {!result && !isLoading && !error && (
              <Card className="h-full flex flex-col items-center justify-center text-center p-8 bg-slate-50/50 dark:bg-slate-900/50 border-dashed">
                <ShieldCheck className="h-12 w-12 text-slate-300 mb-4" aria-hidden />
                <h3 className="text-lg font-medium text-slate-700 dark:text-slate-300">Awaiting input</h3>
                <p className="text-slate-500 text-sm mt-2 max-w-xs">
                  Your analysis results will appear here. The check looks for known fraud indicators using deterministic rules.
                </p>
              </Card>
            )}

            {isLoading && (
              <Card className="h-full flex flex-col items-center justify-center text-center p-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mb-4" role="status" aria-label="Analyzing" />
                <h3 className="text-lg font-medium">Checking for warning signs...</h3>
                <p className="text-sm text-slate-500 mt-2">This runs deterministic rules — it never contacts official sources on your behalf.</p>
              </Card>
            )}

            {error && (
              <Alert variant="destructive" role="alert">
                <AlertTriangle className="h-5 w-5" aria-hidden />
                <AlertTitle>Something went wrong</AlertTitle>
                <AlertDescription className="mt-2">{error}</AlertDescription>
              </Alert>
            )}

            {result && !isLoading && <ResultView result={result} />}
          </div>
        </div>
      </div>
    </div>
  );
}
