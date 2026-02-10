"use client";

import type { RefObject } from "react";

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
  Item,
  ItemActions,
  ItemContent,
  ItemDescription as ItemHelp,
  ItemGroup,
  ItemMedia,
  ItemSeparator,
  ItemTitle,
} from "@/components/ui/item";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Info, X } from "lucide-react";

import type { StatusItem } from "./types";
import { statusMeta } from "./status-meta";

export function StatusCard({
  statuses,
  busy,
  stickToBottom,
  statusScrollAreaId,
  endRef,
  copyStatus,
  clearStatus,
  jumpToLatest,
}: {
  statuses: StatusItem[];
  busy: boolean;
  stickToBottom: boolean;
  statusScrollAreaId: string;
  endRef: RefObject<HTMLDivElement | null>;
  copyStatus: () => void;
  clearStatus: () => void;
  jumpToLatest: () => void;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Status</CardTitle>
        <CardDescription>
          {statuses.length === 0 ? "Ready when you are." : "Newest messages appear at the bottom."}
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
          <ScrollArea id={statusScrollAreaId} className="h-72 rounded-md bg-muted/20">
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
  );
}
