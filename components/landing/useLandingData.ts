"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "@/lib/supabase";
import type { AlumniRow, LandingStats } from "./types";

const LATEST_ALUMNI_LIMIT = 6;

const dedupeRowsById = (rows: AlumniRow[]) => {
  const seen = new Set<string>();
  const uniqueRows: AlumniRow[] = [];

  for (const row of rows) {
    const key = String(row.id);
    if (seen.has(key)) continue;

    seen.add(key);
    uniqueRows.push(row);
  }

  return uniqueRows;
};

const isWithinDays = (isoDate: string | null, days: number) => {
  if (!isoDate) return false;

  const now = Date.now();
  const timestamp = new Date(isoDate).getTime();

  if (Number.isNaN(timestamp)) return false;

  return now - timestamp <= days * 24 * 60 * 60 * 1000;
};

export function useLandingData() {
  const [stats, setStats] = useState<LandingStats>({
    totalAlumni: 0,
    activeMembers: 0,
    recentRegistrations: 0,
  });
  const [latestAlumni, setLatestAlumni] = useState<AlumniRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const seenIdsRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    let isMounted = true;

    const loadLandingData = async () => {
      const activeCutoff = new Date(
        Date.now() - 180 * 24 * 60 * 60 * 1000,
      ).toISOString();
      const recentCutoff = new Date(
        Date.now() - 30 * 24 * 60 * 60 * 1000,
      ).toISOString();

      const [totalResponse, activeResponse, recentResponse, latestResponse] =
        await Promise.all([
          supabase.from("alumni").select("id", { count: "exact", head: true }),
          supabase
            .from("alumni")
            .select("id", { count: "exact", head: true })
            .gte("created_at", activeCutoff),
          supabase
            .from("alumni")
            .select("id", { count: "exact", head: true })
            .gte("created_at", recentCutoff),
          supabase
            .from("alumni")
            .select("id, name, session, created_at")
            .order("created_at", { ascending: false })
            .limit(LATEST_ALUMNI_LIMIT),
        ]);

      if (!isMounted) return;

      if (
        totalResponse.error ||
        activeResponse.error ||
        recentResponse.error ||
        latestResponse.error
      ) {
        setHasError(true);
        setIsLoading(false);
        return;
      }

      const latestRows = dedupeRowsById(
        (latestResponse.data as AlumniRow[] | null) ?? [],
      );
      seenIdsRef.current = new Set(latestRows.map((row) => String(row.id)));

      setStats({
        totalAlumni: totalResponse.count ?? 0,
        activeMembers: activeResponse.count ?? 0,
        recentRegistrations: recentResponse.count ?? 0,
      });
      setLatestAlumni(latestRows);
      setHasError(false);
      setIsLoading(false);
    };

    void loadLandingData();

    const channel = supabase
      .channel("alumni-landing-live")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "alumni",
        },
        (payload) => {
          if (!isMounted) return;

          const inserted = payload.new as AlumniRow;
          const insertedId = String(inserted.id);

          setStats((previous) => ({
            totalAlumni: previous.totalAlumni + 1,
            activeMembers:
              previous.activeMembers +
              (isWithinDays(inserted.created_at, 180) ? 1 : 0),
            recentRegistrations:
              previous.recentRegistrations +
              (isWithinDays(inserted.created_at, 30) ? 1 : 0),
          }));

          if (seenIdsRef.current.has(insertedId)) {
            return;
          }

          setLatestAlumni((previous) => {
            const next = dedupeRowsById([inserted, ...previous]).slice(
              0,
              LATEST_ALUMNI_LIMIT,
            );
            seenIdsRef.current = new Set(next.map((row) => String(row.id)));
            return next;
          });
        },
      )
      .subscribe();

    return () => {
      isMounted = false;
      void supabase.removeChannel(channel);
    };
  }, []);

  return useMemo(
    () => ({
      stats,
      latestAlumni,
      isLoading,
      hasError,
    }),
    [hasError, isLoading, latestAlumni, stats],
  );
}
