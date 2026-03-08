import { useEffect, useMemo, useState } from "react";
import type { MouseEvent } from "react";
import type { TargetItem } from "../../targets/types";

const TARGET_WIDTH = 400;
const TARGET_HEIGHT = 300;
const HIDDEN_COMPARE_OFFSET = -1;

interface PreviewPaneProps {
  target: TargetItem | null;
  debouncedCode: string;
  renderApiBase: string;
  renderTargetId: string;
  isCompareEnabled: boolean;
  isDiffEnabled: boolean;
  onCompareEnabledChange: (nextValue: boolean) => void;
  onDiffEnabledChange: (nextValue: boolean) => void;
}

function buildPreviewUrl(apiBase: string, code: string, targetId: string): string {
  const params = new URLSearchParams();
  params.set("t", targetId);
  params.set("q", code);
  return `${apiBase}?${params.toString()}`;
}

function clampOffset(value: number, max: number): number {
  return Math.max(0, Math.min(max, value));
}

export function PreviewPane({
  target,
  debouncedCode,
  renderApiBase,
  renderTargetId,
  isCompareEnabled,
  isDiffEnabled,
  onCompareEnabledChange,
  onDiffEnabledChange
}: PreviewPaneProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [compareX, setCompareX] = useState(HIDDEN_COMPARE_OFFSET);
  const [compareY, setCompareY] = useState(HIDDEN_COMPARE_OFFSET);
  const [isShiftPressed, setIsShiftPressed] = useState(false);
  const [cursorX, setCursorX] = useState(-1000);
  const [cursorY, setCursorY] = useState(-1000);

  useEffect(() => {
    setCompareX(HIDDEN_COMPARE_OFFSET);
    setCompareY(HIDDEN_COMPARE_OFFSET);
  }, [isCompareEnabled, isDiffEnabled, target?.challengeId]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Shift") {
        setIsShiftPressed(true);
      }
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      if (event.key === "Shift") {
        setIsShiftPressed(false);
      }
    };

    const handleWindowBlur = () => {
      setIsShiftPressed(false);
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    window.addEventListener("blur", handleWindowBlur);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
      window.removeEventListener("blur", handleWindowBlur);
    };
  }, []);

  const previewUrl = useMemo(() => {
    return buildPreviewUrl(renderApiBase, debouncedCode, renderTargetId);
  }, [renderApiBase, debouncedCode, renderTargetId]);

  const hasTarget = target !== null;

  useEffect(() => {
    if (!hasTarget || !previewUrl) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
  }, [previewUrl, hasTarget]);

  const handlePreviewMouseMove = (event: MouseEvent<HTMLDivElement>) => {
    if (!isCompareEnabled) {
      return;
    }

    const bounds = event.currentTarget.getBoundingClientRect();
    const nextX = clampOffset(event.clientX - bounds.left, TARGET_WIDTH);
    const nextY = clampOffset(event.clientY - bounds.top, TARGET_HEIGHT);
    setCompareX(nextX);
    setCompareY(nextY);
    setIsShiftPressed(event.shiftKey);
  };

  const handlePreviewMouseLeave = () => {
    setCompareX(HIDDEN_COMPARE_OFFSET);
    setCompareY(HIDDEN_COMPARE_OFFSET);
  };

  const handleMeasureMove = (event: MouseEvent<HTMLDivElement>) => {
    const bounds = event.currentTarget.getBoundingClientRect();
    setCursorX(Math.floor(event.clientX - bounds.left));
    setCursorY(Math.floor(event.clientY - bounds.top));
  };

  const handleMeasureLeave = () => {
    setCursorX(-1000);
    setCursorY(-1000);
  };

  if (!target) {
    return (
      <section className="panel previewPanel">
        <p className="targetsMeta">Select a target to start previewing.</p>
      </section>
    );
  }

  const isCompareVisible = isCompareEnabled && compareX >= 0 && compareY >= 0;
  const useHorizontalCompare = isShiftPressed;

  const canRenderHorizontal = isCompareVisible && compareY < TARGET_HEIGHT;
  const canRenderVertical = isCompareVisible && compareX < TARGET_WIDTH;
  const hasActions = Boolean(target.playUrl || target.leaderboardUrl);

  return (
    <section className="panel previewPanel">
      <div className="previewPair">
        <section className="previewBlock">
          <div className="previewBlockHeader">
            <h3 className="previewBlockTitle">Output</h3>

            <div className="previewCompareControls" role="group" aria-label="Comparison controls">
              <label className="toggleCheck" htmlFor="slideCompareToggle">
                <input
                  id="slideCompareToggle"
                  type="checkbox"
                  checked={isCompareEnabled}
                  onChange={(event) => onCompareEnabledChange(event.target.checked)}
                />
                <span>Slide & Compare</span>
              </label>

              <label className="toggleCheck" htmlFor="diffToggle">
                <input
                  id="diffToggle"
                  type="checkbox"
                  checked={isDiffEnabled}
                  onChange={(event) => onDiffEnabledChange(event.target.checked)}
                />
                <span>Diff</span>
              </label>
            </div>
          </div>

          <div className="previewCanvas" onMouseMove={handlePreviewMouseMove} onMouseLeave={handlePreviewMouseLeave}>
            {isLoading ? <div className="previewLoader" /> : null}

            <img
              className="previewGenerated"
              src={previewUrl}
              width={TARGET_WIDTH}
              height={TARGET_HEIGHT}
              alt="Rendered output"
              onLoad={() => setIsLoading(false)}
              onError={() => setIsLoading(false)}
            />

            {useHorizontalCompare && canRenderHorizontal ? (
              <div
                className="previewTargetOverlay previewTargetOverlayHorizontal"
                style={{
                  top: `${compareY}px`,
                  width: `${TARGET_WIDTH}px`,
                  height: `${TARGET_HEIGHT - compareY}px`,
                  mixBlendMode: isDiffEnabled ? "difference" : "normal"
                }}
              >
                <img
                  className="previewTarget"
                  src={target.imageUrl}
                  width={TARGET_WIDTH}
                  height={TARGET_HEIGHT}
                  alt="Target overlay"
                  style={{ transform: `translateY(-${compareY}px)` }}
                />
              </div>
            ) : null}

            {!useHorizontalCompare && canRenderVertical ? (
              <div
                className="previewTargetOverlay previewTargetOverlayVertical"
                style={{
                  left: `${compareX}px`,
                  width: `${TARGET_WIDTH - compareX}px`,
                  height: `${TARGET_HEIGHT}px`,
                  mixBlendMode: isDiffEnabled ? "difference" : "normal"
                }}
              >
                <img
                  className="previewTarget"
                  src={target.imageUrl}
                  width={TARGET_WIDTH}
                  height={TARGET_HEIGHT}
                  alt="Target overlay"
                  style={{ transform: `translateX(-${compareX}px)` }}
                />
              </div>
            ) : null}
          </div>
        </section>

        <section className="previewBlock">
          <h3 className="previewBlockTitle">Target</h3>
          <div className="referenceWrap" onMouseMove={handleMeasureMove} onMouseLeave={handleMeasureLeave}>
            <div className="measureLineHorizontal" style={{ top: `${cursorY}px` }} />
            <div className="measureLineVertical" style={{ left: `${cursorX}px` }} />
            <div className="measureTooltip" style={{ left: `${cursorX + 8}px`, top: `${cursorY - 28}px` }}>
              {cursorX} / {cursorY}
            </div>

            <img
              className="referenceImage"
              src={target.imageUrl}
              width={TARGET_WIDTH}
              height={TARGET_HEIGHT}
              alt="Target reference"
            />
          </div>
        </section>
      </div>

      {hasActions ? (
        <div className="buttonRow">
          {target.playUrl ? (
            <a className="actionButton" href={target.playUrl} target="_blank" rel="noreferrer">
              Play
            </a>
          ) : null}
          {target.leaderboardUrl ? (
            <a className="actionButton" href={target.leaderboardUrl} target="_blank" rel="noreferrer">
              Leaderboard
            </a>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}
