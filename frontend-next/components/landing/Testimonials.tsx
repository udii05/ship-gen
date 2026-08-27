"use client";

import Reveal from "../Reveal";

interface Quote {
  name: string;
  role: string;
  text: string;
}

const ROW_A: Quote[] = [
  {
    name: "Sarah Chen",
    role: "Principal SRE, FinTech",
    text: "An idea went from brief to deployed app over a weekend. The PRD gate caught three requirements we'd have discovered in production.",
  },
  {
    name: "Marcus Rivera",
    role: "Founder, Product Agency",
    text: "We run every client pitch through ShipGen first. The competitive research alone sells the idea before anyone writes code.",
  },
  {
    name: "Priya Nair",
    role: "DevOps Engineer, Series B",
    text: "The human gates are the whole point. Agents draft everything, but nothing moves until I approve. Automation that respects review.",
  },
];

const ROW_B: Quote[] = [
  {
    name: "Tom Bridger",
    role: "Staff Engineer, Logistics",
    text: "One paragraph in — PRD, architecture and a working build out. The token meter keeps the crew honest.",
  },
  {
    name: "Lena Fischer",
    role: "CTO, B2B SaaS",
    text: "Our PMs feed ideas straight into the pipeline now. Engineering only sees the ones that survive both gates.",
  },
  {
    name: "James Park",
    role: "Eng Manager, E-commerce",
    text: "Build summaries and QA checklists make handoff painless. Like adding a five-person team that never sleeps.",
  },
];

function Card({ q }: { q: Quote }) {
  const initials = q.name
    .split(" ")
    .map((w) => w[0])
    .join("");
  return (
    <figure className="mr-5 w-[300px] shrink-0 whitespace-normal rounded-md border border-line bg-surface p-5 transition hover:border-ember/30 sm:w-[360px]">
      <blockquote className="text-[0.8rem] font-light leading-relaxed text-fg2">
        “{q.text}”
      </blockquote>
      <figcaption className="mt-4 flex items-center gap-3 border-t border-line pt-4">
        <span className="grid size-9 shrink-0 place-items-center rounded border border-line2 bg-ink font-mono text-[0.7rem] font-semibold text-ember">
          {initials}
        </span>
        <span className="min-w-0">
          <span className="block truncate font-display text-[0.8rem] font-semibold text-fg">{q.name}</span>
          <span className="block truncate font-mono text-[0.56rem] uppercase tracking-[0.1em] text-fg3">
            {q.role}
          </span>
        </span>
      </figcaption>
    </figure>
  );
}

function MarqueeRow({ items, reverse = false }: { items: Quote[]; reverse?: boolean }) {
  // Duplicated once for a seamless -50% loop; cards carry their own spacing.
  const doubled = [...items, ...items];
  return (
    <div className="marquee-wrap overflow-hidden">
      <div className={`marquee-track ${reverse ? "marquee-reverse" : ""}`}>
        {doubled.map((q, i) => (
          <Card key={`${q.name}-${i}`} q={q} />
        ))}
      </div>
    </div>
  );
}

export default function Testimonials() {
  return (
    <section id="testimonials" className="border-b border-line bg-ink2">
      <div className="mx-auto max-w-6xl px-6 py-28 lg:py-32">
        <Reveal className="flex flex-col items-center text-center">
          <div className="sec-label">// testimonials</div>
          <h2 className="heading-lux text-4xl sm:text-5xl">
            Loved by teams <em>who ship</em>
          </h2>
          <p className="mt-5 max-w-md font-mono text-[0.65rem] leading-relaxed text-fg3">
            builders who run their ideas through ShipGen, gate by gate
          </p>
        </Reveal>

        <Reveal delay={1} className="mt-16 flex flex-col gap-6">
          <MarqueeRow items={ROW_A} />
          <MarqueeRow items={ROW_B} reverse />
        </Reveal>
      </div>
    </section>
  );
}
