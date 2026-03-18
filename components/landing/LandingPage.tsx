"use client";

import dynamic from "next/dynamic";
import { HeroSection } from "./HeroSection";
import { LandingNavbar } from "./LandingNavbar";
import { StatsSection } from "./StatsSection";
import { useLandingData } from "./useLandingData";

const AlumniPreviewSection = dynamic(
  () =>
    import("./AlumniPreviewSection").then((mod) => mod.AlumniPreviewSection),
  { ssr: false },
);

const CommunitySection = dynamic(
  () => import("./CommunitySection").then((mod) => mod.CommunitySection),
  { ssr: false },
);

const CtaSection = dynamic(
  () => import("./CtaSection").then((mod) => mod.CtaSection),
  { ssr: false },
);

const LandingFooter = dynamic(
  () => import("./LandingFooter").then((mod) => mod.LandingFooter),
  { ssr: false },
);

export function LandingPage() {
  const { stats, latestAlumni, isLoading, hasError } = useLandingData();

  return (
    <main className="bg-white text-slate-900">
      <LandingNavbar />
      <HeroSection />
      <StatsSection stats={stats} hasError={hasError} />
      <AlumniPreviewSection latestAlumni={latestAlumni} isLoading={isLoading} />
      <CommunitySection />
      <CtaSection />
      <LandingFooter />
    </main>
  );
}
