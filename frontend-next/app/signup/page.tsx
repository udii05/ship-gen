import type { Metadata } from "next";
import { SignUp } from "@clerk/nextjs";
import { clerkEnabled, clerkTheme } from "@/lib/clerkConfig";
import { AuthShell, ClerkSetupNotice } from "@/components/AuthShell";

export const metadata: Metadata = { title: "Create account — ShipGen" };

export default function SignupPage() {
  if (!clerkEnabled) {
    return (
      <AuthShell title="Authentication" subtitle="Clerk keys are not configured yet.">
        <ClerkSetupNotice />
      </AuthShell>
    );
  }

  return (
    <AuthShell
      title="Create your account"
      subtitle="One brief away from your first agent-built product."
    >
      <SignUp
        routing="path"
        path="/signup"
        signInUrl="/login"
        fallbackRedirectUrl="/dashboard"
        appearance={clerkTheme}
      />
    </AuthShell>
  );
}