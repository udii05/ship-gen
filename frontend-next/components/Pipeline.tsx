"use client";

import type { ComponentType, SVGProps } from "react";
import type { Run, RunStep } from "@/lib/types";
import { Beaker, Check, Doc, Hammer, Palette, Search, Spinner, XMark } from "./icons";

interface AgentMeta {
  key: string;
  name: string;
  desc: string;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
}

// Order mirrors the backend pipeline (backend/app/agents/orchestrator.py)
const AGENTS: AgentMeta[] = [
  { key: "requirement", name: "Planner", desc: "Turns your idea into a structured PRD", icon: Doc },
  { key: "competitor", name: "Researcher", desc: "Market scan & competitive analysis", icon: Search },
  { key: "designer", name: "Architect", desc: "System architecture & product design", icon: Palette },
  { key: "builder", name: "Builder", desc: "Generates the working product", icon: Hammer },
  { key: "tester", name: "QA", desc: "Quality checklist & verification", icon: Beaker },
];

function latestStep(run: Run | null, agent: string): RunStep | undefined {
  if (!run) return undefined;
  const matches = run.steps.filter((s) => s.agent === agent);
  return matches.length ? matches[matches.length - 1] : undefined;
}

function NodeIcon({ status }: { status: string }) {
  if (status === "done") return <Check className="size-4 text-mint" />;
  if (status === "running") return <Spinner className="size-4 text-ember" />;
  if (status === "failed") return <XMark className="size-4 text-danger" />;
  return <span className="size-1.5 rounded-full bg-current opacity-50" />;
}

export default function Pipeline({ run }: { run: Run | null }) {
  return (
    <ol>
      {AGENTS.map((agent, i) => {
        const step = latestStep(run, agent.key);
        const status = step?.status ?? "pending";
        const Icon = agent.icon;

        const nodeCls =
          status === "done"
            ? "border-mint/35 bg-mint/10 text-mint"
            : status === "running"
              ? "border-ember/45 bg-ember-dim text-ember shadow-[0_0_18px_rgba(35,169,242,0.25)]"
              : status === "failed"
                ? "border-danger/35 bg-danger/10 text-danger"
                : "border-line2 bg-ink text-fg3";

        return (
          <li key={agent.key} className="relative flex gap-4 pb-7 last:pb-0">
            {i < AGENTS.length - 1 && (
              <span
                aria-hidden
                className={`absolute left-[19px] top-11 bottom-0 w-px ${
                  status === "done" ? "bg-mint/30" : "bg-line2"
                }`}
              />
            )}

            <span
              className={`relative z-10 grid size-10 shrink-0 place-items-center rounded border ${nodeCls}`}
            >
              {status === "pending" || status === "skipped" ? (
                <Icon className="size-4 opacity-80" />
              ) : (
                <NodeIcon status={status} />
              )}
            </span>

            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                <span
                  className={`font-display text-sm font-semibold ${
                    status === "running"
                      ? "text-ember-bright"
                      : status === "failed"
                        ? "text-rose-200"
                        : status === "pending" || status === "skipped"
                          ? "text-fg2"
                          : "text-fg"
                  }`}
                >
                  {agent.name}
                </span>
                {status === "running" && (
                  <span className="font-mono text-[0.58rem] uppercase tracking-[0.18em] text-ember/80">
                    working…
                  </span>
                )}
              </div>
              <p className="mt-0.5 font-mono text-[0.62rem] text-fg3">{agent.desc}</p>
              {step?.detail && status !== "pending" && (
                <p
                  className={`mt-1.5 rounded border px-3 py-2 font-mono text-[0.65rem] leading-relaxed ${
                    status === "failed"
                      ? "border-danger/25 bg-danger/[0.06] text-rose-200/90"
                      : "border-line bg-ink2 text-fg2"
                  }`}
                >
                  {step.detail}
                </p>
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
