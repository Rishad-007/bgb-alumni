"use client";

import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import type { LandingStats } from "./types";

type StatsProps = {
  stats: LandingStats;
  hasError: boolean;
};

type CounterProps = {
  value: number;
  duration?: number;
};

function Counter({ value, duration = 1100 }: CounterProps) {
  const [displayValue, setDisplayValue] = useState(0);
  const currentValueRef = useRef(0);

  useEffect(() => {
    const startValue = currentValueRef.current;
    if (startValue === value) return;

    let frame = 0;
    const startTime = performance.now();

    const tick = (timestamp: number) => {
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const next = Math.round(startValue + (value - startValue) * eased);

      currentValueRef.current = next;
      setDisplayValue(next);

      if (progress < 1) {
        frame = requestAnimationFrame(tick);
      }
    };

    frame = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(frame);
    };
  }, [duration, value]);

  return <>{displayValue.toLocaleString()}</>;
}

export function Stats({ stats, hasError }: StatsProps) {
  const items = [
    {
      title: "Total Alumni",
      value: stats.totalAlumni,
      subtitle: "Registered members in our network",
    },
    {
      title: "New This Week",
      value: Math.max(0, Math.round(stats.recentRegistrations / 4)),
      subtitle: "Newly joined alumni in the past 7 days",
    },
  ];

  return (
    <section
      id="live-stats"
      className="scroll-mt-24 bg-[#03142b] py-20 sm:py-24"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          className="mx-auto max-w-3xl text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6 }}
        >
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-cyan-300">
            Live Stats
          </p>
          <h2 className="mt-3 text-3xl font-bold text-white sm:text-4xl md:text-5xl">
            Real-Time Ready Community Pulse
          </h2>
        </motion.div>

        <div className="mx-auto mt-12 grid max-w-4xl grid-cols-1 gap-5 md:grid-cols-2">
          {items.map((item, index) => (
            <motion.article
              key={item.title}
              className="rounded-3xl border border-white/15 bg-white/10 p-8 text-white shadow-[0_16px_36px_rgba(2,8,23,0.32)] backdrop-blur-sm"
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.55, delay: index * 0.1 }}
            >
              <p className="text-sm uppercase tracking-[0.14em] text-slate-200">
                {item.title}
              </p>
              <p className="mt-4 text-5xl font-black text-cyan-300">
                {hasError ? "-" : <Counter value={item.value} />}
              </p>
              <p className="mt-4 text-sm text-slate-200">{item.subtitle}</p>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
