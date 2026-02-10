"use client";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";

export function HostedModeAlert() {
  return (
    <Alert variant="destructive">
      <AlertTriangle className="h-4 w-4" />
      <AlertTitle>Hosted mode: downloads disabled</AlertTitle>
      <AlertDescription>
        <p>
          This app runs <span className="font-medium">yt-dlp</span> on the server and saves to
          the server filesystem. It only works when you run it locally.
        </p>
        <p>
          Run <span className="font-medium">npm run dev</span> and open{" "}
          <span className="font-medium">http://localhost:3000</span>.
        </p>
      </AlertDescription>
    </Alert>
  );
}
