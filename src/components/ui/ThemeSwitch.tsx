"use client";

import { useTheme } from "next-themes";
import { useSettingsStore } from "@/stores/settings";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";

const themeIcons: Record<string, string> = {
  light: "sun",
  dark: "moon",
  system: "monitor",
};

export function ThemeSwitch() {
  const t = useTranslations("theme");
  const { theme, cycleTheme } = useSettingsStore();
  const { setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Sync Zustand theme with next-themes
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) {
      setTheme(theme);
    }
  }, [theme, setTheme, mounted]);

  // Avoid hydration mismatch
  if (!mounted) {
    return (
      <button className="btn btn-ghost text-sm w-10 h-10" disabled>
        <span className="w-5 h-5" />
      </button>
    );
  }

  const displayTheme = theme === "system" ? resolvedTheme || "light" : theme;

  return (
    <button
      onClick={cycleTheme}
      className="btn btn-ghost text-sm flex items-center gap-1"
      title={t(theme)}
    >
      {displayTheme === "light" && (
        <svg
          className="w-5 h-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
          />
        </svg>
      )}
      {displayTheme === "dark" && (
        <svg
          className="w-5 h-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
          />
        </svg>
      )}
      <span className="hidden sm:inline">{t(theme)}</span>
    </button>
  );
}
