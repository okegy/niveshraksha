"use client";

import { useEffect, useState } from "react";
import { Eraser, Mic, Palette, ShieldCheck, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { ApiError, api, getUserSessionId } from "@/lib/api";
import {
  applyPalette,
  PALETTES,
  useSettings,
  type AvatarId,
  type PaletteId,
  type UserAvatarId,
} from "@/lib/settings";
import { GuideAvatar, UserAvatar } from "@/components/avatars";

const GUIDE_AVATARS: { id: AvatarId; label: string }[] = [
  { id: "shield", label: "Shield" },
  { id: "owl", label: "Owl" },
  { id: "robot", label: "Bot" },
];
const USER_AVATARS: { id: UserAvatarId; label: string }[] = [
  { id: "person", label: "Person" },
  { id: "star", label: "Star" },
];

export default function SettingsPage() {
  const [settings, update] = useSettings();
  const [voice, setVoice] = useState<{ available: boolean; reason?: string } | null>(null);
  const [clearMsg, setClearMsg] = useState<string | null>(null);
  const [clearing, setClearing] = useState(false);

  useEffect(() => {
    applyPalette(settings.palette);
  }, [settings.palette]);

  useEffect(() => {
    api
      .voiceStatus()
      .then(setVoice)
      .catch(() => setVoice({ available: false, reason: "status unavailable" }));
  }, []);

  const clearHistory = async () => {
    setClearing(true);
    setClearMsg(null);
    try {
      const r = await api.clearChatHistory(getUserSessionId());
      setClearMsg(`Deleted ${r.deleted} encrypted history rows.`);
    } catch (e) {
      setClearMsg(e instanceof ApiError ? e.message : "Could not clear history.");
    } finally {
      setClearing(false);
    }
  };

  return (
    <div className="min-h-[80vh] p-4 sm:p-6">
      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-3">
            <ShieldCheck className="h-8 w-8 text-teal-600" aria-hidden /> Settings
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-2 text-sm">
            Personalise the interface and control your private data. Preferences are stored on this
            device only — there are no accounts.
          </p>
        </div>

        {/* Palette */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Palette className="h-5 w-5" aria-hidden /> UI palette
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {(Object.keys(PALETTES) as PaletteId[]).map((id) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => update({ palette: id })}
                  aria-pressed={settings.palette === id}
                  className={`rounded-lg border-2 p-3 text-left transition-all ${
                    settings.palette === id
                      ? "border-teal-600 dark:border-teal-400 shadow-md"
                      : "border-slate-200 dark:border-slate-700 hover:border-slate-300"
                  }`}
                >
                  <div
                    className="w-full h-8 rounded mb-2"
                    style={{ background: `linear-gradient(135deg, ${PALETTES[id].accent}, ${PALETTES[id].accentDark})` }}
                    aria-hidden
                  />
                  <span className="text-xs text-slate-700 dark:text-slate-300">{PALETTES[id].label}</span>
                </button>
              ))}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              The accent applies across the whole app instantly. High-contrast safety colours (red
              for high risk, amber for caution) stay fixed — they are safety semantics, not style.
            </p>
          </CardContent>
        </Card>

        {/* Avatars */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <User className="h-5 w-5" aria-hidden /> Chat avatars
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-sm">Raksha Guide</Label>
              <div className="flex gap-3 mt-2">
                {GUIDE_AVATARS.map((a) => (
                  <button
                    key={a.id}
                    type="button"
                    onClick={() => update({ guideAvatar: a.id })}
                    aria-pressed={settings.guideAvatar === a.id}
                    className={`rounded-full p-1 border-2 transition-all ${
                      settings.guideAvatar === a.id ? "border-teal-600 dark:border-teal-400" : "border-transparent"
                    }`}
                    aria-label={`Guide avatar: ${a.label}`}
                  >
                    <GuideAvatar avatar={a.id} size={48} />
                  </button>
                ))}
              </div>
            </div>
            <div>
              <Label className="text-sm">You</Label>
              <div className="flex gap-3 mt-2">
                {USER_AVATARS.map((a) => (
                  <button
                    key={a.id}
                    type="button"
                    onClick={() => update({ userAvatar: a.id })}
                    aria-pressed={settings.userAvatar === a.id}
                    className={`rounded-full p-1 border-2 transition-all ${
                      settings.userAvatar === a.id ? "border-teal-600 dark:border-teal-400" : "border-transparent"
                    }`}
                    aria-label={`Your avatar: ${a.label}`}
                  >
                    <UserAvatar avatar={a.id} size={44} />
                  </button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Voice + history */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Mic className="h-5 w-5" aria-hidden /> Voice &amp; private history
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-medium text-slate-900 dark:text-slate-100">Speak Guide replies aloud</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Indian-language TTS via Sarvam (processed by Sarvam AI — see their privacy notice).
                </p>
                {voice && (
                  <p className={`text-xs mt-1 ${voice.available ? "text-teal-700 dark:text-teal-400" : "text-amber-700 dark:text-amber-500"}`}>
                    Voice service: {voice.available ? "available" : `unavailable (${voice.reason ?? "unknown"})`}
                  </p>
                )}
              </div>
              <input
                type="checkbox"
                checked={settings.voiceReplies}
                onChange={(e) => update({ voiceReplies: e.target.checked })}
                className="size-5 accent-teal-600"
                aria-label="Speak Guide replies aloud"
              />
            </div>
            <div className="border-t border-slate-200 dark:border-slate-800 pt-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                    Save private chat history (encrypted)
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md">
                    Off by default. When on, chat turns are stored <strong>encrypted at rest</strong> with a
                    key derived from this browser&apos;s session token — the server cannot read them
                    without it. Auto-deleted after 72 hours. Losing/clearing the browser token
                    deliberately makes the history unreadable.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.saveChatHistory}
                  onChange={(e) => update({ saveChatHistory: e.target.checked })}
                  className="size-5 accent-teal-600 mt-1"
                  aria-label="Save private chat history"
                />
              </div>
              <div className="mt-3 flex items-center gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  className="text-red-600 border-red-200 hover:bg-red-50 dark:border-red-900"
                  onClick={clearHistory}
                  disabled={clearing}
                >
                  <Eraser className="mr-2 h-4 w-4" aria-hidden /> Delete all chat history
                </Button>
                {clearMsg && <p className="text-xs text-slate-600 dark:text-slate-400">{clearMsg}</p>}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
