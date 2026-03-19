"use client";

import { useState } from "react";
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

const createdAtFormatter = new Intl.DateTimeFormat("en-GB", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  timeZone: "UTC",
});

const formatCreatedAt = (value: string | null) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return createdAtFormatter.format(date);
};

export function AlumniTable({ alumni, isEmpty, hasError }: AlumniTableProps) {
  const router = useRouter();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState<string>("");

  const openDetails = (id: AlumniRow["id"]) => {
    router.push(`/admin/${id}`);
  };

  const handleDelete = async (
    event: React.MouseEvent<HTMLButtonElement>,
    row: AlumniRow,
  ) => {
    event.stopPropagation();

    const id = String(row.id);
    const warning = `Delete ${row.name || "this alumni"}? This action cannot be undone.`;
    const confirmed = window.confirm(warning);
    if (!confirmed) return;

    setDeletingId(id);
    setActionMessage("");

    try {
      const response = await fetch(
        `/api/admin/alumni/${encodeURIComponent(id)}`,
        {
          method: "DELETE",
        },
      );

      const payload = (await response.json().catch(() => null)) as {
        error?: string;
      } | null;

      if (!response.ok) {
        setActionMessage(payload?.error || "Delete failed.");
        return;
      }

      setActionMessage("Alumni deleted successfully.");
      router.refresh();
    } catch {
      setActionMessage("Delete failed due to a network error.");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="overflow-x-auto rounded-xl bg-white shadow-sm ring-1 ring-slate-200">
      {actionMessage ? (
        <div className="border-b border-slate-200 bg-slate-50 px-4 py-2 text-sm text-slate-700">
          {actionMessage}
        </div>
      ) : null}

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
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-700">
              Action
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200">
          {isEmpty && !hasError && (
            <tr>
              <td className="px-4 py-6 text-sm text-slate-600" colSpan={7}>
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
                {formatCreatedAt(row.created_at)}
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
              <td className="px-4 py-3 text-sm text-slate-700">
                <button
                  type="button"
                  onClick={(event) => void handleDelete(event, row)}
                  disabled={deletingId === String(row.id)}
                  className="rounded-md border border-rose-300 px-3 py-1.5 text-xs font-semibold text-rose-700 hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {deletingId === String(row.id) ? "Deleting..." : "Delete"}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
