"use client";

import dynamic from "next/dynamic";
import { DeveloperFooter } from "./DeveloperFooter";
import { HeroSection } from "./HeroSection";
import { Navbar } from "./Navbar";
import { useLandingData } from "./useLandingData";

const LegacySection = dynamic(
  () => import("./LegacySection").then((mod) => mod.LegacySection),
  { ssr: false },
);

const WhyJoinSection = dynamic(
  () => import("./WhyJoinSection").then((mod) => mod.WhyJoinSection),
  { ssr: false },
);

const Stats = dynamic(() => import("./Stats").then((mod) => mod.Stats), {
  ssr: false,
});

const TestimonialsSection = dynamic(
  () => import("./TestimonialsSection").then((mod) => mod.TestimonialsSection),
  { ssr: false },
);

const CTA = dynamic(() => import("./CTA").then((mod) => mod.CTA), {
  ssr: false,
});

export function LandingPage() {
  const { stats, hasError } = useLandingData();

  return (
    <main className="bg-white text-slate-900">
      <Navbar />
      <HeroSection />
      <LegacySection totalAlumni={stats.totalAlumni} />
      <WhyJoinSection />
      <Stats stats={stats} hasError={hasError} />
      <TestimonialsSection />
      <CTA />
      <DeveloperFooter />
    </main>
  );
}
