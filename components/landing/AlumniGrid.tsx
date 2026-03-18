"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import type { AlumniRow } from "./types";

type AlumniGridProps = {
  alumni: AlumniRow[];
  isLoading: boolean;
};

export function AlumniGrid({ alumni, isLoading }: AlumniGridProps) {
  return (
    <section
      id="alumni-showcase"
      className="scroll-mt-24 bg-white py-20 sm:py-24"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          className="mx-auto max-w-3xl text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6 }}
        >
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-blue-700">
            Alumni Showcase
          </p>
          <h2 className="mt-3 text-3xl font-bold text-slate-900 sm:text-4xl md:text-5xl">
            Faces of Our Growing Legacy
          </h2>
        </motion.div>

        {isLoading ? (
          <div className="mt-12 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <div
                key={`loading-card-${index + 1}`}
                className="h-72 animate-pulse rounded-3xl border border-slate-200 bg-slate-100"
              />
            ))}
          </div>
        ) : alumni.length === 0 ? (
          <div className="mt-12 rounded-3xl border border-slate-200 bg-slate-50 p-10 text-center text-slate-600">
            New alumni profiles will appear here soon.
          </div>
        ) : (
          <div className="mt-12 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {alumni.map((entry, index) => (
              <motion.article
                key={String(entry.id)}
                className="group relative overflow-hidden rounded-3xl border border-slate-200 shadow-[0_14px_34px_rgba(2,8,23,0.12)]"
                initial={{ opacity: 0, y: 28 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.25 }}
                transition={{ duration: 0.55, delay: index * 0.09 }}
              >
                <div className="relative h-80">
                  <Image
                    src={entry.photo_url || "/images/scl.jpg"}
                    alt={`${entry.name?.trim() || "Alumni"} photo`}
                    fill
                    loading="lazy"
                    unoptimized={Boolean(entry.photo_url)}
                    className="object-cover transition duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#041129]/92 via-[#041129]/35 to-transparent" />

                  <div className="absolute inset-x-0 bottom-0 translate-y-2 p-5 text-white transition duration-300 group-hover:translate-y-0">
                    <p className="text-xl font-bold">
                      {entry.name?.trim() || "Alumni Member"}
                    </p>
                    <p className="mt-1 text-sm text-slate-200">
                      Session: {entry.session?.trim() || "Not shared"}
                    </p>
                  </div>
                </div>
              </motion.article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
