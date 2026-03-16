import Navbar from './components/Navbar'
import ErrorBoundary from './components/ErrorBoundary'
import Menu from './pages/Menu'
import Quiz from './pages/Quiz'
import { Routes, Route } from "react-router";
import { useState } from 'react';
import { ProviderProvider } from './context/ProviderContext';
import type { Category } from './types';

export default function App() {
  const [category, setCategory] = useState<Category | null>(null);

  const selectedCategory = (cat: Category) => {
    setCategory(cat);
  };

  return (
    <ProviderProvider>
      <div style={{ minHeight: '100vh' }}>
        <Navbar />
        <ErrorBoundary>
          <Routes>
            <Route path="/" element={
              <Menu setCategory={selectedCategory} />
            } />
            <Route path="/quiz/:categoryID/:difficulty/:type/" element={
              <Quiz category={category} />
            } />
          </Routes>
        </ErrorBoundary>
      </div>
    </ProviderProvider>
  )
}
