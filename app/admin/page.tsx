import { supabase } from "@/lib/supabaseClient";

type AlumniRow = {
  name: string | null;
  email: string | null;
  phone: string | null;
  session: string | null;
  photo_url: string | null;
};

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const { data, error } = await supabase
    .from("alumni")
    .select("name, email, phone, session, photo_url")
    .order("name", { ascending: true });

  const alumni = (data ?? []) as AlumniRow[];

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 rounded-xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
          <h1 className="text-2xl font-bold text-slate-900">Admin Dashboard</h1>
          <p className="mt-1 text-sm text-slate-600">
            Alumni records: {alumni.length}
          </p>
          {error && (
            <p className="mt-3 rounded-md bg-rose-50 px-3 py-2 text-sm text-rose-700 ring-1 ring-rose-200">
              Failed to fetch alumni data: {error.message}
            </p>
          )}
        </div>

        <div className="overflow-x-auto rounded-xl bg-white shadow-sm ring-1 ring-slate-200">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-100">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-700">
                  Name
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-700">
                  Email
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-700">
                  Phone
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-700">
                  Session
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-700">
                  Photo
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {alumni.length === 0 && !error && (
                <tr>
                  <td className="px-4 py-6 text-sm text-slate-600" colSpan={5}>
                    No alumni records found.
                  </td>
                </tr>
              )}

              {alumni.map((row, index) => (
                <tr
                  key={`${row.email ?? "no-email"}-${index}`}
                  className="hover:bg-slate-50"
                >
                  <td className="whitespace-nowrap px-4 py-3 text-sm text-slate-900">
                    {row.name || "-"}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-sm text-slate-700">
                    {row.email || "-"}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-sm text-slate-700">
                    {row.phone || "-"}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-sm text-slate-700">
                    {row.session || "-"}
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-700">
                    {row.photo_url ? (
                      <img
                        src={row.photo_url}
                        alt={`${row.name ?? "Alumni"} photo`}
                        className="h-12 w-12 rounded-md object-cover ring-1 ring-slate-300"
                        loading="lazy"
                      />
                    ) : (
                      <span className="text-slate-500">No photo</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}
