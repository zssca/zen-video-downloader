import { DownloadApp } from "@/components/download-app";
import { headers } from "next/headers";

function isLocalHostHostHeader(host: string) {
  const h = (host || "").toLowerCase();
  return h.startsWith("localhost") || h.startsWith("127.0.0.1") || h.startsWith("[::1]");
}

export default async function Home() {
  const host = (await headers()).get("host") ?? "";
  return <DownloadApp isLocalHost={isLocalHostHostHeader(host)} />;
}
