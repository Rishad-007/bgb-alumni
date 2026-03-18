"use client";

import { motion } from "framer-motion";

type LegacySectionProps = {
  totalAlumni: number;
};

export function LegacySection({ totalAlumni }: LegacySectionProps) {
  const legacyStats = [
    { label: "Years of excellence", value: "25+" },
    { label: "Registered alumni", value: `${totalAlumni.toLocaleString()}+` },
  ];

  return (
    <section id="legacy" className="scroll-mt-24 bg-white py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          className="mx-auto max-w-3xl text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.35 }}
          transition={{ duration: 0.6 }}
        >
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-blue-700">
            Trust and Legacy
          </p>
          <h2 className="mt-3 text-3xl font-bold leading-tight text-slate-900 sm:text-4xl md:text-5xl">
            A Legacy That Lives On
          </h2>
          <p className="mt-5 text-base leading-relaxed text-slate-600 sm:text-lg">
            Every classroom memory, every achievement, every friendship
            continues beyond graduation. This alumni network honors that journey
            and keeps our school spirit alive across generations.
          </p>
        </motion.div>

        <div className="mt-12 grid grid-cols-1 gap-5 sm:grid-cols-2">
          {legacyStats.map((stat, index) => (
            <motion.article
              key={stat.label}
              className="rounded-3xl border border-slate-200 bg-slate-50 p-8 shadow-[0_12px_30px_rgba(2,8,23,0.06)]"
              initial={{ opacity: 0, y: 22 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.55, delay: index * 0.1 }}
            >
              <p className="text-sm font-medium uppercase tracking-[0.12em] text-slate-500">
                {stat.label}
              </p>
              <p className="mt-3 text-4xl font-extrabold text-slate-900 sm:text-5xl">
                {stat.value}
              </p>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
