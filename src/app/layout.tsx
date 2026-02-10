import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { headers } from "next/headers";
import "./globals.css";

import { EnvProvider } from "@/components/env-provider";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { SkipToContent } from "@/components/skip-to-content";
import { Toaster } from "@/components/ui/sonner";
import { SettingsProvider } from "@/features/settings/settings-provider";
import { getRequestHost, isLocalHost } from "@/lib/env";

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

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const host = getRequestHost(await headers());
  const env = { host, isLocalHost: isLocalHost(host) };

  return (
    <html lang="en" className="dark">
      <body className={`${geistSans.variable} ${geistMono.variable} relative min-h-screen overflow-x-hidden antialiased`}>
        <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(56,189,248,0.18),transparent_55%),radial-gradient(circle_at_bottom_left,rgba(129,140,248,0.12),transparent_60%)]" />
          <div className="absolute inset-0 bg-gradient-to-b from-slate-950 via-slate-950 to-slate-900" />
          <div className="absolute inset-0 opacity-[0.08] [background-image:linear-gradient(to_right,rgba(255,255,255,0.12)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.12)_1px,transparent_1px)] [background-size:64px_64px]" />
        </div>
        <EnvProvider env={env}>
          <SettingsProvider>
            <SkipToContent />
            <div className="mx-auto flex w-full max-w-2xl flex-col gap-6 px-5 py-14 sm:px-6">
              <SiteHeader />
              <main id="main" className="flex flex-col gap-6">
                {children}
              </main>
              <SiteFooter />
            </div>
            <Toaster />
          </SettingsProvider>
        </EnvProvider>
      </body>
    </html>
  );
}
