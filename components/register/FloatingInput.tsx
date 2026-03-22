"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";

type FloatingInputProps = {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: "text" | "email" | "tel";
  required?: boolean;
  placeholder?: string;
  error?: string;
  icon?: ReactNode;
};

export function FloatingInput({
  id,
  label,
  value,
  onChange,
  type = "text",
  required = false,
  placeholder,
  error,
  icon,
}: FloatingInputProps) {
  return (
    <motion.div
      className="space-y-1.5"
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.9 }}
      transition={{ duration: 0.45 }}
    >
      <p className="pl-1 text-xs font-semibold uppercase tracking-[0.12em] text-slate-700">
        {label}
        {required ? " *" : ""}
      </p>

      <label
        htmlFor={id}
        className="relative block rounded-xl border border-slate-300 bg-white transition duration-200 hover:border-[#002147]/60 focus-within:border-[#002147] focus-within:ring-4 focus-within:ring-[#002147]/10"
      >
        {icon ? (
          <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">
            {icon}
          </span>
        ) : null}

        <input
          id={id}
          type={type}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          required={required}
          placeholder={placeholder ?? `Enter ${label.toLowerCase()}`}
          className={`h-12 w-full rounded-xl bg-transparent pr-4 text-slate-900 placeholder:text-slate-400 outline-none ${
            icon ? "pl-12" : "pl-4"
          }`}
          aria-invalid={error ? "true" : "false"}
          aria-describedby={error ? `${id}-error` : undefined}
        />
      </label>

      {error ? (
        <motion.p
          id={`${id}-error`}
          className="pl-1 text-xs text-rose-600"
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {error}
        </motion.p>
      ) : null}
    </motion.div>
  );
}
