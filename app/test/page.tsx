"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

type TestStatus = {
  action: "insert" | "select";
  ok: boolean;
  message: string;
};

export default function TestPage() {
  const [loading, setLoading] = useState<"insert" | "select" | null>(null);
  const [status, setStatus] = useState<TestStatus | null>(null);

  const runInsertTest = async () => {
    setLoading("insert");
    setStatus(null);

    const now = Date.now();
    const payload = {
      name: "Test Alumni",
      email: `test-${now}@example.com`,
      phone: "0000000000",
      session: "2026",
      photo_url: null,
    };

    const { error } = await supabase.from("alumni").insert([payload]);

    if (error) {
      setStatus({
        action: "insert",
        ok: false,
        message: error.message,
      });
    } else {
      setStatus({
        action: "insert",
        ok: true,
        message: "Insert success: test alumni record added.",
      });
    }

    setLoading(null);
  };

  const runSelectTest = async () => {
    setLoading("select");
    setStatus(null);

    const { data, error } = await supabase
      .from("alumni")
      .select("id, name, email, session, created_at")
      .limit(5);

    if (error) {
      setStatus({
        action: "select",
        ok: false,
        message: error.message,
      });
    } else {
      setStatus({
        action: "select",
        ok: true,
        message: `Select success: fetched ${data?.length ?? 0} row(s).`,
      });
    }

    setLoading(null);
  };

  return (
    <main className="mx-auto max-w-xl p-6">
      <h1 className="mb-2 text-2xl font-semibold">Supabase Setup Test</h1>
      <p className="mb-6 text-sm text-gray-600">
        Use these buttons to verify your table policies are working.
      </p>

      <div className="flex gap-3">
        <button
          type="button"
          onClick={runInsertTest}
          disabled={loading !== null}
          className="rounded bg-green-600 px-4 py-2 text-white disabled:opacity-60"
        >
          {loading === "insert" ? "Testing Insert..." : "Test Insert"}
        </button>

        <button
          type="button"
          onClick={runSelectTest}
          disabled={loading !== null}
          className="rounded bg-blue-600 px-4 py-2 text-white disabled:opacity-60"
        >
          {loading === "select" ? "Testing Select..." : "Test Select"}
        </button>
      </div>

      {status && (
        <div
          className={`mt-5 rounded border p-3 text-sm ${
            status.ok
              ? "border-green-200 bg-green-50 text-green-800"
              : "border-red-200 bg-red-50 text-red-800"
          }`}
        >
          <strong>{status.action.toUpperCase()}:</strong> {status.message}
        </div>
      )}

      <div className="mt-6 rounded border bg-gray-50 p-3 text-sm text-gray-700">
        <p>Expected result with your current policy setup:</p>
        <p>1. Insert should pass (public insert enabled).</p>
        <p>2. Select should fail unless user is authenticated.</p>
      </div>
    </main>
  );
}
