import type { Metadata } from "next";
import { SignIn } from "@clerk/nextjs";
import { clerkEnabled, clerkTheme } from "@/lib/clerkConfig";
import { AuthShell, ClerkSetupNotice } from "@/components/AuthShell";

export const metadata: Metadata = { title: "Sign in · ShipGen" };

export default function LoginPage() {
  if (!clerkEnabled) {
    return (
      <AuthShell title="Authentication" subtitle="Clerk keys are not configured yet.">
        <ClerkSetupNotice />
      </AuthShell>
    );
  }

  return (
    <AuthShell
      title="Welcome back"
      subtitle="Sign in to your ShipGen account, your crew is waiting."
    >
      <SignIn
        routing="path"
        path="/login"
        signUpUrl="/signup"
        fallbackRedirectUrl="/dashboard"
        appearance={clerkTheme}
      />
    </AuthShell>
  );
}