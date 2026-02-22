import Navbar from './components/Navbar'
import Menu from './pages/Menu'
import Quiz from './pages/Quiz'
import { Routes, Route } from "react-router";
import { useState, useEffect } from 'react';
import { getProvider } from './api/providers';
import type { Category } from './types';

export default function App() {
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [category, setCategory] = useState<Category | null>(null);
  const [selectedProvider, setSelectedProvider] = useState<string>('opentdb');
  const [retryCount, setRetryCount] = useState<number>(0);

  useEffect(() => {
    const controller = new AbortController();

    const retrieveToken = async () => {
      try {
        const provider = getProvider(selectedProvider);

        if (provider.requiresToken) {
          const tokenData = await provider.getToken();
          setToken(tokenData);
        } else {
          setToken(null);
        }
      } catch (err) {
        if ((err as { name?: string }).name !== 'CanceledError') {
          setError('Failed to retrieve Token');
        }
      } finally {
        setLoading(false);
      }
    };

    retrieveToken();

    return () => controller.abort();
  }, [selectedProvider, retryCount]);

  const selectedCategory = (cat: Category) => {
    setCategory(cat);
  };

  const handleProviderChange = (providerId: string) => {
    setSelectedProvider(providerId);
    setLoading(true);
    setError(null);
  };

  const retryTokenFetch = () => {
    setLoading(true);
    setError(null);
    setRetryCount(c => c + 1);
  };

  if (loading) return <div className="tq-status">Loading...</div>;
  if (error) return (
    <div className="tq-status error">
      <div>{error}</div>
      <button className="tq-btn tq-btn-ghost" onClick={retryTokenFetch}>
        Retry
      </button>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh' }}>
      <Navbar />
      <Routes>
        <Route path="/" element={
          <Menu
            setCategory={selectedCategory}
            provider={selectedProvider}
            onProviderChange={handleProviderChange}
          />
        } />
        <Route path="/quiz/:categoryID/:difficulty/:type/" element={
          <Quiz
            token={token}
            category={category}
            provider={selectedProvider}
          />
        } />
      </Routes>
    </div>
  )
}
