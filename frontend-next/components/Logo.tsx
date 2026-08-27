"use client";

import { useId } from "react";

/** Rocket mark — "make your product, then ship it." No frame, just the glyph. */
export function LogoMark({ className = "size-6" }: { className?: string }) {
  const raw = useId();
  const gid = `lg${raw.replace(/[^a-zA-Z0-9]/g, "")}`;
  const grad = `url(#${gid})`;
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden="true">
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#44b8f7" />
          <stop offset="1" stopColor="#1A8FD0" />
        </linearGradient>
      </defs>
      {/* rocket body */}
      <path
        d="M16 2.6c3.4 3.2 5.1 7.1 5.1 11.7 0 2.9-.66 5.6-1.8 8.1h-6.6c-1.14-2.5-1.8-5.2-1.8-8.1 0-4.6 1.7-8.5 5.1-11.7z"
        fill={grad}
      />
      {/* fins */}
      <path d="M11.2 16.2 6.8 23.7l5.3-1.4z" fill={grad} />
      <path d="M20.8 16.2l4.4 7.5-5.3-1.4z" fill={grad} />
      {/* flame */}
      <path d="M14.2 24.4c.45 2.7 1.05 4.7 1.8 6.2.75-1.5 1.35-3.5 1.8-6.2z" fill="#44b8f7" />
    </svg>
  );
}

/** Mark + wordmark lockup. */
export default function Logo({ markClass = "size-6" }: { markClass?: string }) {
  return (
    <span className="flex items-center gap-2.5">
      <LogoMark className={markClass} />
      <span className="font-logo text-[1.1rem] leading-none tracking-[0.02em] text-fg">
        Ship<span className="text-ember-bright">Gen</span>
      </span>
    </span>
  );
}
