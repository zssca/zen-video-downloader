import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import "./globals.css";

import { Badge } from "@/components/ui/badge";
import { Sparkles } from "lucide-react";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Zen Video Downloader",
  description: "Local video downloader powered by yt-dlp",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${geistSans.variable} ${geistMono.variable} relative min-h-screen overflow-x-hidden antialiased`}>
        <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(56,189,248,0.18),transparent_55%),radial-gradient(circle_at_bottom_left,rgba(129,140,248,0.12),transparent_60%)]" />
          <div className="absolute inset-0 bg-gradient-to-b from-slate-950 via-slate-950 to-slate-900" />
          <div className="absolute inset-0 opacity-[0.08] [background-image:linear-gradient(to_right,rgba(255,255,255,0.12)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.12)_1px,transparent_1px)] [background-size:64px_64px]" />
        </div>
        <div className="mx-auto flex w-full max-w-2xl flex-col gap-6 px-5 py-14 sm:px-6">
          <header className="flex flex-col items-start justify-between gap-4 border-b border-border pb-4 sm:flex-row sm:items-center">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-sm font-medium tracking-tight text-foreground"
            >
              <Sparkles className="h-4 w-4 text-sky-300" />
              Zen Video Downloader
            </Link>
            <Badge variant="secondary">Local-only</Badge>
          </header>
          <main className="flex flex-col gap-6">{children}</main>
        </div>
      </body>
    </html>
  );
}
