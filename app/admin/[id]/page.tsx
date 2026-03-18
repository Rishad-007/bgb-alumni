import Link from "next/link";
import { cookies } from "next/headers";
import { AdminAccessForm } from "@/app/admin/AdminAccessForm";
import { ADMIN_AUTH_COOKIE, isAdminCookieValid } from "@/lib/adminAuth";
import {
  getSupabaseAdmin,
  isSupabaseAdminConfigured,
} from "@/lib/supabaseAdmin";

export const dynamic = "force-dynamic";

type AlumniDetails = {
  id: number | string;
  name: string | null;
  email: string | null;
  phone: string | null;
  session: string | null;
  current_university: string | null;
  photo_url: string | null;
  created_at: string | null;
};

export default async function AlumniDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const cookieStore = await cookies();
  const adminCookie = cookieStore.get(ADMIN_AUTH_COOKIE)?.value;
  const hasAdminAccess = isAdminCookieValid(adminCookie);

  if (!hasAdminAccess) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-10">
        <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <h1 className="text-2xl font-bold text-slate-900">Admin Access</h1>
          <p className="mt-1 text-sm text-slate-600">
            Enter the admin password to open alumni details.
          </p>
          <div className="mt-5">
            <AdminAccessForm />
          </div>
        </div>
      </main>
    );
  }

  if (!isSupabaseAdminConfigured()) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-10">
        <div className="w-full max-w-xl rounded-xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <h1 className="text-xl font-bold text-slate-900">
            Admin Setup Needed
          </h1>
          <p className="mt-2 text-sm text-slate-700">
            Missing server env vars. Add NEXT_PUBLIC_SUPABASE_URL and
            SUPABASE_SERVICE_ROLE_KEY in .env.local, then restart dev server.
          </p>
        </div>
      </main>
    );
  }

  const supabaseAdmin = getSupabaseAdmin();
  if (!supabaseAdmin) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-10">
        <div className="w-full max-w-xl rounded-xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <h1 className="text-xl font-bold text-slate-900">
            Admin Setup Needed
          </h1>
          <p className="mt-2 text-sm text-slate-700">
            Supabase admin client could not be initialized. Check server env
            vars and restart the app.
          </p>
        </div>
      </main>
    );
  }

  const { data, error } = await supabaseAdmin
    .from("alumni")
    .select(
      "id, name, email, phone, session, current_university, photo_url, created_at",
    )
    .eq("id", id)
    .maybeSingle();

  let alumni = data as AlumniDetails | null;

  if (
    alumni?.photo_url &&
    !alumni.photo_url.startsWith("http://") &&
    !alumni.photo_url.startsWith("https://")
  ) {
    const { data: signedData } = await supabaseAdmin.storage
      .from("alumni-photos")
      .createSignedUrl(alumni.photo_url, 60 * 60);

    if (signedData?.signedUrl) {
      alumni = { ...alumni, photo_url: signedData.signedUrl };
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6">
      <div className="mx-auto max-w-5xl">
        <div className="mb-5">
          <Link
            href="/admin"
            className="inline-flex items-center rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 hover:bg-slate-100"
          >
            Back to Dashboard
          </Link>
        </div>

        {error && (
          <div className="rounded-xl bg-rose-50 p-4 text-sm text-rose-700 ring-1 ring-rose-200">
            Failed to fetch alumni details: {error.message}
          </div>
        )}

        {!error && !alumni && (
          <div className="rounded-xl bg-white p-6 text-sm text-slate-700 shadow-sm ring-1 ring-slate-200">
            Alumni not found.
          </div>
        )}

        {!error && alumni && (
          <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200">
            <div className="border-b border-slate-200 px-6 py-5">
              <h1 className="text-2xl font-bold text-slate-900">
                {alumni.name || "Unnamed Alumni"}
              </h1>
              <p className="mt-1 text-sm text-slate-600">ID: {alumni.id}</p>
            </div>

            <div className="grid grid-cols-1 gap-8 p-6 md:grid-cols-3">
              <div className="md:col-span-1">
                {alumni.photo_url ? (
                  <img
                    src={alumni.photo_url}
                    alt={`${alumni.name ?? "Alumni"} photo`}
                    className="h-80 w-full rounded-xl object-cover ring-1 ring-slate-300"
                  />
                ) : (
                  <div className="flex h-80 w-full items-center justify-center rounded-xl bg-slate-100 text-sm text-slate-500 ring-1 ring-slate-200">
                    No photo uploaded
                  </div>
                )}
              </div>

              <div className="space-y-4 md:col-span-2">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="rounded-lg bg-slate-50 p-4 ring-1 ring-slate-200">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Name
                    </p>
                    <p className="mt-1 text-sm text-slate-900">
                      {alumni.name || "-"}
                    </p>
                  </div>
                  <div className="rounded-lg bg-slate-50 p-4 ring-1 ring-slate-200">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Email
                    </p>
                    <p className="mt-1 text-sm text-slate-900">
                      {alumni.email || "-"}
                    </p>
                  </div>
                  <div className="rounded-lg bg-slate-50 p-4 ring-1 ring-slate-200">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Phone
                    </p>
                    <p className="mt-1 text-sm text-slate-900">
                      {alumni.phone || "-"}
                    </p>
                  </div>
                  <div className="rounded-lg bg-slate-50 p-4 ring-1 ring-slate-200">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Session
                    </p>
                    <p className="mt-1 text-sm text-slate-900">
                      {alumni.session || "-"}
                    </p>
                  </div>
                  <div className="rounded-lg bg-slate-50 p-4 ring-1 ring-slate-200 sm:col-span-2">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Current University/Job
                    </p>
                    <p className="mt-1 text-sm text-slate-900">
                      {alumni.current_university || "-"}
                    </p>
                  </div>
                  <div className="rounded-lg bg-slate-50 p-4 ring-1 ring-slate-200 sm:col-span-2">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Submission Date
                    </p>
                    <p className="mt-1 text-sm text-slate-900">
                      {alumni.created_at
                        ? new Date(alumni.created_at).toLocaleString()
                        : "-"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
