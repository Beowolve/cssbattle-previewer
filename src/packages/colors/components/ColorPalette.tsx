import type { CSSProperties } from "react";

interface ColorPaletteProps {
  colors: string[];
}

export function ColorPalette({ colors }: ColorPaletteProps) {
  const hasColors = colors.length > 0;

  const copyColor = async (color: string) => {
    try {
      await navigator.clipboard.writeText(color);
    } catch {
      // Ignore clipboard failures on restricted contexts.
    }
  };

  return (
    <section className="panel colorsPanel">
      <div className="panelHeader compactHeader">
        <div className="panelHeaderMain">
          <h2>Colors</h2>
        </div>
      </div>

      {!hasColors ? <p className="targetsMeta">No colors available for this target.</p> : null}

      {hasColors ? (
        <ul className="colorRow">
          {colors.map((color) => (
            <li key={color}>
              <button
                type="button"
                className="colorPill"
                title="Copy color"
                style={{ "--swatch-color": color } as CSSProperties}
                onClick={() => void copyColor(color)}
              >
                {color}
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  );
}
