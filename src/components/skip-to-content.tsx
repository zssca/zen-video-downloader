import * as React from "react";

import { cn } from "@/lib/utils";

function SkipToContent({
  href = "#main",
  className,
  children = "Skip to content",
  ...props
}: React.ComponentProps<"a"> & { href?: string }) {
  return (
    <a
      data-slot="skip-to-content"
      href={href}
      className={cn(
        "sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50",
        "bg-background text-foreground rounded-md border px-3 py-2 text-sm shadow-sm",
        "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
        className
      )}
      {...props}
    >
      {children}
    </a>
  );
}

export { SkipToContent };
