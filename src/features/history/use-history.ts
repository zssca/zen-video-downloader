"use client";

import { useCallback, useSyncExternalStore } from "react";

import { historyStore } from "./store";

export function useHistory() {
  const sessions = useSyncExternalStore(
    historyStore.subscribe,
    historyStore.getSnapshot,
    historyStore.getServerSnapshot
  );

  const clear = useCallback(() => {
    historyStore.clear();
  }, []);

  return {
    sessions,
    clear,
  };
}
