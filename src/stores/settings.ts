import { create } from "zustand";
import { persist } from "zustand/middleware";

export type Locale = "en" | "zh-TW";
export type Theme = "light" | "dark" | "system";

interface SettingsState {
  locale: Locale;
  theme: Theme;
  availableLocales: Locale[];
  availableThemes: Theme[];

  // Actions
  setLocale: (locale: Locale) => void;
  setTheme: (theme: Theme) => void;
  toggleLocale: () => void;
  cycleTheme: () => void;
  reset: () => void;
}

const initialState = {
  locale: "zh-TW" as Locale,
  theme: "system" as Theme,
  availableLocales: ["en", "zh-TW"] as Locale[],
  availableThemes: ["light", "dark", "system"] as Theme[],
};

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set, get) => ({
      ...initialState,

      setLocale: (locale) => {
        set({ locale });
      },

      setTheme: (theme) => {
        set({ theme });
      },

      toggleLocale: () => {
        const { locale, availableLocales } = get();
        const currentIndex = availableLocales.indexOf(locale);
        const nextIndex = (currentIndex + 1) % availableLocales.length;
        set({ locale: availableLocales[nextIndex] });
      },

      cycleTheme: () => {
        const { theme, availableThemes } = get();
        const currentIndex = availableThemes.indexOf(theme);
        const nextIndex = (currentIndex + 1) % availableThemes.length;
        set({ theme: availableThemes[nextIndex] });
      },

      reset: () => {
        set({
          locale: initialState.locale,
          theme: initialState.theme,
        });
      },
    }),
    {
      name: "hkmj-settings",
      partialize: (state) => ({
        locale: state.locale,
        theme: state.theme,
      }),
    }
  )
);
