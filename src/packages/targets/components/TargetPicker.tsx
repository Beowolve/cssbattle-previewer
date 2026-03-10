import { useEffect, useMemo, useState } from "react";
import type { TargetItem, TargetMode, TargetSortOrder } from "../types";

interface BackendOption {
  id: string;
  label: string;
}

interface TargetPickerProps {
  mode: TargetMode;
  onModeChange: (nextMode: TargetMode) => void;
  sortOrder: TargetSortOrder;
  onSortOrderChange: (nextSortOrder: TargetSortOrder) => void;
  searchValue: string;
  onSearchValueChange: (nextValue: string) => void;
  selectedTargetId: string;
  onTargetIdChange: (nextTargetId: string) => void;
  targets: TargetItem[];
  backendOptions: BackendOption[];
  backendId: string;
  onBackendIdChange: (nextBackendId: string) => void;
  customImageUrl: string;
  onCustomImageUrlChange: (nextValue: string) => void;
  shareUrl: string;
}

function compareTargets(a: TargetItem, b: TargetItem, sortOrder: TargetSortOrder): number {
  const delta = a.sortValue - b.sortValue;

  if (delta !== 0) {
    return sortOrder === "newest" ? -delta : delta;
  }

  return sortOrder === "newest"
    ? b.challengeId.localeCompare(a.challengeId)
    : a.challengeId.localeCompare(b.challengeId);
}

export function TargetPicker({
  mode,
  onModeChange,
  sortOrder,
  onSortOrderChange,
  searchValue,
  onSearchValueChange,
  selectedTargetId,
  onTargetIdChange,
  targets,
  backendOptions,
  backendId,
  onBackendIdChange,
  customImageUrl,
  onCustomImageUrlChange,
  shareUrl
}: TargetPickerProps) {
  const [shareCopyState, setShareCopyState] = useState<"idle" | "copied" | "error">("idle");

  const filteredTargets = useMemo(() => {
    const normalizedQuery = searchValue.trim().toLowerCase();

    const candidates = normalizedQuery
      ? targets.filter((target) => {
          return (
            target.name.toLowerCase().includes(normalizedQuery) ||
            target.challengeId.toLowerCase().includes(normalizedQuery) ||
            target.label.toLowerCase().includes(normalizedQuery)
          );
        })
      : targets;

    return [...candidates].sort((a, b) => compareTargets(a, b, sortOrder));
  }, [targets, searchValue, sortOrder]);

  useEffect(() => {
    if (mode === "custom" || filteredTargets.length === 0) {
      return;
    }

    const isSelectedTargetVisible = filteredTargets.some((target) => target.challengeId === selectedTargetId);
    if (isSelectedTargetVisible) {
      return;
    }

    onTargetIdChange(filteredTargets[0].challengeId);
  }, [mode, filteredTargets, selectedTargetId, onTargetIdChange]);

  useEffect(() => {
    if (shareCopyState === "idle") {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setShareCopyState("idle");
    }, 1600);

    return () => window.clearTimeout(timeoutId);
  }, [shareCopyState]);

  const handleModeChange = (event: React.MouseEvent<HTMLButtonElement>) => {
    const value = event.currentTarget.value;

    if (value === "daily") {
      onModeChange("daily");
      return;
    }

    if (value === "custom") {
      onModeChange("custom");
      return;
    }

    onModeChange("battle");
  };

  const handleCopyShareLink = async () => {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(shareUrl);
      } else {
        // Fallback for environments where clipboard API is not available.
        const helper = document.createElement("textarea");
        helper.value = shareUrl;
        helper.setAttribute("readonly", "");
        helper.style.position = "absolute";
        helper.style.left = "-9999px";
        document.body.appendChild(helper);
        helper.select();
        document.execCommand("copy");
        document.body.removeChild(helper);
      }

      setShareCopyState("copied");
    } catch {
      setShareCopyState("error");
    }
  };

  return (
    <section className="panel toolbarPanel" aria-label="Target controls">
      <div className={mode === "custom" ? "targetRow targetRowCustom" : "targetRow"}>
        <div className="modeSwitch" role="tablist" aria-label="Target mode">
          <button
            type="button"
            role="tab"
            value="battle"
            className={mode === "battle" ? "modeButton active" : "modeButton"}
            aria-selected={mode === "battle"}
            onClick={handleModeChange}
          >
            Battle
          </button>
          <button
            type="button"
            role="tab"
            value="daily"
            className={mode === "daily" ? "modeButton active" : "modeButton"}
            aria-selected={mode === "daily"}
            onClick={handleModeChange}
          >
            Daily
          </button>
          <button
            type="button"
            role="tab"
            value="custom"
            className={mode === "custom" ? "modeButton active" : "modeButton"}
            aria-selected={mode === "custom"}
            onClick={handleModeChange}
          >
            Custom
          </button>
        </div>

        {mode === "custom" ? (
          <input
            className="targetInlineInput targetSelectInline targetCustomInput"
            id="customTargetImage"
            aria-label="Custom target image URL"
            type="url"
            placeholder="Custom target image URL"
            value={customImageUrl}
            onChange={(event) => onCustomImageUrlChange(event.target.value)}
          />
        ) : (
          <>
            <input
              className="targetInlineInput"
              id="targetSearch"
              aria-label="Search target"
              type="search"
              placeholder="Search target"
              value={searchValue}
              onChange={(event) => onSearchValueChange(event.target.value)}
            />

            <select
              className="targetInlineSelect targetSelectInline"
              id="targetSelect"
              aria-label="Select target"
              value={selectedTargetId}
              onChange={(event) => onTargetIdChange(event.target.value)}
              disabled={filteredTargets.length === 0}
            >
              {filteredTargets.length === 0 ? <option value="">No targets</option> : null}
              {filteredTargets.map((target) => (
                <option key={`${target.mode}-${target.challengeId}`} value={target.challengeId}>
                  {target.label} {target.name}
                </option>
              ))}
            </select>

            <select
              className="targetInlineSelect"
              id="targetSort"
              aria-label="Sort targets"
              value={sortOrder}
              onChange={(event) => onSortOrderChange(event.target.value === "oldest" ? "oldest" : "newest")}
            >
              <option value="newest">Newest</option>
              <option value="oldest">Oldest</option>
            </select>
          </>
        )}

        <label className="backendInline" htmlFor="backendSelect">
          Backend
          <select
            id="backendSelect"
            className="targetInlineSelect"
            value={backendId}
            onChange={(event) => onBackendIdChange(event.target.value)}
          >
            {backendOptions.map((option) => (
              <option key={option.id} value={option.id}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <button type="button" className="secondaryButton targetShareButton" onClick={handleCopyShareLink}>
          {shareCopyState === "copied" ? "Copied" : shareCopyState === "error" ? "Copy failed" : "Copy Link"}
        </button>
      </div>
    </section>
  );
}
