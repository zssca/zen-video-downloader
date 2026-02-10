import type { DownloadSession } from "./types";

export function summarizeSession(session: DownloadSession): {
  total: number;
  success: number;
  failed: number;
} {
  const total = session.results.length;
  const success = session.results.filter((r) => r.status === "success").length;
  const failed = total - success;
  return { total, success, failed };
}
