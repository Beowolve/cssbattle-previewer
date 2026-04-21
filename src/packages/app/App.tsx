import { useEffect, useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { renderApiBase } from "../supabase/client";
import { Header } from "./components/Header";
import { EditorPane } from "../editor/components/EditorPane";
import { PreviewPane } from "../preview/components/PreviewPane";
import { SpacesTable } from "../spaces/components/SpacesTable";
import { TOOL_LINKS } from "../tools/config/toolLinks";
import { TargetPicker } from "../targets/components/TargetPicker";
import { clearTargetCaches } from "../targets/cache";
import { useTargets } from "../targets/hooks/useTargets";
import type { TargetItem, TargetMode, TargetSortOrder } from "../targets/types";
import { encodeInvisibleChars, decodeHtmlEntities } from "../shared/utils/encoding";
import { readStoredJson, readStoredString, writeStoredJson, writeStoredValue } from "../shared/utils/storage";
import { useTheme } from "../theme/useTheme";
import { ColorPalette } from "../colors/components/ColorPalette";

interface SelectionState {
  battle: string;
  daily: string;
  custom: string;
}

interface ParsedQueryState {
  mode?: TargetMode;
  targetId?: string;
  imageUrl?: string;
}

const MODE_STORAGE_KEY = "cssbattle-previewer.mode";
const SORT_STORAGE_KEY = "cssbattle-previewer.sort";
const SELECTION_STORAGE_KEY = "cssbattle-previewer.selection";
const COMPARE_STORAGE_KEY = "cssbattle-previewer.preview.compare";
const DIFF_STORAGE_KEY = "cssbattle-previewer.preview.diff";
const CUSTOM_IMAGE_STORAGE_KEY = "cssbattle-previewer.custom-image";

const DEFAULT_SELECTION_STATE: SelectionState = {
  battle: "",
  daily: "",
  custom: ""
};

function isMode(value: string): value is TargetMode {
  return value === "battle" || value === "daily" || value === "custom";
}

function isSortOrder(value: string): value is TargetSortOrder {
  return value === "newest" || value === "oldest";
}

function parseInitialQueryState(search: string): ParsedQueryState {
  const params = new URLSearchParams(search);
  const rawMode = (params.get("mode") ?? "").trim().toLowerCase();
  const rawTargetId = (params.get("target") ?? "").trim();
  const rawImageUrl = (params.get("image") ?? "").trim();

  const parsedState: ParsedQueryState = {};

  if (isMode(rawMode)) {
    parsedState.mode = rawMode;
  }

  // If an image URL is provided without mode, default to custom mode.
  if (!parsedState.mode && rawImageUrl) {
    parsedState.mode = "custom";
  }

  if (rawTargetId) {
    parsedState.targetId = rawTargetId;
  }

  if (rawImageUrl) {
    parsedState.imageUrl = rawImageUrl;
  }

  return parsedState;
}

function buildInitialSelectionState(parsedQueryState: ParsedQueryState): SelectionState {
  const storedSelection = readStoredJson<SelectionState>(SELECTION_STORAGE_KEY, DEFAULT_SELECTION_STATE);

  if ((parsedQueryState.mode === "battle" || parsedQueryState.mode === "daily") && parsedQueryState.targetId) {
    return {
      ...storedSelection,
      [parsedQueryState.mode]: parsedQueryState.targetId
    };
  }

  return storedSelection;
}

function buildShareQuery(
  mode: TargetMode,
  selection: SelectionState,
  selectedTargetId: string | null,
  customImageUrl: string
): string {
  const params = new URLSearchParams();
  params.set("mode", mode);

  if (mode === "custom") {
    const normalizedImageUrl = customImageUrl.trim();
    if (normalizedImageUrl) {
      params.set("image", normalizedImageUrl);
    }

    return params.toString();
  }

  const targetId = selection[mode] || selectedTargetId || "";
  if (targetId) {
    params.set("target", targetId);
  }

  return params.toString();
}

function compareTargets(aSortValue: number, bSortValue: number, sortOrder: TargetSortOrder): number {
  const delta = aSortValue - bSortValue;
  return sortOrder === "newest" ? -delta : delta;
}

function buildCustomTarget(customImageUrl: string): TargetItem | null {
  const normalized = customImageUrl.trim();
  if (!normalized) {
    return null;
  }

  return {
    challengeId: "-1",
    name: "Custom",
    mode: "custom",
    imageUrl: normalized,
    colors: [],
    label: "Custom",
    sortValue: 0,
    playUrl: null,
    leaderboardUrl: null,
    battleNumber: null,
    date: null
  };
}

export default function App() {
  const [themeMode, setThemeMode] = useTheme();
  const initialQueryState = useMemo(() => parseInitialQueryState(window.location.search), []);

  const [mode, setMode] = useState<TargetMode>(() => {
    const rawValue = readStoredString(MODE_STORAGE_KEY, "battle");
    const storedMode = isMode(rawValue) ? rawValue : "battle";
    return initialQueryState.mode ?? storedMode;
  });
  const [sortOrder, setSortOrder] = useState<TargetSortOrder>(() => {
    const rawValue = readStoredString(SORT_STORAGE_KEY, "newest");
    return isSortOrder(rawValue) ? rawValue : "newest";
  });
  const [searchValue, setSearchValue] = useState("");
  const [selection, setSelection] = useState<SelectionState>(() => buildInitialSelectionState(initialQueryState));
  const [customImageUrl, setCustomImageUrl] = useState<string>(() => {
    if (initialQueryState.mode === "custom") {
      return initialQueryState.imageUrl ?? "";
    }

    return readStoredString(CUSTOM_IMAGE_STORAGE_KEY, "");
  });
  const [code, setCode] = useState("");
  const [debouncedCode, setDebouncedCode] = useState("");
  const [isCompareEnabled, setIsCompareEnabled] = useState<boolean>(() =>
    readStoredString(COMPARE_STORAGE_KEY, "1") === "1"
  );
  const [isDiffEnabled, setIsDiffEnabled] = useState<boolean>(() => readStoredString(DIFF_STORAGE_KEY, "0") === "1");

  const targetsQuery = useTargets(mode);
  const queryClient = useQueryClient();

  const sortedTargets = useMemo(() => {
    return [...targetsQuery.targets].sort((a, b) => compareTargets(a.sortValue, b.sortValue, sortOrder));
  }, [targetsQuery.targets, sortOrder]);

  const selectedTarget = useMemo(() => {
    if (mode === "custom") {
      return buildCustomTarget(customImageUrl);
    }

    const selectedId = selection[mode];
    if (selectedId) {
      const found = sortedTargets.find((target) => target.challengeId === selectedId);
      if (found) {
        return found;
      }
    }

    return sortedTargets[0] ?? null;
  }, [customImageUrl, mode, selection, sortedTargets]);

  const shareQuery = useMemo(
    () => buildShareQuery(mode, selection, selectedTarget?.challengeId ?? null, customImageUrl),
    [customImageUrl, mode, selectedTarget?.challengeId, selection]
  );
  const shareSearch = shareQuery ? `?${shareQuery}` : "";
  const shareUrl = useMemo(() => {
    return `${window.location.origin}${window.location.pathname}${shareSearch}${window.location.hash}`;
  }, [shareSearch]);

  useEffect(() => {
    function handleForceRefresh(event: KeyboardEvent) {
      const isForceRefreshShortcut = event.key === "F5" && (event.ctrlKey || event.metaKey);
      if (!isForceRefreshShortcut) {
        return;
      }

      event.preventDefault();
      clearTargetCaches();
      queryClient.removeQueries({ queryKey: ["targets"] });
      void queryClient.refetchQueries({ queryKey: ["targets"], type: "active" });
    }

    window.addEventListener("keydown", handleForceRefresh);
    return () => window.removeEventListener("keydown", handleForceRefresh);
  }, [queryClient]);

  useEffect(() => {
    if (mode === "custom" || !selectedTarget) {
      return;
    }

    if (selection[mode] === selectedTarget.challengeId) {
      return;
    }

    setSelection((previousState) => ({
      ...previousState,
      [mode]: selectedTarget.challengeId
    }));
  }, [mode, selectedTarget, selection]);

  useEffect(() => {
    if (window.location.search === shareSearch) {
      return;
    }

    const nextUrl = `${window.location.pathname}${shareSearch}${window.location.hash}`;
    window.history.replaceState(null, "", nextUrl);
  }, [shareSearch]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setDebouncedCode(code);
    }, 650);

    return () => window.clearTimeout(timeoutId);
  }, [code]);

  useEffect(() => {
    writeStoredValue(MODE_STORAGE_KEY, mode);
  }, [mode]);

  useEffect(() => {
    writeStoredValue(SORT_STORAGE_KEY, sortOrder);
  }, [sortOrder]);

  useEffect(() => {
    writeStoredValue(CUSTOM_IMAGE_STORAGE_KEY, customImageUrl);
  }, [customImageUrl]);

  useEffect(() => {
    writeStoredValue(COMPARE_STORAGE_KEY, isCompareEnabled ? "1" : "0");
  }, [isCompareEnabled]);

  useEffect(() => {
    writeStoredValue(DIFF_STORAGE_KEY, isDiffEnabled ? "1" : "0");
  }, [isDiffEnabled]);

  useEffect(() => {
    writeStoredJson(SELECTION_STORAGE_KEY, selection);
  }, [selection]);

  const decodedCharCount = useMemo(() => decodeHtmlEntities(code).length, [code]);
  const showTargetErrors = mode !== "custom";

  return (
    <div className="appRoot">
      <Header themeMode={themeMode} onThemeModeChange={setThemeMode} links={TOOL_LINKS} />

      <main className="content">
        <TargetPicker
          mode={mode}
          onModeChange={setMode}
          sortOrder={sortOrder}
          onSortOrderChange={setSortOrder}
          searchValue={searchValue}
          onSearchValueChange={setSearchValue}
          selectedTargetId={selectedTarget?.challengeId ?? selection[mode] ?? ""}
          onTargetIdChange={(nextTargetId) =>
            setSelection((previousState) => ({
              ...previousState,
              [mode]: nextTargetId
            }))
          }
          targets={sortedTargets}
          customImageUrl={customImageUrl}
          onCustomImageUrlChange={setCustomImageUrl}
          shareUrl={shareUrl}
        />

        {showTargetErrors && !targetsQuery.hasConfig ? (
          <div className="statusCard errorCard">
            Missing Supabase config. Create <code>.env</code> from <code>.env.example</code> and set
            <code> VITE_SUPABASE_URL</code> and <code>VITE_SUPABASE_ANON_KEY</code>.
          </div>
        ) : null}

        {showTargetErrors && targetsQuery.error ? (
          <div className="statusCard errorCard">{(targetsQuery.error as Error).message || "Target query failed."}</div>
        ) : null}

        <section className="workspaceGrid">
          <EditorPane
            code={code}
            charCount={decodedCharCount}
            onCodeChange={setCode}
            onDecodeEntities={() => setCode((previousCode) => decodeHtmlEntities(previousCode))}
            onEncodeInvisible={() => setCode((previousCode) => encodeInvisibleChars(previousCode))}
          />

          <aside className="previewColumn">
            <PreviewPane
              target={selectedTarget}
              debouncedCode={debouncedCode}
              renderApiBase={renderApiBase}
              isCompareEnabled={isCompareEnabled}
              isDiffEnabled={isDiffEnabled}
              onCompareEnabledChange={setIsCompareEnabled}
              onDiffEnabledChange={setIsDiffEnabled}
            />

            <ColorPalette colors={selectedTarget?.colors ?? []} />
          </aside>

          <div className="spacesUnderEditor">
            <SpacesTable />
          </div>
        </section>
      </main>
    </div>
  );
}
