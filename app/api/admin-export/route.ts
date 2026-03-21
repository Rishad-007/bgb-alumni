import { NextRequest, NextResponse } from "next/server";
import { ADMIN_AUTH_COOKIE, isAdminCookieValid } from "@/lib/adminAuth";
import {
  getSupabaseAdmin,
  isSupabaseAdminConfigured,
} from "@/lib/supabaseAdmin";

type SortField = "name" | "session" | "created_at";
type SortOrder = "asc" | "desc";

type AlumniExportRow = {
  id: number | string;
  name: string | null;
  email: string | null;
  phone: string | null;
  session: string | null;
  start_class: string | null;
  start_year: number | null;
  end_class: string | null;
  end_year: number | null;
  has_public_exam: boolean | null;
  psc_year: number | null;
  jsc_year: number | null;
  ssc_year: number | null;
  hsc_year: number | null;
  current_university: string | null;
  photo_url: string | null;
  created_at: string | null;
};

const EXPORT_BATCH_SIZE = 1000;

const normalizeSortField = (value: string | null): SortField => {
  if (value === "name" || value === "session" || value === "created_at") {
    return value;
  }
  return "created_at";
};

const normalizeSortOrder = (value: string | null): SortOrder => {
  if (value === "asc" || value === "desc") return value;
  return "desc";
};

const sanitizeSearchQuery = (value: string | null) => (value ?? "").trim();

const escapeForIlike = (value: string) =>
  value.replace(/\\/g, "\\\\").replace(/%/g, "\\%").replace(/_/g, "\\_");

const csvEscape = (value: string | number | boolean | null) => {
  const stringValue = value == null ? "" : String(value);
  if (!/[",\n]/.test(stringValue)) return stringValue;
  return `"${stringValue.replace(/"/g, '""')}"`;
};

export async function GET(request: NextRequest) {
  const adminCookie = request.cookies.get(ADMIN_AUTH_COOKIE)?.value;
  if (!isAdminCookieValid(adminCookie)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!isSupabaseAdminConfigured()) {
    return NextResponse.json(
      { error: "Supabase admin env vars are not configured." },
      { status: 500 },
    );
  }

  const supabaseAdmin = getSupabaseAdmin();
  if (!supabaseAdmin) {
    return NextResponse.json(
      { error: "Supabase admin client could not be initialized." },
      { status: 500 },
    );
  }

  const query = sanitizeSearchQuery(request.nextUrl.searchParams.get("q"));
  const sort = normalizeSortField(request.nextUrl.searchParams.get("sort"));
  const order = normalizeSortOrder(request.nextUrl.searchParams.get("order"));

  const alumniRows: AlumniExportRow[] = [];
  let from = 0;

  while (true) {
    let dbQuery = supabaseAdmin
      .from("alumni")
      .select(
        "id, name, email, phone, session, start_class, start_year, end_class, end_year, has_public_exam, psc_year, jsc_year, ssc_year, hsc_year, current_university, photo_url, created_at",
      )
      .order(sort, { ascending: order === "asc" })
      .range(from, from + EXPORT_BATCH_SIZE - 1);

    if (query) {
      const escapedQuery = escapeForIlike(query);
      dbQuery = dbQuery.or(
        `name.ilike.%${escapedQuery}%,email.ilike.%${escapedQuery}%`,
      );
    }

    const { data, error } = await dbQuery;

    if (error) {
      return NextResponse.json(
        { error: `Failed to export alumni data: ${error.message}` },
        { status: 500 },
      );
    }

    const batch = (data ?? []) as AlumniExportRow[];
    alumniRows.push(...batch);

    if (batch.length < EXPORT_BATCH_SIZE) {
      break;
    }

    from += EXPORT_BATCH_SIZE;
  }

  const headers = [
    "id",
    "name",
    "email",
    "phone",
    "session",
    "start_class",
    "start_year",
    "end_class",
    "end_year",
    "has_public_exam",
    "psc_year",
    "jsc_year",
    "ssc_year",
    "hsc_year",
    "current_university",
    "photo_url",
    "created_at",
  ];

  const csvRows = [
    headers.join(","),
    ...alumniRows.map((row) =>
      [
        row.id,
        row.name,
        row.email,
        row.phone,
        row.session,
        row.start_class,
        row.start_year,
        row.end_class,
        row.end_year,
        row.has_public_exam,
        row.psc_year,
        row.jsc_year,
        row.ssc_year,
        row.hsc_year,
        row.current_university,
        row.photo_url,
        row.created_at,
      ]
        .map((value) => csvEscape(value))
        .join(","),
    ),
  ];

  const csv = csvRows.join("\n");
  const timestamp = new Date().toISOString().slice(0, 19).replace(/[:T]/g, "-");

  return new NextResponse(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="alumni-export-${timestamp}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
