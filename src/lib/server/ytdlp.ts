export function parseTitleFromDumpJson(stdout: string): string | undefined {
  const lines = (stdout || "").trim().split("\n").filter(Boolean);
  for (const line of lines) {
    try {
      const obj = JSON.parse(line) as { title?: unknown };
      if (typeof obj.title === "string" && obj.title.trim()) return obj.title.trim();
    } catch {
      // ignore
    }
  }
  return undefined;
}

export function cleanYtDlpStderr(stderr: string): string {
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
