import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { Fraunces, Inter, JetBrains_Mono, Space_Grotesk } from "next/font/google";
import { clerkEnabled } from "@/lib/clerkConfig";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const fraunces = Fraunces({ subsets: ["latin"], variable: "--font-fraunces" });
const jetbrainsMono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-jetbrains-mono" });
const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-space-grotesk",
});

export const metadata: Metadata = {
  title: "ShipGen · Multi-Agent Software Pipeline",
  description:
    "Describe a product. A team of AI agents plans, researches, designs, builds and QA-checks it, while you approve every gate.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const shell = (
    <html lang="en" className={`${inter.variable} ${fraunces.variable} ${jetbrainsMono.variable} ${spaceGrotesk.variable}`}>
      <body>{children}</body>
    </html>
  );

  // Graceful degradation: the app renders (with setup instructions on auth pages)
  // until Clerk keys are added to .env.local.
  if (!clerkEnabled) return shell;

  return <ClerkProvider>{shell}</ClerkProvider>;
}
