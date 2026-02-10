export function extractUrlsOrLines(text: string): {
  cleaned: string[];
  unique: string[];
  duplicates: number;
} {
  const raw = text || "";
  const matches = [...raw.matchAll(/https?:\/\/[^\s<>\"']+/gi)].map((m) => m[0] || "");

  const base =
    matches.length > 0
      ? matches
      : raw
          .split(/\r?\n/)
          .map((l) => l.trim())
          .filter(Boolean);

  const cleaned = base
    .map((u) => u.trim())
    .map((u) => u.replace(/[),.;\]]+$/g, ""))
    .filter(Boolean);

  const unique: string[] = [];
  const seen = new Set<string>();
  for (const u of cleaned) {
    if (seen.has(u)) continue;
    seen.add(u);
    unique.push(u);
  }

  return {
    cleaned,
    unique,
    duplicates: cleaned.length - unique.length,
  };
}
