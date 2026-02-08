"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import {
  Field,
  FieldContent,
  FieldDescription as FieldHelp,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
  InputGroupTextarea,
} from "@/components/ui/input-group";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription as ItemHelp,
  ItemGroup,
  ItemMedia,
  ItemSeparator,
  ItemTitle,
} from "@/components/ui/item";
import { Kbd, KbdGroup } from "@/components/ui/kbd";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Spinner } from "@/components/ui/spinner";
import {
  AlertTriangle,
  ClipboardPaste,
  CircleCheck,
  Download,
  FolderOpen,
  Info,
  WandSparkles,
  X,
} from "lucide-react";

type StatusType = "info" | "success" | "error";
type StatusItem = { id: string; type: StatusType; text: string; at: number };

type DownloadApiResult =
  | { url: string; status: "success"; title?: string }
  | { url: string; status: "failed"; error: string };

type DownloadApiResponse =
  | {
      status: "success";
      results: DownloadApiResult[];
      download_folder: string;
      ffmpeg: boolean;
    }
  | { status: "error"; message: string };

function uid() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
}

function statusMeta(type: StatusType) {
  switch (type) {
    case "success":
      return { label: "Success", icon: <CircleCheck className="text-emerald-500" /> };
    case "error":
      return { label: "Error", icon: <AlertTriangle className="text-destructive" /> };
    default:
      return { label: "Info", icon: <Info className="text-muted-foreground" /> };
  }
}

function extractUrlsOrLines(text: string) {
  const raw = text || "";
  const matches = [...raw.matchAll(/https?:\/\/[^\s<>"']+/gi)].map((m) => m[0] || "");

  const base =
    matches.length > 0
      ? matches
      : raw
          .split(/\r?\n/)
          .map((l) => l.trim())
          .filter(Boolean);

  const cleaned = base
    .map((u) => u.trim())
    .map((u) => u.replace(/[),.;\]]+$/g, "")) // common "paste punctuation"
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

export function DownloadApp() {
  const [folder, setFolder] = useState("");
  const [links, setLinks] = useState("");
  const [picking, setPicking] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [progress, setProgress] = useState<{ done: number; total: number } | null>(null);
  const [statuses, setStatuses] = useState<StatusItem[]>([]);

  const [stickToBottom, setStickToBottom] = useState(true);
  const scrollAreaRef = useRef<HTMLDivElement | null>(null);
  const endRef = useRef<HTMLDivElement | null>(null);

  const downloadControllerRef = useRef<AbortController | null>(null);
  const ffmpegWarnedRef = useRef(false);
  const downloadFolderRef = useRef<string | null>(null);

  const parsed = useMemo(() => extractUrlsOrLines(links), [links]);
  const isLocalHost = useMemo(() => {
    if (typeof window === "undefined") return true;
    const host = window.location.hostname;
    return host === "localhost" || host === "127.0.0.1" || host === "[::1]";
  }, []);

  function addStatus(text: string, type: StatusType = "info") {
    setStatuses((s) => [...s, { id: uid(), type, text, at: Date.now() }]);
  }

  useEffect(() => {
    try {
      const savedFolder = localStorage.getItem("zvd.folder") || "";
      if (savedFolder) setFolder(savedFolder);

      const savedLinks = localStorage.getItem("zvd.links") || "";
      if (savedLinks) setLinks(savedLinks);
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem("zvd.folder", folder);
    } catch {
      // ignore
    }
  }, [folder]);

  useEffect(() => {
    try {
      // Keep it bounded so a huge paste doesn't hammer storage.
      if (links.length <= 100_000) localStorage.setItem("zvd.links", links);
    } catch {
      // ignore
    }
  }, [links]);

  useEffect(() => {
    const viewport = scrollAreaRef.current?.querySelector(
      '[data-slot="scroll-area-viewport"]'
    );
    if (!(viewport instanceof HTMLElement)) return;

    const threshold = 32;
    const onScroll = () => {
      const atBottom =
        viewport.scrollHeight - viewport.scrollTop - viewport.clientHeight <=
        threshold;
      setStickToBottom(atBottom);
    };

    viewport.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => viewport.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!stickToBottom) return;
    endRef.current?.scrollIntoView({ block: "end", behavior: "smooth" });
  }, [statuses, stickToBottom]);

  async function chooseFolder() {
    if (!isLocalHost) {
      addStatus(
        "Folder picker only works when the app is running locally (http://localhost:3000).",
        "error"
      );
      return;
    }

    setPicking(true);
    addStatus("Opening folder picker...", "info");
    try {
      const res = await fetch("/api/select-folder", { method: "POST" });
      const data = (await res.json()) as
        | { status: "success"; path: string }
        | { status: "cancelled" }
        | { status: "error"; message: string };

      if (data.status === "success") {
        setFolder(data.path);
        addStatus(`Selected folder: ${data.path}`, "success");
        return;
      }

      if (data.status === "cancelled") {
        addStatus("Folder selection cancelled.", "info");
        return;
      }

      addStatus(data.message || "Folder picker failed.", "error");
    } catch (err) {
      addStatus(String(err), "error");
    } finally {
      setPicking(false);
    }
  }

  function clearStatus() {
    setStatuses([]);
    ffmpegWarnedRef.current = false;
    downloadFolderRef.current = null;
  }

  function cleanLinks() {
    if (parsed.unique.length === 0) return;
    setLinks(parsed.unique.join("\n"));
    if (parsed.duplicates > 0) {
      addStatus(
        `Cleaned links: ${parsed.unique.length} unique (${parsed.duplicates} duplicate${parsed.duplicates === 1 ? "" : "s"} removed).`,
        "success"
      );
    } else {
      addStatus(`Cleaned links: ${parsed.unique.length} unique.`, "success");
    }
  }

  async function pasteFromClipboard() {
    try {
      const text = await navigator.clipboard.readText();
      if (!text.trim()) {
        addStatus("Clipboard is empty.", "info");
        return;
      }

      setLinks((prev) => {
        const next = prev.trim() ? `${prev.trim()}\n${text.trim()}` : text.trim();
        return next;
      });
      addStatus("Pasted from clipboard.", "success");
    } catch (err) {
      addStatus(`Clipboard paste failed: ${String(err)}`, "error");
    }
  }

  async function copyStatus() {
    try {
      const text = statuses
        .map((s) => `[${new Date(s.at).toLocaleTimeString()}] ${s.type.toUpperCase()}: ${s.text}`)
        .join("\n");
      await navigator.clipboard.writeText(text || "");
      addStatus("Copied status log to clipboard.", "success");
    } catch (err) {
      addStatus(`Copy failed: ${String(err)}`, "error");
    }
  }

  async function downloadOne(url: string, folderValue: string) {
    const controller = new AbortController();
    downloadControllerRef.current = controller;

    const res = await fetch("/api/download", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ urls: [url], folder: folderValue.trim() || null }),
      signal: controller.signal,
    });

    const data = (await res.json()) as DownloadApiResponse;
    if (!res.ok || data.status !== "success") {
      throw new Error(data.status === "error" ? data.message : "Download request failed.");
    }

    if (data.ffmpeg === false && !ffmpegWarnedRef.current) {
      ffmpegWarnedRef.current = true;
      addStatus(
        "ffmpeg not found. Downloading single-file formats when possible. Install ffmpeg for best quality.",
        "info"
      );
    }

    if (!downloadFolderRef.current) {
      downloadFolderRef.current = data.download_folder;
      addStatus(`Saving to: ${data.download_folder}`, "success");
    }

    const r = data.results[0];
    if (!r) throw new Error("No result returned from server.");

    if (r.status === "success") {
      addStatus(`Downloaded: ${r.title || r.url}`, "success");
      return;
    }

    const msg = r.error ? `Failed: ${r.url} (${r.error})` : `Failed: ${r.url}`;
    addStatus(msg, "error");
  }

  async function startDownload() {
    if (!isLocalHost) {
      addStatus(
        "Downloads are disabled on hosted deployments. Run locally (npm run dev) so yt-dlp can save to your machine.",
        "error"
      );
      return;
    }

    const urls = parsed.unique;
    if (urls.length === 0) {
      addStatus("Paste at least one URL to download.", "error");
      return;
    }

    setDownloading(true);
    setProgress({ done: 0, total: urls.length });
    downloadFolderRef.current = null;
    ffmpegWarnedRef.current = false;

    addStatus(`Starting ${urls.length} download${urls.length === 1 ? "" : "s"}...`, "info");
    try {
      for (let i = 0; i < urls.length; i += 1) {
        const url = urls[i]!;
        setProgress({ done: i, total: urls.length });
        addStatus(`Downloading (${i + 1}/${urls.length}): ${url}`, "info");
        await downloadOne(url, folder);
        setProgress({ done: i + 1, total: urls.length });
      }
      addStatus("All downloads complete.", "success");
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      if (msg.toLowerCase().includes("aborted")) {
        addStatus("Cancelled.", "info");
      } else {
        addStatus(msg, "error");
      }
    } finally {
      downloadControllerRef.current = null;
      setProgress(null);
      setDownloading(false);
    }
  }

  function cancelDownload() {
    downloadControllerRef.current?.abort();
  }

  function jumpToLatest() {
    endRef.current?.scrollIntoView({ block: "end", behavior: "smooth" });
  }

  const busy = picking || downloading;
  const progressPercent = progress
    ? Math.round((progress.done / Math.max(1, progress.total)) * 100)
    : 0;

  return (
    <>
      {!isLocalHost ? (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Hosted mode: downloads disabled</AlertTitle>
          <AlertDescription>
            <p>
              This app runs <span className="font-medium">yt-dlp</span> on the server and saves to
              the server filesystem. It only works when you run it locally.
            </p>
            <p>
              Run <span className="font-medium">npm run dev</span> and open{" "}
              <span className="font-medium">http://localhost:3000</span>.
            </p>
          </AlertDescription>
        </Alert>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle>Download</CardTitle>
          <CardDescription>
            Paste links, pick a folder, and download. Leave the folder blank to
            use <span className="font-medium">~/Downloads</span>.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form
            className="space-y-6"
            onSubmit={(e) => {
              e.preventDefault();
              startDownload();
            }}
          >
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="folder">Download location</FieldLabel>
                <FieldContent>
                  <InputGroup>
                    <InputGroupInput
                      id="folder"
                      value={folder}
                      onChange={(e) => setFolder(e.target.value)}
                      placeholder="~/Downloads"
                      spellCheck={false}
                      disabled={downloading || !isLocalHost}
                    />
                    <InputGroupAddon align="inline-end">
                      <InputGroupButton onClick={chooseFolder} disabled={busy || !isLocalHost}>
                        {picking ? (
                          <Spinner data-icon="inline-start" />
                        ) : (
                          <FolderOpen />
                        )}
                        Choose folder
                      </InputGroupButton>
                    </InputGroupAddon>
                  </InputGroup>
                  <FieldHelp>
                    Leave blank to use <span className="font-medium">~/Downloads</span>.
                  </FieldHelp>
                </FieldContent>
              </Field>

              <Field>
                <FieldLabel htmlFor="links">
                  <span>Video links</span>
                  <Badge variant="outline" className="ml-auto">
                    {parsed.unique.length} link
                    {parsed.unique.length === 1 ? "" : "s"}
                    {parsed.duplicates > 0 ? ` (${parsed.duplicates} dup)` : ""}
                  </Badge>
                </FieldLabel>
                <FieldContent>
                  <div className="flex flex-wrap items-center justify-end gap-2">
                    <ButtonGroup>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={pasteFromClipboard}
                        disabled={downloading}
                        aria-label="Paste from clipboard"
                      >
                        <ClipboardPaste className="h-4 w-4" />
                        Paste
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={cleanLinks}
                        disabled={downloading || parsed.unique.length === 0}
                        aria-label="Clean and deduplicate links"
                      >
                        <WandSparkles className="h-4 w-4" />
                        Clean
                      </Button>
                    </ButtonGroup>
                  </div>
                  <InputGroup className="h-auto">
                    <InputGroupTextarea
                      id="links"
                      value={links}
                      onChange={(e) => setLinks(e.target.value)}
                      onKeyDown={(e) => {
                        if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
                          e.preventDefault();
                          startDownload();
                        }
                      }}
                      placeholder={
                        "https://www.tiktok.com/@...\nhttps://www.instagram.com/reel/..."
                      }
                      spellCheck={false}
                      disabled={downloading}
                      className="min-h-36"
                    />
                  </InputGroup>
                  <FieldHelp className="flex flex-wrap items-center gap-2">
                    Tip: press{" "}
                    <KbdGroup>
                      <Kbd>⌘/Ctrl</Kbd>
                      <Kbd>Enter</Kbd>
                    </KbdGroup>{" "}
                    to start.
                  </FieldHelp>
                </FieldContent>
              </Field>
            </FieldGroup>

            <div className="space-y-3">
              <Button type="submit" disabled={busy || !isLocalHost} className="w-full">
                {downloading ? (
                  <Spinner data-icon="inline-start" />
                ) : (
                  <Download className="h-4 w-4" />
                )}
                {downloading ? "Downloading..." : "Start download"}
              </Button>

              {downloading ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-sm">
                    <div className="text-muted-foreground">
                      {progress ? (
                        <>
                          {progress.done}/{progress.total} complete
                        </>
                      ) : (
                        "Working..."
                      )}
                    </div>
                    {progress ? (
                      <div className="ml-auto text-muted-foreground tabular-nums">
                        {progressPercent}%
                      </div>
                    ) : null}
                  </div>
                  {progress ? (
                    <Progress value={progressPercent} className="w-full" />
                  ) : null}
                  <div className="flex justify-end">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={cancelDownload}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : null}
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Status</CardTitle>
          <CardDescription>
            {statuses.length === 0
              ? "Ready when you are."
              : "Newest messages appear at the bottom."}
          </CardDescription>
          <CardAction>
            <ButtonGroup>
              <Button
                type="button"
                variant="outline"
                onClick={copyStatus}
                disabled={statuses.length === 0}
              >
                Copy log
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={clearStatus}
                disabled={busy || statuses.length === 0}
              >
                <X className="h-4 w-4" />
                Clear
              </Button>
            </ButtonGroup>
          </CardAction>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <ScrollArea ref={scrollAreaRef} className="h-72 rounded-md bg-muted/20">
              <div className="p-3" aria-live="polite">
                {statuses.length === 0 ? (
                  <Empty className="min-h-[240px]">
                    <EmptyHeader>
                      <EmptyMedia variant="icon">
                        <Info className="text-muted-foreground" />
                      </EmptyMedia>
                      <EmptyTitle>No activity yet</EmptyTitle>
                      <EmptyDescription>
                        Paste one or more links above, then start a download.
                      </EmptyDescription>
                    </EmptyHeader>
                    <EmptyContent>
                      <EmptyDescription>
                        The status log is kept locally in this browser tab.
                      </EmptyDescription>
                    </EmptyContent>
                  </Empty>
                ) : (
                  <ItemGroup>
                    {statuses.map((s, idx) => {
                      const meta = statusMeta(s.type);
                      return (
                        <div key={s.id}>
                          <Item role="listitem" variant="outline" size="sm">
                            <ItemMedia variant="icon">{meta.icon}</ItemMedia>
                            <ItemContent className="min-w-0">
                              <ItemTitle>{meta.label}</ItemTitle>
                              <ItemHelp className="line-clamp-none break-words">
                                {s.text}
                              </ItemHelp>
                            </ItemContent>
                            <ItemActions className="ml-auto shrink-0">
                              <span className="text-muted-foreground text-xs tabular-nums">
                                {new Date(s.at).toLocaleTimeString()}
                              </span>
                            </ItemActions>
                          </Item>
                          {idx < statuses.length - 1 ? <ItemSeparator /> : null}
                        </div>
                      );
                    })}
                    <div ref={endRef} />
                  </ItemGroup>
                )}
              </div>
            </ScrollArea>
            {!stickToBottom && statuses.length > 0 ? (
              <div className="absolute bottom-3 right-3">
                <Button type="button" variant="outline" size="sm" onClick={jumpToLatest}>
                  Jump to latest
                </Button>
              </div>
            ) : null}
          </div>
        </CardContent>
      </Card>
    </>
  );
}
