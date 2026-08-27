const ITEMS = [
  { tag: "PLANNER", text: "drafted PRD — InvoicePilot" },
  { tag: "HUMAN", text: "approved prd gate" },
  { tag: "RESEARCHER", text: "scanned 6 competitors" },
  { tag: "ARCHITECT", text: "shipped design spec" },
  { tag: "HUMAN", text: "approved design gate" },
  { tag: "BUILDER", text: "generated product v1" },
  { tag: "QA", text: "checklist passed" },
  { tag: "DEPLOY", text: "live on Vercel" },
];

export default function Ticker() {
  const row = (keyPrefix: string) =>
    ITEMS.map((item, i) => (
      <span
        key={`${keyPrefix}-${i}`}
        className="ticker-item inline-flex items-center gap-2 font-mono text-[0.68rem] text-fg2"
      >
        <span className="text-ember">◈</span>
        <span className="font-semibold tracking-[0.08em] text-fg">{item.tag}</span>
        {item.text}
      </span>
    ));

  return (
    <div className="ticker-wrap flex items-center gap-4 overflow-hidden border-b border-line bg-ink2 py-3">
      <span className="z-10 shrink-0 border-r border-line2 bg-ink2 pl-5 pr-4 font-mono text-[0.65rem] uppercase tracking-[0.2em] text-ember">
        &gt;_ live feed
      </span>
      <div className="overflow-hidden">
        <div className="ticker-track">
          {row("a")}
          {row("b")}
        </div>
      </div>
    </div>
  );
}
