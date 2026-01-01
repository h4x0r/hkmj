import { describe, it, expect, beforeEach, vi } from "vitest";
import { useSettingsStore } from "./settings";

describe("settings store", () => {
  beforeEach(() => {
    useSettingsStore.getState().reset();
    // Clear localStorage mock
    vi.stubGlobal("localStorage", {
      getItem: vi.fn(),
      setItem: vi.fn(),
      removeItem: vi.fn(),
    });
  });

  describe("initial state", () => {
    it("has default locale as en", () => {
      expect(useSettingsStore.getState().locale).toBe("en");
    });

    it("has default theme as system", () => {
      expect(useSettingsStore.getState().theme).toBe("system");
    });

    it("has available locales", () => {
      expect(useSettingsStore.getState().availableLocales).toEqual(["en", "zh-TW"]);
    });

    it("has available themes", () => {
      expect(useSettingsStore.getState().availableThemes).toEqual(["light", "dark", "system"]);
    });
  });

  describe("setLocale", () => {
    it("changes locale to zh-TW", () => {
      useSettingsStore.getState().setLocale("zh-TW");
      expect(useSettingsStore.getState().locale).toBe("zh-TW");
    });

    it("changes locale to en", () => {
      useSettingsStore.getState().setLocale("zh-TW");
      useSettingsStore.getState().setLocale("en");
      expect(useSettingsStore.getState().locale).toBe("en");
    });
  });

  describe("setTheme", () => {
    it("changes theme to light", () => {
      useSettingsStore.getState().setTheme("light");
      expect(useSettingsStore.getState().theme).toBe("light");
    });

    it("changes theme to dark", () => {
      useSettingsStore.getState().setTheme("dark");
      expect(useSettingsStore.getState().theme).toBe("dark");
    });

    it("changes theme to system", () => {
      useSettingsStore.getState().setTheme("dark");
      useSettingsStore.getState().setTheme("system");
      expect(useSettingsStore.getState().theme).toBe("system");
    });
  });

  describe("reset", () => {
    it("resets all settings to defaults", () => {
      useSettingsStore.getState().setLocale("zh-TW");
      useSettingsStore.getState().setTheme("dark");

      useSettingsStore.getState().reset();

      expect(useSettingsStore.getState().locale).toBe("en");
      expect(useSettingsStore.getState().theme).toBe("system");
    });
  });

  describe("toggleLocale", () => {
    it("toggles from en to zh-TW", () => {
      useSettingsStore.getState().toggleLocale();
      expect(useSettingsStore.getState().locale).toBe("zh-TW");
    });

    it("toggles from zh-TW to en", () => {
      useSettingsStore.getState().setLocale("zh-TW");
      useSettingsStore.getState().toggleLocale();
      expect(useSettingsStore.getState().locale).toBe("en");
    });
  });

  describe("cycleTheme", () => {
    it("cycles from system to light", () => {
      useSettingsStore.getState().cycleTheme();
      expect(useSettingsStore.getState().theme).toBe("light");
    });

    it("cycles from light to dark", () => {
      useSettingsStore.getState().setTheme("light");
      useSettingsStore.getState().cycleTheme();
      expect(useSettingsStore.getState().theme).toBe("dark");
    });

    it("cycles from dark to system", () => {
      useSettingsStore.getState().setTheme("dark");
      useSettingsStore.getState().cycleTheme();
      expect(useSettingsStore.getState().theme).toBe("system");
    });
  });
});
