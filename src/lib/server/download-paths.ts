import * as fs from "node:fs/promises";
import * as os from "node:os";
import * as path from "node:path";

function expandTilde(p: string): string {
  if (p === "~") return os.homedir();
  if (p.startsWith("~/")) return path.join(os.homedir(), p.slice(2));
  return p;
}

export async function normalizeDownloadDir(input: unknown): Promise<string> {
  const raw = typeof input === "string" ? input.trim() : "";
  const fallback = path.join(os.homedir(), "Downloads");
  const candidate = raw ? expandTilde(raw) : fallback;

  const resolved = path.resolve(candidate);
  try {
    const stat = await fs.stat(resolved);
    if (stat.isFile()) return path.dirname(resolved);
  } catch {
    // Path doesn't exist yet; treat as directory.
  }
  return resolved;
}

export function defaultDownloadsDir(): string {
  return path.join(os.homedir(), "Downloads");
}
