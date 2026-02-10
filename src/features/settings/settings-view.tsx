"use client";

import { useCallback } from "react";

import { ConfirmAlertDialog } from "@/components/confirm-alert-dialog";
import {
  Page,
  PageDescription,
  PageHeader,
  PageHeaderText,
  PageTitle,
} from "@/components/page";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
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
  Field,
  FieldContent,
  FieldDescription as FieldHelp,
  FieldGroup,
  FieldTitle,
} from "@/components/ui/field";
import { Slider } from "@/components/ui/slider";
import { removeKey } from "@/lib/storage";
import { Info } from "lucide-react";
import { toast } from "sonner";

import { SwitchField } from "./switch-field";
import { useSettings } from "./settings-provider";

const FORM_FOLDER_KEY = "zvd.folder";
const FORM_LINKS_KEY = "zvd.links";

export function SettingsView() {
  const { settings, update, reset } = useSettings();

  const notify = useCallback(
    (message: string) => {
      if (!settings.showToasts) return;
      toast(message);
    },
    [settings.showToasts]
  );

  return (
    <Page>
      <PageHeader>
        <PageHeaderText>
          <PageTitle>Settings</PageTitle>
          <PageDescription>
            Preferences are saved in this browser only.
          </PageDescription>
        </PageHeaderText>
      </PageHeader>

      <Alert>
        <Info className="h-4 w-4" />
        <AlertTitle>Local preferences</AlertTitle>
        <AlertDescription>
          This app stores settings, form values, and history in localStorage.
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader>
          <CardTitle>Downloader</CardTitle>
          <CardDescription>Control form persistence and log behavior.</CardDescription>
        </CardHeader>
        <CardContent>
          <FieldGroup>
            <SwitchField
              id="settings-remember-folder"
              label="Remember download folder"
              description="Persist the last selected folder between reloads."
              checked={settings.rememberFolder}
              onCheckedChange={(checked) => {
                update({ rememberFolder: checked });
                if (!checked) removeKey(FORM_FOLDER_KEY);
                notify(checked ? "Folder will be remembered." : "Folder memory disabled.");
              }}
            />
            <SwitchField
              id="settings-remember-links"
              label="Remember pasted links"
              description="Persist the textarea contents between reloads."
              checked={settings.rememberLinks}
              onCheckedChange={(checked) => {
                update({ rememberLinks: checked });
                if (!checked) removeKey(FORM_LINKS_KEY);
                notify(checked ? "Links will be remembered." : "Links memory disabled.");
              }}
            />
            <SwitchField
              id="settings-auto-follow"
              label="Auto-follow the status log"
              description="When enabled, the log will keep itself scrolled to the latest messages."
              checked={settings.autoFollowLog}
              onCheckedChange={(checked) => {
                update({ autoFollowLog: checked });
                notify(checked ? "Auto-follow enabled." : "Auto-follow disabled.");
              }}
            />
            <SwitchField
              id="settings-toasts"
              label="Show toast notifications"
              description="Use small popups for actions like copy/clear."
              checked={settings.showToasts}
              onCheckedChange={(checked) => {
                update({ showToasts: checked });
              }}
            />
          </FieldGroup>
        </CardContent>
        <CardAction>
          <ButtonGroup>
            <ConfirmAlertDialog
              trigger={
                <Button variant="outline" size="sm">
                  Clear saved form values
                </Button>
              }
              title="Clear saved form values?"
              description="This removes the remembered folder and pasted links for this browser."
              confirmLabel="Clear"
              onConfirm={() => {
                removeKey(FORM_FOLDER_KEY);
                removeKey(FORM_LINKS_KEY);
                notify("Saved form values cleared.");
              }}
            />
            <ConfirmAlertDialog
              trigger={
                <Button variant="outline" size="sm">
                  Reset settings
                </Button>
              }
              title="Reset settings?"
              description="This will restore the default preferences."
              confirmLabel="Reset"
              onConfirm={() => {
                reset();
                notify("Settings reset.");
              }}
            />
          </ButtonGroup>
        </CardAction>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>History</CardTitle>
          <CardDescription>Limit how many sessions are kept.</CardDescription>
        </CardHeader>
        <CardContent>
          <FieldGroup>
            <Field>
              <FieldTitle>Max sessions to keep</FieldTitle>
              <FieldContent>
                <div className="flex flex-col gap-3">
                  <div className="flex items-center gap-3">
                    <Slider
                      value={[settings.maxHistorySessions]}
                      min={0}
                      max={100}
                      step={5}
                      onValueChange={(v) =>
                        update({ maxHistorySessions: v[0] ?? 0 })
                      }
                      className="w-full"
                    />
                    <Badge variant="outline" className="tabular-nums">
                      {settings.maxHistorySessions}
                    </Badge>
                  </div>
                  <FieldHelp>
                    Keep the most recent sessions only. Set to 0 to disable saving history.
                  </FieldHelp>
                </div>
              </FieldContent>
            </Field>
          </FieldGroup>
        </CardContent>
      </Card>
    </Page>
  );
}
