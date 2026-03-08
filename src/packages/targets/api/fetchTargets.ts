import type { TargetItem, TargetMode } from "../types";
import { getSupabaseClient } from "../../supabase/client";

const CSS_BATTLE_BASE = "https://cssbattle.dev";

function normalizeImageUrl(imageUrl: string): string {
  if (!imageUrl || imageUrl.trim() === "") {
    return "";
  }

  if (imageUrl.startsWith("https://") || imageUrl.startsWith("http://")) {
    return imageUrl;
  }

  if (imageUrl.startsWith("/")) {
    return `${CSS_BATTLE_BASE}${imageUrl}`;
  }

  return `${CSS_BATTLE_BASE}/${imageUrl}`;
}

function formatDailyLabel(dateString: string): string {
  const parsedDate = new Date(`${dateString}T00:00:00Z`);
  if (Number.isNaN(parsedDate.getTime())) {
    return dateString;
  }

  return new Intl.DateTimeFormat("en-US", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "UTC"
  }).format(parsedDate);
}

function parseDailySortValue(dateString: string): number {
  const timestamp = Date.parse(`${dateString}T00:00:00Z`);
  return Number.isFinite(timestamp) ? timestamp : 0;
}

function normalizeHexColor(input: string): string | null {
  const trimmed = input.trim();
  if (!/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(trimmed)) {
    return null;
  }

  return trimmed.toUpperCase();
}

function parseColors(rawColors: unknown): string[] {
  if (Array.isArray(rawColors)) {
    return rawColors
      .map((item) => (typeof item === "string" ? normalizeHexColor(item) : null))
      .filter((item): item is string => Boolean(item));
  }

  if (typeof rawColors === "string") {
    const trimmed = rawColors.trim();
    if (trimmed === "") {
      return [];
    }

    try {
      const parsed = JSON.parse(trimmed) as unknown;
      return parseColors(parsed);
    } catch {
      const matches = trimmed.match(/#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})/g) ?? [];
      return matches
        .map((item) => normalizeHexColor(item))
        .filter((item): item is string => Boolean(item));
    }
  }

  return [];
}

function uniqueColors(colors: string[]): string[] {
  const result: string[] = [];

  for (const color of colors) {
    if (!result.includes(color)) {
      result.push(color);
    }
  }

  return result;
}

export async function fetchTargets(mode: TargetMode): Promise<TargetItem[]> {
  if (mode === "custom") {
    return [];
  }

  const supabase = getSupabaseClient();

  if (mode === "daily") {
    const { data: dailyTargets, error: dailyTargetsError } = await supabase
      .from("daily_targets")
      .select("key, name, image_url, date, colors")
      .order("date", { ascending: false })
      .order("key", { ascending: false });

    if (dailyTargetsError) {
      throw new Error(`Could not load daily targets: ${dailyTargetsError.message}`);
    }

    return (dailyTargets ?? []).map((row) => {
      const challengeId = String(row.key);
      return {
        challengeId,
        name: row.name,
        mode: "daily",
        imageUrl: normalizeImageUrl(row.image_url),
        colors: uniqueColors(parseColors(row.colors)),
        label: formatDailyLabel(row.date),
        sortValue: parseDailySortValue(row.date),
        playUrl: `${CSS_BATTLE_BASE}/play/${challengeId}`,
        leaderboardUrl: null,
        battleNumber: null,
        date: row.date
      };
    });
  }

  const { data: battleTargets, error: battleTargetsError } = await supabase
    .from("battle_targets")
    .select("id, name, image_url, battle_number, colors")
    .order("id", { ascending: false });

  if (battleTargetsError) {
    throw new Error(`Could not load battle targets: ${battleTargetsError.message}`);
  }

  return (battleTargets ?? []).map((row) => {
    const challengeId = String(row.id);
    return {
      challengeId,
      name: row.name,
      mode: "battle",
      imageUrl: normalizeImageUrl(row.image_url),
      colors: uniqueColors(parseColors(row.colors)),
      label: `#${challengeId}`,
      sortValue: Number(row.id) || 0,
      playUrl: `${CSS_BATTLE_BASE}/play/${challengeId}`,
      leaderboardUrl: `${CSS_BATTLE_BASE}/leaderboard/target/${challengeId}`,
      battleNumber: Number.isFinite(row.battle_number) ? Number(row.battle_number) : null,
      date: null
    };
  });
}
