export type DownloadResultItem = {
  url: string;
  status: "success" | "failed";
  title?: string;
  error?: string;
};

export type DownloadSession = {
  id: string;
  startedAt: number;
  finishedAt: number;
  folder: string;
  ffmpeg: boolean;
  results: DownloadResultItem[];
};
