"use client";

import { useState, useCallback, useRef, useLayoutEffect } from "react";

/**
 * Persists state to localStorage and syncs on mount.
 * Returns [value, setValue, clearValue].
 *
 * SSR-safe: initialValue is used on the server and first render.
 * useLayoutEffect (client-only) hydrates from localStorage before paint,
 * avoiding a visible flash of stale state.
 */
export function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, (value: T | ((prev: T) => T)) => void, () => void] {
  const [storedValue, setStoredValue] = useState<T>(initialValue);

  // Track whether we've hydrated from localStorage yet
  const hydratedRef = useRef(false);

  // useLayoutEffect only runs on the client, so this is SSR-safe.
  // It runs synchronously before paint, preventing a hydration flash.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useLayoutEffect(() => {
    if (hydratedRef.current) return;
    hydratedRef.current = true;
    try {
      const item = window.localStorage.getItem(key);
      if (item !== null) {
        // Direct call is intentional here: we want to sync localStorage
        // into React state exactly once on mount, before first paint.
        setStoredValue(JSON.parse(item) as T); // eslint-disable-line react-hooks/set-state-in-effect
      }
    } catch {
      // localStorage unavailable (private browsing, quota, etc.) — fall back silently
    }
  });

  const setValue = useCallback(
    (value: T | ((prev: T) => T)) => {
      setStoredValue((prev) => {
        const next = value instanceof Function ? value(prev) : value;
        try {
          window.localStorage.setItem(key, JSON.stringify(next));
        } catch {
          // Quota exceeded or unavailable — state still updates in memory
        }
        return next;
      });
    },
    [key]
  );

  const clearValue = useCallback(() => {
    setStoredValue(initialValue);
    try {
      window.localStorage.removeItem(key);
    } catch {
      // ignore
    }
  }, [key, initialValue]);

  return [storedValue, setValue, clearValue];
}
