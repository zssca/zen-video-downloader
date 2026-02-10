import * as React from "react";

import { cn } from "@/lib/utils";

function Page({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div data-slot="page" className={cn("flex flex-col gap-6", className)} {...props} />
  );
}

function PageHeader({ className, ...props }: React.ComponentProps<"header">) {
  return (
    <header
      data-slot="page-header"
      className={cn(
        "flex flex-col gap-3 border-b border-border pb-4 sm:flex-row sm:items-end sm:justify-between",
        className
      )}
      {...props}
    />
  );
}

function PageHeaderText({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div data-slot="page-header-text" className={cn("min-w-0", className)} {...props} />
  );
}

function PageTitle({ className, ...props }: React.ComponentProps<"h1">) {
  return (
    <h1
      data-slot="page-title"
      className={cn(
        "scroll-m-20 text-2xl font-semibold tracking-tight text-balance",
        className
      )}
      {...props}
    />
  );
}

function PageDescription({ className, ...props }: React.ComponentProps<"p">) {
  return (
    <p
      data-slot="page-description"
      className={cn(
        "text-muted-foreground mt-1 max-w-prose text-sm leading-relaxed text-pretty",
        className
      )}
      {...props}
    />
  );
}

function PageActions({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="page-actions"
      className={cn("flex shrink-0 flex-wrap items-center gap-2", className)}
      {...props}
    />
  );
}

export {
  Page,
  PageHeader,
  PageHeaderText,
  PageTitle,
  PageDescription,
  PageActions,
};
