import { readJson, writeJson } from "@/lib/storage";

import type { DownloadSession } from "./types";

export const HISTORY_KEY = "zvd.history";

function emitHistoryChange(): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(`zvd:store:${HISTORY_KEY}`));
}

export function coerceSession(input: unknown): DownloadSession | null {
  const raw = (input || {}) as Partial<DownloadSession>;
  if (typeof raw.id !== "string" || !raw.id) return null;
  if (typeof raw.startedAt !== "number" || !Number.isFinite(raw.startedAt)) return null;
  if (typeof raw.finishedAt !== "number" || !Number.isFinite(raw.finishedAt)) return null;
  if (typeof raw.folder !== "string") return null;
  if (typeof raw.ffmpeg !== "boolean") return null;
  if (!Array.isArray(raw.results)) return null;

  const results = raw.results
    .map((r) => {
      const obj = (r || {}) as { url?: unknown; status?: unknown; title?: unknown; error?: unknown };
      if (typeof obj.url !== "string" || !obj.url) return null;
      if (obj.status !== "success" && obj.status !== "failed") return null;
      return {
        url: obj.url,
        status: obj.status,
        title: typeof obj.title === "string" ? obj.title : undefined,
        error: typeof obj.error === "string" ? obj.error : undefined,
      };
    })
    .filter(Boolean) as DownloadSession["results"];

  return {
    id: raw.id,
    startedAt: raw.startedAt,
    finishedAt: raw.finishedAt,
    folder: raw.folder,
    ffmpeg: raw.ffmpeg,
    results,
  };
}

export function readHistory(): DownloadSession[] {
  const raw = readJson<unknown>(HISTORY_KEY, []);
  if (!Array.isArray(raw)) return [];

  return raw
    .map(coerceSession)
    .filter(Boolean)
    .sort((a, b) => b!.startedAt - a!.startedAt) as DownloadSession[];
}

export function writeHistory(sessions: DownloadSession[]): void {
  writeJson(HISTORY_KEY, sessions);
  emitHistoryChange();
}

export function clearHistory(): void {
  writeJson(HISTORY_KEY, []);
  emitHistoryChange();
}

export function appendHistory(session: DownloadSession, maxSessions: number): void {
  if (maxSessions <= 0) return;

  const next = [session, ...readHistory()]
    .filter((s) => s.id !== session.id)
    .slice(0, maxSessions);

  writeHistory(next);
}
