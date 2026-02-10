export type AppSettings = {
  rememberFolder: boolean;
  rememberLinks: boolean;
  autoFollowLog: boolean;
  showToasts: boolean;
  maxHistorySessions: number;
};

export const DEFAULT_SETTINGS: AppSettings = {
  rememberFolder: true,
  rememberLinks: true,
  autoFollowLog: true,
  showToasts: true,
  maxHistorySessions: 30,
};
