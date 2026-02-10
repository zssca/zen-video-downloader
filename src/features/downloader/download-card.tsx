"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Kbd, KbdGroup } from "@/components/ui/kbd";
import { Progress } from "@/components/ui/progress";
import { Spinner } from "@/components/ui/spinner";
import { ClipboardPaste, Download, FolderOpen, WandSparkles, X } from "lucide-react";

import type { DownloadProgress } from "./types";

export function DownloadCard({
  isLocalHost,
  folder,
  onFolderChange,
  chooseFolder,
  picking,
  links,
  onLinksChange,
  parsed,
  downloading,
  busy,
  startDownload,
  cancelDownload,
  cleanLinks,
  pasteFromClipboard,
  progress,
  progressPercent,
}: {
  isLocalHost: boolean;
  folder: string;
  onFolderChange: (next: string) => void;
  chooseFolder: () => void;
  picking: boolean;
  links: string;
  onLinksChange: (next: string) => void;
  parsed: { unique: string[]; duplicates: number };
  downloading: boolean;
  busy: boolean;
  startDownload: () => void;
  cancelDownload: () => void;
  cleanLinks: () => void;
  pasteFromClipboard: () => void;
  progress: DownloadProgress | null;
  progressPercent: number;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Download</CardTitle>
        <CardDescription>
          Paste links, pick a folder, and download. Leave the folder blank to use{" "}
          <span className="font-medium">~/Downloads</span>.
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
                    onChange={(e) => onFolderChange(e.target.value)}
                    placeholder="~/Downloads"
                    spellCheck={false}
                    disabled={downloading || !isLocalHost}
                  />
                  <InputGroupAddon align="inline-end">
                    <InputGroupButton onClick={chooseFolder} disabled={busy || !isLocalHost}>
                      {picking ? <Spinner data-icon="inline-start" /> : <FolderOpen />}
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
                  {parsed.unique.length} link{parsed.unique.length === 1 ? "" : "s"}
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
                    onChange={(e) => onLinksChange(e.target.value)}
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
              {downloading ? <Spinner data-icon="inline-start" /> : <Download className="h-4 w-4" />}
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

                {progress ? <Progress value={progressPercent} className="w-full" /> : null}

                <div className="flex justify-end">
                  <Button type="button" variant="outline" size="sm" onClick={cancelDownload}>
                    <X className="h-4 w-4" />
                    Cancel
                  </Button>
                </div>
              </div>
            ) : null}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
