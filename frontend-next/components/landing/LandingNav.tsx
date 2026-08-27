"use client";

import Link from "next/link";
import { useAuth } from "@clerk/nextjs";
import { clerkEnabled } from "@/lib/clerkConfig";
import Logo from "@/components/Logo";

function SignedInNav() {
  const { isSignedIn } = useAuth();
  if (!isSignedIn) return null;
  return (
    <Link href="/dashboard" className="btn btn-primary">
      Open dashboard →
    </Link>
  );
}

export default function LandingNav() {
  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-line bg-ink/80 backdrop-blur-xl">
      <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <Link href="/" aria-label="ShipGen home">
          <Logo />
        </Link>

        <div className="hidden items-center gap-8 font-mono text-[0.68rem] uppercase tracking-[0.16em] text-fg2 md:flex">
          <a href="#pipeline" className="transition hover:text-ember-bright">
            Pipeline
          </a>
          <a href="#metrics" className="transition hover:text-ember-bright">
            Metrics
          </a>
          <a href="#gates" className="transition hover:text-ember-bright">
            Human gates
          </a>
          <a href="#pricing" className="transition hover:text-ember-bright">
            Pricing
          </a>
          <a href="#testimonials" className="transition hover:text-ember-bright">
            Voices
          </a>
        </div>

        <div className="flex items-center gap-3">
          {clerkEnabled ? (
            <SignedInNav />
          ) : null}
        </div>
      </nav>
    </header>
  );
}
