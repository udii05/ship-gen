// Clerk availability + theme shared by auth surfaces.
// The app degrades gracefully until Clerk keys are configured in .env.local.

export const clerkEnabled = Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY);

export const clerkTheme = {
  variables: {
    colorPrimary: "#23A9F2",
    colorBackground: "#161311",
    colorText: "#e7e5e4",
    colorTextSecondary: "#a8a29e",
    colorInputBackground: "#0c0a09",
    colorInputText: "#e7e5e4",
    colorDanger: "#fb7185",
    colorSuccess: "#34d399",
    colorNeutral: "#6f6a65",
    colorTextOnPrimary: "#fff",
    fontFamily: "var(--font-inter), Inter, ui-sans-serif, sans-serif",
    fontFamilyButtons: "var(--font-jetbrains-mono), JetBrains Mono, monospace",
    borderRadius: "6px",
    fontSize: "14px",
  },
  elements: {
    rootBox: "mx-auto w-full",
    card: "border border-white/10 shadow-2xl shadow-black/50",
    headerTitle: "!text-zinc-100 !font-semibold",
    headerSubtitle: "!text-zinc-500",
    socialButtonsIconButton: "border border-white/15 bg-black/30 !text-zinc-200",
    socialButtonsProviderIcon: "bg-transparent",
    dividerLine: "!bg-white/10",
    dividerText: "!text-zinc-500",
    formFieldLabel: "!text-zinc-400",
    formFieldInput: "border-white/15",
    footerActionLink: "!text-[#44b8f7] hover:!text-[#5cc8fa]",
    formButtonPrimary: "!bg-[#23A9F2] hover:!bg-[#1A8FD0] !text-white",
  },
};
