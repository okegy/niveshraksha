"use client";

// Tiny SVG character avatars — no external assets, fully themeable.
// Guide avatars: shield-character variants; user avatars: neutral figures.

import type { AvatarId, UserAvatarId } from "@/lib/settings";

export function GuideAvatar({
  avatar = "shield",
  size = 40,
  typing = false,
}: {
  avatar?: AvatarId;
  size?: number;
  typing?: boolean;
}) {
  return (
    <div
      aria-hidden
      className={`shrink-0 rounded-full overflow-hidden shadow-md ${typing ? "animate-pulse" : ""}`}
      style={{ width: size, height: size }}
    >
      <svg viewBox="0 0 48 48" width={size} height={size} role="img" aria-label="Raksha Guide avatar">
        {avatar === "shield" && (
          <>
            <defs>
              <linearGradient id="g-shield" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="var(--nr-accent, #0d9488)" />
                <stop offset="100%" stopColor="#0891b2" />
              </linearGradient>
            </defs>
            <circle cx="24" cy="24" r="24" fill="url(#g-shield)" />
            <path d="M24 9l12 4v10c0 8-5 13-12 16-7-3-12-8-12-16V13l12-4z" fill="#fff" opacity="0.92" />
            <circle cx="20" cy="22" r="2" fill="var(--nr-accent, #0d9488)" />
            <circle cx="28" cy="22" r="2" fill="var(--nr-accent, #0d9488)" />
            <path d="M19 28c1.6 2 8.4 2 10 0" stroke="var(--nr-accent, #0d9488)" strokeWidth="2" fill="none" strokeLinecap="round" />
          </>
        )}
        {avatar === "owl" && (
          <>
            <circle cx="24" cy="24" r="24" fill="#475569" />
            <circle cx="24" cy="26" r="15" fill="#64748b" />
            <circle cx="18" cy="21" r="6" fill="#fff" />
            <circle cx="30" cy="21" r="6" fill="#fff" />
            <circle cx="18" cy="21" r="2.4" fill="var(--nr-accent, #0d9488)" />
            <circle cx="30" cy="21" r="2.4" fill="var(--nr-accent, #0d9488)" />
            <path d="M24 25l-3 5h6l-3-5z" fill="#f59e0b" />
            <path d="M14 36c4 3 16 3 20 0" stroke="#334155" strokeWidth="2" fill="none" />
          </>
        )}
        {avatar === "robot" && (
          <>
            <circle cx="24" cy="24" r="24" fill="#1e293b" />
            <rect x="10" y="14" width="28" height="22" rx="6" fill="#334155" />
            <circle cx="18" cy="24" r="3" fill="var(--nr-accent, #0d9488)" />
            <circle cx="30" cy="24" r="3" fill="var(--nr-accent, #0d9488)" />
            <rect x="17" y="30" width="14" height="2.5" rx="1.25" fill="#94a3b8" />
            <rect x="22" y="8" width="4" height="6" rx="2" fill="#94a3b8" />
            <circle cx="24" cy="7" r="2.5" fill="var(--nr-accent, #0d9488)" />
          </>
        )}
      </svg>
    </div>
  );
}

export function UserAvatar({ avatar = "person", size = 32 }: { avatar?: UserAvatarId; size?: number }) {
  return (
    <div className="shrink-0 rounded-full overflow-hidden shadow" style={{ width: size, height: size }} aria-hidden>
      <svg viewBox="0 0 48 48" width={size} height={size}>
        {avatar === "person" && (
          <>
            <circle cx="24" cy="24" r="24" fill="#cbd5e1" />
            <circle cx="24" cy="19" r="8" fill="#64748b" />
            <path d="M10 42c2-9 8-13 14-13s12 4 14 13" fill="#64748b" />
          </>
        )}
        {avatar === "star" && (
          <>
            <circle cx="24" cy="24" r="24" fill="var(--nr-accent, #0d9488)" />
            <path d="M24 10l4.7 9.5 10.5 1.5-7.6 7.4 1.8 10.4L24 33.8l-9.4 5 1.8-10.4-7.6-7.4 10.5-1.5L24 10z" fill="#fff" opacity="0.95" />
          </>
        )}
      </svg>
    </div>
  );
}
