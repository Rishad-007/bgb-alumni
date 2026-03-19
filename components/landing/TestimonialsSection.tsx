"use client";

import { motion } from "framer-motion";

const quotes = [
  {
    quote:
      "This alumni network brought me back to the people who shaped my earliest dreams. It feels like coming home.",
    author: "MD. Rishad Nur",
    session: "SSC Batch 2017",
  },
  {
    quote:
      "Through the alumni community, I found mentors, collaborators, and lifelong friends all over again.",
    author: "Azizul Haq Akash",
    session: "SSC Batch 2017",
  },
];

export function TestimonialsSection() {
  return (
    <section id="voices" className="scroll-mt-24 bg-white py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          className="mx-auto max-w-3xl text-center"
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.55 }}
        >
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-blue-700">
            Testimonials
          </p>
          <h2 className="mt-3 text-3xl font-bold text-slate-900 sm:text-4xl md:text-5xl">
            Voices From Our Alumni Family
          </h2>
        </motion.div>

        <div className="mt-12 grid grid-cols-1 gap-5 lg:grid-cols-2">
          {quotes.map((item, index) => (
            <motion.blockquote
              key={item.author}
              className="rounded-3xl border border-slate-200 bg-slate-50 p-8 shadow-[0_14px_34px_rgba(2,8,23,0.08)]"
              initial={{ opacity: 0, y: 22 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.55, delay: index * 0.12 }}
            >
              <p className="text-lg leading-relaxed text-slate-700">
                “{item.quote}”
              </p>
              <footer className="mt-5">
                <p className="text-base font-bold text-slate-900">
                  {item.author}
                </p>
                <p className="text-sm text-slate-600">{item.session}</p>
              </footer>
            </motion.blockquote>
          ))}
        </div>
      </div>
    </section>
  );
}
