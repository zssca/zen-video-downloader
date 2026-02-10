"use client";

import { ConfirmAlertDialog } from "@/components/confirm-alert-dialog";
import {
  Page,
  PageDescription,
  PageHeader,
  PageHeaderText,
  PageTitle,
} from "@/components/page";
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
import { ItemGroup, ItemSeparator } from "@/components/ui/item";
import { toast } from "sonner";

import { useSettings } from "@/features/settings/settings-provider";

import { HistorySessionItem } from "./history-session-item";
import { useHistory } from "./use-history";
import { ClipboardCopy, History } from "lucide-react";

export function HistoryView() {
  const { settings } = useSettings();
  const { sessions, clear } = useHistory();

  async function copyAllJson() {
    try {
      await navigator.clipboard.writeText(JSON.stringify(sessions, null, 2));
      if (settings.showToasts) toast("Copied history JSON.");
    } catch (err) {
      if (settings.showToasts) toast(`Copy failed: ${String(err)}`);
    }
  }

  return (
    <Page>
      <PageHeader>
        <PageHeaderText>
          <PageTitle>History</PageTitle>
          <PageDescription>
            Download sessions stored in this browser.
          </PageDescription>
        </PageHeaderText>
      </PageHeader>

      <Card>
        <CardHeader>
          <CardTitle>Sessions</CardTitle>
          <CardDescription>
            {settings.maxHistorySessions <= 0
              ? "History saving is disabled in Settings."
              : `Keeping up to ${settings.maxHistorySessions} sessions.`}
          </CardDescription>
          <CardAction>
            <ButtonGroup>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={copyAllJson}
                disabled={sessions.length === 0}
              >
                <ClipboardCopy className="h-4 w-4" />
                Copy JSON
              </Button>
              <ConfirmAlertDialog
                trigger={
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={sessions.length === 0}
                >
                  Clear
                </Button>
              }
                title="Clear history?"
                description="This will remove all saved sessions for this browser."
                confirmLabel="Clear"
                onConfirm={() => {
                  clear();
                  if (settings.showToasts) toast("History cleared.");
                }}
              />
            </ButtonGroup>
          </CardAction>
        </CardHeader>
        <CardContent>
          {sessions.length === 0 ? (
            <Empty className="min-h-[360px] bg-muted/20">
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <History className="text-muted-foreground" />
                </EmptyMedia>
                <EmptyTitle>No sessions yet</EmptyTitle>
                <EmptyDescription>
                  Your completed downloads will appear here.
                </EmptyDescription>
              </EmptyHeader>
              <EmptyContent>
                <EmptyDescription>
                  Tip: enable history saving in Settings.
                </EmptyDescription>
              </EmptyContent>
            </Empty>
          ) : (
            <ItemGroup>
              {sessions.map((s, idx) => (
                <div key={s.id}>
                  <HistorySessionItem session={s} showToasts={settings.showToasts} />
                  {idx < sessions.length - 1 ? <ItemSeparator /> : null}
                </div>
              ))}
            </ItemGroup>
          )}
        </CardContent>
      </Card>
    </Page>
  );
}
