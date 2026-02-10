export function getRequestHost(h: { get(name: string): string | null }): string {
  return h.get("x-forwarded-host") ?? h.get("host") ?? "";
}

export function isLocalHost(host: string): boolean {
  const h = (host || "").toLowerCase();
  return h.startsWith("localhost") || h.startsWith("127.0.0.1") || h.startsWith("[::1]");
}
