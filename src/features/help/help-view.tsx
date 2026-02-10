import { SetupCheck } from "@/features/help/setup-check";

import {
  Page,
  PageDescription,
  PageHeader,
  PageHeaderText,
  PageTitle,
} from "@/components/page";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemMedia,
  ItemSeparator,
  ItemTitle,
} from "@/components/ui/item";
import { Kbd, KbdGroup } from "@/components/ui/kbd";
import { Badge } from "@/components/ui/badge";
import { Download, FolderOpen, Info, TerminalSquare, WandSparkles } from "lucide-react";

export function HelpView() {
  return (
    <Page>
      <PageHeader>
        <PageHeaderText>
          <PageTitle>Help</PageTitle>
          <PageDescription>
            Zen is a local UI for <span className="font-medium">yt-dlp</span>. It downloads to
            your machine when you run the app locally.
          </PageDescription>
        </PageHeaderText>
      </PageHeader>

      <Alert>
        <Info className="h-4 w-4" />
        <AlertTitle>Hosted deployments are preview-only</AlertTitle>
        <AlertDescription>
          The downloader runs native binaries (<span className="font-medium">yt-dlp</span>,
          optionally <span className="font-medium">ffmpeg</span>). For safety and filesystem
          constraints, hosted deployments disable downloads.
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader>
          <CardTitle>Quick start</CardTitle>
          <CardDescription>Recommended local setup.</CardDescription>
        </CardHeader>
        <CardContent>
          <ItemGroup>
            <Item variant="outline" size="sm">
              <ItemMedia variant="icon">
                <TerminalSquare />
              </ItemMedia>
              <ItemContent>
                <ItemTitle>Install yt-dlp</ItemTitle>
                <ItemDescription>
                  Use Homebrew or pip. If needed, set <Badge variant="outline">YTDLP_PATH</Badge>.
                </ItemDescription>
              </ItemContent>
            </Item>
            <ItemSeparator />
            <Item variant="outline" size="sm">
              <ItemMedia variant="icon">
                <TerminalSquare />
              </ItemMedia>
              <ItemContent>
                <ItemTitle>Install ffmpeg (optional)</ItemTitle>
                <ItemDescription>
                  Improves merges and quality selection.
                </ItemDescription>
              </ItemContent>
            </Item>
            <ItemSeparator />
            <Item variant="outline" size="sm">
              <ItemMedia variant="icon">
                <WandSparkles />
              </ItemMedia>
              <ItemContent>
                <ItemTitle>Run the app</ItemTitle>
                <ItemDescription className="line-clamp-none">
                  Start dev server and open <span className="font-medium">http://localhost:3000</span>.
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <Badge variant="secondary">npm run dev</Badge>
                    <span className="text-muted-foreground">then</span>
                    <Badge variant="secondary">open localhost</Badge>
                  </div>
                </ItemDescription>
              </ItemContent>
            </Item>
            <ItemSeparator />
            <Item variant="outline" size="sm">
              <ItemMedia variant="icon">
                <FolderOpen />
              </ItemMedia>
              <ItemContent>
                <ItemTitle>Pick a folder and download</ItemTitle>
                <ItemDescription className="line-clamp-none">
                  Paste one link per line and press{" "}
                  <KbdGroup>
                    <Kbd>⌘/Ctrl</Kbd>
                    <Kbd>Enter</Kbd>
                  </KbdGroup>.
                </ItemDescription>
              </ItemContent>
            </Item>
          </ItemGroup>
        </CardContent>
      </Card>

      <SetupCheck />

      <Card>
        <CardHeader>
          <CardTitle>FAQ</CardTitle>
          <CardDescription>Common questions and gotchas.</CardDescription>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="where-saved">
              <AccordionTrigger>Where are files saved?</AccordionTrigger>
              <AccordionContent>
                Files are saved on the machine running the server. When you run locally, that means
                your computer. If the folder is blank, Zen uses <span className="font-medium">~/Downloads</span>.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="hosted-disabled">
              <AccordionTrigger>Why are downloads disabled on Vercel?</AccordionTrigger>
              <AccordionContent>
                Hosted platforms run in serverless or sandboxed environments with limited filesystem
                access. Even if the API ran, downloads would land on an ephemeral server disk, not
                your device.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="paste-clean">
              <AccordionTrigger>How do I paste faster?</AccordionTrigger>
              <AccordionContent>
                Use the Paste button or paste directly into the textarea. Use the Clean button to
                deduplicate and remove trailing punctuation.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Keyboard shortcuts</CardTitle>
          <CardDescription>Small things that save time.</CardDescription>
        </CardHeader>
        <CardContent>
          <ItemGroup>
            <Item variant="outline" size="sm">
              <ItemMedia variant="icon">
                <Download />
              </ItemMedia>
              <ItemContent>
                <ItemTitle>Start download</ItemTitle>
                <ItemDescription>
                  Press{" "}
                  <KbdGroup>
                    <Kbd>⌘/Ctrl</Kbd>
                    <Kbd>Enter</Kbd>
                  </KbdGroup>{" "}
                  in the links box.
                </ItemDescription>
              </ItemContent>
            </Item>
          </ItemGroup>
        </CardContent>
      </Card>
    </Page>
  );
}
