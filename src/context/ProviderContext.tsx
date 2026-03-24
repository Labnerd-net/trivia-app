import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import axiosInstance from '../api/axiosInstance';
import { getProvider } from '../api/providers';
import type { Provider } from '../types';

interface ProviderContextValue {
  provider: Provider;
  token: string | null;
  setSelectedProvider: (id: string) => void;
}

const ProviderContext = createContext<ProviderContextValue | null>(null);

export function useProvider(): ProviderContextValue {
  const ctx = useContext(ProviderContext);
  if (!ctx) throw new Error('useProvider must be used within a ProviderProvider');
  return ctx;
}

interface ProviderProviderProps {
  children: React.ReactNode;
}

export function ProviderProvider({ children }: ProviderProviderProps) {
  const [selectedProvider, setSelectedProviderState] = useState<string>('opentdb');
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState<number>(0);

  useEffect(() => {
    const controller = new AbortController();
    let cancelled = false;

    const retrieveToken = async () => {
      try {
        const p = getProvider(selectedProvider);
        if (p.requiresToken) {
          if (!p.tokenUrl) throw new Error(`Provider "${p.id}" requires a token but has no tokenUrl`);
          const response = await axiosInstance.get(p.tokenUrl, { signal: controller.signal });
          if (!cancelled) setToken(response.data.token);
        } else {
          if (!cancelled) setToken(null);
        }
      } catch (err) {
        if (!cancelled && !axios.isCancel(err)) {
          setError('Failed to retrieve Token');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    retrieveToken();

    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [selectedProvider, retryCount]);

  const setSelectedProvider = useCallback((id: string) => {
    setSelectedProviderState(id);
    setLoading(true);
    setError(null);
  }, []);

  const provider = useMemo(() => getProvider(selectedProvider), [selectedProvider]);

  const contextValue = useMemo(
    () => ({ provider, token, setSelectedProvider }),
    [provider, token, setSelectedProvider]
  );

  if (loading) return <div className="tq-status">Loading...</div>;
  if (error) return (
    <div className="tq-status error">
      <div>{error}</div>
      <button className="tq-btn tq-btn-ghost" onClick={() => { setLoading(true); setError(null); setRetryCount(c => c + 1); }}>
        Retry
      </button>
    </div>
  );

  return (
    <ProviderContext.Provider value={contextValue}>
      {children}
    </ProviderContext.Provider>
  );
}
