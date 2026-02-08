import { execFile } from "node:child_process";
import { promisify } from "node:util";

import { NextResponse } from "next/server";

export const runtime = "nodejs";

const execFileAsync = promisify(execFile);

export async function POST() {
  if (process.platform !== "darwin") {
    return NextResponse.json(
      {
        status: "error",
        message:
          "Folder picker is only supported on macOS. Type a folder path manually instead.",
      },
      { status: 400 }
    );
  }

  // Return empty string on user cancel (-128).
  const script = [
    "try",
    'set theFolder to choose folder with prompt "Select Download Folder"',
    "return POSIX path of theFolder",
    "on error number -128",
    'return ""',
    "end try",
  ].join("\n");

  try {
    const { stdout } = await execFileAsync("osascript", ["-e", script]);
    const path = (stdout || "").trim();
    if (!path) return NextResponse.json({ status: "cancelled" });
    return NextResponse.json({ status: "success", path });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ status: "error", message }, { status: 500 });
  }
}

