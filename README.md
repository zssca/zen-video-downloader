# Zen Video Downloader (Next.js + shadcn/ui)

Local Next.js app (App Router) with a shadcn/ui frontend and Node API routes that run `yt-dlp`.

## Prereqs

- `yt-dlp` available as either:
  - `./.venv/bin/yt-dlp` (recommended: `python -m venv .venv && .venv/bin/pip install yt-dlp`), or
  - `yt-dlp` in your PATH (for example via Homebrew), or
  - set `YTDLP_PATH` to the full executable path
- `ffmpeg` is optional but recommended for best quality merges (for example via Homebrew).

## Run

```bash
cd web
npm run dev
```

Open `http://localhost:3000`.

## Pages

- `/` Downloader UI
- `/history` Saved download sessions (stored in your browser)
- `/settings` Preferences (stored in your browser)
- `/help` Setup + FAQ

## API

- `GET /api/health` Basic diagnostics for `yt-dlp` and `ffmpeg`.
- `POST /api/download` Run `yt-dlp` for one or more URLs (intended for local-only usage).
- `POST /api/select-folder` macOS-only folder picker (uses `osascript`).

## Dev helpers

- `npm run typecheck`
- `npm run lint`
- `npm run check` (lint + typecheck + build)

## Notes

- Hosted deployments (Vercel) are treated as a UI preview and disable downloads by default.
- Folder picker uses `osascript` and only works on macOS.
- If `yt-dlp` isn't found automatically, set `YTDLP_PATH` before running `npm run dev`.
