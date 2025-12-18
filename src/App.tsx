import { Routes, Route, Link, useLocation, Navigate } from 'react-router-dom';
import React from 'react';
import HomePage from './pages/HomePage';
import LibraryPage from './pages/LibraryPage';
import PlayerPage from './pages/PlayerPage';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';

import AdminDashboard from './pages/admin/AdminDashboard';
import SettingsPage from './pages/SettingsPage';
import NotFoundPage from './pages/NotFoundPage';
import { Headphones, Loader2, Settings as SettingsIcon, LogOut, ChevronDown } from 'lucide-react';
import { LanguageSwitcher } from './components/LanguageSwitcher';
import { ThemeToggle } from './components/ThemeToggle';
import { useTranslation } from 'react-i18next';
import { useState, useRef, useEffect } from 'react';
import pkg from '../package.json';
import { useAuth } from './contexts/AuthContext';

// Simple Protected Route Component
const ProtectedRoute = ({ children, requireAdmin = false }: { children: React.ReactNode, requireAdmin?: boolean }) => {
  const { user, isLoading, isAdmin } = useAuth(); // removed isApproved which is unused

  if (isLoading) return <div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin" /></div>;

  if (!user) return <Navigate to="/login" replace />;

  if (requireAdmin && !isAdmin) return <Navigate to="/" replace />;

  return children;
};

const UserDropdown = ({ user, profile, signOut }: { user: any, profile: any, signOut: () => void }) => {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white transition-colors"
      >
        <span>{profile?.nickname || user.email?.split('@')[0] || 'User'}</span>
        <ChevronDown className="w-4 h-4" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg shadow-lg py-1 z-50">
          <div className="px-4 py-2 border-b border-zinc-100 dark:border-zinc-800">
            <p className="text-xs text-zinc-500 dark:text-zinc-400 truncate">{user.email}</p>
          </div>

          <Link
            to="/settings"
            onClick={() => setIsOpen(false)}
            className="flex items-center gap-2 px-4 py-2 text-sm text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800"
          >
            <SettingsIcon className="w-4 h-4" />
            {t('nav.settings')}
          </Link>

          <div className="border-t border-zinc-100 dark:border-zinc-800 mt-1">
            <button
              onClick={() => {
                setIsOpen(false);
                signOut();
              }}
              className="flex w-full items-center gap-2 px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-left"
            >
              <LogOut className="w-4 h-4" />
              {t('nav.signout')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

function App() {
  const { t } = useTranslation();
  const location = useLocation();
  const { user, profile, isAdmin, isLoading } = useAuth();


  return (
    <div className="min-h-screen bg-white dark:bg-black text-zinc-900 dark:text-white font-sans selection:bg-indigo-500/30">
      {/* Header */}
      <header className="w-full z-50 bg-white/80 dark:bg-black/80 backdrop-blur-md border-b border-zinc-200 dark:border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-2 cursor-pointer">
            <div className="bg-indigo-600 p-2 rounded-lg">
              <Headphones className="w-5 h-5 text-white" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-zinc-900 to-zinc-500 dark:from-white dark:to-zinc-400">
                Singlue
              </span>
              <span className="hidden sm:inline text-xs text-zinc-600 dark:text-zinc-600 font-mono">v{pkg.version}</span>
            </div>
          </Link>

          <div className="flex items-center gap-3 sm:gap-6">
            <Link
              to="/library"
              className={`text-sm font-medium transition-colors ${location.pathname === '/library'
                ? 'text-indigo-600 dark:text-indigo-400'
                : 'text-zinc-700 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
                }`}
            >
              {t('nav.library')}
            </Link>

            {isAdmin && (
              <Link to="/admin" className="text-sm font-medium text-zinc-700 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors">
                {t('nav.admin')}
              </Link>
            )}

            <LanguageSwitcher />

            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin text-zinc-500" />
            ) : (!user) ? (
              <Link to="/login" className="text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 transition-colors">
                {t('nav.signin')}
              </Link>
            ) : (
              <UserDropdown user={user} profile={profile} signOut={useAuth().signOut} />
            )}

            <ThemeToggle />
          </div>
        </div>
      </header>

      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        <Route path="/library" element={<LibraryPage />} />
        <Route path="/settings" element={
          <ProtectedRoute>
            <SettingsPage />
          </ProtectedRoute>
        } />

        <Route path="/admin" element={
          <ProtectedRoute requireAdmin>
            <AdminDashboard />
          </ProtectedRoute>
        } />

        <Route path="/watch/:id" element={<PlayerPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </div>
  );
}

export default App;
