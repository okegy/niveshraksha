// Typed API client for the NiveshRaksha backend.
// The base URL comes from NEXT_PUBLIC_API_BASE_URL so no secret or absolute
// localhost reference ever ships inside component code.

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000";

export type RiskLevel = "high" | "review_carefully" | "no_obvious_red_flags";

export interface RedFlag {
  code: string;
  label: string;
  explanation: string;
  matched_text: string;
  severity: "high" | "medium" | "low";
}

export interface VerifiedSource {
  source_name: string;
  source_url: string;
  status: string;
  retrieved_at: string | null;
}

export interface AnalysisResult {
  analysis_id: string;
  risk_level: RiskLevel;
  summary: string;
  red_flags: RedFlag[];
  what_we_verified?: VerifiedSource[];
  safe_next_steps: string[];
  limitations: string[];
  created_at: string;
  input_type?: "message" | "url";
  note?: string;
  detected_language?: string;
}

export interface VerificationResult {
  status: "verified" | "not_found" | "unavailable";
  source_name: string;
  source_url: string;
  retrieved_at: string;
  match_quality: string;
  matched_name: string | null;
  uncertainty_note: string;
}

export interface IncidentDraft {
  draft_id: string;
  redacted_content: string;
  notes: string | null;
  created_at: string;
  expires_at: string;
  retention_note?: string;
}

export interface ReportingRoute {
  name: string;
  url: string;
  use: string;
}

export interface EducationModule {
  id: string;
  title: string;
  description: string;
  content: string[];
  source_ids: string[];
}

export interface SourceStatusItem {
  source_name: string;
  source_url: string;
  status: string;
  mode: string;
  last_checked: string | null;
}

export interface ChatCitation {
  document_id: string;
  source_name: string;
  source_url: string;
  retrieved_at: string;
  freshness: string;
  title: string;
}

export interface ChatReply {
  reply: string;
  refused: boolean;
  refusal_kind: string | null;
  citations: ChatCitation[];
  uncertainty: string;
  retrieval: { method: string; score: number | null };
  latency_ms: number;
}

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${API_BASE_URL}${path}`, {
      headers: { "Content-Type": "application/json" },
      ...init,
    });
  } catch {
    // Network-level failure (backend down, offline). Safe, honest message.
    throw new ApiError(
      "Could not reach the NiveshRaksha service. Check your connection and make sure the backend is running.",
      0,
    );
  }
  if (!res.ok) {
    let detail = `Request failed (${res.status})`;
    try {
      const body = await res.json();
      if (body?.detail) detail = typeof body.detail === "string" ? body.detail : detail;
    } catch {
      /* non-JSON error body — keep generic message */
    }
    throw new ApiError(detail, res.status);
  }
  return res.json() as Promise<T>;
}

export const api = {
  analyzeMessage: (content: string, language: string) =>
    request<AnalysisResult>("/api/v1/analyze/message", {
      method: "POST",
      body: JSON.stringify({ content, language }),
    }),

  analyzeUrl: (url: string, language: string) =>
    request<AnalysisResult>("/api/v1/analyze/url", {
      method: "POST",
      body: JSON.stringify({ url, language }),
    }),

  getAnalysis: (id: string) => request<AnalysisResult>(`/api/v1/analyze/${id}`),

  verifyAdvisor: (payload: { name?: string; registration_number?: string; firm_name?: string }) =>
    request<VerificationResult>("/api/v1/verify/advisor", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  createDraft: (payload: {
    user_session_id: string;
    content: string;
    notes?: string;
    consent_storage: boolean;
  }) =>
    request<IncidentDraft>("/api/v1/reports/draft", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  listDrafts: (userSessionId: string) =>
    request<{ drafts: IncidentDraft[]; reporting_routes: ReportingRoute[] }>(
      `/api/v1/reports/draft?user_session_id=${encodeURIComponent(userSessionId)}`,
    ),

  deleteDraft: (draftId: string, userSessionId: string) =>
    request<{ deleted: boolean }>(
      `/api/v1/reports/draft/${draftId}?user_session_id=${encodeURIComponent(userSessionId)}`,
      { method: "DELETE" },
    ),

  getReportingRoutes: () => request<{ routes: ReportingRoute[] }>("/api/v1/reports/routes"),

  getEducationModules: (language: string) =>
    request<{ language: string; modules: EducationModule[]; note: string }>(
      `/api/v1/education/modules?language=${encodeURIComponent(language)}`,
    ),

  getSourceStatus: () =>
    request<{ sources: SourceStatusItem[]; policy: string }>("/api/v1/sources/status"),

  redactPreview: (content: string) =>
    request<{ redacted_content: string; note: string }>("/api/v1/reports/preview", {
      method: "POST",
      body: JSON.stringify({ content }),
    }),

  chatMessage: (
    payload: { message: string; language: string; save_history?: boolean; page_context?: string },
    sessionToken?: string,
  ) =>
    request<ChatReply & { detected_language?: string; agent?: Record<string, unknown> }>("/api/v1/chat/message", {
      method: "POST",
      headers: { "Content-Type": "application/json", ...(sessionToken ? { "x-session-token": sessionToken } : {}) },
      body: JSON.stringify(payload),
    }),

  getChatHistory: (sessionToken: string) =>
    request<{ messages: { id: string; role: string; content: string; meta: Record<string, unknown>; created_at: string }[]; encrypted_at_rest?: boolean }>(
      "/api/v1/chat/history",
      { headers: { "x-session-token": sessionToken } },
    ),

  clearChatHistory: (sessionToken: string) =>
    request<{ deleted: number; note: string }>("/api/v1/chat/history", {
      method: "DELETE",
      headers: { "x-session-token": sessionToken },
    }),

  analyzeQuery: (query: string) =>
    request<{
      query_type: string;
      risk_level: RiskLevel;
      red_flags: RedFlag[];
      guidance: string[];
      detected_language?: string;
      reporting_routes?: ReportingRoute[];
    }>("/api/v1/analyze/query", {
      method: "POST",
      body: JSON.stringify({ query }),
    }),

  threatFeed: () =>
    request<{ entries: { target: string; category: string; risk_score: number; reported_at: string; source: string }[]; demo_notice: string }>(
      "/api/v1/threatfeed/feed",
    ),

  threatStats: () =>
    request<{ scams_flagged_today: number; addresses_audited: number; active_threat_feeds: number; community_reports_this_session: number; notice: string }>(
      "/api/v1/threatfeed/stats",
    ),

  submitThreatReport: (payload: { target: string; details: string; category: string }) =>
    request<{ report_id: string; risk_score: number; risk_level: string; red_flags: RedFlag[]; note: string }>(
      "/api/v1/threatfeed/report",
      { method: "POST", body: JSON.stringify(payload) },
    ),

  voiceStatus: () =>
    request<{ service: string; available: boolean; reason?: string; tts_model?: string }>("/api/v1/voice/status"),

  speakText: async (text: string, language: string): Promise<Blob> => {
    const res = await fetch(`${API_BASE_URL}/api/v1/voice/speak`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text, language }),
    });
    if (!res.ok) throw new ApiError(`Voice synthesis failed (${res.status})`, res.status);
    return res.blob();
  },

  transcribeAudio: async (audio: Blob, language: string): Promise<string> => {
    const form = new FormData();
    form.append("file", audio, "recording.wav");
    const res = await fetch(`${API_BASE_URL}/api/v1/voice/transcribe?language=${encodeURIComponent(language)}`, {
      method: "POST",
      body: form,
    });
    if (!res.ok) {
      let detail = `Transcription failed (${res.status})`;
      try {
        const body = await res.json();
        if (body?.detail) detail = body.detail;
      } catch { /* keep generic */ }
      throw new ApiError(detail, res.status);
    }
    const data = await res.json();
    return data.transcript as string;
  },

  analyzeScreenshot: (file: File) => {
    const form = new FormData();
    form.append("file", file);
    return request<{
      accepted: boolean;
      content_type: string;
      ocr_available: boolean;
      summary: string;
      safe_next_steps: string[];
      limitations: string[];
    }>("/api/v1/analyze/screenshot", { method: "POST", body: form, headers: {} });
  },
};

// Stable per-browser session id for the evidence locker (no account system,
// nothing identifying — a random token in localStorage).
export function getUserSessionId(): string {
  if (typeof window === "undefined") return "server";
  const KEY = "nr_session_id";
  let id = window.localStorage.getItem(KEY);
  if (!id) {
    id =
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `sess-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    window.localStorage.setItem(KEY, id);
  }
  return id;
}
