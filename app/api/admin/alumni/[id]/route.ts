import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { ADMIN_AUTH_COOKIE, isAdminCookieValid } from "@/lib/adminAuth";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  const cookieStore = await cookies();
  const adminCookie = cookieStore.get(ADMIN_AUTH_COOKIE)?.value;
  if (!isAdminCookieValid(adminCookie)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabaseAdmin = getSupabaseAdmin();
  if (!supabaseAdmin) {
    return NextResponse.json(
      {
        error:
          "Server is missing Supabase admin configuration. Add SUPABASE_SERVICE_ROLE_KEY.",
      },
      { status: 500 },
    );
  }

  const { data: alumniRow, error: fetchError } = await supabaseAdmin
    .from("alumni")
    .select("id, photo_url")
    .eq("id", id)
    .maybeSingle();

  if (fetchError) {
    return NextResponse.json(
      { error: `Failed to find alumni: ${fetchError.message}` },
      { status: 500 },
    );
  }

  if (!alumniRow) {
    return NextResponse.json({ error: "Alumni not found." }, { status: 404 });
  }

  const { error: deleteError } = await supabaseAdmin
    .from("alumni")
    .delete()
    .eq("id", id);

  if (deleteError) {
    return NextResponse.json(
      { error: `Failed to delete alumni: ${deleteError.message}` },
      { status: 500 },
    );
  }

  const photoPath = alumniRow.photo_url;
  if (
    photoPath &&
    !photoPath.startsWith("http://") &&
    !photoPath.startsWith("https://")
  ) {
    await supabaseAdmin.storage.from("alumni-photos").remove([photoPath]);
  }

  return NextResponse.json({ ok: true });
}
