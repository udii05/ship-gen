const STYLES: Record<string, { pill: string; dot: string; pulse?: boolean }> = {
  draft: { pill: "border-line2 text-fg2", dot: "bg-fg3" },
  none: { pill: "border-line2 text-fg2", dot: "bg-fg3" },
  queued: { pill: "border-line2 text-fg2", dot: "bg-fg3" },
  waiting: { pill: "border-line2 text-fg3", dot: "bg-fg3" },
  pending: { pill: "border-ember/35 bg-ember-dim text-ember-bright", dot: "bg-ember", pulse: true },
  in_progress: { pill: "border-ember/35 bg-ember-dim text-ember-bright", dot: "bg-ember", pulse: true },
  running: { pill: "border-ember/35 bg-ember-dim text-ember-bright", dot: "bg-ember", pulse: true },
  requested: { pill: "border-ember/35 bg-ember-dim text-ember-bright", dot: "bg-ember", pulse: true },
  ready: { pill: "border-mint/30 bg-mint/10 text-emerald-300", dot: "bg-mint" },
  done: { pill: "border-mint/30 bg-mint/10 text-emerald-300", dot: "bg-mint" },
  approved: { pill: "border-mint/30 bg-mint/10 text-emerald-300", dot: "bg-mint" },
  deployed: { pill: "border-cyan-400/30 bg-cyan-400/10 text-cyan-300", dot: "bg-cyan-400" },
  failed: { pill: "border-danger/35 bg-danger/10 text-rose-300", dot: "bg-danger" },
  rejected: { pill: "border-danger/35 bg-danger/10 text-rose-300", dot: "bg-danger" },
  skipped: { pill: "border-line text-fg3", dot: "bg-fg3" },
};

const FALLBACK = STYLES.draft;

const LABELS: Record<string, string> = {
  in_progress: "in progress",
};

export default function StatusPill({ status }: { status: string }) {
  const s = STYLES[status] ?? FALLBACK;
  const label = LABELS[status] ?? status.replace(/_/g, " ");
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-sm border px-2 py-0.5 font-mono text-[0.58rem] font-semibold uppercase tracking-[0.12em] ${s.pill}`}
    >
      <span className="relative flex size-1.5">
        {s.pulse && (
          <span className={`absolute inline-flex h-full w-full animate-ping rounded-full opacity-60 ${s.dot}`} />
        )}
        <span className={`relative inline-flex size-1.5 rounded-full ${s.dot}`} />
      </span>
      {label}
    </span>
  );
}
