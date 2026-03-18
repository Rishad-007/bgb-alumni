"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useEffect, useState } from "react";

const navLinks = [
  { href: "#stats", label: "Stats" },
  { href: "#alumni", label: "Alumni" },
  { href: "#community", label: "Community" },
  { href: "#contact", label: "Contact" },
];

export function LandingNavbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

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

  return (
    <motion.header
      className={`fixed inset-x-0 top-0 z-50 border-b transition-all duration-300 ${
        isScrolled
          ? "border-slate-200/80 bg-white/95 shadow-lg shadow-slate-900/5 backdrop-blur-md"
          : "border-transparent bg-transparent"
      }`}
      initial={{ y: -24, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      <nav className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <a
          href="#top"
          className={`text-sm font-semibold uppercase tracking-[0.16em] sm:text-base ${
            isScrolled ? "text-slate-900" : "text-white"
          }`}
        >
          BGPSC Alumni
        </a>

        <button
          type="button"
          className={`rounded-full border px-3 py-2 text-sm md:hidden ${
            isScrolled
              ? "border-slate-300 text-slate-900"
              : "border-white/60 text-white"
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
                className={`text-sm font-medium transition-colors duration-200 ${
                  isScrolled
                    ? "text-slate-700 hover:text-blue-700"
                    : "text-slate-100 hover:text-cyan-200"
                }`}
              >
                {link.label}
              </a>
            </li>
          ))}
          <li>
            <Link
              href="/register"
              className="rounded-full bg-blue-700 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-700/30 transition-all duration-200 hover:bg-blue-600"
            >
              Join Now
            </Link>
          </li>
        </ul>
      </nav>

      {isMenuOpen ? (
        <div className="border-t border-slate-200 bg-white px-4 py-4 md:hidden">
          <ul className="space-y-3">
            {navLinks.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  className="block rounded-lg px-2 py-1.5 text-sm font-medium text-slate-700"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {link.label}
                </a>
              </li>
            ))}
            <li>
              <Link
                href="/register"
                className="mt-1 block rounded-lg bg-blue-700 px-3 py-2 text-center text-sm font-semibold text-white"
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
