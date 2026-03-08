import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { hasSupabaseConfig } from "../../supabase/client";
import { readStoredJson, writeStoredJson } from "../../shared/utils/storage";
import { fetchTargets } from "../api/fetchTargets";
import type { StoredTargetCache, TargetMode } from "../types";

const CACHE_KEY_PREFIX = "cssbattle-previewer.targets.v1";

function getCacheKey(mode: TargetMode): string {
  return `${CACHE_KEY_PREFIX}.${mode}`;
}

function readTargetCache(mode: TargetMode): StoredTargetCache | null {
  const parsed = readStoredJson<StoredTargetCache | null>(getCacheKey(mode), null);

  if (!parsed || !Array.isArray(parsed.targets) || typeof parsed.fetchedAt !== "number") {
    return null;
  }

  return parsed;
}

export function useTargets(mode: TargetMode) {
  const query = useQuery({
    queryKey: ["targets", mode],
    queryFn: () => fetchTargets(mode),
    enabled: hasSupabaseConfig,
    initialData: () => readTargetCache(mode)?.targets,
    retry: 1,
    refetchOnWindowFocus: false
  });

  useEffect(() => {
    if (!query.data || !hasSupabaseConfig) {
      return;
    }

    writeStoredJson<StoredTargetCache>(getCacheKey(mode), {
      fetchedAt: Date.now(),
      targets: query.data
    });
  }, [mode, query.data]);

  return {
    ...query,
    hasConfig: hasSupabaseConfig,
    targets: query.data ?? []
  };
}
