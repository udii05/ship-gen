"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, type ReactNode } from "react";
import { useClerk, useUser } from "@clerk/nextjs";
import { clerkEnabled } from "@/lib/clerkConfig";
import { ClerkSetupNotice } from "@/components/AuthShell";
import Logo from "@/components/Logo";

/** Avatar-only user menu: Profile / Manage account / Settings / Sign out. */
function UserMenu() {
  const { user, isSignedIn } = useUser();
  const { openUserProfile, signOut } = useClerk();
  const [open, setOpen] = useState(false);

  if (!isSignedIn) return null;

  const initials = (user?.fullName || user?.primaryEmailAddress?.emailAddress || "U")
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const itemCls =
    "flex w-full items-center gap-2.5 rounded-sm px-3 py-2 text-left text-[0.78rem] font-light text-fg2 transition hover:bg-white/[0.04] hover:text-fg";

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label="Account menu"
        className="grid size-8 place-items-center overflow-hidden rounded-full bg-ink2 ring-1 ring-white/15 transition hover:ring-ember/50"
      >
        {user?.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={user.imageUrl} alt="" className="size-full object-cover" />
        ) : (
          <span className="font-mono text-[0.6rem] font-semibold text-ember-bright">{initials}</span>
        )}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full z-50 mt-2 w-56 rounded-md border border-line2 bg-surface p-1.5 shadow-2xl shadow-black/60">
            <div className="mb-1 border-b border-line px-3 py-2">
              <p className="truncate text-[0.78rem] font-semibold text-fg">
                {user?.fullName || "Account"}
              </p>
              <p className="truncate font-mono text-[0.58rem] text-fg3">
                {user?.primaryEmailAddress?.emailAddress}
              </p>
            </div>
            <button
              className={itemCls}
              onClick={() => {
                setOpen(false);
                openUserProfile();
              }}
            >
              Profile
            </button>
            <button
              className={itemCls}
              onClick={() => {
                setOpen(false);
                openUserProfile();
              }}
            >
              Manage account
            </button>
            <Link href="/settings" className={itemCls} onClick={() => setOpen(false)}>
              Settings
            </Link>
            <div className="my-1 border-t border-line" />
            <button className={itemCls} onClick={() => void signOut()}>
              Sign out
            </button>
          </div>
        </>
      )}
    </div>
  );
}

function AppNav({ children }: { children: ReactNode }) {
  const pathname = usePathname();

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
    <div className="relative min-h-screen overflow-hidden">
      <div className="ember-glow -top-72 left-1/2 -translate-x-1/2" />
      <header className="sticky top-0 z-40 border-b border-line bg-ink/85 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <Link href="/dashboard" aria-label="ShipGen dashboard">
            <Logo />
          </Link>

          <nav className="flex items-center gap-1">
            {navLink("/dashboard", "projects")}
            <div className="mx-3 h-5 w-px bg-line2" />
            <UserMenu />
          </nav>
        </div>
      </header>

      <main className="relative z-10 mx-auto max-w-6xl px-6 py-12">{children}</main>

      <footer className="relative z-10 mx-auto max-w-6xl px-6 pb-10">
        <p className="text-center font-mono text-[0.68rem] uppercase tracking-[0.14em] text-fg3">
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