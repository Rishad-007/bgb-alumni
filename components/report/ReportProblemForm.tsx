"use client";

import { FormEvent, useMemo, useState } from "react";

type FormStatus = "idle" | "success" | "error";

type ReportProblemFormProps = {
  className?: string;
};

const SUBJECT_MAX_LENGTH = 120;
const DETAILS_MAX_LENGTH = 2000;

export function ReportProblemForm({ className = "" }: ReportProblemFormProps) {
  const [subject, setSubject] = useState("");
  const [details, setDetails] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState<FormStatus>("idle");
  const [statusMessage, setStatusMessage] = useState("");

  const detailsCount = useMemo(() => details.length, [details.length]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const trimmedSubject = subject.trim();
    const trimmedDetails = details.trim();

    if (!trimmedSubject || !trimmedDetails) {
      setStatus("error");
      setStatusMessage("Please provide both subject and details.");
      return;
    }

    setIsSubmitting(true);
    setStatus("idle");
    setStatusMessage("");

    try {
      const response = await fetch("/api/report-problem", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          subject: trimmedSubject,
          details: trimmedDetails,
        }),
      });

      const payload = (await response.json().catch(() => null)) as {
        ok?: boolean;
        error?: string;
      } | null;

      if (!response.ok || !payload?.ok) {
        throw new Error(payload?.error || "Failed to send your report.");
      }

      setSubject("");
      setDetails("");
      setStatus("success");
      setStatusMessage("Thanks. Your report has been sent successfully.");
    } catch (error) {
      setStatus("error");
      setStatusMessage(
        error instanceof Error
          ? error.message
          : "Something went wrong while sending your report.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={className} noValidate>
      <div>
        <label
          htmlFor="problem-subject"
          className="mb-2 block text-sm font-semibold text-slate-800"
        >
          Problem Subject
        </label>
        <input
          id="problem-subject"
          name="subject"
          type="text"
          value={subject}
          onChange={(event) => setSubject(event.target.value)}
          maxLength={SUBJECT_MAX_LENGTH}
          placeholder="Example: Registration form photo upload fails"
          required
          className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm outline-none transition-all focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
        />
      </div>

      <div className="mt-5">
        <label
          htmlFor="problem-details"
          className="mb-2 block text-sm font-semibold text-slate-800"
        >
          Problem Details
        </label>
        <textarea
          id="problem-details"
          name="details"
          value={details}
          onChange={(event) => setDetails(event.target.value)}
          maxLength={DETAILS_MAX_LENGTH}
          placeholder="Write what happened, what you expected, and steps to reproduce."
          required
          rows={6}
          className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm outline-none transition-all focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
        />
        <p className="mt-2 text-xs text-slate-500">
          {detailsCount}/{DETAILS_MAX_LENGTH} characters
        </p>
      </div>

      {statusMessage ? (
        <p
          className={`mt-4 rounded-lg px-3 py-2 text-sm ${
            status === "success"
              ? "border border-emerald-200 bg-emerald-50 text-emerald-700"
              : "border border-rose-200 bg-rose-50 text-rose-700"
          }`}
        >
          {statusMessage}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={isSubmitting}
        className="mt-6 inline-flex items-center justify-center rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 px-6 py-2.5 text-sm font-semibold text-slate-950 shadow-[0_10px_24px_rgba(14,165,233,0.35)] transition-transform duration-200 hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-70"
      >
        {isSubmitting ? "Sending..." : "Send"}
      </button>
    </form>
  );
}
