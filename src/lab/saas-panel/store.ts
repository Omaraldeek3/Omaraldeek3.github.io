"use client";

import { useCallback, useSyncExternalStore } from "react";

/** A value kept in localStorage and shared by every component that reads it.
 *  When storage is blocked (a private window, a strict setting) the value
 *  lives in memory instead, so the panel still works for the visit. */
export type Store<T> = {
  use(): [T, (update: (current: T) => T) => void];
  reset(): void;
  read(): T;
};

const stores: Store<unknown>[] = [];

export function createStore<T>(key: string, seed: () => T): Store<T> {
  const listeners = new Set<() => void>();
  let seeded: T | undefined;
  let memory: T | undefined;
  let cachedRaw: string | null | undefined;
  let cachedValue: T | undefined;

  const initial = () => (seeded ??= seed());

  const read = (): T => {
    if (memory !== undefined) return memory;
    let raw: string | null = null;
    try {
      raw = window.localStorage.getItem(key);
    } catch {
      return initial();
    }
    if (raw === cachedRaw && cachedValue !== undefined) return cachedValue;
    cachedRaw = raw;
    try {
      cachedValue = raw ? (JSON.parse(raw) as T) : initial();
    } catch {
      cachedValue = initial();
    }
    return cachedValue;
  };

  const notify = () => listeners.forEach(listener => listener());

  const write = (next: T) => {
    try {
      window.localStorage.setItem(key, JSON.stringify(next));
    } catch {
      memory = next;
    }
    notify();
  };

  const subscribe = (listener: () => void) => {
    listeners.add(listener);
    const onStorage = (event: StorageEvent) => {
      if (event.key === key) listener();
    };
    window.addEventListener("storage", onStorage);
    return () => {
      listeners.delete(listener);
      window.removeEventListener("storage", onStorage);
    };
  };

  const store: Store<T> = {
    use() {
      const value = useSyncExternalStore(subscribe, read, initial);
      const set = useCallback((update: (current: T) => T) => write(update(read())), []);
      return [value, set];
    },
    reset() {
      memory = undefined;
      seeded = undefined;
      cachedRaw = undefined;
      try {
        window.localStorage.removeItem(key);
      } catch {
        /* nothing stored, nothing to clear */
      }
      notify();
    },
    read,
  };
  stores.push(store as Store<unknown>);
  return store;
}

export function resetAll() {
  for (const store of stores) store.reset();
}

const noop = () => () => {};

/** False on the server and during hydration, true once mounted. The panel's
 *  data is the visitor's own, so it is only ever rendered in their browser. */
export function useMounted() {
  return useSyncExternalStore(noop, () => true, () => false);
}

export function uid() {
  return Math.random().toString(36).slice(2, 10);
}

/** Today at midnight, as YYYY-MM-DD in local time. */
export function isoDay(date = new Date()) {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

export function addDays(day: string, days: number) {
  const [y, m, d] = day.split("-").map(Number);
  return isoDay(new Date(y, m - 1, d + days));
}

export function dayDiff(from: string, to: string) {
  const parse = (day: string) => {
    const [y, m, d] = day.split("-").map(Number);
    return Date.UTC(y, m - 1, d);
  };
  return Math.round((parse(to) - parse(from)) / 86400000);
}
