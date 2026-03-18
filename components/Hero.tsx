"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "@/lib/supabase";

type AlumniStatRow = {
  id: number | string;
  name: string | null;
  session: string | null;
  created_at: string | null;
};

const HIGHLIGHT_DURATION_MS = 2400;
const COUNT_ANIMATION_DURATION_MS = 450;

const dedupeById = (rows: AlumniStatRow[]) => {
  const seen = new Set<string>();
  const uniqueRows: AlumniStatRow[] = [];

  for (const row of rows) {
    const key = String(row.id);
    if (seen.has(key)) continue;
    seen.add(key);
    uniqueRows.push(row);
  }

  return uniqueRows;
};

export function Hero() {
  const [totalSubmissions, setTotalSubmissions] = useState<number | null>(null);
  const [animatedTotal, setAnimatedTotal] = useState(0);
  const [latestSubmissions, setLatestSubmissions] = useState<AlumniStatRow[]>(
    [],
  );
  const [highlightedIds, setHighlightedIds] = useState<Set<string>>(new Set());
  const [hasStatsError, setHasStatsError] = useState(false);
  const animatedTotalRef = useRef(0);
  const seenIdsRef = useRef<Set<string>>(new Set());
  const highlightTimersRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(
    new Map(),
  );

  useEffect(() => {
    let isMounted = true;

    const loadStats = async () => {
      const [countResponse, latestResponse] = await Promise.all([
        supabase.from("alumni").select("id", { count: "exact", head: true }),
        supabase
          .from("alumni")
          .select("id, name, session, created_at")
          .order("created_at", { ascending: false })
          .limit(5),
      ]);

      if (!isMounted) return;

      if (countResponse.error || latestResponse.error) {
        setHasStatsError(true);
        return;
      }

      const initialRows = dedupeById(
        ((latestResponse.data ?? []) as AlumniStatRow[]).slice(0, 5),
      );
      seenIdsRef.current = new Set(initialRows.map((row) => String(row.id)));

      setTotalSubmissions(countResponse.count ?? 0);
      setLatestSubmissions(initialRows);
      setHasStatsError(false);
    };

    void loadStats();

    const channel = supabase
      .channel("alumni-hero-stats")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "alumni" },
        (payload) => {
          if (!isMounted) return;

          const insertedRow = payload.new as AlumniStatRow;
          const insertedId = String(insertedRow.id);

          if (seenIdsRef.current.has(insertedId)) {
            return;
          }

          seenIdsRef.current.add(insertedId);
          setTotalSubmissions((previous) => (previous ?? 0) + 1);
          setLatestSubmissions((previous) => {
            const nextRows = dedupeById([insertedRow, ...previous]).slice(0, 5);
            seenIdsRef.current = new Set(nextRows.map((row) => String(row.id)));
            return nextRows;
          });

          setHighlightedIds((previous) => {
            const next = new Set(previous);
            next.add(insertedId);
            return next;
          });

          const existingTimer = highlightTimersRef.current.get(insertedId);
          if (existingTimer) {
            clearTimeout(existingTimer);
          }

          const timer = setTimeout(() => {
            setHighlightedIds((previous) => {
              const next = new Set(previous);
              next.delete(insertedId);
              return next;
            });
            highlightTimersRef.current.delete(insertedId);
          }, HIGHLIGHT_DURATION_MS);

          highlightTimersRef.current.set(insertedId, timer);
        },
      )
      .subscribe();

    return () => {
      isMounted = false;
      for (const timer of highlightTimersRef.current.values()) {
        clearTimeout(timer);
      }
      highlightTimersRef.current.clear();
      void supabase.removeChannel(channel);
    };
  }, []);

  useEffect(() => {
    if (totalSubmissions === null) return;

    const startValue = animatedTotalRef.current;
    const targetValue = totalSubmissions;

    if (startValue === targetValue) return;

    let frameId = 0;
    const startTime = performance.now();

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / COUNT_ANIMATION_DURATION_MS, 1);
      const nextValue = Math.round(
        startValue + (targetValue - startValue) * progress,
      );

      animatedTotalRef.current = nextValue;
      setAnimatedTotal(nextValue);

      if (progress < 1) {
        frameId = requestAnimationFrame(animate);
      }
    };

    frameId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(frameId);
    };
  }, [totalSubmissions]);

  const totalSubmissionsLabel = useMemo(() => {
    if (hasStatsError) return "Unavailable";
    if (totalSubmissions === null) return "Loading...";
    return animatedTotal.toLocaleString();
  }, [animatedTotal, hasStatsError, totalSubmissions]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-blue-500 to-indigo-600 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full text-center">
        <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
          School Alumni Network
        </h1>
        <p className="text-xl md:text-2xl text-blue-100 mb-12">
          Connect with your classmates, share memories, and stay in touch with
          your school community.
        </p>

        <div className="mb-10 rounded-xl border border-white/20 bg-white/10 p-5 text-left backdrop-blur-sm">
          <h2 className="text-lg font-semibold text-white">
            Live Alumni Stats
          </h2>

          <p className="mt-2 text-sm text-blue-100">
            Total submissions:{" "}
            <span className="font-semibold text-white">
              {totalSubmissionsLabel}
            </span>
          </p>

          <div className="mt-4">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-blue-100">
              Latest 5 submissions
            </h3>

            {hasStatsError ? (
              <p className="mt-2 text-sm text-red-100">
                Unable to load live stats right now.
              </p>
            ) : latestSubmissions.length === 0 ? (
              <p className="mt-2 text-sm text-blue-100">No submissions yet.</p>
            ) : (
              <ul className="mt-2 space-y-1.5">
                {latestSubmissions.map((submission) => (
                  <li
                    key={String(submission.id)}
                    className={`rounded-md border px-3 py-2 text-sm text-white transition-colors duration-700 ${
                      highlightedIds.has(String(submission.id))
                        ? "border-emerald-200/70 bg-emerald-300/30"
                        : "border-white/10 bg-white/5"
                    }`}
                  >
                    <span className="font-medium">
                      {submission.name?.trim() || "Unknown"}
                    </span>
                    <span className="text-blue-100">
                      {" "}
                      {" - "} {submission.session?.trim() || "Unknown Session"}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <Link
          href="/register"
          className="inline-block bg-white text-blue-600 px-8 py-4 rounded-lg font-bold text-lg hover:bg-blue-50 transition duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
        >
          Get Started
        </Link>
      </div>
    </div>
  );
}
