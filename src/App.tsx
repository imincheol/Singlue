import { Routes, Route, Link, useLocation, Navigate } from 'react-router-dom';
import React from 'react';
import HomePage from './pages/HomePage';
import LibraryPage from './pages/LibraryPage';
import PlayerPage from './pages/PlayerPage';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';

import AdminDashboard from './pages/admin/AdminDashboard';
import { Headphones, Loader2 } from 'lucide-react';
import { LanguageSwitcher } from './components/LanguageSwitcher';
import { ThemeToggle } from './components/ThemeToggle';
import pkg from '../package.json';
import { useAuth } from './contexts/AuthContext';

// Simple Protected Route Component
const ProtectedRoute = ({ children, requireAdmin = false }: { children: React.ReactNode, requireAdmin?: boolean }) => {
  const { user, profile, isLoading, isAdmin, isApproved } = useAuth();

  if (isLoading) return <div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin" /></div>;

  if (!user) return <Navigate to="/login" replace />;

  if (!isApproved && !isAdmin) return <Navigate to="/" replace />;

  if (requireAdmin && !isAdmin) return <Navigate to="/" replace />;

  return children;
};

function App() {
  const location = useLocation();
  const { user, profile, isAdmin, isApproved, isLoading } = useAuth();


  return (
    <div className="min-h-screen bg-white dark:bg-black text-zinc-900 dark:text-white font-sans selection:bg-indigo-500/30">
      {/* Header */}
      <header className="fixed top-0 w-full z-50 bg-white/80 dark:bg-black/80 backdrop-blur-md border-b border-zinc-200 dark:border-white/5">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-2 cursor-pointer">
            <div className="bg-indigo-600 p-2 rounded-lg">
              <Headphones className="w-5 h-5 text-white" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-zinc-900 to-zinc-500 dark:from-white dark:to-zinc-400">
                Singlue
              </span>
              <span className="text-xs text-zinc-600 dark:text-zinc-600 font-mono">v{pkg.version}</span>
            </div>
          </Link>

          <div className="flex items-center gap-6">
            {location.pathname !== '/library' && user && isApproved && (
              <Link to="/library" className="text-sm font-medium text-zinc-700 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors">
                Library
              </Link>
            )}

            {isAdmin && (
              <Link to="/admin" className="text-sm font-medium text-zinc-700 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors">
                Admin
              </Link>
            )}

            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin text-zinc-500" />
            ) : (!user || (!isApproved && !isAdmin)) ? (
              <Link to="/login" className="text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 transition-colors">
                Sign In
              </Link>
            ) : (
              <div className="text-sm text-zinc-500 font-medium">
                {profile?.nickname || user.email?.split('@')[0] || 'User'}
              </div>
            )}

            <LanguageSwitcher />
            <ThemeToggle />
          </div>
        </div>
      </header>

      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        <Route path="/library" element={<LibraryPage />} />

        <Route path="/admin" element={
          <ProtectedRoute requireAdmin>
            <AdminDashboard />
          </ProtectedRoute>
        } />

        <Route path="/watch/:id" element={<PlayerPage />} />
      </Routes>
    </div>
  );
}

export default App;
