import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import axios from 'axios';
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

    const retrieveToken = async () => {
      try {
        const p = getProvider(selectedProvider);
        if (p.requiresToken) {
          const tokenData = await p.getToken(controller.signal);
          setToken(tokenData);
        } else {
          setToken(null);
        }
      } catch (err) {
        if (!axios.isCancel(err)) {
          setError('Failed to retrieve Token');
        }
      } finally {
        setLoading(false);
      }
    };

    retrieveToken();

    return () => controller.abort();
  }, [selectedProvider, retryCount]);

  const setSelectedProvider = useCallback((id: string) => {
    setSelectedProviderState(id);
    setLoading(true);
    setError(null);
  }, []);

  const handleRetry = () => {
    setLoading(true);
    setError(null);
    setRetryCount(c => c + 1);
  };

  const provider = useMemo(() => getProvider(selectedProvider), [selectedProvider]);

  const contextValue = useMemo(
    () => ({ provider, token, setSelectedProvider }),
    [provider, token, setSelectedProvider]
  );

  if (loading) return <div className="tq-status">Loading...</div>;
  if (error) return (
    <div className="tq-status error">
      <div>{error}</div>
      <button className="tq-btn tq-btn-ghost" onClick={handleRetry}>
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
