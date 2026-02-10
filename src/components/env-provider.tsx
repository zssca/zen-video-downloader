"use client";

import type { ReactNode } from "react";
import { createContext, useContext } from "react";

export type AppEnv = {
  host: string;
  isLocalHost: boolean;
};

const EnvContext = createContext<AppEnv | null>(null);

export function EnvProvider({
  env,
  children,
}: {
  env: AppEnv;
  children: ReactNode;
}) {
  return <EnvContext.Provider value={env}>{children}</EnvContext.Provider>;
}

export function useEnv(): AppEnv {
  const v = useContext(EnvContext);
  if (!v) {
    throw new Error("useEnv must be used within EnvProvider");
  }
  return v;
}
