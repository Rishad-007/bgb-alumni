import { ReportProblemForm } from "@/components/report/ReportProblemForm";

export function ReportProblemSection() {
  return (
    <section
      id="report-problem"
      className="bg-slate-50 scroll-mt-24 border-y border-slate-200"
    >
      <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-blue-700">
            Support
          </p>
          <h2 className="mt-3 text-3xl font-bold text-slate-900 sm:text-4xl">
            Report a Problem
          </h2>
          <p className="mt-4 text-base text-slate-600">
            Found something not working? Share the issue and we will review it.
          </p>
        </div>

        <div className="mx-auto mt-10 max-w-2xl rounded-2xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-900/5 sm:p-8">
          <ReportProblemForm />
        </div>
      </div>
    </section>
  );
}
