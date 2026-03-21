"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { AlumniRow, LandingStats } from "./types";

const LATEST_ALUMNI_LIMIT = 6;
const LANDING_REFRESH_INTERVAL_MS = 10000;

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
    let intervalId: ReturnType<typeof setInterval> | null = null;

    const loadLandingData = async () => {
      const response = await fetch("/api/landing-data", { cache: "no-store" });

      const payload = (await response.json().catch(() => null)) as {
        stats?: LandingStats;
        latestAlumni?: AlumniRow[];
        error?: string;
      } | null;

      if (!isMounted) return;

      if (
        !response.ok ||
        !payload?.stats ||
        !Array.isArray(payload.latestAlumni)
      ) {
        setHasError(true);
        setIsLoading(false);
        return;
      }

      const latestRows = dedupeRowsById(payload.latestAlumni).slice(
        0,
        LATEST_ALUMNI_LIMIT,
      );

      seenIdsRef.current = new Set(latestRows.map((row) => String(row.id)));

      setStats(payload.stats);
      setLatestAlumni(latestRows);
      setHasError(false);
      setIsLoading(false);
    };

    void loadLandingData();

    intervalId = setInterval(() => {
      void loadLandingData();
    }, LANDING_REFRESH_INTERVAL_MS);

    return () => {
      isMounted = false;
      if (intervalId) {
        clearInterval(intervalId);
      }
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
