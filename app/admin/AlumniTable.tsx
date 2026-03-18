"use client";

import { useRouter } from "next/navigation";

type AlumniRow = {
  id: number | string;
  name: string | null;
  email: string | null;
  phone: string | null;
  session: string | null;
  photo_url: string | null;
  created_at: string | null;
};

type AlumniTableProps = {
  alumni: AlumniRow[];
  isEmpty: boolean;
  hasError: boolean;
};

export function AlumniTable({ alumni, isEmpty, hasError }: AlumniTableProps) {
  const router = useRouter();

  const openDetails = (id: AlumniRow["id"]) => {
    router.push(`/admin/${id}`);
  };

  return (
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
              Created At
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-700">
              Photo
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200">
          {isEmpty && !hasError && (
            <tr>
              <td className="px-4 py-6 text-sm text-slate-600" colSpan={6}>
                No alumni records found.
              </td>
            </tr>
          )}

          {alumni.map((row, index) => (
            <tr
              key={`${row.id}-${row.email ?? "no-email"}-${index}`}
              className="cursor-pointer hover:bg-slate-50"
              onClick={() => openDetails(row.id)}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  openDetails(row.id);
                }
              }}
              tabIndex={0}
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
              <td className="whitespace-nowrap px-4 py-3 text-sm text-slate-700">
                {row.created_at
                  ? new Date(row.created_at).toLocaleDateString()
                  : "-"}
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
  );
}
