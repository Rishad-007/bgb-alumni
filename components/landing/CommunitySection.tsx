"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { SectionReveal } from "./SectionReveal";

const storyBlocks = [
  {
    title: "A Living Network of Trust",
    description:
      "From mentorship to career opportunities, the alumni platform helps former students support one another at every life stage.",
    image: "/images/SideviewSchool.jpg",
    imageAlt: "Campus side view",
  },
  {
    title: "Preserving Memories, Building Futures",
    description:
      "Celebrate milestones, revisit unforgettable school moments, and contribute to the next generation through a connected community.",
    image: "/images/School-Logo.jpeg",
    imageAlt: "School emblem",
  },
];

export function CommunitySection() {
  return (
    <SectionReveal
      className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8"
      delay={0.1}
    >
      <div id="community" className="scroll-mt-24">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-blue-700">
            Community and About
          </p>
          <h2 className="mt-3 text-3xl font-bold text-slate-900 sm:text-4xl">
            A Platform Built for Alumni Belonging
          </h2>
        </div>

        <div className="mt-14 space-y-10">
          {storyBlocks.map((block, index) => {
            const reverseLayout = index % 2 !== 0;

            return (
              <motion.article
                key={block.title}
                className={`grid gap-8 overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-900/5 md:grid-cols-2 md:items-center md:p-8 ${
                  reverseLayout ? "md:[&>*:first-child]:order-2" : ""
                }`}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.25 }}
                transition={{ duration: 0.6, delay: index * 0.08 }}
              >
                <div className="relative h-64 overflow-hidden rounded-2xl">
                  <Image
                    src={block.image}
                    alt={block.imageAlt}
                    fill
                    loading="lazy"
                    className="object-cover"
                  />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-slate-900">
                    {block.title}
                  </h3>
                  <p className="mt-4 text-base leading-relaxed text-slate-600">
                    {block.description}
                  </p>
                </div>
              </motion.article>
            );
          })}
        </div>
      </div>
    </SectionReveal>
  );
}
