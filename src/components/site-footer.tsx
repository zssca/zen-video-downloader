import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

export function SiteFooter() {
  return (
    <footer className="pt-2">
      <Separator />
      <div className="flex flex-col gap-3 py-4 text-sm sm:flex-row sm:items-center sm:justify-between">
        <p className="text-muted-foreground leading-relaxed">
          Runs <span className="font-medium">yt-dlp</span> locally. Hosted deployments are a UI
          preview and cannot save to your device.
        </p>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="link" size="sm" asChild className="text-muted-foreground">
            <Link href="/help">Help</Link>
          </Button>
          <Button
            variant="link"
            size="sm"
            asChild
            className="text-muted-foreground"
          >
            <a
              href="https://github.com/zssca/zen-video-downloader"
              target="_blank"
              rel="noreferrer"
            >
              GitHub
            </a>
          </Button>
        </div>
      </div>
    </footer>
  );
}
