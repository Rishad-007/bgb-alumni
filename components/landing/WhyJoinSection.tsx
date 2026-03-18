"use client";

import { motion } from "framer-motion";

const items = [
  {
    title: "Networking",
    description:
      "Reconnect with friends and grow your circle with alumni across batches and professions.",
    icon: "🤝",
  },
  {
    title: "Opportunities",
    description:
      "Discover mentorship, career openings, and collaborations within a trusted school community.",
    icon: "🚀",
  },
  {
    title: "Events",
    description:
      "Get first updates on reunions, campus visits, and special alumni gatherings.",
    icon: "🎉",
  },
  {
    title: "Recognition",
    description:
      "Celebrate achievements and inspire current students through your journey.",
    icon: "🏆",
  },
];

export function WhyJoinSection() {
  return (
    <section id="why-join" className="scroll-mt-24 bg-[#f3f8ff] py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          className="mx-auto max-w-3xl text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.55 }}
        >
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-blue-700">
            Why Join
          </p>
          <h2 className="mt-3 text-3xl font-bold text-slate-900 sm:text-4xl md:text-5xl">
            One Community, Infinite Possibilities
          </h2>
        </motion.div>

        <div className="mt-12 grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
          {items.map((item, index) => (
            <motion.article
              key={item.title}
              className="rounded-3xl border border-white/80 bg-white p-6 shadow-[0_16px_38px_rgba(2,8,23,0.08)]"
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.5, delay: index * 0.08 }}
              whileHover={{ y: -8, scale: 1.01 }}
            >
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-100 to-blue-100 text-2xl">
                {item.icon}
              </div>
              <h3 className="mt-5 text-xl font-bold text-slate-900">
                {item.title}
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-slate-600">
                {item.description}
              </p>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
