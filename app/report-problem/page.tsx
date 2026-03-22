import Link from "next/link";
import { ReportProblemForm } from "@/components/report/ReportProblemForm";

export default function ReportProblemPage() {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_20%_0%,rgba(34,211,238,0.16),transparent_35%),radial-gradient(circle_at_85%_100%,rgba(59,130,246,0.12),transparent_35%),#f8fafc] px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl">
        <div className="mb-8 flex items-center justify-between gap-3">
          <h1 className="text-3xl font-bold text-slate-900 sm:text-4xl">
            Report a Problem
          </h1>
          <Link
            href="/"
            className="rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-100"
          >
            Back to Home
          </Link>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-900/5 sm:p-8">
          <p className="mb-6 text-sm text-slate-600">
            Send your issue report directly to the admin email.
          </p>
          <ReportProblemForm />
        </div>
      </div>
    </main>
  );
}
