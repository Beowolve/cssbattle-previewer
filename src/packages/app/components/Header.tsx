import { THEME_OPTIONS, type ThemeMode } from "../../theme/useTheme";
import { ToolNav } from "../../tools/components/ToolNav";
import type { ToolLink } from "../../tools/config/toolLinks";

interface HeaderProps {
  themeMode: ThemeMode;
  onThemeModeChange: (nextTheme: ThemeMode) => void;
  links: ToolLink[];
}

export function Header({ themeMode, onThemeModeChange, links }: HeaderProps) {
  return (
    <>
      <div className="topBand" />
      <header className="appHeader">
        <div className="brand">
          <img className="brandLogo" src={`${import.meta.env.BASE_URL}cssbattle_previewer.png`} alt="" aria-hidden="true" />
          <span className="brandMeta">
            <span className="brandText">CSSBattle Previewer</span>
            <span className="brandVersion" aria-label={`Version ${__APP_VERSION__}`}>
              v{__APP_VERSION__}
            </span>
          </span>
        </div>

        <ToolNav links={links} />

        <label className="themeSwitch" htmlFor="themeMode">
          Theme
          <select
            id="themeMode"
            value={themeMode}
            onChange={(event) => onThemeModeChange(event.target.value as ThemeMode)}
          >
            <option value={THEME_OPTIONS.system}>System</option>
            <option value={THEME_OPTIONS.light}>Light</option>
            <option value={THEME_OPTIONS.dark}>Dark</option>
          </select>
        </label>
      </header>
    </>
  );
}