"use client";

import Reveal from "../Reveal";

const VALUES = [
  {
    icon: "⬡",
    title: "You approve the PRD",
    body: "The planner drafts, then stops. No tokens are spent on design or code until you've read and approved the requirements.",
  },
  {
    icon: "◈",
    title: "You approve the design",
    body: "Architecture and UX land on your desk before a single file is generated. Change direction here — it costs nothing yet.",
  },
  {
    icon: "⟁",
    title: "You trigger every deploy",
    body: "Deploys run only with your own Vercel token, on your click. Nothing goes live automatically. Ever.",
  },
  {
    icon: "⊞",
    title: "Agents never ship alone",
    body: "Every loop is closed by a human. Agents draft, recommend and build — decisions stay yours.",
  },
];

export default function GatesSection() {
  return (
    <section id="gates" className="relative overflow-hidden border-b border-line">
      <div className="ember-glow -top-80 left-1/2 -translate-x-1/2" />
      <div className="relative z-10 mx-auto max-w-6xl px-6 py-28 lg:py-32">
        <div className="grid gap-14 lg:grid-cols-[1fr_1.35fr] lg:gap-20">
          {/* Left — sticky intro */}
          <Reveal className="lg:sticky lg:top-28 lg:self-start">
            <div className="sec-label">// human-in-the-loop</div>
            <h2 className="heading-lux text-4xl sm:text-5xl">
              Agents draft. <em>Humans decide.</em>
            </h2>
            <p className="mt-6 max-w-md text-sm font-light leading-[1.9] text-fg2">
              This isn't an autopilot — it's a crew with a captain. The pipeline is built around{" "}
              <strong className="font-medium text-fg">hard gates</strong> that only you can open.
            </p>
            <blockquote className="font-news mt-10 max-w-md text-[1.05rem] font-light italic leading-[1.8] text-fg2">
              "ShipGen moves fast because it stops at the right places."
            </blockquote>
          </Reveal>

          {/* Right — gate timeline */}
          <div className="relative">
            <span
              aria-hidden
              className="absolute bottom-6 left-[19px] top-6 w-px bg-gradient-to-b from-ember/50 via-line2 to-transparent"
            />
            <div className="flex flex-col gap-4">
              {VALUES.map((v, i) => (
                <Reveal key={v.title} delay={i % 2 === 0 ? 0 : 1}>
                  <div className="group relative flex items-start gap-5 rounded-md border border-line bg-surface p-6 transition hover:border-ember/30 hover:bg-surface2">
                    <span className="relative z-10 grid size-10 shrink-0 place-items-center rounded-full border border-line2 bg-ink font-mono text-base text-ember transition group-hover:border-ember/40 group-hover:shadow-[0_0_10px_rgba(35,169,242,0.12)]">
                      {v.icon}
                    </span>
                    <div>
                      <h3 className="font-mono text-[0.78rem] font-semibold tracking-[0.04em] text-fg">
                        {v.title}
                      </h3>
                      <p className="mt-2 text-[0.8rem] font-light leading-[1.85] text-fg2">{v.body}</p>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}