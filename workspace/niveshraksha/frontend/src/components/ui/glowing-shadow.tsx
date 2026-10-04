"use client";

import React, { type ReactNode } from "react";

interface GlowingShadowProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
}

export function GlowingShadow({ children, className = "", onClick }: GlowingShadowProps) {
  return (
    <div onClick={onClick} className={`relative group inline-block ${className}`}>
      <style jsx>{`
        @property --hue {
          syntax: "<number>";
          inherits: true;
          initial-value: 120;
        }
        @property --rotate {
          syntax: "<number>";
          inherits: true;
          initial-value: 0;
        }

        .glow-container {
          --card-color: rgba(6, 15, 10, 0.92);
          --card-radius: 1rem;
          --border-width: 2px;
          --animation-speed: 5s;
          position: relative;
          z-index: 2;
          border-radius: var(--card-radius);
          cursor: pointer;
        }

        .glow-content {
          background: var(--card-color);
          border-radius: var(--card-radius);
          border: 1px solid rgba(34, 197, 94, 0.2);
          transition: all 0.3s ease;
        }

        .glow-container:hover .glow-content {
          border-color: rgba(34, 197, 94, 0.6);
          box-shadow: 0 0 25px rgba(34, 197, 94, 0.25);
        }
      `}</style>

      <div className="glow-container">
        <div className="glow-content p-6">{children}</div>
      </div>
    </div>
  );
}
