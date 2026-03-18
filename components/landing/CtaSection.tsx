"use client";

import { motion } from "framer-motion";
import Link from "next/link";

export function CtaSection() {
  return (
    <section className="px-4 py-20 sm:px-6 lg:px-8">
      <motion.div
        className="mx-auto max-w-5xl overflow-hidden rounded-3xl bg-gradient-to-r from-blue-900 via-blue-700 to-cyan-600 px-8 py-14 text-center text-white shadow-2xl shadow-blue-900/30 sm:px-12"
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.35 }}
        transition={{ duration: 0.7, ease: "easeOut" }}
      >
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-100">
          Join the Next Chapter
        </p>
        <h2 className="mt-3 text-3xl font-bold sm:text-4xl md:text-5xl">
          Be part of the legacy
        </h2>
        <p className="mx-auto mt-5 max-w-2xl text-base text-blue-100 sm:text-lg">
          Connect with classmates, contribute to your school community, and keep
          every generation inspired.
        </p>
        <Link
          href="/register"
          className="mt-9 inline-flex rounded-full bg-white px-8 py-3.5 text-base font-semibold text-blue-700 transition-all duration-300 hover:-translate-y-0.5 hover:bg-slate-100"
        >
          Join Alumni Network
        </Link>
      </motion.div>
    </section>
  );
}
