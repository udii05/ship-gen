import type { Metadata } from "next";
import { AuthenticateWithRedirectCallback } from "@clerk/nextjs";

export const metadata: Metadata = { title: "Creating your account · ShipGen" };

export default function SSOCallbackPage() {
  return (
    <div className="relative grid min-h-screen place-items-center overflow-hidden px-4">
      <div className="grid-bg" />
      <div className="ember-glow -top-52 left-1/2 -translate-x-1/2" />
      <div className="relative z-10 text-center">
        <p className="font-mono text-[0.68rem] uppercase tracking-[0.2em] text-fg3">
          completing sign-up…
        </p>
        <AuthenticateWithRedirectCallback />
      </div>
    </div>
  );
}