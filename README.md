# Zen Video Downloader (Next.js + shadcn/ui)

Local Next.js app (App Router) with a shadcn/ui frontend and Node API routes that run `yt-dlp`.

## Prereqs

- `yt-dlp` available as either:
  - `../.venv/bin/yt-dlp` (recommended: create the venv in the repo root and `pip install -r requirements.txt`), or
  - `yt-dlp` in your PATH (for example via Homebrew)
- `ffmpeg` is optional but recommended for best quality merges.

## Run

```bash
cd web
npm run dev
```

Open `http://localhost:3000`.

## Dev helpers

- `npm run typecheck`
- `npm run lint`
- `npm run check` (lint + typecheck + build)

## Notes

- Folder picker uses `osascript` and only works on macOS.
- If `yt-dlp` isn't found automatically, set `YTDLP_PATH` before running `npm run dev`.
