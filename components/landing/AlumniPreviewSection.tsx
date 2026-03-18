"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { SectionReveal } from "./SectionReveal";
import type { AlumniRow } from "./types";

type AlumniPreviewSectionProps = {
  latestAlumni: AlumniRow[];
  isLoading: boolean;
};

export function AlumniPreviewSection({
  latestAlumni,
  isLoading,
}: AlumniPreviewSectionProps) {
  return (
    <SectionReveal className="bg-slate-50 py-20" delay={0.05}>
      <div
        id="alumni"
        className="mx-auto max-w-7xl scroll-mt-24 px-4 sm:px-6 lg:px-8"
      >
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-cyan-700">
            Alumni Preview
          </p>
          <h2 className="mt-3 text-3xl font-bold text-slate-900 sm:text-4xl">
            Meet Members Joining the Community
          </h2>
        </div>

        {isLoading ? (
          <div className="mt-12 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <div
                key={`skeleton-${index + 1}`}
                className="h-72 animate-pulse rounded-2xl border border-slate-200 bg-white"
              />
            ))}
          </div>
        ) : latestAlumni.length === 0 ? (
          <div className="mt-10 rounded-2xl border border-slate-200 bg-white p-8 text-center text-slate-600">
            Alumni profiles will appear here as members register.
          </div>
        ) : (
          <div className="mt-12 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {latestAlumni.map((alumni, index) => (
              <motion.article
                key={String(alumni.id)}
                className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-lg shadow-slate-900/5"
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.25 }}
                transition={{ duration: 0.55, delay: index * 0.08 }}
                whileHover={{ y: -5 }}
              >
                <div className="relative h-44 overflow-hidden">
                  <Image
                    src="/images/scl.jpg"
                    alt="Alumni profile placeholder"
                    fill
                    loading="lazy"
                    className="object-cover transition duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/70 to-transparent opacity-70 transition-opacity duration-300 group-hover:opacity-90" />
                </div>
                <div className="space-y-2 p-5">
                  <h3 className="text-xl font-semibold text-slate-900">
                    {alumni.name?.trim() || "Unknown Alumni"}
                  </h3>
                  <p className="text-sm text-slate-600">
                    Session: {alumni.session?.trim() || "Not shared"}
                  </p>
                </div>
              </motion.article>
            ))}
          </div>
        )}
      </div>
    </SectionReveal>
  );
}
