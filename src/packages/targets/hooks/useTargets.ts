import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { hasSupabaseConfig } from "../../supabase/client";
import { fetchTargets } from "../api/fetchTargets";
import { readTargetCache, writeTargetCache } from "../cache";
import type { TargetMode } from "../types";

export function useTargets(mode: TargetMode) {
  const cachedTargets = readTargetCache(mode);

  const query = useQuery({
    queryKey: ["targets", mode],
    queryFn: () => fetchTargets(mode),
    enabled: hasSupabaseConfig,
    initialData: cachedTargets?.targets,
    initialDataUpdatedAt: cachedTargets?.fetchedAt,
    retry: 1,
    refetchOnWindowFocus: false
  });

  useEffect(() => {
    if (!query.data || !hasSupabaseConfig) {
      return;
    }

    writeTargetCache(mode, query.data);
  }, [mode, query.data]);

  return {
    ...query,
    hasConfig: hasSupabaseConfig,
    targets: query.data ?? []
  };
}
