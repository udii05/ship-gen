const STACK = ["Gemini", "OpenAI", "Vercel", "Docker", "PostgreSQL", "GitHub"];

export default function StackStrip() {
  return (
    <section className="border-b border-line bg-ink2">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-8 px-6 py-14">
        <p className="font-mono text-[0.6rem] uppercase tracking-[0.24em] text-fg3">
          works with your existing stack
        </p>
        <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-4">
          {STACK.map((name) => (
            <span
              key={name}
              className="cursor-default text-base font-medium text-fg2 transition hover:text-ember-bright sm:text-lg"
            >
              {name}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
