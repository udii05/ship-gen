import LandingNav from "@/components/landing/LandingNav";
import Hero from "@/components/landing/Hero";
import StackStrip from "@/components/landing/StackStrip";
import Showcase from "@/components/landing/Showcase";
import Ticker from "@/components/landing/Ticker";
import Metrics from "@/components/landing/Metrics";
import PipelineSection from "@/components/landing/PipelineSection";
import GatesSection from "@/components/landing/GatesSection";
import PricingSection from "@/components/landing/PricingSection";
import Testimonials from "@/components/landing/Testimonials";
import CtaFooter from "@/components/landing/CtaFooter";

export default function LandingPage() {
  return (
    <>
      <LandingNav />
      <main>
        <Hero />
        <StackStrip />
        <Showcase />
        <Ticker />
        <Metrics />
        <PipelineSection />
        <GatesSection />
        <PricingSection />
        <Testimonials />
        <CtaFooter />
      </main>
    </>
  );
}
