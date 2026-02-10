import { createLocalStorageJsonStore } from "@/lib/local-storage-json-store";

import type { DownloadSession } from "./types";
import { coerceSession, HISTORY_KEY } from "./storage";

export const historyStore = createLocalStorageJsonStore<DownloadSession[]>({
  key: HISTORY_KEY,
  defaultValue: [],
  coerce: (input: unknown) => {
    if (!Array.isArray(input)) return [];
    return input
      .map(coerceSession)
      .filter(Boolean)
      .sort((a, b) => b!.startedAt - a!.startedAt) as DownloadSession[];
  },
});
