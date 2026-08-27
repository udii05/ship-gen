import Link from "next/link";

export default function Hero() {
  return (
    <section className="relative overflow-hidden border-b border-line">
      <div className="grid-bg" />
      <div className="ember-glow -top-40 left-1/2 -translate-x-1/2" />

      {/* Centered hero — content fits the viewport so CTAs are visible without scrolling */}
      <div className="relative z-10 mx-auto flex min-h-[100svh] max-w-3xl flex-col items-center justify-center px-6 pb-8 pt-32 text-center">
        <div className="eyebrow justify-center before:hidden">
          multi-agent sdlc pipeline · human-gated
        </div>

        <h1 className="heading-lux mt-8 text-[clamp(3.1rem,6.8vw,5.4rem)]">
          Ship software with
          <em className="block">a crew of agents</em>
        </h1>

        <p className="mt-7 max-w-xl text-center text-[0.95rem] font-medium leading-[1.75] text-fg2">
          Describe the product you want. A crew of specialized agents{" "}
          <strong className="font-medium text-fg">plans, researches, designs and builds</strong> it —
          pausing at every gate for <strong className="font-medium text-fg">your approval</strong>.
        </p>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <Link href="/signup" className="btn-hero btn-hero-primary">
            Start building →
          </Link>
          <Link href="/login" className="btn-hero btn-hero-ghost">
            Sign in
          </Link>
        </div>

        <p className="mt-7 font-mono text-[0.62rem] uppercase tracking-[0.16em] text-fg3">
          Free tier included · No credit card · Deploy in one click
        </p>
      </div>
    </section>
  );
}