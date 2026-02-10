"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
} from "@/components/ui/item";
import { formatDateTime, formatDurationMs } from "@/lib/datetime";
import { HistorySessionDialog } from "@/features/history/history-session-dialog";
import { Download } from "lucide-react";

import type { DownloadSession } from "./types";
import { summarizeSession } from "./summary";

export function HistorySessionItem({
  session,
  showToasts,
}: {
  session: DownloadSession;
  showToasts: boolean;
}) {
  const summary = summarizeSession(session);
  const duration = formatDurationMs(session.finishedAt - session.startedAt);

  return (
    <Item variant="outline" size="sm">
      <ItemMedia variant="icon">
        <Download />
      </ItemMedia>
      <ItemContent className="min-w-0">
        <ItemTitle>{formatDateTime(session.startedAt)}</ItemTitle>
        <ItemDescription className="line-clamp-none break-words">
          <span className="text-muted-foreground">{duration}</span>
          <span className="text-muted-foreground"> · </span>
          <span>
            {summary.success}/{summary.total} succeeded
          </span>
          {summary.failed > 0 ? (
            <>
              <span className="text-muted-foreground"> · </span>
              <span className="text-destructive">{summary.failed} failed</span>
            </>
          ) : null}
          <span className="text-muted-foreground"> · </span>
          <span className="text-muted-foreground break-words">
            {session.folder || "~/Downloads"}
          </span>
        </ItemDescription>
      </ItemContent>
      <ItemActions className="ml-auto shrink-0">
        <div className="flex items-center gap-2">
          {session.ffmpeg ? (
            <Badge variant="secondary">ffmpeg</Badge>
          ) : (
            <Badge variant="outline">no ffmpeg</Badge>
          )}
          <HistorySessionDialog
            session={session}
            showToasts={showToasts}
            trigger={
              <Button type="button" variant="outline" size="sm">
                View
              </Button>
            }
          />
        </div>
      </ItemActions>
    </Item>
  );
}
