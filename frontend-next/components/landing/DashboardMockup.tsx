import { LogoMark } from "../Logo";

/** Mini stage-progress dots: done / active / pending */
function Stages({ done, active }: { done: number; active: boolean }) {
  return (
    <span className="flex items-center gap-1.5">
      {Array.from({ length: 5 }).map((_, i) => {
        const state = i < done ? "done" : i === done && active ? "active" : "todo";
        return (
          <span
            key={i}
            className={
              state === "done"
                ? "size-1.5 rounded-full bg-mint"
                : state === "active"
                  ? "size-1.5 animate-pulse rounded-full bg-ember shadow-[0_0_6px_rgba(35,169,242,0.9)]"
                  : "size-1.5 rounded-full bg-white/12"
            }
          />
        );
      })}
    </span>
  );
}

const PROJECTS = [
  {
    name: "InvoicePilot",
    desc: "AI invoice chasing for freelancers",
    stage: "Builder writing code…",
    done: 3,
    active: true,
    pill: { text: "building", cls: "border-ember/35 bg-ember-dim text-ember-bright" },
  },
  {
    name: "HabitLoop",
    desc: "Tiny habit tracker with streaks",
    stage: "Waiting on PRD approval",
    done: 0,
    active: false,
    pill: { text: "needs approval", cls: "border-ember/35 bg-ember-dim text-ember-bright" },
  },
  {
    name: "ChurnRadar",
    desc: "Predict churn from usage signals",
    stage: "Deployed to Vercel",
    done: 5,
    active: false,
    pill: { text: "deployed", cls: "border-mint/35 bg-mint/10 text-mint" },
  },
];

const SIDEBAR = [
  { label: "Projects", active: true },
  { label: "Deploys" },
  { label: "Settings" },
];

/** A static, styled mockup of the real ShipGen dashboard — app shell with sidebar. */
export default function DashboardMockup() {
  return (
    <div className="overflow-hidden rounded-lg border border-line2 bg-ink2 shadow-2xl shadow-black/50">
      {/* Browser chrome */}
      <div className="flex items-center gap-3 border-b border-line bg-surface px-4 py-2.5">
        <span className="flex gap-1.5">
          <span className="size-2.5 rounded-full bg-white/10" />
          <span className="size-2.5 rounded-full bg-white/10" />
          <span className="size-2.5 rounded-full bg-white/10" />
        </span>
        <span className="mx-auto rounded-full border border-line bg-ink px-4 py-1 font-mono text-[0.6rem] text-fg3">
          app.shipgen.dev/dashboard
        </span>
        <span className="w-10" />
      </div>

      {/* App shell: sidebar + main */}
      <div className="flex min-h-[380px] text-left">
        {/* Sidebar */}
        <aside className="hidden w-44 shrink-0 flex-col border-r border-line bg-ink px-3 py-4 sm:flex">
          <span className="flex items-center gap-2 px-2">
            <LogoMark className="size-5" />
            <span className="font-logo text-[0.7rem] text-fg">
              Ship<span className="text-ember-bright">Gen</span>
            </span>
          </span>

          <nav className="mt-6 flex flex-col gap-1">
            {SIDEBAR.map((item) => (
              <span
                key={item.label}
                className={`rounded px-2.5 py-1.5 font-mono text-[0.58rem] uppercase tracking-[0.1em] ${
                  item.active
                    ? "bg-ember-dim text-ember-bright"
                    : "text-fg3"
                }`}
              >
                {item.label}
              </span>
            ))}
          </nav>

          <span className="mt-auto flex items-center gap-2 border-t border-line px-2 pt-3">
            <span className="size-5 rounded-full bg-gradient-to-br from-ember to-ember-deep" />
            <span className="font-mono text-[0.55rem] text-fg3">you@shipgen.dev</span>
          </span>
        </aside>

        {/* Main */}
        <div className="min-w-0 flex-1 bg-ink p-5 sm:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-display text-sm font-semibold text-fg">Your projects</p>
              <p className="mt-0.5 font-mono text-[0.55rem] text-fg3">3 projects · 1 awaiting you</p>
            </div>
            <span className="rounded-full bg-ember px-3 py-1.5 font-mono text-[0.58rem] font-bold text-white">
              + new project
            </span>
          </div>

          <div className="mt-4 flex flex-col gap-2.5">
            {PROJECTS.map((p) => (
              <div
                key={p.name}
                className="flex flex-col gap-3 rounded-md border border-line bg-surface px-4 py-3.5 transition hover:border-ember/30 sm:flex-row sm:items-center"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2.5">
                    <span className="font-display text-[0.82rem] font-semibold text-fg">{p.name}</span>
                    <span className={`rounded-full border px-2 py-0.5 font-mono text-[0.52rem] uppercase tracking-[0.08em] ${p.pill.cls}`}>
                      {p.pill.text}
                    </span>
                  </div>
                  <p className="mt-1 truncate font-mono text-[0.58rem] text-fg3">{p.desc}</p>
                </div>
                <div className="flex items-center gap-4">
                  <Stages done={p.done} active={p.active} />
                  <span className="w-36 truncate text-right font-mono text-[0.56rem] text-fg3">{p.stage}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Pipeline strip for the active project */}
          <div className="mt-4 rounded-md border border-line bg-surface px-4 py-3">
            <p className="font-mono text-[0.55rem] uppercase tracking-[0.16em] text-fg3">
              InvoicePilot — pipeline
            </p>
            <div className="mt-2.5 flex items-center gap-1 overflow-hidden">
              {["Planner", "Researcher", "Architect", "Builder", "QA"].map((s, i) => (
                <span key={s} className="flex min-w-0 items-center gap-1">
                  <span
                    className={`truncate rounded-full border px-2 py-0.5 font-mono text-[0.52rem] ${
                      i < 3
                        ? "border-mint/30 bg-mint/10 text-mint"
                        : i === 3
                          ? "border-ember/40 bg-ember-dim text-ember-bright"
                          : "border-line bg-ink text-fg3"
                    }`}
                  >
                    {s}
                  </span>
                  {i < 4 && <span className="text-[0.5rem] text-fg3">→</span>}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}