import { DownloadApp } from "@/components/download-app";
import Link from "next/link";

import {
  Page,
  PageActions,
  PageDescription,
  PageHeader,
  PageHeaderText,
  PageTitle,
} from "@/components/page";
import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";

export default function Home() {
  return (
    <Page>
      <PageHeader>
        <PageHeaderText>
          <PageTitle>Downloader</PageTitle>
          <PageDescription>
            Paste links, choose a folder, and download with{" "}
            <span className="font-medium">yt-dlp</span>. Leave the folder blank
            to use <span className="font-medium">~/Downloads</span>.
          </PageDescription>
        </PageHeaderText>
        <PageActions>
          <ButtonGroup>
            <Button variant="outline" asChild>
              <Link href="/help">Help</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/settings">Settings</Link>
            </Button>
          </ButtonGroup>
        </PageActions>
      </PageHeader>

      <DownloadApp />
    </Page>
  );
}
