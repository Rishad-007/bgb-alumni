"use client";

import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { SectionReveal } from "./SectionReveal";
import type { LandingStats } from "./types";

type StatsSectionProps = {
  stats: LandingStats;
  hasError: boolean;
};

type AnimatedCountProps = {
  value: number;
  durationMs?: number;
};

function AnimatedCount({ value, durationMs = 900 }: AnimatedCountProps) {
  const [displayedValue, setDisplayedValue] = useState(0);
  const currentValueRef = useRef(0);

  useEffect(() => {
    const startValue = currentValueRef.current;
    const targetValue = value;

    if (startValue === targetValue) return;

    let frameId = 0;
    const startTime = performance.now();

    const animate = (time: number) => {
      const elapsed = time - startTime;
      const progress = Math.min(elapsed / durationMs, 1);
      const nextValue = Math.round(
        startValue + (targetValue - startValue) * progress,
      );

      currentValueRef.current = nextValue;
      setDisplayedValue(nextValue);

      if (progress < 1) {
        frameId = requestAnimationFrame(animate);
      }
    };

    frameId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(frameId);
    };
  }, [durationMs, value]);

  return <>{displayedValue.toLocaleString()}</>;
}

export function StatsSection({ stats, hasError }: StatsSectionProps) {
  const cards = [
    {
      label: "Total Alumni",
      value: stats.totalAlumni,
      hint: "Growing with every graduating batch",
    },
    {
      label: "Active Members",
      value: stats.activeMembers,
      hint: "Recently engaged alumni activity",
    },
    {
      label: "Recent Registrations",
      value: stats.recentRegistrations,
      hint: "New members in the last 30 days",
    },
  ];

  return (
    <SectionReveal
      className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8"
      delay={0.1}
    >
      <div id="stats" className="scroll-mt-24">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-blue-700">
            Real-Time School Pulse
          </p>
          <h2 className="mt-3 text-3xl font-bold text-slate-900 sm:text-4xl">
            Numbers That Reflect Our Shared Journey
          </h2>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-5 md:grid-cols-3">
          {cards.map((card, index) => (
            <motion.article
              key={card.label}
              className="rounded-2xl border border-slate-200 bg-white p-7 shadow-lg shadow-slate-900/5"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.55, delay: index * 0.1 }}
              whileHover={{ y: -6, scale: 1.01 }}
            >
              <p className="text-sm font-medium text-slate-500">{card.label}</p>
              <p className="mt-4 text-4xl font-bold text-slate-900">
                {hasError ? "-" : <AnimatedCount value={card.value} />}
              </p>
              <p className="mt-3 text-sm text-slate-500">{card.hint}</p>
            </motion.article>
          ))}
        </div>
      </div>
    </SectionReveal>
  );
}
