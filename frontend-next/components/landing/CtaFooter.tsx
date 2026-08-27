"use client";

import { useState, type FormEvent } from "react";
import Reveal from "../Reveal";
import Logo from "../Logo";
import { GitHub, Mail } from "../icons";

const FOOTER_COLS = [
  {
    title: "Product",
    links: [
      { label: "Features", href: "#pipeline" },
      { label: "Pricing", href: "#pricing" },
      { label: "FAQ", href: "#gates" },
      { label: "Roadmap", href: "#" },
      { label: "Status", href: "#" },
    ],
  },
  {
    title: "Developer",
    links: [
      { label: "Docs", href: "#" },
      { label: "CLI Reference", href: "#" },
      { label: "API Reference", href: "#" },
      { label: "Changelog", href: "#" },
      { label: "GitHub", href: "https://github.com" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "Contact", href: "#" },
      { label: "Privacy", href: "#" },
      { label: "Terms", href: "#" },
    ],
  },
];

export default function CtaFooter() {
  const [email, setEmail] = useState("");
  const [done, setDone] = useState(false);

  const subscribe = (e: FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setDone(true);
  };

  return (
    <>
      {/* CTA — email subscribe */}
      <section className="relative overflow-hidden border-b border-line">
        <div className="grid-bg" />
        <div className="ember-glow -bottom-64 left-1/2 -translate-x-1/2" />
        <div className="relative z-10 mx-auto max-w-6xl px-6 py-32 text-center lg:py-36">
          <Reveal>
            <div className="eyebrow justify-center before:hidden">
              <span className="mx-auto">ready when you are</span>
            </div>
            <h2 className="heading-lux mx-auto mt-9 max-w-2xl text-5xl sm:text-6xl">
              Your product, <em>assembled.</em>
            </h2>
            <p className="mx-auto mt-7 max-w-md text-sm font-light leading-[1.95] text-fg2">
              One brief in. PRD, market research, architecture, code and QA out, with your name on
              every approval.
            </p>

            {/* Mail subscription — automated dispatches */}
            <div className="mx-auto mt-12 max-w-md">
              <p className="mb-3 flex items-center justify-center gap-2 font-mono text-[0.62rem] uppercase tracking-[0.2em] text-fg3">
                <Mail className="size-3.5 text-ember" />
                automated product dispatches
              </p>

              {done ? (
                <p className="rounded-full border border-mint/35 bg-mint/10 px-6 py-3.5 font-mono text-[0.7rem] tracking-[0.06em] text-mint">
                  you're on the list, first dispatch lands in your inbox soon
                </p>
              ) : (
                <form
                  onSubmit={subscribe}
                  className="flex flex-col gap-2.5 sm:flex-row"
                >
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@company.com"
                    className="input !rounded-full font-mono text-[0.75rem]"
                    aria-label="Email address"
                  />
                  <button type="submit" className="btn btn-primary shrink-0">
                    Subscribe
                  </button>
                </form>
              )}
            </div>
          </Reveal>
        </div>
      </section>

      {/* Footer — 4 columns */}
      <footer className="bg-ink2">
        <div className="mx-auto grid max-w-6xl gap-12 px-6 py-16 md:grid-cols-[1.5fr_1fr_1fr_1fr]">
          {/* Brand */}
          <div>
            <Logo />
            <p className="mt-4 max-w-56 text-[0.85rem] font-bold leading-[1.8] text-fg3">
              A multi-agent software pipeline. Describe it, approve it, ship it, without writing
              the boring parts.
            </p>
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="ShipGen on GitHub"
              className="mt-5 inline-grid size-9 place-items-center rounded-full border border-line2 text-fg3 transition hover:border-ember/40 hover:text-ember-bright"
            >
              <GitHub className="size-4" />
            </a>
          </div>

          {/* Link columns */}
          {FOOTER_COLS.map((col) => (
            <div key={col.title}>
              <h4 className="font-mono text-[0.7rem] uppercase tracking-[0.22em] text-fg3">
                {col.title}
              </h4>
              <ul className="mt-5 flex flex-col gap-3">
                {col.links.map((l) => (
                  <li key={l.label}>
                    <a
                      href={l.href}
                      className="text-[0.8rem] font-light text-fg2 transition hover:text-fg"
                    >
                      {l.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="border-t border-line">
          <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-6 py-6">
            <p className="text-[0.7rem] font-bold text-fg3">© 2026 ShipGen. All rights reserved.</p>
            <p className="flex items-center gap-2.5 font-mono text-[0.7rem] text-fg3">
              <span className="pulse-dot" />
              All agents operational
            </p>
          </div>
        </div>
      </footer>
    </>
  );
}
