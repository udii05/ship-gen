"use client";

import { useEffect, useState } from "react";

interface TermLine {
  text: string;
  tone: "cmd" | "ok" | "gate" | "run" | "dim";
}

const SCRIPT: TermLine[] = [
  { text: '$ shipgen run "InvoicePilot"', tone: "cmd" },
  { text: "✓ planner      PRD drafted              1,204 tok", tone: "ok" },
  { text: "■ gate:prd     approved by you", tone: "gate" },
  { text: "✓ researcher   6 competitors analyzed     987 tok", tone: "ok" },
  { text: "✓ architect    design spec ready        1,432 tok", tone: "ok" },
  { text: "■ gate:design  approved by you", tone: "gate" },
  { text: "● builder      generating product…       running", tone: "run" },
  { text: "○ qa           queued", tone: "dim" },
];

const TONE_CLS: Record<TermLine["tone"], string> = {
  cmd: "text-fg",
  ok: "text-mint",
  gate: "text-ember-bright",
  run: "text-[#a8d8ff]",
  dim: "text-fg3",
};

export default function Terminal() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const total = SCRIPT.length;
    const holdTicks = 7; // pause with full script visible
    const t = window.setInterval(() => {
      setCount((c) => (c >= total + holdTicks ? 0 : c + 1));
    }, 620);
    return () => window.clearInterval(t);
  }, []);

  const visible = SCRIPT.slice(0, Math.min(count, SCRIPT.length));
  const done = count >= SCRIPT.length;

  return (
    <div className="overflow-hidden rounded-md border border-line2 bg-[#0a0806] text-left">
      <div className="flex items-center gap-1.5 border-b border-line2 bg-surface px-3.5 py-2.5">
        <span className="size-2.5 rounded-full bg-[#ff5f57]" />
        <span className="size-2.5 rounded-full bg-[#ffbd2e]" />
        <span className="size-2.5 rounded-full bg-[#28c840]" />
        <span className="ml-2 font-mono text-[0.62rem] tracking-[0.08em] text-fg3">
          shipgen@pipeline:~
        </span>
      </div>
      <div className="min-h-[248px] p-4 font-mono text-[0.72rem] leading-[1.95]">
        {visible.map((line, i) => (
          <p key={i} className={TONE_CLS[line.tone]}>
            {line.text}
          </p>
        ))}
        <p className="text-ember">
          {done ? "$ " : "  "}
          <span className="term-caret" />
        </p>
      </div>
    </div>
  );
}
