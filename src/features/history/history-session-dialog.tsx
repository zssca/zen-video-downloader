"use client";

import type { ReactNode } from "react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDateTime, formatDurationMs } from "@/lib/datetime";
import { toast } from "sonner";

import type { DownloadSession } from "./types";
import { summarizeSession } from "./summary";

export function HistorySessionDialog({
  session,
  trigger,
  showToasts,
}: {
  session: DownloadSession;
  trigger: ReactNode;
  showToasts: boolean;
}) {
  const summary = summarizeSession(session);
  const duration = formatDurationMs(session.finishedAt - session.startedAt);

  async function copyJson() {
    try {
      await navigator.clipboard.writeText(JSON.stringify(session, null, 2));
      if (showToasts) toast("Copied session JSON.");
    } catch (err) {
      if (showToasts) toast(`Copy failed: ${String(err)}`);
    }
  }

  return (
    <Dialog>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Download session</DialogTitle>
          <DialogDescription>
            {formatDateTime(session.startedAt)}
            <span className="text-muted-foreground"> · </span>
            {duration}
            <span className="text-muted-foreground"> · </span>
            {summary.total} total
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline">Folder: {session.folder || "~/Downloads"}</Badge>
            <Badge variant={session.ffmpeg ? "secondary" : "outline"}>
              ffmpeg: {session.ffmpeg ? "found" : "missing"}
            </Badge>
            <Badge variant="secondary">Success: {summary.success}</Badge>
            {summary.failed > 0 ? (
              <Badge variant="destructive">Failed: {summary.failed}</Badge>
            ) : null}
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Status</TableHead>
                <TableHead>Title / URL</TableHead>
                <TableHead>Error</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {session.results.map((r) => (
                <TableRow key={r.url}>
                  <TableCell className="align-top">
                    <Badge variant={r.status === "success" ? "secondary" : "destructive"}>
                      {r.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="min-w-0 align-top">
                    <div className="break-words">
                      <div className="font-medium">
                        {r.title || "(no title)"}
                      </div>
                      <div className="text-muted-foreground text-xs">{r.url}</div>
                    </div>
                  </TableCell>
                  <TableCell className="align-top">
                    <div className="text-muted-foreground break-words text-xs">
                      {r.error || ""}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <DialogFooter>
          <ButtonGroup>
            <Button type="button" variant="outline" onClick={copyJson}>
              Copy JSON
            </Button>
          </ButtonGroup>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
