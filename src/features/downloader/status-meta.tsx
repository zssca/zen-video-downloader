import type { ReactNode } from "react";
import { AlertTriangle, CircleCheck, Info } from "lucide-react";

import type { StatusType } from "./types";

export function statusMeta(type: StatusType): { label: string; icon: ReactNode } {
  switch (type) {
    case "success":
      return {
        label: "Success",
        icon: <CircleCheck className="text-emerald-500" />,
      };
    case "error":
      return {
        label: "Error",
        icon: <AlertTriangle className="text-destructive" />,
      };
    default:
      return {
        label: "Info",
        icon: <Info className="text-muted-foreground" />,
      };
  }
}
