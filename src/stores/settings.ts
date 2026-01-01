import { create } from "zustand";
import { persist } from "zustand/middleware";

export type Locale = "en" | "zh-TW";
export type Theme = "light" | "dark" | "system";
export type TurnTimer = 5 | 10 | 15 | 30;

interface SettingsState {
  locale: Locale;
  theme: Theme;
  turnTimer: TurnTimer;
  availableLocales: Locale[];
  availableThemes: Theme[];
  availableTurnTimers: TurnTimer[];

  // Actions
  setLocale: (locale: Locale) => void;
  setTheme: (theme: Theme) => void;
  setTurnTimer: (timer: TurnTimer) => void;
  toggleLocale: () => void;
  cycleTheme: () => void;
  reset: () => void;
}

const initialState = {
  locale: "zh-TW" as Locale,
  theme: "system" as Theme,
  turnTimer: 10 as TurnTimer,
  availableLocales: ["en", "zh-TW"] as Locale[],
  availableThemes: ["light", "dark", "system"] as Theme[],
  availableTurnTimers: [5, 10, 15, 30] as TurnTimer[],
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

      setTurnTimer: (turnTimer) => {
        set({ turnTimer });
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
          turnTimer: initialState.turnTimer,
        });
      },
    }),
    {
      name: "hkmj-settings",
      partialize: (state) => ({
        locale: state.locale,
        theme: state.theme,
        turnTimer: state.turnTimer,
      }),
    }
  )
);
