"use client";

import Reveal from "../Reveal";
import DashboardMockup from "./DashboardMockup";

export default function Showcase() {
  return (
    <section className="relative overflow-hidden border-b border-line">
      <div className="ember-glow -bottom-72 left-1/2 -translate-x-1/2" />
      <div className="relative z-10 mx-auto max-w-4xl px-6 py-28 lg:py-32">
        <Reveal className="flex flex-col items-center text-center">
          <div className="sec-label">// inside the dashboard</div>
          <h2 className="heading-lux text-4xl sm:text-5xl">
            One brief in. <em>A full run on the line.</em>
          </h2>
          <p className="mt-5 max-w-md text-[0.78rem] font-bold leading-relaxed text-fg3">
            every stage reports back with an artifact — and stops at your gates
          </p>
        </Reveal>

        <Reveal delay={1} className="mt-14">
          <DashboardMockup />
        </Reveal>
      </div>
    </section>
  );
}
