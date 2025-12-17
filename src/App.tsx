import { Routes, Route, Link, useLocation } from 'react-router-dom';
import HomePage from './pages/HomePage';
import LibraryPage from './pages/LibraryPage';
import PlayerPage from './pages/PlayerPage';
import { Headphones, Github } from 'lucide-react';
import { LanguageSwitcher } from './components/LanguageSwitcher';
import pkg from '../package.json';

function App() {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-indigo-500/30">
      {/* Header */}
      <header className="fixed top-0 w-full z-50 bg-black/80 backdrop-blur-md border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-2 cursor-pointer">
            <div className="bg-indigo-600 p-2 rounded-lg">
              <Headphones className="w-5 h-5 text-white" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-zinc-400">
                Singlue
              </span>
              <span className="text-xs text-zinc-600 font-mono">v{pkg.version}</span>
            </div>
          </Link>

          <div className="flex items-center gap-6">
            {location.pathname !== '/library' && (
              <Link to="/library" className="text-sm font-medium text-zinc-400 hover:text-white transition-colors">
                History
              </Link>
            )}
            <LanguageSwitcher />
            <a href="https://github.com" target="_blank" rel="noreferrer" className="text-zinc-500 hover:text-white transition-colors">
              <Github className="w-5 h-5" />
            </a>
          </div>
        </div>
      </header>

      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/library" element={<LibraryPage />} />
        <Route path="/watch/:id" element={<PlayerPage />} />
      </Routes>
    </div>
  );
}

export default App;
