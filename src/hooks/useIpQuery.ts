import { useState, useCallback, useEffect, useRef } from 'react';
import { IpResult } from '../types';

export type QueryStatus = 'idle' | 'loading' | 'success' | 'error';

export interface IpQueryResult {
  status: QueryStatus;
  data: IpResult | null;
  error: string | null;
  apiName: string | null;
  latency: number | null;
}

const CACHE_KEY_PREFIX = 'ip_show_cache_';
const CACHE_EXPIRE_MS = 5 * 60 * 1000; // 5 minutes

interface CachedData {
  data: IpResult;
  apiName: string;
  timestamp: number;
}

function getCache(type: string): CachedData | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY_PREFIX + type);
    if (!raw) return null;
    const cached: CachedData = JSON.parse(raw);
    if (Date.now() - cached.timestamp > CACHE_EXPIRE_MS) {
      localStorage.removeItem(CACHE_KEY_PREFIX + type);
      return null;
    }
    return cached;
  } catch {
    return null;
  }
}

function setCache(type: string, data: IpResult, apiName: string): void {
  try {
    const cached: CachedData = { data, apiName, timestamp: Date.now() };
    localStorage.setItem(CACHE_KEY_PREFIX + type, JSON.stringify(cached));
  } catch {
    // ignore
  }
}

function clearCache(type?: string): void {
  if (type) {
    localStorage.removeItem(CACHE_KEY_PREFIX + type);
  } else {
    // Clear all
    const keys = Object.keys(localStorage).filter(k => k.startsWith(CACHE_KEY_PREFIX));
    keys.forEach(k => localStorage.removeItem(k));
  }
}

interface UseIpQueryOptions {
  /** 查询类型标识 */
  type: string;
  /** 查询函数 */
  queryFn: () => Promise<{ data: IpResult; apiName: string }>;
  /** 是否自动查询（默认 true） */
  autoFetch?: boolean;
}

export function useIpQuery({ type, queryFn, autoFetch = true }: UseIpQueryOptions) {
  const [result, setResult] = useState<IpQueryResult>(() => {
    // Try to load from cache first
    const cached = getCache(type);
    if (cached) {
      return {
        status: 'success',
        data: cached.data,
        error: null,
        apiName: cached.apiName,
        latency: cached.data.latency || null,
      };
    }
    return {
      status: 'idle',
      data: null,
      error: null,
      apiName: null,
      latency: null,
    };
  });

  const abortRef = useRef<AbortController | null>(null);
  const queryCountRef = useRef(0);

  const query = useCallback(async (forceRefresh = false) => {
    // Check cache first (unless force refresh)
    if (!forceRefresh) {
      const cached = getCache(type);
      if (cached) {
        setResult({
          status: 'success',
          data: cached.data,
          error: null,
          apiName: cached.apiName,
          latency: cached.data.latency || null,
        });
        return;
      }
    }

    // Cancel any in-flight request
    if (abortRef.current) {
      abortRef.current.abort();
    }
    abortRef.current = new AbortController();

    queryCountRef.current++;
    const currentQuery = queryCountRef.current;

    setResult(prev => ({
      ...prev,
      status: 'loading',
      error: null,
    }));

    try {
      const { data, apiName } = await queryFn();

      // Only update if this is still the latest query
      if (currentQuery === queryCountRef.current) {
        setResult({
          status: 'success',
          data,
          error: null,
          apiName,
          latency: data.latency || null,
        });
        setCache(type, data, apiName);
      }
    } catch (err) {
      if (currentQuery === queryCountRef.current) {
        setResult({
          status: 'error',
          data: null,
          error: err instanceof Error ? err.message : '查询失败',
          apiName: null,
          latency: null,
        });
      }
    }
  }, [type, queryFn]);

  const clear = useCallback(() => {
    clearCache(type);
    setResult({
      status: 'idle',
      data: null,
      error: null,
      apiName: null,
      latency: null,
    });
  }, [type]);

  useEffect(() => {
    if (autoFetch) {
      query();
    }
    return () => {
      if (abortRef.current) {
        abortRef.current.abort();
      }
    };
  }, [autoFetch, query]);

  return {
    ...result,
    refetch: (forceRefresh = false) => query(forceRefresh),
    clear,
  };
}

export { clearCache as clearAllCache };
