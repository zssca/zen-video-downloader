import { readJson, writeJson } from "@/lib/storage";

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
    return coerce(readJson(key, defaultValue));
  }

  function getServerSnapshot(): T {
    return defaultValue;
  }

  function set(value: T) {
    writeJson(key, value);
    emit();
  }

  function update(fn: (prev: T) => T) {
    set(fn(getSnapshot()));
  }

  function clear() {
    writeJson(key, defaultValue);
    emit();
  }

  return { subscribe, getSnapshot, getServerSnapshot, set, update, clear };
}
