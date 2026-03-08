export type RemoteTargetMode = "battle" | "daily";

export type TargetMode = RemoteTargetMode | "custom";

export type TargetSortOrder = "newest" | "oldest";

export interface TargetItem {
  challengeId: string;
  name: string;
  mode: TargetMode;
  imageUrl: string;
  colors: string[];
  label: string;
  sortValue: number;
  playUrl: string | null;
  leaderboardUrl: string | null;
  battleNumber: number | null;
  date: string | null;
}

export interface StoredTargetCache {
  fetchedAt: number;
  targets: TargetItem[];
}
