"use client";

import { motion } from "framer-motion";
import Link from "next/link";

export function CTA() {
  return (
    <section id="final-cta" className="bg-[#020b1a] py-20 sm:py-24">
      <div className="mx-auto max-w-5xl px-4 text-center sm:px-6 lg:px-8">
        <motion.p
          className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-300"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.55 }}
        >
          Final Call
        </motion.p>
        <motion.h2
          className="mt-4 text-balance text-3xl font-black leading-tight text-white sm:text-5xl"
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.35 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          Once a student. Forever a part of the legacy.
        </motion.h2>
        <motion.div
          className="mt-10"
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.35 }}
          transition={{ duration: 0.55, delay: 0.2 }}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
        >
          <Link
            href="/register"
            className="inline-flex items-center rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 px-10 py-4 text-base font-bold text-slate-950 shadow-[0_0_34px_rgba(56,189,248,0.42)] transition-shadow duration-300 hover:shadow-[0_0_48px_rgba(56,189,248,0.6)]"
          >
            Register Now
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
