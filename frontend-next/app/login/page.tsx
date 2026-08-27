import type { Metadata } from "next";
import { SignIn } from "@clerk/nextjs";
import { clerkEnabled, clerkTheme } from "@/lib/clerkConfig";
import { AuthShell, ClerkSetupNotice } from "@/components/AuthShell";

export const metadata: Metadata = { title: "Sign in — ShipGen" };

export default function LoginPage() {
  if (!clerkEnabled) {
    return (
      <AuthShell label="// sign in">
        <ClerkSetupNotice />
      </AuthShell>
    );
  }

  return (
    <AuthShell label="// sign in">
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
