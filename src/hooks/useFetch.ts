import { useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';

interface UseFetchResult<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  retry: () => void;
}

export function useFetch<T>(
  fetchFn: (signal: AbortSignal) => Promise<T>,
  errorMessage: string
): UseFetchResult<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const errorMessageRef = useRef(errorMessage);
  errorMessageRef.current = errorMessage;

  const retry = useCallback(() => setRetryCount(c => c + 1), []);

  useEffect(() => {
    const controller = new AbortController();
    let cancelled = false;

    setLoading(true);
    setError(null);

    fetchFn(controller.signal)
      .then(result => {
        if (!cancelled) {
          setData(result);
          setError(null);
        }
      })
      .catch(err => {
        if (!cancelled && !axios.isCancel(err)) {
          setError(errorMessageRef.current);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [fetchFn, retryCount]);

  return { data, loading, error, retry };
}
