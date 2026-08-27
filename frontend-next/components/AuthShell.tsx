"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import Logo from "./Logo";

export function AuthShell({
  children,
  title,
  subtitle,
}: {
  children: ReactNode;
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="relative grid min-h-screen place-items-center overflow-hidden px-4 py-16">
      <div className="grid-bg" />
      <div className="ember-glow -top-52 left-1/2 -translate-x-1/2" />

      <div className="relative z-10 w-full max-w-md">
        <Link
          href="/"
          className="mb-8 inline-flex items-center gap-2 font-mono text-[0.68rem] uppercase tracking-[0.16em] text-fg3 transition hover:text-ember-bright"
        >
          ← back to ShipGen
        </Link>

        <div className="mb-8 flex flex-col items-center text-center">
          <Logo markClass="size-9" />
          <h1 className="heading-lux mt-6 text-3xl">{title}</h1>
          {subtitle && (
            <p className="mt-3 max-w-sm text-sm font-light leading-relaxed text-fg2">{subtitle}</p>
          )}
        </div>

        {children}
      </div>
    </div>
  );
}

export function ClerkSetupNotice() {
  return (
    <div className="rounded-md border border-line2 bg-surface p-6">
      <h1 className="font-display text-lg font-semibold text-fg">Clerk is not configured yet</h1>
      <p className="mt-3 text-sm font-light leading-relaxed text-fg2">
        Authentication runs through <span className="text-fg">Clerk</span> (Google, GitHub or
        email &amp; password). To enable it:
      </p>
      <ol className="mt-4 list-decimal space-y-2 pl-5 font-mono text-[0.7rem] leading-relaxed text-fg2">
        <li>Create a free app at clerk.com</li>
        <li>Enable Google / GitHub / email+password methods</li>
        <li>
          Copy the keys into <span className="text-ember-bright">frontend-next/.env.local</span>:
          <span className="mt-2 block rounded border border-line bg-black/40 p-2.5 text-[0.62rem] text-fg3">
            NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_…
            <br />
            CLERK_SECRET_KEY=sk_live_…
          </span>
        </li>
        <li>Restart the dev server</li>
      </ol>
    </div>
  );
}