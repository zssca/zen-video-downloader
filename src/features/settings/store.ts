import { createLocalStorageJsonStore } from "@/lib/local-storage-json-store";

import { DEFAULT_SETTINGS, type AppSettings } from "./types";

export const SETTINGS_KEY = "zvd.settings";

export function coerceSettings(input: unknown): AppSettings {
  const raw = (input || {}) as Partial<Record<keyof AppSettings, unknown>>;

  const maxHistorySessions =
    typeof raw.maxHistorySessions === "number" && Number.isFinite(raw.maxHistorySessions)
      ? Math.max(0, Math.min(200, Math.round(raw.maxHistorySessions)))
      : DEFAULT_SETTINGS.maxHistorySessions;

  return {
    rememberFolder:
      typeof raw.rememberFolder === "boolean" ? raw.rememberFolder : DEFAULT_SETTINGS.rememberFolder,
    rememberLinks:
      typeof raw.rememberLinks === "boolean" ? raw.rememberLinks : DEFAULT_SETTINGS.rememberLinks,
    autoFollowLog:
      typeof raw.autoFollowLog === "boolean" ? raw.autoFollowLog : DEFAULT_SETTINGS.autoFollowLog,
    showToasts:
      typeof raw.showToasts === "boolean" ? raw.showToasts : DEFAULT_SETTINGS.showToasts,
    maxHistorySessions,
  };
}

export const settingsStore = createLocalStorageJsonStore<AppSettings>({
  key: SETTINGS_KEY,
  defaultValue: DEFAULT_SETTINGS,
  coerce: coerceSettings,
});
