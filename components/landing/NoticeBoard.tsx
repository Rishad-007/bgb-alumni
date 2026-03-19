"use client";

import { motion } from "framer-motion";

const latestNotice = {
  title: "Alumni Registrations Open!",
  body: "Grand reunion registrations are now open. Confirm your participation and reconnect with your batchmates.",
  date: "Updated 2 hours ago",
};

export function NoticeBoard() {
  return (
    <motion.aside
      className="relative overflow-hidden rounded-3xl border border-white/30 bg-white/12 p-6 text-white shadow-2xl shadow-slate-950/40 backdrop-blur-xl"
      initial={{ opacity: 0, x: 32, y: 20 }}
      animate={{ opacity: 1, x: 0, y: 0 }}
      transition={{ duration: 0.8, delay: 0.9, ease: "easeOut" }}
    >
      <motion.div
        className="pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full bg-cyan-300/20 blur-2xl"
        animate={{ y: [0, -8, 0], opacity: [0.3, 0.55, 0.3] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      />

      <motion.div
        animate={{ y: [0, -6, 0] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
      >
        <p className="text-sm font-semibold tracking-[0.16em] text-cyan-200">
          📢 NOTICE BOARD
        </p>
        <div className="mt-4 rounded-2xl border border-white/20 bg-slate-950/35 p-4">
          <h3 className="text-lg font-bold text-white">{latestNotice.title}</h3>
          <p className="mt-2 text-sm leading-relaxed text-slate-200">
            {latestNotice.body}
          </p>
          <p className="mt-4 text-xs uppercase tracking-[0.14em] text-slate-300">
            {latestNotice.date}
          </p>
        </div>
      </motion.div>
    </motion.aside>
  );
}
