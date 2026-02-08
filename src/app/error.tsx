"use client";

import { useEffect } from "react";

import Link from "next/link";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import {
  Empty,
  EmptyContent,
  EmptyDescription as EmptyHelp,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { AlertTriangle } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Surface client-side errors in the console for local debugging.
    // Next will show a dev overlay too, but this keeps it explicit.
    console.error(error);
  }, [error]);

  return (
    <Empty className="min-h-[420px]">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <AlertTriangle />
        </EmptyMedia>
        <EmptyTitle>Something went wrong</EmptyTitle>
        <EmptyHelp>
          The app hit an unexpected error. You can retry or return home.
        </EmptyHelp>
      </EmptyHeader>
      <EmptyContent>
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            <div className="break-words">{error.message || "Unknown error"}</div>
            {error.digest ? (
              <div className="mt-1 text-xs text-muted-foreground">
                Digest: {error.digest}
              </div>
            ) : null}
          </AlertDescription>
        </Alert>

        <ButtonGroup>
          <Button type="button" onClick={() => reset()}>
            Try again
          </Button>
          <Button type="button" variant="outline" asChild>
            <Link href="/">Go home</Link>
          </Button>
        </ButtonGroup>
      </EmptyContent>
    </Empty>
  );
}
