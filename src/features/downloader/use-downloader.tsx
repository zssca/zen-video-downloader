"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";

import { useEnv } from "@/components/env-provider";
import { appendHistory } from "@/features/history/storage";
import { useSettings } from "@/features/settings/settings-provider";
import { readString, removeKey, writeString } from "@/lib/storage";
import { extractUrlsOrLines } from "@/lib/urls";
import { toast } from "sonner";

import { FOLDER_KEY, LINKS_KEY, MAX_LINKS_STORAGE_CHARS } from "./keys";
import type {
  DownloadApiResponse,
  DownloadApiResult,
  DownloadProgress,
  StatusItem,
  StatusType,
} from "./types";

function uid() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
}

export function useDownloader() {
  const { isLocalHost } = useEnv();
  const { settings } = useSettings();

  const [folder, setFolder] = useState("");
  const [links, setLinks] = useState("");
  const [picking, setPicking] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [progress, setProgress] = useState<DownloadProgress | null>(null);
  const [statuses, setStatuses] = useState<StatusItem[]>([]);

  const [stickToBottom, setStickToBottom] = useState(true);

  const reactId = useId();
  const statusScrollAreaId = `zvd-status-${reactId}`;

  const endRef = useRef<HTMLDivElement | null>(null);

  const downloadControllerRef = useRef<AbortController | null>(null);
  const ffmpegWarnedRef = useRef(false);
  const downloadFolderRef = useRef<string | null>(null);
  const ffmpegAvailableRef = useRef<boolean | null>(null);
  const sessionIdRef = useRef<string | null>(null);
  const sessionStartedAtRef = useRef<number | null>(null);
  const sessionResultsRef = useRef<DownloadApiResult[]>([]);
  const didRestoreRef = useRef(false);

  const parsed = useMemo(() => extractUrlsOrLines(links), [links]);

  const busy = picking || downloading;
  const progressPercent = progress
    ? Math.round((progress.done / Math.max(1, progress.total)) * 100)
    : 0;

  function addStatus(text: string, type: StatusType = "info") {
    setStatuses((s) => [...s, { id: uid(), type, text, at: Date.now() }]);
  }

  useEffect(() => {
    if (didRestoreRef.current) return;
    didRestoreRef.current = true;

    if (settings.rememberFolder) {
      const savedFolder = readString(FOLDER_KEY);
      if (savedFolder) setFolder(savedFolder);
    }

    if (settings.rememberLinks) {
      const savedLinks = readString(LINKS_KEY);
      if (savedLinks) setLinks(savedLinks);
    }
  }, [settings.rememberFolder, settings.rememberLinks]);

  useEffect(() => {
    if (!settings.rememberFolder) return;
    writeString(FOLDER_KEY, folder);
  }, [folder, settings.rememberFolder]);

  useEffect(() => {
    if (!settings.rememberLinks) return;
    if (links.length <= MAX_LINKS_STORAGE_CHARS) writeString(LINKS_KEY, links);
  }, [links, settings.rememberLinks]);

  useEffect(() => {
    if (settings.rememberFolder) return;
    removeKey(FOLDER_KEY);
  }, [settings.rememberFolder]);

  useEffect(() => {
    if (settings.rememberLinks) return;
    removeKey(LINKS_KEY);
  }, [settings.rememberLinks]);

  useEffect(() => {
    const root = document.getElementById(statusScrollAreaId);
    const viewport = root?.querySelector('[data-slot="scroll-area-viewport"]');
    if (!(viewport instanceof HTMLElement)) return;

    const threshold = 32;
    const onScroll = () => {
      const atBottom =
        viewport.scrollHeight - viewport.scrollTop - viewport.clientHeight <= threshold;
      setStickToBottom(atBottom);
    };

    viewport.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => viewport.removeEventListener("scroll", onScroll);
  }, [statusScrollAreaId]);

  useEffect(() => {
    if (!settings.autoFollowLog) return;
    if (!stickToBottom) return;
    endRef.current?.scrollIntoView({ block: "end", behavior: "smooth" });
  }, [statuses, stickToBottom, settings.autoFollowLog]);

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
        if (settings.showToasts) toast("Folder selected.");
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
    if (settings.showToasts) toast("Status cleared.");
  }

  function cleanLinks() {
    if (parsed.unique.length === 0) return;
    setLinks(parsed.unique.join("\n"));

    if (parsed.duplicates > 0) {
      const msg = `Cleaned links: ${parsed.unique.length} unique (${parsed.duplicates} duplicate${parsed.duplicates === 1 ? "" : "s"} removed).`;
      addStatus(msg, "success");
      if (settings.showToasts) toast(msg);
      return;
    }

    const msg = `Cleaned links: ${parsed.unique.length} unique.`;
    addStatus(msg, "success");
    if (settings.showToasts) toast(msg);
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
      if (settings.showToasts) toast("Pasted from clipboard.");
    } catch (err) {
      addStatus(`Clipboard paste failed: ${String(err)}`, "error");
    }
  }

  async function copyStatus() {
    try {
      const text = statuses
        .map(
          (s) =>
            `[${new Date(s.at).toLocaleTimeString()}] ${s.type.toUpperCase()}: ${s.text}`
        )
        .join("\n");
      await navigator.clipboard.writeText(text || "");
      addStatus("Copied status log to clipboard.", "success");
      if (settings.showToasts) toast("Copied status log.");
    } catch (err) {
      addStatus(`Copy failed: ${String(err)}`, "error");
    }
  }

  async function downloadOne(url: string, folderValue: string): Promise<DownloadApiResult> {
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
      throw new Error(
        data.status === "error" ? data.message : "Download request failed."
      );
    }

    if (ffmpegAvailableRef.current === null) ffmpegAvailableRef.current = data.ffmpeg;

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
      return r;
    }

    const msg = r.error ? `Failed: ${r.url} (${r.error})` : `Failed: ${r.url}`;
    addStatus(msg, "error");
    return r;
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
    ffmpegAvailableRef.current = null;
    sessionIdRef.current = uid();
    sessionStartedAtRef.current = Date.now();
    sessionResultsRef.current = [];

    addStatus(
      `Starting ${urls.length} download${urls.length === 1 ? "" : "s"}...`,
      "info"
    );

    try {
      for (let i = 0; i < urls.length; i += 1) {
        const url = urls[i]!;
        setProgress({ done: i, total: urls.length });
        addStatus(`Downloading (${i + 1}/${urls.length}): ${url}`, "info");
        const r = await downloadOne(url, folder);
        sessionResultsRef.current.push(r);
        setProgress({ done: i + 1, total: urls.length });
      }
      addStatus("All downloads complete.", "success");
      if (settings.showToasts) toast("All downloads complete.");
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      if (msg.toLowerCase().includes("aborted")) {
        addStatus("Cancelled.", "info");
      } else {
        addStatus(msg, "error");
      }
    } finally {
      const sessionId = sessionIdRef.current;
      const startedAt = sessionStartedAtRef.current;
      const results = sessionResultsRef.current;

      if (sessionId && startedAt && results.length > 0) {
        appendHistory(
          {
            id: sessionId,
            startedAt,
            finishedAt: Date.now(),
            folder: downloadFolderRef.current ?? folder.trim(),
            ffmpeg: ffmpegAvailableRef.current ?? false,
            results: results.map((r) =>
              r.status === "success"
                ? { url: r.url, status: r.status, title: r.title }
                : { url: r.url, status: r.status, error: r.error }
            ),
          },
          settings.maxHistorySessions
        );
      }

      sessionIdRef.current = null;
      sessionStartedAtRef.current = null;
      sessionResultsRef.current = [];
      ffmpegAvailableRef.current = null;

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

  return {
    isLocalHost,
    settings,
    folder,
    setFolder,
    links,
    setLinks,
    picking,
    downloading,
    progress,
    progressPercent,
    parsed,
    statuses,
    stickToBottom,
    statusScrollAreaId,
    endRef,
    busy,
    chooseFolder,
    clearStatus,
    cleanLinks,
    pasteFromClipboard,
    copyStatus,
    startDownload,
    cancelDownload,
    jumpToLatest,
  };
}
