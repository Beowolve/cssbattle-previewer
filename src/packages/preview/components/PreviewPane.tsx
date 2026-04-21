import { useEffect, useMemo, useState, useRef } from "react";
import type { PointerEvent } from "react";
import type { TargetItem } from "../../targets/types";

const TARGET_WIDTH = 400;
const TARGET_HEIGHT = 300;
const HIDDEN_COMPARE_OFFSET = -1;
const TOUCH_AXIS_LOCK_THRESHOLD = 8;
type CompareOrientation = "horizontal" | "vertical";

interface ActiveTouchCompareGesture {
  pointerId: number;
  startX: number;
  startY: number;
  lockedOrientation: CompareOrientation | null;
}

interface PreviewPaneProps {
  target: TargetItem | null;
  debouncedCode: string;
  renderApiBase: string;
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
  isCompareEnabled,
  isDiffEnabled,
  onCompareEnabledChange,
  onDiffEnabledChange
}: PreviewPaneProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [compareX, setCompareX] = useState(HIDDEN_COMPARE_OFFSET);
  const [compareY, setCompareY] = useState(HIDDEN_COMPARE_OFFSET);
  const [isShiftPressed, setIsShiftPressed] = useState(false);
  const [touchCompareOrientation, setTouchCompareOrientation] = useState<CompareOrientation | null>(null);
  const [cursorX, setCursorX] = useState(-1000);
  const [cursorY, setCursorY] = useState(-1000);
  const referenceWrapRef = useRef<HTMLDivElement | null>(null);
  const activeTouchCompareGestureRef = useRef<ActiveTouchCompareGesture | null>(null);
  const activeMeasurePointerIdRef = useRef<number | null>(null);
  const [referenceOffset, setReferenceOffset] = useState({ left: 0, top: 0 });

  useEffect(() => {
    setCompareX(HIDDEN_COMPARE_OFFSET);
    setCompareY(HIDDEN_COMPARE_OFFSET);
    setTouchCompareOrientation(null);
    activeTouchCompareGestureRef.current = null;
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

  const targetId = target?.challengeId ?? "";
  const previewUrl = useMemo(() => {
    return targetId ? buildPreviewUrl(renderApiBase, debouncedCode, targetId) : "";
  }, [renderApiBase, debouncedCode, targetId]);

  const hasTarget = target !== null;

  useEffect(() => {
    if (!hasTarget || !previewUrl) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
  }, [previewUrl, hasTarget]);

  const resetComparePosition = () => {
    setCompareX(HIDDEN_COMPARE_OFFSET);
    setCompareY(HIDDEN_COMPARE_OFFSET);
  };

  const updateMeasureCursor = (event: PointerEvent<HTMLDivElement>) => {
    const bounds = event.currentTarget.getBoundingClientRect();
    const nextX = clampOffset(Math.floor(event.clientX - bounds.left), TARGET_WIDTH - 1);
    const nextY = clampOffset(Math.floor(event.clientY - bounds.top), TARGET_HEIGHT - 1);
    setCursorX(nextX);
    setCursorY(nextY);
  };

  const detectTouchCompareOrientation = (
    gesture: ActiveTouchCompareGesture,
    pointerX: number,
    pointerY: number
  ): CompareOrientation | null => {
    const deltaX = Math.abs(pointerX - gesture.startX);
    const deltaY = Math.abs(pointerY - gesture.startY);
    const movement = Math.max(deltaX, deltaY);

    if (movement < TOUCH_AXIS_LOCK_THRESHOLD) {
      return null;
    }

    return deltaY > deltaX ? "horizontal" : "vertical";
  };

  const updateComparePosition = (event: PointerEvent<HTMLDivElement>) => {
    if (!isCompareEnabled) {
      return;
    }

    const bounds = event.currentTarget.getBoundingClientRect();
    const nextX = clampOffset(event.clientX - bounds.left, TARGET_WIDTH);
    const nextY = clampOffset(event.clientY - bounds.top, TARGET_HEIGHT);
    setCompareX(nextX);
    setCompareY(nextY);

    if (event.pointerType === "touch") {
      const activeGesture = activeTouchCompareGestureRef.current;
      if (activeGesture && activeGesture.pointerId === event.pointerId) {
        const nextOrientation =
          activeGesture.lockedOrientation ?? detectTouchCompareOrientation(activeGesture, nextX, nextY);

        if (nextOrientation && activeGesture.lockedOrientation !== nextOrientation) {
          activeGesture.lockedOrientation = nextOrientation;
          setTouchCompareOrientation(nextOrientation);
        }
      }
      return;
    }

    setTouchCompareOrientation(null);
    setIsShiftPressed(event.shiftKey);
  };

  const handlePreviewPointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (event.pointerType === "touch") {
      const bounds = event.currentTarget.getBoundingClientRect();
      activeTouchCompareGestureRef.current = {
        pointerId: event.pointerId,
        startX: clampOffset(event.clientX - bounds.left, TARGET_WIDTH),
        startY: clampOffset(event.clientY - bounds.top, TARGET_HEIGHT),
        lockedOrientation: null
      };
      setTouchCompareOrientation(null);
      setIsShiftPressed(false);
    } else {
      activeTouchCompareGestureRef.current = null;
      setTouchCompareOrientation(null);
    }

    updateComparePosition(event);

    if (event.currentTarget.setPointerCapture) {
      event.currentTarget.setPointerCapture(event.pointerId);
    }
  };

  const handlePreviewPointerMove = (event: PointerEvent<HTMLDivElement>) => {
    updateComparePosition(event);
  };

  const handlePreviewPointerLeave = (event: PointerEvent<HTMLDivElement>) => {
    if (event.pointerType === "mouse" || event.pointerType === "pen") {
      resetComparePosition();
    }
  };

  const handlePreviewPointerUp = (event: PointerEvent<HTMLDivElement>) => {
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }

    const activeGesture = activeTouchCompareGestureRef.current;
    if (event.pointerType === "touch" && activeGesture && activeGesture.pointerId === event.pointerId) {
      activeTouchCompareGestureRef.current = null;
      setTouchCompareOrientation(null);
      resetComparePosition();
    }
  };

  const handlePreviewPointerCancel = () => {
    activeTouchCompareGestureRef.current = null;
    setTouchCompareOrientation(null);
    resetComparePosition();
  };

  const handleMeasureLeave = () => {
    setCursorX(-1000);
    setCursorY(-1000);
  };

  const handleMeasurePointerDown = (event: PointerEvent<HTMLDivElement>) => {
    updateMeasureCursor(event);
    activeMeasurePointerIdRef.current = event.pointerId;

    if (event.currentTarget.setPointerCapture) {
      event.currentTarget.setPointerCapture(event.pointerId);
    }
  };

  const handleMeasurePointerMove = (event: PointerEvent<HTMLDivElement>) => {
    updateMeasureCursor(event);
  };

  const handleMeasurePointerLeave = (event: PointerEvent<HTMLDivElement>) => {
    if (event.pointerType === "mouse") {
      handleMeasureLeave();
    }
  };

  const handleMeasurePointerUp = (event: PointerEvent<HTMLDivElement>) => {
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }

    const isActivePointer = activeMeasurePointerIdRef.current === event.pointerId;
    if (isActivePointer) {
      activeMeasurePointerIdRef.current = null;
      if (event.pointerType !== "mouse") {
        handleMeasureLeave();
      }
    }
  };

  const handleMeasurePointerCancel = () => {
    activeMeasurePointerIdRef.current = null;
    handleMeasureLeave();
  };

  useEffect(() => {
    if (referenceWrapRef.current) {
      const bounds = referenceWrapRef.current.getBoundingClientRect();
      setReferenceOffset({ left: bounds.left, top: bounds.top });
    }
    // Keep tooltip offset aligned when the viewport size changes.
    const handleResize = () => {
      if (referenceWrapRef.current) {
        const bounds = referenceWrapRef.current.getBoundingClientRect();
        setReferenceOffset({ left: bounds.left, top: bounds.top });
      }
    };
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  if (!target) {
    return (
      <section className="panel previewPanel">
        <p className="targetsMeta">Select a target to start previewing.</p>
      </section>
    );
  }

  const isCompareVisible = isCompareEnabled && compareX >= 0 && compareY >= 0;
  const shouldRenderFullDiff = isDiffEnabled && !isCompareVisible;
  const overlayBlendMode = isDiffEnabled ? "difference" : "normal";
  const useHorizontalCompare = isShiftPressed || touchCompareOrientation === "horizontal";

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

          <div
            className="previewCanvas"
            style={{ touchAction: isCompareEnabled ? "none" : "auto" }}
            onPointerDown={handlePreviewPointerDown}
            onPointerMove={handlePreviewPointerMove}
            onPointerLeave={handlePreviewPointerLeave}
            onPointerUp={handlePreviewPointerUp}
            onPointerCancel={handlePreviewPointerCancel}
          >
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
            {shouldRenderFullDiff ? (
              <div
                className="previewTargetOverlay"
                style={{
                  width: `${TARGET_WIDTH}px`,
                  height: `${TARGET_HEIGHT}px`,
                  mixBlendMode: overlayBlendMode
                }}
              >
                <img
                  className="previewTarget"
                  src={target.imageUrl}
                  width={TARGET_WIDTH}
                  height={TARGET_HEIGHT}
                  alt="Target overlay"
                />
              </div>
            ) : null}

            {useHorizontalCompare && canRenderHorizontal ? (
              <div
                className="previewTargetOverlay previewTargetOverlayHorizontal"
                style={{
                  top: `${compareY}px`,
                  width: `${TARGET_WIDTH}px`,
                  height: `${TARGET_HEIGHT - compareY}px`,
                  mixBlendMode: overlayBlendMode
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
                  mixBlendMode: overlayBlendMode
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
          <div
            className="measureTooltip"
            style={{
              left: `${cursorX + referenceOffset.left + 8}px`,
              top: `${cursorY + referenceOffset.top - 28}px`,
              position: "fixed"
            }}
          >
            {cursorX} / {cursorY}
          </div>
          <div
            className="referenceWrap"
            ref={referenceWrapRef}
            style={{ touchAction: "none" }}
            onPointerDown={handleMeasurePointerDown}
            onPointerMove={handleMeasurePointerMove}
            onPointerLeave={handleMeasurePointerLeave}
            onPointerUp={handleMeasurePointerUp}
            onPointerCancel={handleMeasurePointerCancel}
          >
            <div className="measureLineHorizontal" style={{ top: `${cursorY}px` }} />
            <div className="measureLineVertical" style={{ left: `${cursorX}px` }} />

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
