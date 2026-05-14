'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

// ── In-memory cache with TTL ────────────────────────────────────────────────
interface CacheEntry<T> {
  data: T;
  timestamp: number;
  promise?: Promise<T>;
}

const cache = new Map<string, CacheEntry<any>>();
const DEFAULT_TTL = 60_000; // 1 minute
const inflight = new Map<string, Promise<any>>();

// Self-heal: even if a fetcher promise never resolves (backend hang, dropped
// connection), force-clear it from inflight after this long so later callers
// can retry instead of awaiting a dead promise forever.
const INFLIGHT_TIMEOUT_MS = 30_000;
// When a piggy-back caller awaits an existing inflight promise, cap how long
// it will wait so a stuck inflight entry can never freeze the whole UI.
const INFLIGHT_WAIT_TIMEOUT_MS = 25_000;

function withTimeout<T>(p: Promise<T>, ms: number, label: string): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error(`${label} timeout after ${ms}ms`)), ms);
    p.then(
      (v) => { clearTimeout(timer); resolve(v); },
      (e) => { clearTimeout(timer); reject(e); },
    );
  });
}

function getCacheKey(key: string | string[]): string {
  return Array.isArray(key) ? key.join(':') : key;
}

// ── Hook Options ────────────────────────────────────────────────────────────
interface UseApiDataOptions<T> {
  /** Cache key — string or array of strings */
  key: string | string[];
  /** Async function that fetches data */
  fetcher: () => Promise<T>;
  /** Cache TTL in ms (default: 60s) */
  ttl?: number;
  /** Don't auto-fetch on mount */
  manual?: boolean;
  /** Dependencies that trigger re-fetch */
  deps?: any[];
  /** Initial/fallback data */
  initialData?: T;
  /** Skip fetching when condition is false */
  enabled?: boolean;
}

interface UseApiDataReturn<T> {
  data: T | undefined;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  mutate: (newData: T | ((prev: T | undefined) => T)) => void;
}

// ── Main Hook ───────────────────────────────────────────────────────────────
export function useApiData<T>(options: UseApiDataOptions<T>): UseApiDataReturn<T> {
  const {
    key,
    fetcher,
    ttl = DEFAULT_TTL,
    manual = false,
    deps = [],
    initialData,
    enabled = true,
  } = options;

  const cacheKey = getCacheKey(key);
  const mountedRef = useRef(true);

  // Check cache for initial state
  const cached = cache.get(cacheKey);
  const isFresh = cached && Date.now() - cached.timestamp < ttl;

  const [data, setData] = useState<T | undefined>(
    isFresh ? cached.data : initialData
  );
  const [loading, setLoading] = useState(!isFresh && !manual && enabled);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!mountedRef.current) return;

    // Deduplicate concurrent requests to the same key, but cap how long we
    // wait so a stuck inflight entry can't freeze the UI forever.
    const existing = inflight.get(cacheKey);
    if (existing) {
      try {
        const result = await withTimeout(existing, INFLIGHT_WAIT_TIMEOUT_MS, `inflight:${cacheKey}`);
        if (mountedRef.current) {
          setData(result);
          setLoading(false);
          setError(null);
        }
      } catch (err: any) {
        // If the piggy-backed promise timed out / failed, clear it so the next
        // attempt can fire a fresh fetch instead of stacking on a dead promise.
        if (inflight.get(cacheKey) === existing) {
          inflight.delete(cacheKey);
        }
        if (mountedRef.current) {
          setError(err?.message || 'Fetch failed');
          setLoading(false);
        }
      }
      return;
    }

    setLoading(true);
    setError(null);

    const promise = fetcher();
    inflight.set(cacheKey, promise);

    // Safety net: if the fetcher promise never settles, force-clear inflight
    // after this long so later callers don't permanently piggy-back on it.
    const heal = setTimeout(() => {
      if (inflight.get(cacheKey) === promise) {
        inflight.delete(cacheKey);
      }
    }, INFLIGHT_TIMEOUT_MS);

    try {
      const result = await promise;
      cache.set(cacheKey, { data: result, timestamp: Date.now() });

      if (mountedRef.current) {
        setData(result);
        setError(null);
      }
    } catch (err: any) {
      if (mountedRef.current) {
        setError(err?.message || 'Fetch failed');
      }
    } finally {
      clearTimeout(heal);
      if (inflight.get(cacheKey) === promise) {
        inflight.delete(cacheKey);
      }
      if (mountedRef.current) {
        setLoading(false);
      }
    }
  }, [cacheKey, fetcher, ...deps]);

  // Auto-fetch on mount
  useEffect(() => {
    mountedRef.current = true;
    if (!manual && enabled) {
      // Stale-while-revalidate: show cached data, refetch in background
      if (isFresh) {
        setLoading(false);
      } else {
        fetchData();
      }
    }
    return () => {
      mountedRef.current = false;
    };
  }, [cacheKey, manual, enabled]);

  // Re-fetch when deps change
  useEffect(() => {
    if (!manual && enabled && deps.length > 0) {
      fetchData();
    }
  }, deps);

  const mutate = useCallback(
    (newData: T | ((prev: T | undefined) => T)) => {
      const resolved =
        typeof newData === 'function'
          ? (newData as (prev: T | undefined) => T)(data)
          : newData;
      setData(resolved);
      cache.set(cacheKey, { data: resolved, timestamp: Date.now() });
    },
    [cacheKey, data]
  );

  return { data, loading, error, refetch: fetchData, mutate };
}

// ── Paginated Hook ──────────────────────────────────────────────────────────
interface PaginatedResponse<T> {
  items: T[];
  total: number;
}

interface UsePaginatedDataOptions<T> {
  key: string | string[];
  fetcher: (limit: number, offset: number) => Promise<{ items: T[]; total: number }>;
  pageSize?: number;
  enabled?: boolean;
}

interface UsePaginatedDataReturn<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  loading: boolean;
  error: string | null;
  goToPage: (page: number) => void;
  refetch: () => void;
}

export function usePaginatedData<T>(
  options: UsePaginatedDataOptions<T>
): UsePaginatedDataReturn<T> {
  const { key, fetcher, pageSize = 20, enabled = true } = options;
  const [page, setPage] = useState(1);
  const offset = (page - 1) * pageSize;

  const { data, loading, error, refetch } = useApiData<PaginatedResponse<T>>({
    key: [...(Array.isArray(key) ? key : [key]), String(page), String(pageSize)],
    fetcher: () => fetcher(pageSize, offset),
    enabled,
    deps: [page, pageSize],
  });

  const goToPage = useCallback(
    (p: number) => {
      const maxPage = data ? Math.ceil(data.total / pageSize) : 1;
      setPage(Math.max(1, Math.min(p, maxPage)));
    },
    [data, pageSize]
  );

  return {
    data: data?.items || [],
    total: data?.total || 0,
    page,
    pageSize,
    totalPages: data ? Math.ceil(data.total / pageSize) : 0,
    loading,
    error,
    goToPage,
    refetch,
  };
}

// ── Cache utilities ─────────────────────────────────────────────────────────
export function invalidateCache(keyPrefix: string) {
  for (const k of cache.keys()) {
    if (k.startsWith(keyPrefix)) {
      cache.delete(k);
    }
  }
}

export function clearAllCache() {
  cache.clear();
}
