"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import Image from "next/image";
import Link from "next/link";

export function HeroSection() {
  const { scrollY } = useScroll();
  const backgroundY = useTransform(scrollY, [0, 700], [0, 120]);

  return (
    <section
      id="top"
      className="relative flex min-h-screen items-center justify-center overflow-hidden"
    >
      <motion.div className="absolute inset-0" style={{ y: backgroundY }}>
        <Image
          src="/images/heroPageImage.jpg"
          alt="Border Guard Public School and College campus"
          fill
          priority
          className="object-cover"
        />
      </motion.div>

      <div className="absolute inset-0 bg-gradient-to-b from-slate-950/85 via-blue-950/80 to-slate-950/90" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_20%,rgba(34,211,238,0.18),rgba(2,6,23,0.1)_35%,rgba(2,6,23,0.65)_85%)]" />

      <motion.div
        className="pointer-events-none absolute -left-24 top-24 h-56 w-56 rounded-full bg-cyan-300/25 blur-3xl"
        animate={{ y: [0, -18, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="pointer-events-none absolute -right-24 bottom-20 h-72 w-72 rounded-full bg-blue-400/20 blur-3xl"
        animate={{ y: [0, 22, 0] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />

      <div className="relative z-10 mx-auto flex w-full max-w-6xl flex-col items-center px-4 pt-24 text-center sm:px-6 lg:px-8">
        <motion.div
          className="mb-6 rounded-3xl border border-white/40 bg-white/15 p-2 shadow-2xl shadow-slate-950/50 backdrop-blur-sm"
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 4.8, repeat: Infinity, ease: "easeInOut" }}
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.6 }}
        >
          <Image
            src="/images/School-Logo.jpeg"
            alt="Border Guard Public School and College logo"
            width={110}
            height={110}
            priority
            className="h-20 w-20 rounded-2xl object-cover sm:h-24 sm:w-24"
          />
        </motion.div>

        <div className="w-full max-w-5xl rounded-3xl border border-white/20 bg-slate-950/40 px-5 py-8 shadow-2xl shadow-slate-950/60 backdrop-blur-md sm:px-8 sm:py-10">
          <motion.p
            className="mb-5 rounded-full border border-white/25 bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-cyan-100 sm:text-sm"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            Border Guard Public School and College Alumni
          </motion.p>

          <motion.h1
            className="mx-auto max-w-4xl text-4xl font-bold leading-tight text-white drop-shadow-[0_8px_30px_rgba(0,0,0,0.55)] sm:text-5xl md:text-6xl lg:text-7xl"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.15 }}
          >
            Reconnect. Remember. Rise Together.
          </motion.h1>

          <motion.p
            className="mx-auto mt-6 max-w-2xl text-base text-slate-100 sm:text-lg md:text-xl"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.25 }}
          >
            One trusted home for stories, friendships, and opportunities that
            keep the BGPSC spirit alive across generations.
          </motion.p>

          <motion.div
            className="mt-10 flex flex-col items-center gap-4 sm:flex-row"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.35 }}
          >
            <Link
              href="/register"
              className="rounded-full bg-blue-600 px-8 py-3.5 text-base font-semibold text-white shadow-xl shadow-blue-700/40 transition-all duration-300 hover:-translate-y-0.5 hover:bg-blue-500"
            >
              Join Alumni
            </Link>
            <a
              href="#community"
              className="rounded-full border border-white/30 bg-white/10 px-8 py-3.5 text-base font-semibold text-white backdrop-blur-sm transition-all duration-300 hover:border-cyan-200 hover:bg-white/15"
            >
              View Community
            </a>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
