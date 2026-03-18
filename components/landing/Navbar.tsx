"use client";

import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { useEffect, useState } from "react";

const navLinks = [
  { href: "#legacy", label: "Legacy" },
  { href: "#why-join", label: "Why Join" },
  { href: "#live-stats", label: "Live Stats" },
  { href: "#voices", label: "Voices" },
];

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeHref, setActiveHref] = useState<string>("#legacy");
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setIsScrolled(window.scrollY > 28);
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  useEffect(() => {
    const updateActiveSection = () => {
      const offset = 140;
      const scrollPosition = window.scrollY + offset;

      const availableSections = navLinks
        .map((link) => ({
          href: link.href,
          element: document.getElementById(link.href.slice(1)),
        }))
        .filter(
          (section): section is { href: string; element: HTMLElement } =>
            section.element instanceof HTMLElement,
        );

      if (availableSections.length === 0) return;

      let currentHref = availableSections[0].href;

      for (const section of availableSections) {
        if (section.element.offsetTop <= scrollPosition) {
          currentHref = section.href;
        }
      }

      setActiveHref(currentHref);
    };

    updateActiveSection();
    window.addEventListener("scroll", updateActiveSection, { passive: true });
    window.addEventListener("resize", updateActiveSection);
    window.addEventListener("load", updateActiveSection);

    return () => {
      window.removeEventListener("scroll", updateActiveSection);
      window.removeEventListener("resize", updateActiveSection);
      window.removeEventListener("load", updateActiveSection);
    };
  }, []);

  const navShellClass = isScrolled
    ? "border-slate-200/85 bg-white/95 shadow-[0_10px_40px_rgba(2,8,23,0.08)] backdrop-blur-xl"
    : "border-white/15 bg-slate-950/25 backdrop-blur-md";

  const textClass = isScrolled ? "text-slate-800" : "text-slate-100";

  return (
    <motion.header
      className={`fixed inset-x-0 top-0 z-50 border-b transition-all duration-300 ${navShellClass}`}
      initial={{ y: -24, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      <nav className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <a href="#top" className="group inline-flex items-center gap-3">
          <span
            className={`rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] transition-colors sm:text-sm ${
              isScrolled
                ? "border-slate-300 bg-slate-100 text-slate-800"
                : "border-white/40 bg-white/10 text-white"
            }`}
          >
            BGPSC
          </span>
          <span
            className={`hidden text-sm font-semibold sm:inline ${textClass}`}
          >
            Border Guard Public School and College Alumni
          </span>
        </a>

        <button
          type="button"
          className={`rounded-full border px-3 py-2 text-sm font-medium md:hidden ${
            isScrolled
              ? "border-slate-300 bg-white text-slate-900"
              : "border-white/45 bg-white/10 text-white"
          }`}
          onClick={() => setIsMenuOpen((previous) => !previous)}
          aria-label="Toggle navigation"
        >
          Menu
        </button>

        <ul className="hidden items-center gap-2 md:flex">
          {navLinks.map((link) => {
            const isActive = activeHref === link.href;
            return (
              <li key={link.href}>
                <a
                  href={link.href}
                  className={`relative inline-flex rounded-full px-4 py-2 text-sm font-medium transition-colors duration-200 ${
                    isScrolled
                      ? isActive
                        ? "text-blue-700"
                        : "text-slate-700 hover:text-slate-950"
                      : isActive
                        ? "text-cyan-300"
                        : "text-slate-100 hover:text-white"
                  }`}
                  aria-current={isActive ? "page" : undefined}
                >
                  {link.label}
                  {isActive ? (
                    <motion.span
                      layoutId="active-nav-pill"
                      className="absolute inset-x-3 bottom-1.5 h-0.5 rounded-full bg-gradient-to-r from-cyan-400 to-blue-500"
                    />
                  ) : null}
                </a>
              </li>
            );
          })}
          <li>
            <Link
              href="/register"
              className="ml-3 inline-flex items-center rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 px-5 py-2.5 text-sm font-semibold text-slate-950 shadow-[0_10px_24px_rgba(14,165,233,0.35)] transition-transform duration-200 hover:scale-[1.03]"
            >
              Join Alumni
            </Link>
          </li>
        </ul>
      </nav>

      <AnimatePresence>
        {isMenuOpen ? (
          <motion.div
            className={`border-t px-4 py-4 md:hidden ${
              isScrolled
                ? "border-slate-200 bg-white"
                : "border-white/10 bg-slate-950/90 backdrop-blur-lg"
            }`}
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
          >
            <ul className="space-y-2">
              {navLinks.map((link) => {
                const isActive = activeHref === link.href;
                return (
                  <li key={link.href}>
                    <a
                      href={link.href}
                      className={`block rounded-xl px-3 py-2 text-sm font-medium ${
                        isScrolled
                          ? isActive
                            ? "bg-slate-100 text-blue-700"
                            : "text-slate-700"
                          : isActive
                            ? "bg-white/10 text-cyan-300"
                            : "text-slate-100"
                      }`}
                      onClick={() => setIsMenuOpen(false)}
                    >
                      {link.label}
                    </a>
                  </li>
                );
              })}
              <li>
                <Link
                  href="/register"
                  className="mt-1 block rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 px-3 py-2 text-center text-sm font-semibold text-slate-950"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Join Alumni
                </Link>
              </li>
            </ul>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </motion.header>
  );
}
