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

export function ThemeInitializer() {
  useEffect(() => {
    const savedTheme = window.localStorage.getItem(THEME_STORAGE_KEY);

    if (savedTheme === "light" || savedTheme === "dark") {
      applyTheme(savedTheme);
      return;
    }

    applyTheme(getSystemTheme());
  }, []);

  return null;
}

export { THEME_STORAGE_KEY, applyTheme, getSystemTheme };
