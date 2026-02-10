export type StatusType = "info" | "success" | "error";
export type StatusItem = { id: string; type: StatusType; text: string; at: number };

export type DownloadApiResult =
  | { url: string; status: "success"; title?: string }
  | { url: string; status: "failed"; error: string };

export type DownloadApiResponse =
  | {
      status: "success";
      results: DownloadApiResult[];
      download_folder: string;
      ffmpeg: boolean;
    }
  | { status: "error"; message: string };

export type DownloadProgress = { done: number; total: number };
