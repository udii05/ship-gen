"use client";

import Link from "next/link";
import Reveal from "../Reveal";
import { Check } from "../icons";

const TIERS = [
  {
    name: "Hobby",
    price: "$0",
    period: "/mo",
    tagline: "For your first run down the line.",
    cta: "Start free",
    highlight: false,
    features: [
      "1 active project",
      "Full 5-agent pipeline",
      "Human approval gates",
      "Community support",
    ],
  },
  {
    name: "Pro",
    price: "$29",
    period: "/mo",
    tagline: "For builders shipping for real.",
    cta: "Go Pro",
    highlight: true,
    features: [
      "Unlimited projects",
      "Priority agent queue",
      "One-click Vercel deploys",
      "Full artifact history",
      "Email support",
    ],
  },
  {
    name: "Team",
    price: "$99",
    period: "/mo",
    tagline: "For crews that approve together.",
    cta: "Talk to us",
    highlight: false,
    features: [
      "Everything in Pro",
      "Shared workspaces",
      "Role-based approvals",
      "SSO & audit log",
      "Priority support",
    ],
  },
];

export default function PricingSection() {
  return (
    <section id="pricing" className="border-b border-line">
      <div className="mx-auto max-w-6xl px-6 py-28 lg:py-32">
        <Reveal className="flex flex-col items-center text-center">
          <div className="sec-label">// pricing</div>
          <h2 className="heading-lux text-4xl sm:text-5xl">
            Pay for the line, <em>not the tokens.</em>
          </h2>
          <p className="mt-5 max-w-md font-mono text-[0.65rem] leading-relaxed text-fg3">
            bring your own model keys — we never mark up inference
          </p>
        </Reveal>

        <div className="mt-16 grid gap-4 lg:grid-cols-3">
          {TIERS.map((t, i) => (
            <Reveal key={t.name} delay={i === 1 ? 1 : 0}>
              <div
                className={`relative flex h-full flex-col rounded-md border p-7 transition ${
                  t.highlight
                    ? "border-ember/45 bg-surface2 shadow-[0_0_40px_rgba(35,169,242,0.08)]"
                    : "border-line bg-surface hover:border-ember/25"
                }`}
              >
                {t.highlight && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-ember px-3 py-1 font-mono text-[0.55rem] font-bold uppercase tracking-[0.14em] text-white">
                    most popular
                  </span>
                )}
                <span className="font-mono text-[0.62rem] uppercase tracking-[0.2em] text-fg3">
                  {t.name}
                </span>
                <div className="mt-4 flex items-baseline gap-1">
                  <span className="font-display text-4xl font-semibold text-fg">{t.price}</span>
                  <span className="font-mono text-[0.65rem] text-fg3">{t.period}</span>
                </div>
                <p className="mt-2 text-[0.8rem] font-light text-fg2">{t.tagline}</p>

                <ul className="mt-6 flex flex-1 flex-col gap-2.5">
                  {t.features.map((f) => (
                    <li key={f} className="flex items-start gap-2.5 text-[0.8rem] font-light text-fg2">
                      <Check className="mt-0.5 size-3.5 shrink-0 text-ember-bright" />
                      {f}
                    </li>
                  ))}
                </ul>

                <Link
                  href="/signup"
                  className={`btn mt-8 w-full ${t.highlight ? "btn-primary" : "btn-secondary"}`}
                >
                  {t.cta}
                </Link>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
