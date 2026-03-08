import rawChars from "./chars.json";

interface RawCharEntry {
  hex?: unknown;
  char?: unknown;
  name?: unknown;
}

type RawCategory = Record<string, RawCharEntry> | RawCharEntry[];

export interface UnicodeCharEntry {
  id: string;
  hex: string;
  char: string;
  name: string;
}

export interface UnicodeTab {
  id: string;
  label: string;
  entries: UnicodeCharEntry[];
}

function slugify(input: string): string {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function normalizeEntry(rawEntry: RawCharEntry, fallbackId: string): UnicodeCharEntry | null {
  const hex = typeof rawEntry.hex === "string" ? rawEntry.hex.trim() : "";
  const char = typeof rawEntry.char === "string" ? rawEntry.char : "";
  const name = typeof rawEntry.name === "string" ? rawEntry.name.trim() : "";

  if (!char) {
    return null;
  }

  return {
    id: fallbackId,
    hex,
    char,
    name
  };
}

function toEntries(rawCategory: RawCategory, tabId: string): UnicodeCharEntry[] {
  const sourceEntries = Array.isArray(rawCategory) ? rawCategory : Object.values(rawCategory);

  return sourceEntries
    .map((rawEntry, index) => normalizeEntry(rawEntry, `${tabId}-${index}`))
    .filter((entry): entry is UnicodeCharEntry => entry !== null);
}

const categories = rawChars as Record<string, RawCategory>;

export const UNICODE_TABS: UnicodeTab[] = Object.entries(categories)
  .map(([label, rawCategory]) => {
    const id = slugify(label);
    const entries = toEntries(rawCategory, id);

    return {
      id,
      label,
      entries
    };
  })
  .filter((tab) => tab.entries.length > 0);
