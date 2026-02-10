"use client";

import type { ReactNode } from "react";
import { useCallback, useSyncExternalStore } from "react";

import { DEFAULT_SETTINGS, type AppSettings } from "./types";
import { coerceSettings, settingsStore } from "./store";

export function SettingsProvider({ children }: { children: ReactNode }) {
  return children;
}

type SettingsApi = {
  settings: AppSettings;
  update: (next: Partial<AppSettings>) => void;
  reset: () => void;
};

export function useSettings(): SettingsApi {
  const settings = useSyncExternalStore(
    settingsStore.subscribe,
    settingsStore.getSnapshot,
    settingsStore.getServerSnapshot
  );

  const update = useCallback((next: Partial<AppSettings>) => {
    settingsStore.update((prev) => coerceSettings({ ...prev, ...next }));
  }, []);

  const reset = useCallback(() => {
    settingsStore.set(DEFAULT_SETTINGS);
  }, []);

  return { settings, update, reset };
}
