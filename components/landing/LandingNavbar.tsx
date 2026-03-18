"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useEffect, useState } from "react";

const navLinks = [
  { href: "#community", label: "Community" },
  { href: "#contact", label: "Contact" },
];

export function LandingNavbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeHref, setActiveHref] = useState<string>("#community");

  useEffect(() => {
    const onScroll = () => {
      setIsScrolled(window.scrollY > 14);
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  useEffect(() => {
    const sections = navLinks
      .map((link) => document.getElementById(link.href.slice(1)))
      .filter(
        (section): section is HTMLElement => section instanceof HTMLElement,
      );

    if (sections.length === 0) return;

    const updateActiveSection = () => {
      const midpoint = window.scrollY + window.innerHeight * 0.35;

      let currentActive = sections[0].id;

      for (const section of sections) {
        if (section.offsetTop <= midpoint) {
          currentActive = section.id;
        }
      }

      setActiveHref(`#${currentActive}`);
    };

    updateActiveSection();
    window.addEventListener("scroll", updateActiveSection, { passive: true });
    window.addEventListener("resize", updateActiveSection);

    return () => {
      window.removeEventListener("scroll", updateActiveSection);
      window.removeEventListener("resize", updateActiveSection);
    };
  }, []);

  return (
    <motion.header
      className={`fixed inset-x-0 top-0 z-50 border-b transition-all duration-300 ${
        isScrolled
          ? "border-slate-200/80 bg-white/92 shadow-lg shadow-slate-900/5 backdrop-blur-xl"
          : "border-white/10 bg-slate-950/35 backdrop-blur-md"
      }`}
      initial={{ y: -24, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      <nav className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <a
          href="#top"
          className={`inline-flex items-center rounded-full px-3 py-1.5 text-sm font-semibold uppercase tracking-[0.16em] transition-colors sm:text-base ${
            isScrolled
              ? "text-slate-900"
              : "border border-white/20 bg-white/5 text-white"
          }`}
        >
          BGPSC Alumni
        </a>

        <button
          type="button"
          className={`rounded-full border px-3 py-2 text-sm md:hidden ${
            isScrolled
              ? "border-slate-300 text-slate-900"
              : "border-white/60 bg-white/10 text-white"
          }`}
          aria-label="Toggle navigation menu"
          onClick={() => setIsMenuOpen((previous) => !previous)}
        >
          Menu
        </button>

        <ul className="hidden items-center gap-8 md:flex">
          {navLinks.map((link) => (
            <li key={link.href}>
              <a
                href={link.href}
                aria-current={activeHref === link.href ? "page" : undefined}
                className={`rounded-full px-3 py-1.5 text-sm font-medium transition-colors duration-200 ${
                  activeHref === link.href
                    ? isScrolled
                      ? "bg-slate-100 text-[var(--brand-navy)]"
                      : "bg-white/15 text-[var(--brand-gold)]"
                    : isScrolled
                      ? "text-slate-700 hover:text-[var(--brand-navy)]"
                      : "text-slate-100 hover:text-[var(--brand-gold)]"
                }`}
              >
                {link.label}
              </a>
            </li>
          ))}
          <li>
            <Link
              href="/register"
              className={`rounded-full px-5 py-2.5 text-sm font-semibold shadow-lg transition-all duration-200 ${
                isScrolled
                  ? "bg-[var(--brand-navy)] text-white shadow-slate-900/20 hover:bg-[#12345e]"
                  : "bg-[var(--brand-gold)] text-slate-950 shadow-amber-500/20 hover:bg-[#ffd36b]"
              }`}
            >
              Join Now
            </Link>
          </li>
        </ul>
      </nav>

      {isMenuOpen ? (
        <div
          className={`px-4 py-4 md:hidden ${
            isScrolled
              ? "border-t border-slate-200 bg-white"
              : "border-t border-white/10 bg-slate-950/80 backdrop-blur-xl"
          }`}
        >
          <ul className="space-y-3">
            {navLinks.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  aria-current={activeHref === link.href ? "page" : undefined}
                  className={`block rounded-lg px-2 py-1.5 text-sm font-medium ${
                    activeHref === link.href
                      ? isScrolled
                        ? "bg-slate-100 text-[var(--brand-navy)]"
                        : "bg-white/15 text-[var(--brand-gold)]"
                      : isScrolled
                        ? "text-slate-700"
                        : "text-slate-100"
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {link.label}
                </a>
              </li>
            ))}
            <li>
              <Link
                href="/register"
                className={`mt-1 block rounded-lg px-3 py-2 text-center text-sm font-semibold ${
                  isScrolled
                    ? "bg-[var(--brand-navy)] text-white"
                    : "bg-[var(--brand-gold)] text-slate-950"
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                Join Now
              </Link>
            </li>
          </ul>
        </div>
      ) : null}
    </motion.header>
  );
}
