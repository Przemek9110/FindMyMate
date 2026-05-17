"use client";

import { useEffect } from "react";

type Theme = "light" | "dark";

const THEME_STORAGE_KEY = "findmymate-theme";

function applyTheme(theme: Theme) {
  document.documentElement.classList.toggle("dark", theme === "dark");
}

function getSystemTheme(): Theme {
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

function getSavedTheme(): Theme | null {
  const savedTheme = window.localStorage.getItem(THEME_STORAGE_KEY);

  if (savedTheme === "light" || savedTheme === "dark") {
    return savedTheme;
  }

  return null;
}

export function ThemeInitializer() {
  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const savedTheme = getSavedTheme();

    if (savedTheme) {
      applyTheme(savedTheme);
      return;
    }

    applyTheme(getSystemTheme());

    const handleSystemThemeChange = () => {
      const currentSavedTheme = getSavedTheme();

      if (!currentSavedTheme) {
        applyTheme(getSystemTheme());
      }
    };

    mediaQuery.addEventListener("change", handleSystemThemeChange);

    return () => {
      mediaQuery.removeEventListener("change", handleSystemThemeChange);
    };
  }, []);

  return null;
}

export { THEME_STORAGE_KEY, applyTheme, getSystemTheme };