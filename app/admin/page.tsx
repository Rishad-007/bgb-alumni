import Link from "next/link";
import { cookies } from "next/headers";
import { AdminAccessForm } from "@/app/admin/AdminAccessForm";
import { AlumniTable } from "@/app/admin/AlumniTable";
import { AdminLogoutButton } from "@/app/admin/AdminLogoutButton";
import { ADMIN_AUTH_COOKIE, isAdminCookieValid } from "@/lib/adminAuth";
import { supabase } from "@/lib/supabaseClient";

type AlumniRow = {
  id: number | string;
  name: string | null;
  email: string | null;
  phone: string | null;
  session: string | null;
  photo_url: string | null;
  created_at: string | null;
};

type SortField = "name" | "session" | "created_at";
type SortOrder = "asc" | "desc";

type SessionCount = {
  session: string;
  count: number;
};

type DailyCount = {
  day: string;
  count: number;
};

const PAGE_SIZE = 10;

const parsePage = (value: string | undefined) => {
  const parsed = Number.parseInt(value ?? "1", 10);
  if (!Number.isFinite(parsed) || parsed < 1) return 1;
  return parsed;
};

const normalizeSortField = (value: string | undefined): SortField => {
  if (value === "name" || value === "session" || value === "created_at") {
    return value;
  }
  return "created_at";
};

const normalizeSortOrder = (value: string | undefined): SortOrder => {
  if (value === "asc" || value === "desc") return value;
  return "desc";
};

const sanitizeSearchQuery = (value: string | undefined) => {
  return (value ?? "").trim();
};

const escapeForIlike = (value: string) =>
  value.replace(/\\/g, "\\\\").replace(/%/g, "\\%").replace(/_/g, "\\_");

const buildQueryString = (params: {
  q: string;
  sort: SortField;
  order: SortOrder;
  page: number;
}) => {
  const searchParams = new URLSearchParams();
  if (params.q) searchParams.set("q", params.q);
  searchParams.set("sort", params.sort);
  searchParams.set("order", params.order);
  searchParams.set("page", String(params.page));
  return searchParams.toString();
};

const getDateKey = (date: Date) => date.toISOString().slice(0, 10);

const getDayLabel = (dateKey: string) => {
  const date = new Date(`${dateKey}T00:00:00`);
  return date.toLocaleDateString(undefined, { weekday: "short" });
};

export const dynamic = "force-dynamic";

export default async function AdminPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = (await searchParams) ?? {};
  const cookieStore = await cookies();
  const adminCookie = cookieStore.get(ADMIN_AUTH_COOKIE)?.value;
  const hasAdminAccess = isAdminCookieValid(adminCookie);

  if (!hasAdminAccess) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-10">
        <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <h1 className="text-2xl font-bold text-slate-900">Admin Access</h1>
          <p className="mt-1 text-sm text-slate-600">
            Enter the admin password to open the dashboard.
          </p>
          <div className="mt-5">
            <AdminAccessForm />
          </div>
        </div>
      </main>
    );
  }

  const qRaw = params.q;
  const sortRaw = params.sort;
  const orderRaw = params.order;
  const pageRaw = params.page;

  const query = sanitizeSearchQuery(Array.isArray(qRaw) ? qRaw[0] : qRaw);
  const sort = normalizeSortField(
    Array.isArray(sortRaw) ? sortRaw[0] : sortRaw,
  );
  const order = normalizeSortOrder(
    Array.isArray(orderRaw) ? orderRaw[0] : orderRaw,
  );
  const page = parsePage(Array.isArray(pageRaw) ? pageRaw[0] : pageRaw);

  const startDate = new Date();
  startDate.setHours(0, 0, 0, 0);
  startDate.setDate(startDate.getDate() - 6);

  const [totalCountResponse, sessionAndDateResponse, paginatedResponse] =
    await Promise.all([
      supabase.from("alumni").select("id", { count: "exact", head: true }),
      supabase.from("alumni").select("session, created_at"),
      (async () => {
        let supabaseQuery = supabase
          .from("alumni")
          .select("id, name, email, phone, session, photo_url, created_at", {
            count: "exact",
          });

        if (query) {
          const escapedQuery = escapeForIlike(query);
          supabaseQuery = supabaseQuery.or(
            `name.ilike.%${escapedQuery}%,email.ilike.%${escapedQuery}%`,
          );
        }

        const from = (page - 1) * PAGE_SIZE;
        const to = from + PAGE_SIZE - 1;

        return supabaseQuery
          .order(sort, { ascending: order === "asc" })
          .range(from, to);
      })(),
    ]);

  const { data, error, count } = paginatedResponse;
  const statsData = sessionAndDateResponse.data ?? [];
  const statsError = totalCountResponse.error ?? sessionAndDateResponse.error;

  const sessionCountsMap = new Map<string, number>();
  const dayCountsMap = new Map<string, number>();

  for (let i = 0; i < 7; i += 1) {
    const day = new Date(startDate);
    day.setDate(startDate.getDate() + i);
    dayCountsMap.set(getDateKey(day), 0);
  }

  for (const row of statsData) {
    const sessionName = (row.session ?? "Unknown").trim() || "Unknown";
    sessionCountsMap.set(
      sessionName,
      (sessionCountsMap.get(sessionName) ?? 0) + 1,
    );

    if (row.created_at) {
      const createdAt = new Date(row.created_at);
      if (!Number.isNaN(createdAt.getTime()) && createdAt >= startDate) {
        const key = getDateKey(createdAt);
        if (dayCountsMap.has(key)) {
          dayCountsMap.set(key, (dayCountsMap.get(key) ?? 0) + 1);
        }
      }
    }
  }

  const sessionCounts: SessionCount[] = [...sessionCountsMap.entries()]
    .map(([session, sessionCount]) => ({ session, count: sessionCount }))
    .sort((a, b) => b.count - a.count);

  const dailyCounts: DailyCount[] = [...dayCountsMap.entries()].map(
    ([day, dayCount]) => ({
      day,
      count: dayCount,
    }),
  );

  const totalAlumniCount = totalCountResponse.count ?? 0;
  const recentSubmissionsCount = dailyCounts.reduce(
    (sum, dayCount) => sum + dayCount.count,
    0,
  );
  const maxSessionCount = sessionCounts[0]?.count ?? 1;
  const maxDailyCount = Math.max(
    1,
    ...dailyCounts.map((dayCount) => dayCount.count),
  );

  const totalRows = count ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalRows / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const alumni = (data ?? []) as AlumniRow[];
  const isEmpty = alumni.length === 0;

  const prevPage = Math.max(1, safePage - 1);
  const nextPage = Math.min(totalPages, safePage + 1);

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 rounded-xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">
                Admin Dashboard
              </h1>
              <p className="mt-1 text-sm text-slate-600">
                Showing {totalRows} record(s) in current result
              </p>
            </div>
            <AdminLogoutButton />
          </div>

          <form
            className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-4"
            method="GET"
          >
            <input
              type="text"
              name="q"
              defaultValue={query}
              placeholder="Search name or email"
              className="rounded-md border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200 md:col-span-2"
            />
            <select
              name="sort"
              defaultValue={sort}
              className="rounded-md border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
            >
              <option value="created_at">Sort by created_at</option>
              <option value="name">Sort by name</option>
              <option value="session">Sort by session</option>
            </select>
            <div className="flex gap-2">
              <select
                name="order"
                defaultValue={order}
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
              >
                <option value="asc">Ascending</option>
                <option value="desc">Descending</option>
              </select>
              <button
                type="submit"
                className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800"
              >
                Apply
              </button>
            </div>
          </form>

          {error && (
            <p className="mt-4 rounded-md bg-rose-50 px-3 py-2 text-sm text-rose-700 ring-1 ring-rose-200">
              Failed to fetch alumni data: {error.message}
            </p>
          )}

          {!error && (
            <p className="mt-3 text-xs text-slate-500">
              Tip: Click any row in the table to open the detailed alumni view.
            </p>
          )}
        </div>

        <div className="mb-6 rounded-xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
          <h2 className="text-lg font-semibold text-slate-900">Statistics</h2>

          {statsError && (
            <p className="mt-3 rounded-md bg-rose-50 px-3 py-2 text-sm text-rose-700 ring-1 ring-rose-200">
              Failed to load statistics: {statsError.message}
            </p>
          )}

          {!statsError && (
            <>
              <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Total Alumni
                  </p>
                  <p className="mt-2 text-2xl font-bold text-slate-900">
                    {totalAlumniCount}
                  </p>
                </div>
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Sessions Covered
                  </p>
                  <p className="mt-2 text-2xl font-bold text-slate-900">
                    {sessionCounts.length}
                  </p>
                </div>
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Recent Submissions
                  </p>
                  <p className="mt-2 text-2xl font-bold text-slate-900">
                    {recentSubmissionsCount}
                  </p>
                  <p className="text-xs text-slate-500">Last 7 days</p>
                </div>
              </div>

              <div className="mt-5 grid grid-cols-1 gap-4 lg:grid-cols-2">
                <div className="rounded-lg border border-slate-200 p-4">
                  <h3 className="text-sm font-semibold text-slate-800">
                    Count Per Session
                  </h3>
                  <div className="mt-4 space-y-3">
                    {sessionCounts.length === 0 && (
                      <p className="text-sm text-slate-500">
                        No session data available.
                      </p>
                    )}
                    {sessionCounts.slice(0, 8).map((item) => (
                      <div key={item.session}>
                        <div className="mb-1 flex items-center justify-between text-xs text-slate-600">
                          <span className="truncate pr-3">{item.session}</span>
                          <span className="font-semibold text-slate-800">
                            {item.count}
                          </span>
                        </div>
                        <div className="h-2 rounded-full bg-slate-100">
                          <div
                            className="h-2 rounded-full bg-slate-700"
                            style={{
                              width: `${(item.count / maxSessionCount) * 100}%`,
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-lg border border-slate-200 p-4">
                  <h3 className="text-sm font-semibold text-slate-800">
                    Recent Submissions (7 Days)
                  </h3>
                  <div className="mt-4 flex h-40 items-end gap-2">
                    {dailyCounts.map((item) => (
                      <div
                        key={item.day}
                        className="flex flex-1 flex-col items-center gap-1"
                      >
                        <span className="text-[11px] text-slate-600">
                          {item.count}
                        </span>
                        <div className="flex h-28 w-full items-end rounded-md bg-slate-100 px-1">
                          <div
                            className="w-full rounded-sm bg-emerald-500"
                            style={{
                              height: `${(item.count / maxDailyCount) * 100}%`,
                            }}
                          />
                        </div>
                        <span className="text-[11px] text-slate-500">
                          {getDayLabel(item.day)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        <AlumniTable
          alumni={alumni}
          isEmpty={isEmpty}
          hasError={Boolean(error)}
        />

        <div className="mt-4 flex items-center justify-between rounded-xl bg-white px-4 py-3 shadow-sm ring-1 ring-slate-200">
          <p className="text-sm text-slate-600">
            Page {safePage} of {totalPages}
          </p>
          <div className="flex items-center gap-2">
            <Link
              href={`/admin?${buildQueryString({
                q: query,
                sort,
                order,
                page: prevPage,
              })}`}
              className={`rounded-md border px-3 py-2 text-sm ${
                safePage <= 1
                  ? "pointer-events-none border-slate-200 text-slate-400"
                  : "border-slate-300 text-slate-700 hover:bg-slate-100"
              }`}
            >
              Previous
            </Link>
            <Link
              href={`/admin?${buildQueryString({
                q: query,
                sort,
                order,
                page: nextPage,
              })}`}
              className={`rounded-md border px-3 py-2 text-sm ${
                safePage >= totalPages
                  ? "pointer-events-none border-slate-200 text-slate-400"
                  : "border-slate-300 text-slate-700 hover:bg-slate-100"
              }`}
            >
              Next
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
