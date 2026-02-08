import { spawn, spawnSync } from "node:child_process";
import { constants as fsConstants } from "node:fs";
import * as fs from "node:fs/promises";
import * as os from "node:os";
import * as path from "node:path";

import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

const MAX_URLS = 200;
const DOWNLOAD_TIMEOUT_MS = 15 * 60_000;

type DownloadRequestBody = {
  urls?: unknown;
  folder?: unknown;
};

type DownloadResult =
  | { url: string; status: "success"; title?: string }
  | { url: string; status: "failed"; error: string };

let cachedYtDlp: string | null = null;
let cachedYtDlpChecked = false;
let cachedYtDlpError: string | null = null;

let cachedFfmpeg: boolean | null = null;

function normalizeUrls(input: unknown): string[] {
  const text =
    typeof input === "string"
      ? input
      : Array.isArray(input)
        ? input.filter((u): u is string => typeof u === "string").join("\n")
        : "";

  if (!text.trim()) return [];

  const matches = [...text.matchAll(/https?:\/\/[^\s<>"']+/gi)].map((m) => (m[0] || "").trim());
  const base =
    matches.length > 0
      ? matches
      : text
          .split(/\r?\n/)
          .map((u) => u.trim())
          .filter(Boolean);

  const cleaned = base
    .map((u) => u.replace(/[),.;\]]+$/g, "")) // common "paste punctuation"
    .filter(Boolean);

  const unique: string[] = [];
  const seen = new Set<string>();
  for (const u of cleaned) {
    if (seen.has(u)) continue;
    seen.add(u);
    unique.push(u);
  }

  return unique;
}

function expandTilde(p: string): string {
  if (p === "~") return os.homedir();
  if (p.startsWith("~/")) return path.join(os.homedir(), p.slice(2));
  return p;
}

async function normalizeDownloadDir(input: unknown): Promise<string> {
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

async function isExecutable(filePath: string): Promise<boolean> {
  try {
    await fs.access(filePath, fsConstants.X_OK);
    return true;
  } catch {
    return false;
  }
}

async function findYtDlp(): Promise<string> {
  const env = process.env.YTDLP_PATH;
  if (env && (await isExecutable(env))) return env;

  const venvCandidate = path.resolve(
    process.cwd(),
    "..",
    ".venv",
    "bin",
    process.platform === "win32" ? "yt-dlp.exe" : "yt-dlp"
  );
  if (await isExecutable(venvCandidate)) return venvCandidate;

  return "yt-dlp"; // fall back to PATH
}

function hasFfmpegUncached(): boolean {
  if (process.env.FFMPEG_PATH) {
    const r = spawnSync(process.env.FFMPEG_PATH, ["-version"], {
      stdio: "ignore",
    });
    return r.status === 0;
  }
  const r = spawnSync("ffmpeg", ["-version"], { stdio: "ignore" });
  return r.status === 0;
}

function getFfmpeg(): boolean {
  if (cachedFfmpeg !== null) return cachedFfmpeg;
  cachedFfmpeg = hasFfmpegUncached();
  return cachedFfmpeg;
}

async function getYtDlp(): Promise<string> {
  if (cachedYtDlpChecked) {
    if (cachedYtDlp) return cachedYtDlp;
    throw new Error(cachedYtDlpError || "yt-dlp not found");
  }

  const candidate = await findYtDlp();
  const r = spawnSync(candidate, ["--version"], { stdio: "ignore" });
  cachedYtDlpChecked = true;

  if (r.status === 0) {
    cachedYtDlp = candidate;
    return candidate;
  }

  const suffix = r.error ? ` (${r.error.message})` : "";
  cachedYtDlpError = `yt-dlp not found. Install it (Homebrew or pip) or set YTDLP_PATH.${suffix}`;
  throw new Error(cachedYtDlpError);
}

function run(
  cmd: string,
  args: string[],
  opts?: { signal?: AbortSignal; timeoutMs?: number }
): Promise<{ code: number; stdout: string; stderr: string }> {
  return new Promise((resolve) => {
    let settled = false;
    if (opts?.signal?.aborted) {
      resolve({ code: 1, stdout: "", stderr: "Cancelled." });
      return;
    }

    const child = spawn(cmd, args, { stdio: ["ignore", "pipe", "pipe"] });

    let stdout = "";
    let stderr = "";
    let killedByAbort = false;
    let killedByTimeout = false;

    const timeoutMs = opts?.timeoutMs ?? 0;
    const timer =
      timeoutMs > 0
        ? setTimeout(() => {
            killedByTimeout = true;
            child.kill("SIGKILL");
          }, timeoutMs)
        : null;

    const onAbort = () => {
      killedByAbort = true;
      child.kill("SIGKILL");
    };
    opts?.signal?.addEventListener("abort", onAbort, { once: true });

    child.stdout.on("data", (d) => (stdout += d.toString("utf8")));
    child.stderr.on("data", (d) => (stderr += d.toString("utf8")));

    child.on("close", (code) => {
      if (settled) return;
      settled = true;
      if (timer) clearTimeout(timer);
      opts?.signal?.removeEventListener("abort", onAbort);

      if (killedByAbort) stderr = `${stderr}\nCancelled.`.trim();
      if (killedByTimeout) stderr = `${stderr}\nTimed out after ${Math.round(timeoutMs / 1000)}s.`.trim();
      resolve({ code: code ?? 1, stdout, stderr });
    });
    child.on("error", (err) => {
      if (settled) return;
      settled = true;
      if (timer) clearTimeout(timer);
      opts?.signal?.removeEventListener("abort", onAbort);
      resolve({ code: 1, stdout, stderr: `${stderr}\n${String(err)}`.trim() });
    });
  });
}

function tryParseTitleFromDumpJson(stdout: string): string | undefined {
  const lines = stdout
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);

  // --dump-json should output JSON lines; pick the last JSON-looking line.
  for (let i = lines.length - 1; i >= 0; i -= 1) {
    const line = lines[i]!;
    if (!line.startsWith("{") || !line.endsWith("}")) continue;
    try {
      const obj = JSON.parse(line) as { title?: unknown };
      if (typeof obj.title === "string" && obj.title.trim()) return obj.title.trim();
    } catch {
      // ignore
    }
  }
  return undefined;
}

function cleanYtDlpStderr(stderr: string): string {
  const raw = (stderr || "").trim();
  if (!raw) return "";

  const cleaned = raw
    .split("\n")
    .filter((line) => !line.startsWith("Deprecated Feature: Support for Python version"))
    .join("\n")
    .trim();

  const msg = cleaned || raw;
  const max = 1500;
  if (msg.length <= max) return msg;
  return `${msg.slice(0, max)} (truncated)`;
}

export async function POST(req: NextRequest) {
  const body = (await req.json().catch(() => ({}))) as DownloadRequestBody;
  const urls = normalizeUrls(body.urls);
  if (urls.length === 0) {
    return NextResponse.json(
      { status: "error", message: "No URLs provided" },
      { status: 400 }
    );
  }
  if (urls.length > MAX_URLS) {
    return NextResponse.json(
      { status: "error", message: `Too many URLs (max ${MAX_URLS}).` },
      { status: 400 }
    );
  }

  const downloadDir = await normalizeDownloadDir(body.folder);
  await fs.mkdir(downloadDir, { recursive: true });

  let ytdlp: string;
  try {
    ytdlp = await getYtDlp();
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ status: "error", message }, { status: 500 });
  }

  const ffmpeg = getFfmpeg();

  const outtmpl = path.join(downloadDir, "%(title)s [%(id)s].%(ext)s");
  const format = ffmpeg ? "bestvideo*+bestaudio/best" : "best[ext=mp4]/best";

  const results: DownloadResult[] = [];

  for (const url of urls) {
    const args = [
      "--no-warnings",
      "--no-progress",
      "--no-playlist",
      "--windows-filenames",
      "--trim-filenames",
      "180",
      "-f",
      format,
      ...(ffmpeg ? ["--merge-output-format", "mp4"] : []),
      "-o",
      outtmpl,
      "--dump-json",
      "--no-simulate",
      url,
    ];

    const { code, stdout, stderr } = await run(ytdlp, args, {
      signal: req.signal,
      timeoutMs: DOWNLOAD_TIMEOUT_MS,
    });
    if (code === 0) {
      results.push({
        url,
        status: "success",
        title: tryParseTitleFromDumpJson(stdout),
      });
    } else {
      results.push({
        url,
        status: "failed",
        error: cleanYtDlpStderr(stderr) || "Download failed",
      });
    }
  }

  return NextResponse.json({
    status: "success",
    results,
    download_folder: downloadDir,
    ffmpeg,
  });
}
