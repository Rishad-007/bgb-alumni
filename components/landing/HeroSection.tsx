"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useScroll, useTransform } from "framer-motion";
import { NoticeBoard } from "./NoticeBoard.tsx";

export function HeroSection() {
  const { scrollY } = useScroll();
  const backgroundScale = useTransform(scrollY, [0, 600], [1, 1.1]);
  const backgroundY = useTransform(scrollY, [0, 600], [0, -40]);

  const headlineWords = [
    "Border",
    "Guard",
    "Public",
    "School",
    "and",
    "College",
  ];

  return (
    <section
      id="top"
      className="relative isolate flex min-h-screen items-center overflow-hidden bg-[#020b1a]"
    >
      <motion.div
        className="absolute inset-0"
        style={{ scale: backgroundScale, y: backgroundY }}
      >
        <Image
          src="/images/heroPageImage.jpg"
          alt="Border Guard Public School and College campus"
          fill
          priority
          className="object-cover"
        />
      </motion.div>

      <div className="absolute inset-0 bg-gradient-to-b from-slate-950/45 via-slate-950/70 to-[#030a17]/95" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_18%,rgba(8,145,178,0.26),rgba(2,8,23,0)_45%),radial-gradient(circle_at_85%_78%,rgba(37,99,235,0.24),rgba(2,6,23,0)_42%)]" />

      <motion.div
        className="pointer-events-none absolute -left-20 top-28 h-64 w-64 rounded-full border border-cyan-300/15 bg-cyan-400/10 blur-3xl"
        animate={{ y: [0, -16, 0] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="pointer-events-none absolute -right-16 bottom-20 h-72 w-72 rounded-full border border-blue-300/15 bg-blue-300/10 blur-3xl"
        animate={{ y: [0, 16, 0] }}
        transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
      />

      <div className="relative z-10 mx-auto w-full max-w-7xl px-4 pb-16 pt-28 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(340px,420px)] lg:items-end">
          <motion.div
            className="max-w-3xl"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <div className="flex flex-col items-start">
              <motion.div
                className="relative mb-8 flex w-full justify-center lg:justify-start"
                initial={{ opacity: 0, scale: 0.85, y: 30 }}
                animate={{ opacity: 1, scale: 1, y: -8 }}
                transition={{
                  duration: 0.8,
                  delay: 0.2,
                  ease: [0.16, 1, 0.3, 1],
                }}
              >
                <div className="relative h-24 w-24 rounded-full border border-white/45 bg-white/10 p-1.5 backdrop-blur-md">
                  <motion.div
                    className="absolute inset-0 rounded-full bg-cyan-300/30 blur-xl"
                    animate={{
                      opacity: [0.28, 0.62, 0.28],
                      scale: [0.96, 1.08, 0.96],
                    }}
                    transition={{
                      duration: 3.2,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  />
                  <Image
                    src="/images/School-Logo.jpeg"
                    alt="Border Guard Public School and College logo"
                    width={92}
                    height={92}
                    priority
                    className="relative h-full w-full rounded-full object-cover"
                  />
                </div>
              </motion.div>

              <h1 className="text-balance text-4xl font-extrabold leading-[1.02] text-white drop-shadow-[0_16px_28px_rgba(2,8,23,0.55)] sm:text-5xl md:text-6xl lg:text-7xl">
                {headlineWords.map((word, index) => (
                  <motion.span
                    key={word}
                    className="mr-3 inline-block"
                    initial={{ opacity: 0, y: 18 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      duration: 0.55,
                      delay: 0.35 + index * 0.08,
                      ease: "easeOut",
                    }}
                  >
                    {word}
                  </motion.span>
                ))}
              </h1>

              <motion.h2
                className="mt-4 bg-gradient-to-r from-cyan-300 via-sky-200 to-blue-300 bg-clip-text text-3xl font-extrabold text-transparent sm:text-4xl md:text-5xl"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.95, ease: "easeOut" }}
              >
                Alumni Network
              </motion.h2>

              <motion.p
                className="mt-6 max-w-2xl text-base leading-relaxed text-slate-200 sm:text-lg md:text-xl"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.7, delay: 1.15, ease: "easeOut" }}
              >
                Reconnect with your roots. Be part of a legacy.
              </motion.p>

              <motion.div
                className="mt-10 flex w-full justify-center sm:justify-start"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 1.3, ease: "easeOut" }}
              >
                <motion.div
                  initial={{ y: 8 }}
                  animate={{ y: [8, 0, -3, 0] }}
                  transition={{ duration: 0.9, delay: 1.35, ease: "easeOut" }}
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.97 }}
                >
                  <Link
                    href="/register"
                    className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 px-8 py-3.5 text-base font-bold text-slate-950 shadow-[0_0_30px_rgba(14,165,233,0.42)] transition-shadow duration-300 hover:shadow-[0_0_44px_rgba(56,189,248,0.6)]"
                  >
                    Join Alumni
                  </Link>
                </motion.div>
              </motion.div>
            </div>
          </motion.div>

          <div className="relative pb-8 lg:pb-0">
            <NoticeBoard />
          </div>
        </div>

        <motion.a
          href="#legacy"
          className="absolute bottom-8 left-1/2 inline-flex -translate-x-1/2 flex-col items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-200/90"
          animate={{ y: [0, 7, 0] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
        >
          Scroll
          <span className="inline-flex h-9 w-6 items-start justify-center rounded-full border border-white/45 p-1">
            <motion.span
              className="h-2 w-2 rounded-full bg-cyan-300"
              animate={{ y: [0, 12, 0], opacity: [0.3, 1, 0.3] }}
              transition={{
                duration: 1.8,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          </span>
        </motion.a>
      </div>
    </section>
  );
}
