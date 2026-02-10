import * as fs from "node:fs/promises";
import * as path from "node:path";

import { NextRequest, NextResponse } from "next/server";

import { normalizeDownloadDir } from "@/lib/server/download-paths";
import { hasFfmpeg, resolveYtDlpPath } from "@/lib/server/media-tools";
import { run } from "@/lib/server/run";
import { cleanYtDlpStderr, parseTitleFromDumpJson } from "@/lib/server/ytdlp";

export const runtime = "nodejs";

const MAX_URLS = 200;
const DOWNLOAD_TIMEOUT_MS = 15 * 60_000;

const IS_VERCEL = process.env.VERCEL === "1";
const ALLOW_HOSTED_DOWNLOADS = process.env.ALLOW_HOSTED_DOWNLOADS === "1";

type DownloadRequestBody = {
  urls?: unknown;
  folder?: unknown;
};

type DownloadResult =
  | { url: string; status: "success"; title?: string }
  | { url: string; status: "failed"; error: string };

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

export async function POST(req: NextRequest) {
  try {
    // This app is designed to run locally so yt-dlp can write to *your* disk.
    // On hosted/serverless environments (like Vercel), there's no reliable way to pick a
    // client folder and downloads would land on an ephemeral server filesystem.
    if (IS_VERCEL && !ALLOW_HOSTED_DOWNLOADS) {
      return NextResponse.json(
        {
          status: "error",
          message:
            "Downloads are disabled on hosted deployments. Run the app locally (npm run dev, then open http://localhost:3000) so yt-dlp can save to your machine. If you really want to enable this on Vercel, set ALLOW_HOSTED_DOWNLOADS=1 (not recommended).",
        },
        { status: 501 }
      );
    }

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
    try {
      await fs.mkdir(downloadDir, { recursive: true });
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      return NextResponse.json(
        {
          status: "error",
          message: `Unable to create download folder: ${downloadDir} (${message})`,
        },
        { status: 400 }
      );
    }

    let ytdlp: string;
    try {
      ytdlp = await resolveYtDlpPath();
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      return NextResponse.json({ status: "error", message }, { status: 500 });
    }

    const ffmpeg = hasFfmpeg();

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
          title: parseTitleFromDumpJson(stdout),
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
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json(
      { status: "error", message: message || "Internal error." },
      { status: 500 }
    );
  }
}
