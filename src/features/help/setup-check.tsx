"use client";

import { useEffect, useState } from "react";

import { useEnv } from "@/components/env-provider";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemMedia,
  ItemSeparator,
  ItemTitle,
} from "@/components/ui/item";
import { Spinner } from "@/components/ui/spinner";
import {
  AlertTriangle,
  CheckCircle2,
  HardDrive,
  TerminalSquare,
} from "lucide-react";

type HealthResponse = {
  status: "success";
  vercel: boolean;
  platform: string;
  node: string;
  downloadsDir: string;
  ytdlp: { ok: boolean; path?: string; version?: string; error?: string };
  ffmpeg: { ok: boolean };
};

function getErrorMessage(v: unknown): string | null {
  if (!v || typeof v !== "object") return null;
  const obj = v as Record<string, unknown>;
  return typeof obj.message === "string" ? obj.message : null;
}

function isHealthResponse(v: unknown): v is HealthResponse {
  if (!v || typeof v !== "object") return false;
  const obj = v as Record<string, unknown>;
  if (obj.status !== "success") return false;
  if (typeof obj.platform !== "string") return false;
  if (typeof obj.node !== "string") return false;
  if (typeof obj.downloadsDir !== "string") return false;
  return true;
}

export function SetupCheck() {
  const { isLocalHost } = useEnv();

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<HealthResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    async function run() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/health", { cache: "no-store" });
        const json: unknown = await res.json();
        if (!res.ok || !isHealthResponse(json)) {
          throw new Error(getErrorMessage(json) || `Health check failed (${res.status}).`);
        }
        if (!mounted) return;
        setData(json);
      } catch (err) {
        if (!mounted) return;
        setError(err instanceof Error ? err.message : String(err));
      } finally {
        if (!mounted) return;
        setLoading(false);
      }
    }

    run();
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Environment check</CardTitle>
        <CardDescription>
          Verifies whether the server can run <span className="font-medium">yt-dlp</span>.
          {isLocalHost ? "" : " (Hosted deployments are preview-only.)"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <Empty className="min-h-[260px] bg-muted/20">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <Spinner className="size-6" />
              </EmptyMedia>
              <EmptyTitle>Checking...</EmptyTitle>
              <EmptyDescription>Running server-side diagnostics.</EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : error ? (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Health check failed</AlertTitle>
            <AlertDescription>
              <div className="break-words">{error}</div>
            </AlertDescription>
          </Alert>
        ) : data ? (
          <ItemGroup>
            <Item variant="outline" size="sm">
              <ItemMedia variant="icon">
                <TerminalSquare />
              </ItemMedia>
              <ItemContent>
                <ItemTitle>yt-dlp</ItemTitle>
                <ItemDescription className="line-clamp-none break-words">
                  {data.ytdlp.ok
                    ? `${data.ytdlp.version || "unknown"} (${data.ytdlp.path || "yt-dlp"})`
                    : data.ytdlp.error || "Not found"}
                </ItemDescription>
              </ItemContent>
              <ItemActions className="ml-auto">
                <Badge variant={data.ytdlp.ok ? "secondary" : "destructive"}>
                  {data.ytdlp.ok ? <CheckCircle2 /> : <AlertTriangle />}
                  {data.ytdlp.ok ? "OK" : "Missing"}
                </Badge>
              </ItemActions>
            </Item>
            <ItemSeparator />
            <Item variant="outline" size="sm">
              <ItemMedia variant="icon">
                <TerminalSquare />
              </ItemMedia>
              <ItemContent>
                <ItemTitle>ffmpeg</ItemTitle>
                <ItemDescription>
                  {data.ffmpeg.ok
                    ? "Found (best quality merges enabled)"
                    : "Not found (still works, but may download single-file formats)"}
                </ItemDescription>
              </ItemContent>
              <ItemActions className="ml-auto">
                <Badge variant={data.ffmpeg.ok ? "secondary" : "outline"}>
                  {data.ffmpeg.ok ? <CheckCircle2 /> : <AlertTriangle />}
                  {data.ffmpeg.ok ? "OK" : "Optional"}
                </Badge>
              </ItemActions>
            </Item>
            <ItemSeparator />
            <Item variant="outline" size="sm">
              <ItemMedia variant="icon">
                <HardDrive />
              </ItemMedia>
              <ItemContent>
                <ItemTitle>Default downloads folder</ItemTitle>
                <ItemDescription className="line-clamp-none break-words">
                  {data.downloadsDir}
                </ItemDescription>
              </ItemContent>
            </Item>
          </ItemGroup>
        ) : null}
      </CardContent>
    </Card>
  );
}
