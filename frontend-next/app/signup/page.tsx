import type { Metadata } from "next";
import { SignUp } from "@clerk/nextjs";
import { clerkEnabled, clerkTheme } from "@/lib/clerkConfig";
import { AuthShell, ClerkSetupNotice } from "@/components/AuthShell";

export const metadata: Metadata = { title: "Create account — ShipGen" };

export default function SignupPage() {
  if (!clerkEnabled) {
    return (
      <AuthShell label="// create account">
        <ClerkSetupNotice />
      </AuthShell>
    );
  }

  return (
    <AuthShell label="// create account">
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
