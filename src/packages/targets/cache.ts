import { readStoredJson, writeStoredJson } from "../shared/utils/storage";
import type { StoredTargetCache, TargetMode } from "./types";

const CACHE_KEY_PREFIX = "cssbattle-previewer.targets.v1";

function getCacheKey(mode: TargetMode): string {
  return `${CACHE_KEY_PREFIX}.${mode}`;
}

export function readTargetCache(mode: TargetMode): StoredTargetCache | null {
  const parsed = readStoredJson<StoredTargetCache | null>(getCacheKey(mode), null);

  if (!parsed || !Array.isArray(parsed.targets) || typeof parsed.fetchedAt !== "number") {
    return null;
  }

  return parsed;
}

export function writeTargetCache(mode: TargetMode, targets: StoredTargetCache["targets"]): void {
  writeStoredJson<StoredTargetCache>(getCacheKey(mode), {
    fetchedAt: Date.now(),
    targets
  });
}

export function clearTargetCaches(): void {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem(getCacheKey("battle"));
  window.localStorage.removeItem(getCacheKey("daily"));
  window.localStorage.removeItem(getCacheKey("custom"));
}
