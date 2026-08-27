"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { SignedIn, UserButton, useUser } from "@clerk/nextjs";
import { clerkEnabled } from "@/lib/clerkConfig";
import { ClerkSetupNotice } from "@/components/AuthShell";
import Logo from "@/components/Logo";

function AppNav({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { user } = useUser();
  const email = user?.primaryEmailAddress?.emailAddress;

  const navLink = (href: string, label: string) => {
    const active = pathname === href || (href !== "/dashboard" && pathname.startsWith(href));
    return (
      <Link
        href={href}
        className={`rounded-sm px-3 py-1.5 font-mono text-[0.68rem] uppercase tracking-[0.12em] transition ${
          active ? "bg-ember-dim text-ember-bright" : "text-fg2 hover:bg-white/[0.04] hover:text-fg"
        }`}
      >
        {label}
      </Link>
    );
  };

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-40 border-b border-line bg-ink/85 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <Link href="/dashboard" aria-label="ShipGen dashboard">
            <Logo />
          </Link>

          <nav className="flex items-center gap-1">
            {navLink("/dashboard", "projects")}
            {navLink("/settings", "settings")}
            <div className="mx-3 h-5 w-px bg-line2" />
            <span className="hidden max-w-48 truncate font-mono text-[0.62rem] text-fg3 lg:inline" title={email}>
              {email}
            </span>
            <SignedIn>
              <UserButton
                appearance={{
                  elements: {
                    avatarBox: "ring-1 ring-white/15",
                  },
                }}
              />
            </SignedIn>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-12">{children}</main>

      <footer className="mx-auto max-w-6xl px-6 pb-10">
        <p className="text-center font-mono text-[0.6rem] uppercase tracking-[0.14em] text-fg3">
          agents draft · humans approve · nothing ships alone
        </p>
      </footer>
    </div>
  );
}

export default function AppLayout({ children }: { children: ReactNode }) {
  if (!clerkEnabled) {
    return (
      <div className="grid min-h-screen place-items-center px-4">
        <div className="w-full max-w-md">
          <ClerkSetupNotice />
        </div>
      </div>
    );
  }

  return <AppNav>{children}</AppNav>;
}
