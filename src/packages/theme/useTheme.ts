export type ThemeMode = "system" | "light" | "dark";

export const THEME_OPTIONS: Record<ThemeMode, ThemeMode> = {
  system: "system",
  light: "light",
  dark: "dark"
};

const THEME_STORAGE_KEY = "cssbattle-previewer.theme";

function parseStoredTheme(rawValue: string | null): ThemeMode {
  if (rawValue === "system" || rawValue === "light" || rawValue === "dark") {
    return rawValue;
  }

  return "system";
}

function resolveTheme(mode: ThemeMode): "light" | "dark" {
  if (mode === "light") {
    return "light";
  }

  if (mode === "dark") {
    return "dark";
  }

  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

import { useEffect, useState } from "react";

export function useTheme(): [ThemeMode, (nextTheme: ThemeMode) => void] {
  const [themeMode, setThemeMode] = useState<ThemeMode>(() => {
    if (typeof window === "undefined") {
      return "system";
    }

    return parseStoredTheme(window.localStorage.getItem(THEME_STORAGE_KEY));
  });

  useEffect(() => {
    const applyTheme = () => {
      document.documentElement.setAttribute("data-theme", resolveTheme(themeMode));
    };

    applyTheme();
    window.localStorage.setItem(THEME_STORAGE_KEY, themeMode);

    if (themeMode !== "system") {
      return undefined;
    }

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const listener = () => applyTheme();

    if (typeof mediaQuery.addEventListener === "function") {
      mediaQuery.addEventListener("change", listener);
      return () => mediaQuery.removeEventListener("change", listener);
    }

    mediaQuery.addListener(listener);
    return () => mediaQuery.removeListener(listener);
  }, [themeMode]);

  return [themeMode, setThemeMode];
}
