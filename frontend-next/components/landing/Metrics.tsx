"use client";

import { useEffect, useRef, useState } from "react";
import Reveal from "../Reveal";

interface Metric {
  target: number | null; // null = static display
  display?: string;
  unit: string;
  label: string;
  sub: string;
}

const METRICS: Metric[] = [
  { target: 5, unit: "", label: "Agents on the line", sub: "planner → researcher → architect → builder → qa" },
  { target: 2, unit: "", label: "Human-only gates", sub: "prd + design must be approved by you" },
  { target: 4, unit: "", label: "Artifacts before code", sub: "prd · market report · design spec · qa checklist" },
  { target: 1, unit: "", label: "Brief needed from you", sub: "just describe the product in plain words" },
  { target: null, display: "24/7", unit: "", label: "Pipeline availability", sub: "agents don't sleep · you decide when" },
];

function CountUp({ target, started }: { target: number; started: boolean }) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!started) return;
    let raf = 0;
    const t0 = performance.now();
    const duration = 1100;
    const tick = (t: number) => {
      const p = Math.min(1, (t - t0) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      setValue(Math.round(target * eased));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [started, target]);

  return <>{String(value).padStart(2, "0")}</>;
}

export default function Metrics() {
  const ref = useRef<HTMLDivElement>(null);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setStarted(true);
          obs.disconnect();
        }
      },
      { threshold: 0.3 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <section id="metrics" className="border-b border-line">
      <div ref={ref} className="mx-auto max-w-6xl px-6 py-20 lg:py-24">
        <Reveal>
          <div className="grid grid-cols-2 gap-x-8 gap-y-14 md:grid-cols-5">
            {METRICS.map((m) => (
              <div key={m.label} className="metric-cell">
                <span className="heading-lux block text-4xl leading-none">
                  {m.target !== null ? <CountUp target={m.target} started={started} /> : m.display}
                  <span className="ml-1 font-mono text-xs text-ember">{m.unit}</span>
                </span>
                <span className="mt-4 block font-mono text-[0.6rem] uppercase tracking-[0.16em] text-fg2">
                  {m.label}
                </span>
                <span className="mt-1.5 block font-mono text-[0.55rem] leading-relaxed text-fg3">
                  {m.sub}
                </span>
              </div>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
