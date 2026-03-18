import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

const LATEST_ALUMNI_LIMIT = 6;

type AlumniRow = {
  id: number | string;
  name: string | null;
  session: string | null;
  created_at: string | null;
  photo_url: string | null;
};

export async function GET() {
  const supabaseAdmin = getSupabaseAdmin();
  if (!supabaseAdmin) {
    return NextResponse.json(
      {
        error:
          "Landing data service is not configured. Add SUPABASE_SERVICE_ROLE_KEY.",
      },
      { status: 500 },
    );
  }

  const activeCutoff = new Date(
    Date.now() - 180 * 24 * 60 * 60 * 1000,
  ).toISOString();
  const recentCutoff = new Date(
    Date.now() - 30 * 24 * 60 * 60 * 1000,
  ).toISOString();

  const [totalResponse, activeResponse, recentResponse, latestResponse] =
    await Promise.all([
      supabaseAdmin.from("alumni").select("id", { count: "exact", head: true }),
      supabaseAdmin
        .from("alumni")
        .select("id", { count: "exact", head: true })
        .gte("created_at", activeCutoff),
      supabaseAdmin
        .from("alumni")
        .select("id", { count: "exact", head: true })
        .gte("created_at", recentCutoff),
      supabaseAdmin
        .from("alumni")
        .select("id, name, session, created_at, photo_url")
        .order("created_at", { ascending: false })
        .limit(LATEST_ALUMNI_LIMIT),
    ]);

  if (
    totalResponse.error ||
    activeResponse.error ||
    recentResponse.error ||
    latestResponse.error
  ) {
    return NextResponse.json(
      {
        error:
          totalResponse.error?.message ||
          activeResponse.error?.message ||
          recentResponse.error?.message ||
          latestResponse.error?.message ||
          "Failed to load landing data.",
      },
      { status: 500 },
    );
  }

  const latestRows = ((latestResponse.data as AlumniRow[] | null) ?? []).map(
    async (row) => {
      if (!row.photo_url) {
        return { ...row, photo_url: null };
      }

      if (
        row.photo_url.startsWith("http://") ||
        row.photo_url.startsWith("https://")
      ) {
        return row;
      }

      const { data: signedData } = await supabaseAdmin.storage
        .from("alumni-photos")
        .createSignedUrl(row.photo_url, 60 * 60);

      return {
        ...row,
        photo_url: signedData?.signedUrl ?? null,
      };
    },
  );

  const resolvedRows = await Promise.all(latestRows);

  return NextResponse.json(
    {
      stats: {
        totalAlumni: totalResponse.count ?? 0,
        activeMembers: activeResponse.count ?? 0,
        recentRegistrations: recentResponse.count ?? 0,
      },
      latestAlumni: resolvedRows,
    },
    {
      status: 200,
      headers: {
        "Cache-Control": "no-store",
      },
    },
  );
}
