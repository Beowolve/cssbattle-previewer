import { THEME_OPTIONS, type ThemeMode } from "../../theme/useTheme";
import { ToolNav } from "../../tools/components/ToolNav";
import type { ToolLink } from "../../tools/config/toolLinks";

const GITHUB_REPOSITORY_URL = "https://github.com/Beowolve/cssbattle-previewer";

interface HeaderProps {
  themeMode: ThemeMode;
  onThemeModeChange: (nextTheme: ThemeMode) => void;
  links: ToolLink[];
}

function GitHubIcon() {
  return (
    <svg className="githubIcon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path
        fill="currentColor"
        d="M12 2C6.48 2 2 6.58 2 12.26c0 4.54 2.87 8.39 6.84 9.75.5.1.68-.22.68-.49 0-.24-.01-.89-.01-1.75-2.78.62-3.37-1.37-3.37-1.37-.45-1.19-1.11-1.5-1.11-1.5-.91-.64.07-.63.07-.63 1 .07 1.53 1.06 1.53 1.06.9 1.57 2.35 1.12 2.92.85.09-.67.35-1.12.63-1.38-2.22-.26-4.56-1.14-4.56-5.08 0-1.12.39-2.04 1.03-2.76-.1-.26-.45-1.31.1-2.72 0 0 .84-.28 2.75 1.05A9.35 9.35 0 0 1 12 6.95c.85 0 1.7.12 2.5.34 1.91-1.33 2.75-1.05 2.75-1.05.55 1.41.2 2.46.1 2.72.64.72 1.03 1.64 1.03 2.76 0 3.95-2.34 4.82-4.57 5.07.36.32.68.94.68 1.9 0 1.37-.01 2.47-.01 2.81 0 .27.18.59.69.49A10.22 10.22 0 0 0 22 12.26C22 6.58 17.52 2 12 2Z"
      />
    </svg>
  );
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

        <div className="headerActions">
          <a
            className="githubRepositoryLink"
            href={GITHUB_REPOSITORY_URL}
            target="_blank"
            rel="noreferrer"
            aria-label="Open GitHub repository"
            title="GitHub repository"
          >
            <GitHubIcon />
          </a>

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
        </div>
      </header>
    </>
  );
}
