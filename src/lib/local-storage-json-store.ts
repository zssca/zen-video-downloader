import { writeJson } from "@/lib/storage";

export type JsonStore<T> = {
  subscribe: (listener: () => void) => () => void;
  getSnapshot: () => T;
  getServerSnapshot: () => T;
  set: (value: T) => void;
  update: (fn: (prev: T) => T) => void;
  clear: () => void;
};

export function createLocalStorageJsonStore<T>({
  key,
  defaultValue,
  coerce,
}: {
  key: string;
  defaultValue: T;
  coerce: (input: unknown) => T;
}): JsonStore<T> {
  const eventName = `zvd:store:${key}`;

  // `useSyncExternalStore` expects `getSnapshot()` to return a referentially-stable
  // value as long as the underlying store hasn't changed.
  //
  // If we parse JSON on every call, we'd create a new object/array each render and
  // React would detect it as a changing snapshot, causing an infinite re-render loop
  // (Minified React error #185 / "Maximum update depth exceeded").
  let cachedRaw: string | null | undefined = undefined;
  let cachedSnapshot: T = defaultValue;

  function emit() {
    if (typeof window === "undefined") return;
    window.dispatchEvent(new Event(eventName));
  }

  function subscribe(listener: () => void) {
    if (typeof window === "undefined") return () => {};

    const onStorage = (e: StorageEvent) => {
      if (e.key !== key) return;
      listener();
    };
    const onCustom = () => listener();

    window.addEventListener("storage", onStorage);
    window.addEventListener(eventName, onCustom);

    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener(eventName, onCustom);
    };
  }

  function getSnapshot(): T {
    if (typeof window === "undefined") return defaultValue;

    let raw: string | null;
    try {
      raw = localStorage.getItem(key);
    } catch {
      // If localStorage is unavailable (privacy mode, blocked, etc.), fall back
      // to the cached snapshot for stability.
      return cachedRaw === undefined ? defaultValue : cachedSnapshot;
    }

    if (raw === cachedRaw) return cachedSnapshot;

    cachedRaw = raw;
    if (!raw) {
      cachedSnapshot = coerce(defaultValue);
      return cachedSnapshot;
    }

    try {
      cachedSnapshot = coerce(JSON.parse(raw));
    } catch {
      cachedSnapshot = coerce(defaultValue);
    }
    return cachedSnapshot;
  }

  function getServerSnapshot(): T {
    return defaultValue;
  }

  function set(value: T) {
    // Ensure cache is updated before emitting so subscribers see a stable snapshot
    // immediately after the notification.
    const next = coerce(value);
    cachedSnapshot = next;
    try {
      cachedRaw = JSON.stringify(next);
    } catch {
      cachedRaw = null;
    }

    writeJson(key, next);
    emit();
  }

  function update(fn: (prev: T) => T) {
    set(fn(getSnapshot()));
  }

  function clear() {
    set(defaultValue);
  }

  return { subscribe, getSnapshot, getServerSnapshot, set, update, clear };
}
