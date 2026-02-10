import { spawnSync } from "node:child_process";
import { constants as fsConstants } from "node:fs";
import * as fs from "node:fs/promises";
import * as path from "node:path";

let cachedYtDlpPath: string | null = null;
let cachedYtDlpVersion: string | null = null;
let cachedYtDlpChecked = false;
let cachedYtDlpError: string | null = null;

let cachedFfmpeg: boolean | null = null;

async function isExecutable(filePath: string): Promise<boolean> {
  try {
    await fs.access(filePath, fsConstants.X_OK);
    return true;
  } catch {
    return false;
  }
}

async function findYtDlpCandidate(): Promise<string> {
  const env = process.env.YTDLP_PATH;
  if (env && (await isExecutable(env))) return env;

  const exeName = process.platform === "win32" ? "yt-dlp.exe" : "yt-dlp";
  const venvBinDir = process.platform === "win32" ? "Scripts" : "bin";
  const venvCandidates = [
    path.resolve(process.cwd(), ".venv", venvBinDir, exeName),
    path.resolve(process.cwd(), "..", ".venv", venvBinDir, exeName),
  ];

  for (const candidate of venvCandidates) {
    if (await isExecutable(candidate)) return candidate;
  }

  return "yt-dlp";
}

function checkCommandVersion(cmd: string): string | null {
  const r = spawnSync(cmd, ["--version"], { stdio: "pipe" });
  if (r.status !== 0) return null;
  return (r.stdout.toString("utf8") || "").trim() || "unknown";
}

export async function resolveYtDlpPath(): Promise<string> {
  if (cachedYtDlpChecked) {
    if (cachedYtDlpPath) return cachedYtDlpPath;
    throw new Error(cachedYtDlpError || "yt-dlp not found");
  }

  const candidate = await findYtDlpCandidate();
  const version = checkCommandVersion(candidate);
  cachedYtDlpChecked = true;

  if (version) {
    cachedYtDlpPath = candidate;
    cachedYtDlpVersion = version;
    return candidate;
  }

  const suffix = candidate === "yt-dlp" ? "" : ` (checked: ${candidate})`;
  cachedYtDlpError = `yt-dlp not found. Install it (Homebrew or pip) or set YTDLP_PATH.${suffix}`;
  throw new Error(cachedYtDlpError);
}

export async function checkYtDlp(): Promise<{
  ok: boolean;
  path?: string;
  version?: string;
  error?: string;
}> {
  try {
    const p = await resolveYtDlpPath();
    return {
      ok: true,
      path: p,
      version: cachedYtDlpVersion || checkCommandVersion(p) || "unknown",
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return { ok: false, error: message };
  }
}

function hasFfmpegUncached(): boolean {
  if (process.env.FFMPEG_PATH) {
    const r = spawnSync(process.env.FFMPEG_PATH, ["-version"], { stdio: "ignore" });
    return r.status === 0;
  }
  const r = spawnSync("ffmpeg", ["-version"], { stdio: "ignore" });
  return r.status === 0;
}

export function hasFfmpeg(): boolean {
  if (cachedFfmpeg !== null) return cachedFfmpeg;
  cachedFfmpeg = hasFfmpegUncached();
  return cachedFfmpeg;
}
