"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { useEnv } from "@/components/env-provider";
import { Badge } from "@/components/ui/badge";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { CloudOff, Laptop, Sparkles } from "lucide-react";

const navItems = [
  { href: "/", label: "Download" },
  { href: "/history", label: "History" },
  { href: "/settings", label: "Settings" },
  { href: "/help", label: "Help" },
] as const;

function isActivePath(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function SiteHeader() {
  const pathname = usePathname();
  const { host, isLocalHost } = useEnv();

  return (
    <TooltipProvider delayDuration={150}>
      <header className="flex flex-col items-start justify-between gap-4 border-b border-border pb-4 sm:flex-row sm:items-center">
        <div className="flex min-w-0 items-center gap-2">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-medium tracking-tight text-foreground"
          >
            <Sparkles className="h-4 w-4 text-sky-300" />
            <span className="truncate">Zen Video Downloader</span>
          </Link>

          <Tooltip>
            <TooltipTrigger asChild>
              <Badge variant={isLocalHost ? "secondary" : "destructive"} className="ml-2">
                {isLocalHost ? <Laptop /> : <CloudOff />}
                {isLocalHost ? "Local" : "Hosted preview"}
              </Badge>
            </TooltipTrigger>
            <TooltipContent sideOffset={8}>
              <div className="max-w-[22rem]">
                <div className="font-medium">Host</div>
                <div className="text-muted-foreground">{host || "(unknown)"}</div>
              </div>
            </TooltipContent>
          </Tooltip>
        </div>

        <nav aria-label="Primary" className="w-full sm:w-auto">
          <NavigationMenu viewport={false} className="w-full justify-start sm:justify-end">
            <NavigationMenuList className="flex w-full flex-wrap justify-start gap-1 sm:justify-end">
              {navItems.map((item) => {
                const active = isActivePath(pathname, item.href);
                return (
                  <NavigationMenuItem key={item.href}>
                    <NavigationMenuLink asChild>
                      <Link
                        href={item.href}
                        aria-current={active ? "page" : undefined}
                        className={cn(
                          navigationMenuTriggerStyle(),
                          "h-8 px-3",
                          active && "bg-accent text-accent-foreground"
                        )}
                      >
                        {item.label}
                      </Link>
                    </NavigationMenuLink>
                  </NavigationMenuItem>
                );
              })}
            </NavigationMenuList>
          </NavigationMenu>
        </nav>
      </header>
    </TooltipProvider>
  );
}
