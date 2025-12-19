import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Menu, X, Settings as SettingsIcon, LogOut, Headphones } from 'lucide-react';
import { LanguageSwitcher } from './LanguageSwitcher';
import { ThemeToggle } from './ThemeToggle';

// I will assume there is no lib/utils yet based on previous file lists, so I will stick to standard template literals or inline logic.
// Package.json has tailwind-merge and clsx.

interface MobileMenuProps {
    user: any;
    profile: any;
    isAdmin: boolean;
    isLoading: boolean;
    signOut: () => void;
}

export const MobileMenu: React.FC<MobileMenuProps> = ({ user, profile, isAdmin, isLoading, signOut }) => {
    const { t } = useTranslation();
    const location = useLocation();
    const [isOpen, setIsOpen] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    // Prevent scrolling when menu is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    const closeMenu = () => setIsOpen(false);

    const menuContent = (
        <>
            {/* Backdrop */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] transition-opacity animate-in fade-in duration-200"
                    onClick={closeMenu}
                />
            )}

            {/* Drawer */}
            <div
                className={`fixed top-0 right-0 h-full w-[80%] max-w-sm bg-white dark:bg-black border-l border-zinc-200 dark:border-zinc-800 z-[100] transform transition-transform duration-300 ease-in-out shadow-2xl ${isOpen ? 'translate-x-0' : 'translate-x-full'
                    }`}
            >
                <div className="flex flex-col h-full">
                    {/* Header */}
                    <div className="flex items-center justify-between p-4 border-b border-zinc-100 dark:border-zinc-900">
                        <div className="flex items-center gap-2">
                            <div className="bg-indigo-600 p-1.5 rounded-lg">
                                <Headphones className="w-4 h-4 text-white" />
                            </div>
                            <span className="font-bold text-lg bg-clip-text text-transparent bg-gradient-to-r from-zinc-900 to-zinc-500 dark:from-white dark:to-zinc-400">
                                Singlue
                            </span>
                        </div>
                        <button
                            onClick={closeMenu}
                            className="p-2 text-zinc-500 hover:text-zinc-900 dark:hover:text-white rounded-lg transition-colors"
                        >
                            <X className="w-6 h-6" />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="flex-1 overflow-y-auto py-4 px-4 space-y-6">
                        {/* User Profile Section */}
                        {user ? (
                            <div className="flex flex-col gap-2 p-4 bg-zinc-50 dark:bg-zinc-900/50 rounded-xl border border-zinc-200 dark:border-white/5">
                                <div className="flex flex-col">
                                    <span className="font-semibold text-zinc-900 dark:text-white">
                                        {profile?.nickname || user.email?.split('@')[0] || 'User'}
                                    </span>
                                    <span className="text-xs text-zinc-500 truncate">{user.email}</span>
                                </div>
                                <div className="flex items-center gap-2 mt-2">
                                    <Link
                                        to="/settings"
                                        onClick={closeMenu}
                                        className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-colors"
                                    >
                                        <SettingsIcon className="w-4 h-4" />
                                        {t('nav.settings')}
                                    </Link>
                                    <button
                                        onClick={() => {
                                            closeMenu();
                                            signOut();
                                        }}
                                        className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900/50 rounded-lg text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
                                    >
                                        <LogOut className="w-4 h-4" />
                                        {t('nav.signout')}
                                    </button>
                                </div>
                            </div>
                        ) : (
                            !isLoading && (
                                <Link
                                    to="/login"
                                    state={{ returnUrl: location.pathname + location.search }}
                                    onClick={closeMenu}
                                    className="block w-full text-center py-3 bg-indigo-600 text-white font-medium rounded-xl hover:bg-indigo-700 transition-colors"
                                >
                                    {t('nav.signin')}
                                </Link>
                            )
                        )}

                        {/* Navigation Links */}
                        <div className="space-y-1">
                            <p className="px-2 text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">
                                Menu
                            </p>
                            <Link
                                to="/library"
                                onClick={closeMenu}
                                className={`flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-colors ${location.pathname === '/library'
                                    ? 'bg-zinc-100 dark:bg-zinc-800 text-indigo-600 dark:text-indigo-400'
                                    : 'text-zinc-700 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-900'
                                    }`}
                            >
                                {t('nav.library')}
                            </Link>

                            {isAdmin && (
                                <Link
                                    to="/admin"
                                    onClick={closeMenu}
                                    className="flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium text-zinc-700 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors"
                                >
                                    {t('nav.admin')}
                                </Link>
                            )}
                        </div>

                        {/* Settings Section */}
                        <div className="space-y-4">
                            <p className="px-2 text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                                Preferences
                            </p>
                            <div className="flex items-center justify-between px-2">
                                <span className="text-sm text-zinc-600 dark:text-zinc-400">Language</span>
                                <LanguageSwitcher />
                            </div>
                            <div className="flex items-center justify-between px-2">
                                <span className="text-sm text-zinc-600 dark:text-zinc-400">Theme</span>
                                <ThemeToggle />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );

    return (
        <div className="md:hidden">
            <button
                onClick={() => setIsOpen(true)}
                className="p-2 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
            >
                <Menu className="w-6 h-6" />
                <span className="sr-only">Open menu</span>
            </button>
            {mounted && createPortal(menuContent, document.body)}
        </div>
    );
};
