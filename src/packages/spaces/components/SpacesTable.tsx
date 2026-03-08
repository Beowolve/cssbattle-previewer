import { useMemo, useState } from "react";
import { SPACES } from "../data/spaces";
import { UNICODE_TABS } from "../data/unicodeChars";

export function SpacesTable() {
  const [status, setStatus] = useState("");
  const [activeTabId, setActiveTabId] = useState<string>(UNICODE_TABS[0]?.id ?? "");

  const activeTab = useMemo(() => {
    return UNICODE_TABS.find((tab) => tab.id === activeTabId) ?? UNICODE_TABS[0] ?? null;
  }, [activeTabId]);

  const copyToClipboard = async (value: string, message: string) => {
    try {
      await navigator.clipboard.writeText(value);
      setStatus(message);
      window.setTimeout(() => setStatus(""), 1100);
    } catch {
      setStatus("Clipboard unavailable");
      window.setTimeout(() => setStatus(""), 1100);
    }
  };

  return (
    <div className="spacesCards" aria-label="Spaces and unicode tools">
      <section className="panel spacesCard" aria-label="Space entities">
        <div className="panelHeader compactHeader">
          <div className="panelHeaderMain inlineHeaderMain">
            <h2>Spaces</h2>
            <span>{status || "Click to copy"}</span>
          </div>
        </div>

        <ul className="spacesCompactList">
          {SPACES.map((entry) => (
            <li key={entry.id}>
              <button
                type="button"
                className="spaceChip"
                onClick={() => void copyToClipboard(entry.entity, "Entity copied")}
                title={`Copy entity for ${entry.name} (${entry.widthPercent}%)`}
              >
                {entry.entity} ({entry.widthPercent}%)
              </button>
              <button
                type="button"
                className="spaceChipSecondary"
                onClick={() => void copyToClipboard(entry.character, "Character copied")}
                title={`Copy character for ${entry.name}`}
              >
                Char
              </button>
            </li>
          ))}
        </ul>
      </section>

      <section className="panel unicodeCard" aria-label="Unicode characters">
        <div className="panelHeader compactHeader">
          <div className="panelHeaderMain inlineHeaderMain">
            <h2>Unicode</h2>
            <span>{activeTab ? activeTab.label : ""}</span>
          </div>
        </div>

        <div className="unicodeColumn">
          <div className="unicodeTabs" role="tablist" aria-label="Unicode groups">
            {UNICODE_TABS.map((tab) => (
              <button
                key={tab.id}
                type="button"
                role="tab"
                className={tab.id === activeTab?.id ? "unicodeTab active" : "unicodeTab"}
                aria-selected={tab.id === activeTab?.id}
                aria-controls={`unicode-panel-${tab.id}`}
                onClick={() => setActiveTabId(tab.id)}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div
            id={activeTab ? `unicode-panel-${activeTab.id}` : "unicode-panel"}
            className="unicodeGrid"
            role="tabpanel"
            aria-label={activeTab ? `${activeTab.label} characters` : "Unicode characters"}
          >
            {activeTab?.entries.map((entry) => (
              <button
                key={entry.id}
                type="button"
                className="unicodeCharButton"
                title={`${entry.name}${entry.hex ? ` (${entry.hex})` : ""}`}
                onClick={() => void copyToClipboard(entry.char, "Character copied")}
              >
                {entry.char}
              </button>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
