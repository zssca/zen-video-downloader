import { NextResponse } from "next/server";

import { defaultDownloadsDir } from "@/lib/server/download-paths";
import { checkYtDlp, hasFfmpeg } from "@/lib/server/media-tools";

export const runtime = "nodejs";

export async function GET() {
  const ytdlp = await checkYtDlp();
  const ffmpeg = hasFfmpeg();

  return NextResponse.json({
    status: "success",
    vercel: process.env.VERCEL === "1",
    platform: process.platform,
    node: process.version,
    downloadsDir: defaultDownloadsDir(),
    ytdlp,
    ffmpeg: { ok: ffmpeg },
  });
}
