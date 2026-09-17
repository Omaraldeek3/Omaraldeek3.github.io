"use client";
import { useCallback, useSyncExternalStore } from "react";
// Stable snapshots prevent hydration differences. No scroll listeners are mounted
// for effects the current input device/viewport cannot use.
export function useMediaQuery(query: string) {
  const subscribe = useCallback((callback: () => void) => {
    const media = window.matchMedia(query);
    media.addEventListener("change", callback);
    return () => media.removeEventListener("change", callback);
  }, [query]);
  const snapshot = useCallback(() => window.matchMedia(query).matches, [query]);
  return useSyncExternalStore(subscribe, snapshot, () => false);
}
