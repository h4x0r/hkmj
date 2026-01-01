"use client";

import { useSettingsStore } from "@/stores/settings";
import { localeNames } from "@/i18n/config";

export function LanguageSwitch() {
  const { locale, toggleLocale } = useSettingsStore();

  return (
    <button
      onClick={toggleLocale}
      className="btn btn-ghost text-sm flex items-center gap-1"
      title={localeNames[locale]}
    >
      <span className="text-lg">
        {locale === "en" ? "🇬🇧" : "🇭🇰"}
      </span>
      <span className="hidden sm:inline">{localeNames[locale]}</span>
    </button>
  );
}
