"use client";

import { DownloadCard } from "@/features/downloader/download-card";
import { HostedModeAlert } from "@/features/downloader/hosted-mode-alert";
import { StatusCard } from "@/features/downloader/status-card";
import { useDownloader } from "@/features/downloader/use-downloader";

export function DownloadApp() {
  const d = useDownloader();

  return (
    <>
      {!d.isLocalHost ? <HostedModeAlert /> : null}

      <DownloadCard
        isLocalHost={d.isLocalHost}
        folder={d.folder}
        onFolderChange={d.setFolder}
        chooseFolder={d.chooseFolder}
        picking={d.picking}
        links={d.links}
        onLinksChange={d.setLinks}
        parsed={{ unique: d.parsed.unique, duplicates: d.parsed.duplicates }}
        downloading={d.downloading}
        busy={d.busy}
        startDownload={d.startDownload}
        cancelDownload={d.cancelDownload}
        cleanLinks={d.cleanLinks}
        pasteFromClipboard={d.pasteFromClipboard}
        progress={d.progress}
        progressPercent={d.progressPercent}
      />

      <StatusCard
        statuses={d.statuses}
        busy={d.busy}
        stickToBottom={d.stickToBottom}
        statusScrollAreaId={d.statusScrollAreaId}
        endRef={d.endRef}
        copyStatus={d.copyStatus}
        clearStatus={d.clearStatus}
        jumpToLatest={d.jumpToLatest}
      />
    </>
  );
}
