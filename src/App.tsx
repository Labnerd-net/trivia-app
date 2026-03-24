import Navbar from './components/Navbar'
import ErrorBoundary from './components/ErrorBoundary'
import Menu from './pages/Menu'
import Quiz from './pages/Quiz'
import { Routes, Route } from "react-router";
import { ProviderProvider } from './context/ProviderContext';

export default function App() {
  return (
    <ProviderProvider>
      <div className="tq-root">
        <Navbar />
        <ErrorBoundary>
          <Routes>
            <Route path="/" element={<Menu />} />
            <Route path="/quiz/:categoryID/:difficulty/:type/" element={<Quiz />} />
          </Routes>
        </ErrorBoundary>
      </div>
    </ProviderProvider>
  )
}
