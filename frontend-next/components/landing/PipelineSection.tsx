"use client";

import Reveal from "../Reveal";
import { Beaker, Doc, Hammer, Palette, Search } from "../icons";
import type { ComponentType, SVGProps } from "react";

interface Stage {
  num: string;
  name: string;
  desc: string;
  artifact: string;
  gated?: boolean;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
}

const STAGES: Stage[] = [
  {
    num: "01",
    name: "Planner",
    desc: "Turns your plain-words idea into a structured product requirements doc.",
    artifact: "PRD",
    gated: true,
    icon: Doc,
  },
  {
    num: "02",
    name: "Researcher",
    desc: "Scans the market and breaks down what competitors ship and charge.",
    artifact: "market report",
    icon: Search,
  },
  {
    num: "03",
    name: "Architect",
    desc: "Designs the system architecture and the product's user experience.",
    artifact: "design spec",
    gated: true,
    icon: Palette,
  },
  {
    num: "04",
    name: "Builder",
    desc: "Generates the working product from the approved design: real files, real code.",
    artifact: "codebase",
    icon: Hammer,
  },
  {
    num: "05",
    name: "QA",
    desc: "Runs a quality checklist over the build before it's allowed near a deploy.",
    artifact: "qa report",
    icon: Beaker,
  },
];

export default function PipelineSection() {
  return (
    <section id="pipeline" className="border-b border-line">
      <div className="mx-auto max-w-6xl px-6 py-28 lg:py-32">
        <Reveal className="flex flex-col items-center text-center">
          <div className="sec-label">// the pipeline</div>
          <h2 className="heading-lux text-4xl sm:text-5xl">
            Five agents. <em>One assembly line.</em>
          </h2>
          <p className="mt-5 max-w-md text-[0.78rem] font-bold leading-relaxed text-fg3">
            each stage hands a typed artifact to the next, nothing skips a step
          </p>
        </Reveal>

        {/* Assembly line */}
        <div className="relative mt-20">
          {/* rail connecting the nodes (desktop) */}
          <div
            aria-hidden
            className="absolute left-[10%] right-[10%] top-[26px] hidden h-px bg-gradient-to-r from-transparent via-ember/45 to-transparent lg:block"
          />

          <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-5 lg:gap-4">
            {STAGES.map((s, i) => {
              const Icon = s.icon;
              return (
                <Reveal key={s.num} delay={i % 2 === 0 ? 0 : 1}>
                  <div className="group relative flex h-full flex-col items-center text-center">
                    {/* node on the rail */}
                    <span className="relative z-10 grid size-[52px] place-items-center rounded-full border border-line2 bg-ink text-fg2 transition duration-200 group-hover:border-ember/50 group-hover:text-ember-bright group-hover:shadow-[0_0_18px_rgba(35,169,242,0.25)]">
                      <Icon className="size-5" />
                    </span>

                    <span className="mt-4 font-mono text-[0.68rem] tracking-[0.22em] text-fg3 transition group-hover:text-ember">
                      STAGE {s.num}
                    </span>
                    <h3 className="mt-2 font-display text-[1.05rem] font-semibold tracking-tight text-fg">
                      {s.name}
                    </h3>
                    <p className="mt-2.5 max-w-[230px] text-[0.76rem] font-light leading-[1.75] text-fg2">
                      {s.desc}
                    </p>

                    <div className="mt-4 flex flex-wrap justify-center gap-1.5">
                      <span className="chip !py-0.5 text-[0.65rem]">→ {s.artifact}</span>
                      {s.gated && <span className="chip ember !py-0.5 text-[0.65rem]">human gate</span>}
                    </div>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}