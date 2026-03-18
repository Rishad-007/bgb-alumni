"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type AlumniRow = {
  id: number;
  name: string;
  email: string;
  phone: string;
  session: string;
  current_university: string | null;
  photo_url: string | null;
  created_at: string;
};

type AlumniWithPhoto = AlumniRow & {
  imageSrc: string | null;
};

export default function AlumniPage() {
  const [rows, setRows] = useState<AlumniWithPhoto[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const loadAlumni = async () => {
      setLoading(true);
      setMessage("");

      const { data, error } = await supabase
        .from("alumni")
        .select(
          "id, name, email, phone, session, current_university, photo_url, created_at",
        )
        .order("created_at", { ascending: false });

      if (error) {
        setLoading(false);
        setMessage(`Failed to load alumni: ${error.message}`);
        return;
      }

      const mapped = await Promise.all(
        (data ?? []).map(async (row) => {
          const item = row as AlumniRow;

          if (!item.photo_url) {
            return { ...item, imageSrc: null };
          }

          if (
            item.photo_url.startsWith("http://") ||
            item.photo_url.startsWith("https://")
          ) {
            return { ...item, imageSrc: item.photo_url };
          }

          const { data: signedData, error: signedError } =
            await supabase.storage
              .from("alumni-photos")
              .createSignedUrl(item.photo_url, 60 * 60);

          if (!signedError && signedData?.signedUrl) {
            return { ...item, imageSrc: signedData.signedUrl };
          }

          const {
            data: { publicUrl },
          } = supabase.storage
            .from("alumni-photos")
            .getPublicUrl(item.photo_url);

          return { ...item, imageSrc: publicUrl || null };
        }),
      );

      setRows(mapped);
      setLoading(false);
    };

    loadAlumni();
  }, []);

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-10">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6 flex items-center justify-between gap-3">
          <h1 className="text-2xl font-bold text-slate-900">
            Alumni Directory
          </h1>
          <a
            href="/register"
            className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
          >
            Add Alumni
          </a>
        </div>

        {loading && <p className="text-slate-600">Loading alumni...</p>}

        {!loading && message && (
          <div className="rounded-lg bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {message}
          </div>
        )}

        {!loading && !message && rows.length === 0 && (
          <div className="rounded-lg bg-white p-4 text-sm text-slate-600 shadow-sm">
            No alumni records yet.
          </div>
        )}

        {!loading && !message && rows.length > 0 && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {rows.map((row) => (
              <article
                key={row.id}
                className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
              >
                <div className="mb-3 flex items-center gap-3">
                  {row.imageSrc ? (
                    <img
                      src={row.imageSrc}
                      alt={`${row.name} photo`}
                      className="h-16 w-16 rounded-full border border-slate-200 object-cover"
                    />
                  ) : (
                    <div className="flex h-16 w-16 items-center justify-center rounded-full border border-slate-200 bg-slate-100 text-xs text-slate-500">
                      No Photo
                    </div>
                  )}

                  <div>
                    <h2 className="text-base font-semibold text-slate-900">
                      {row.name}
                    </h2>
                    <p className="text-xs text-slate-500">{row.session}</p>
                  </div>
                </div>

                <div className="space-y-1 text-sm text-slate-700">
                  <p>
                    <span className="font-medium">Email:</span> {row.email}
                  </p>
                  <p>
                    <span className="font-medium">Phone:</span> {row.phone}
                  </p>
                  <p>
                    <span className="font-medium">Current:</span>{" "}
                    {row.current_university || "-"}
                  </p>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
