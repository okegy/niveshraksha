"use client";

// User preferences: UI palette, voice, avatar, private-history opt-in.
// External localStorage store mirrored via useSyncExternalStore (SSR-safe,
// cached snapshot — the same pattern as the language store).

import { useSyncExternalStore } from "react";

export type PaletteId = "teal" | "indigo" | "emerald" | "rose";
export type AvatarId = "shield" | "owl" | "robot";
export type UserAvatarId = "person" | "star";

export interface Settings {
  palette: PaletteId;
  guideAvatar: AvatarId;
  userAvatar: UserAvatarId;
  voiceReplies: boolean; // auto-play TTS on Guide answers
  saveChatHistory: boolean; // opt-in encrypted history
}

export const DEFAULT_SETTINGS: Settings = {
  palette: "teal",
  guideAvatar: "shield",
  userAvatar: "person",
  voiceReplies: false,
  saveChatHistory: false,
};

// Palette accent variables applied to :root — every component reads the CSS
// custom properties, so switching is instant and site-wide.
export const PALETTES: Record<PaletteId, { label: string; accent: string; accentDark: string; ring: string }> = {
  teal: { label: "Teal (default)", accent: "#0d9488", accentDark: "#2dd4bf", ring: "13 148 136" },
  indigo: { label: "Indigo", accent: "#4f46e5", accentDark: "#818cf8", ring: "79 70 229" },
  emerald: { label: "Emerald", accent: "#059669", accentDark: "#34d399", ring: "5 150 105" },
  rose: { label: "Rose", accent: "#e11d48", accentDark: "#fb7185", ring: "225 29 72" },
};

const SETTINGS_KEY = "nr_settings";
const listeners = new Set<() => void>();
let cached: Settings = { ...DEFAULT_SETTINGS };

function readSettings(): Settings {
  try {
    const raw = window.localStorage.getItem(SETTINGS_KEY);
    if (raw) {
      const parsed = { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
      if (JSON.stringify(parsed) !== JSON.stringify(cached)) cached = parsed;
    }
  } catch {
    /* malformed — keep cache */
  }
  return cached;
}

function writeSettings(next: Settings) {
  cached = next;
  window.localStorage.setItem(SETTINGS_KEY, JSON.stringify(next));
  listeners.forEach((notify) => notify());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

const SERVER_SETTINGS: Settings = { ...DEFAULT_SETTINGS };

export function useSettings(): [Settings, (patch: Partial<Settings>) => void] {
  const settings = useSyncExternalStore(subscribe, readSettings, () => SERVER_SETTINGS);
  const update = (patch: Partial<Settings>) => writeSettings({ ...readSettings(), ...patch });
  return [settings, update];
}

// Apply palette + dark mode to the document root. Called from a top-level
// client component so every page reacts.
export function applyPalette(palette: PaletteId) {
  if (typeof document === "undefined") return;
  const p = PALETTES[palette];
  const root = document.documentElement;
  root.style.setProperty("--nr-accent", p.accent);
  root.style.setProperty("--nr-accent-dark", p.accentDark);
  root.style.setProperty("--nr-accent-rgb", p.ring);
}
