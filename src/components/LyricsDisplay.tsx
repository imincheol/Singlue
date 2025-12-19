import React, { useEffect, useRef, useState } from 'react';
import { useAppStore } from '../store/useAppStore';
import { Music, Plus, Lock } from 'lucide-react';
import { clsx } from 'clsx';
import { useTranslation } from 'react-i18next';
import { enrichLyrics } from '../services/gemini';
import { saveSong, incrementUsageCount } from '../services/supabase';
import type { Song } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { Link, useLocation } from 'react-router-dom';
import { PlaybackControlBar } from './PlaybackControlBar';
import { EditControlBar } from './EditControlBar';

interface LyricsDisplayProps {
    onSearchClick?: () => void;
    onRegisterClick?: () => void;
    canCreate?: boolean;
}

export const LyricsDisplay: React.FC<LyricsDisplayProps> = ({ onSearchClick, onRegisterClick, canCreate = false }) => {
    const {
        currentSong,
        setCurrentSong,
        currentTime,
        userOffset,
        showPronunciation,
        showTranslation,
        apiKey,
        requestSeek,
    } = useAppStore();
    const { t, i18n } = useTranslation();
    const { user } = useAuth();
    const location = useLocation();

    const containerRef = useRef<HTMLDivElement>(null);
    const activeLineRef = useRef<HTMLDivElement>(null);
    const [activeLineIndex, setActiveLineIndex] = useState<number>(-1);
    const [enriching, setEnriching] = useState(false);
    const [enrichProgress, setEnrichProgress] = useState(0);
    const [isExpanded, setIsExpanded] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // AI Enriching Progress Timer
    useEffect(() => {
        let interval: any;

        if (enriching) {
            setEnrichProgress(0);
            const startTime = Date.now();
            interval = setInterval(() => {
                const elapsed = Date.now() - startTime;
                const tau = 78000;
                const progress = 99 * (1 - Math.exp(-elapsed / tau));
                setEnrichProgress(Math.max(0.1, progress));
            }, 500);
        } else {
            if (enrichProgress > 0) {
                setEnrichProgress(100);
                setTimeout(() => setEnrichProgress(0), 1000);
            }
        }

        return () => clearInterval(interval);
    }, [enriching]);

    const handleEnrich = async (targetLang?: string) => {
        if (!currentSong || !apiKey) {
            if (!apiKey) {
                setError(t('curator.enter_api_key'));
                setTimeout(() => setError(null), 3000);
            }
            return;
        }

        // Use targetLang if provided, otherwise fallback to current i18n language or 'en'
        const langToUse = targetLang || t('language_code', { defaultValue: 'en' });

        setEnriching(true);
        try {
            const enrichedSong = await enrichLyrics(apiKey, currentSong, langToUse);

            // Stage 3: Promote to Public
            const finalSong: Song = {
                ...enrichedSong,
                stage: 3,
                is_public: true,
                published_at: new Date().toISOString()
            };

            await saveSong(finalSong);

            // Quota Deduction
            if (user) {
                await incrementUsageCount(user.id);
            }

            setCurrentSong(finalSong);

            // If we generated a new language, should we switch to it?
            if (targetLang) {
                i18n.changeLanguage(targetLang);
            }

        } catch (error) {
            console.error(error);
            setError(t('search.error'));
            setTimeout(() => setError(null), 3000);
            setEnrichProgress(0);
        } finally {
            setEnriching(false);
        }
    };

    const handleGenerateLanguage = async (targetLang: string) => {
        await handleEnrich(targetLang);
    };

    // Calculate synchronized time
    const globalOffset = currentSong?.global_offset || 0;
    const totalOffset = globalOffset + userOffset;
    const syncedTime = currentTime - totalOffset;

    useEffect(() => {
        if (!currentSong) return;
        const index = currentSong.lyrics.findLastIndex((line) => line.time <= syncedTime);
        setActiveLineIndex(index);
    }, [syncedTime, currentSong]);

    useEffect(() => {
        if (activeLineIndex !== -1 && containerRef.current && activeLineRef.current) {
            const container = containerRef.current;
            const element = activeLineRef.current;
            const elementTop = element.offsetTop;
            const elementHeight = element.offsetHeight;
            const containerHeight = container.clientHeight;
            const scrollTo = elementTop - (containerHeight / 2) + (elementHeight / 2);

            container.scrollTo({
                top: scrollTo,
                behavior: 'smooth'
            });
        }
    }, [activeLineIndex]);

    const handleLineClick = (lineTime: number) => {
        requestSeek(lineTime + totalOffset);
    };

    const isOwner = currentSong?.created_by === user?.id;

    return (
        <div className={clsx(
            "flex flex-col bg-zinc-100 dark:bg-zinc-900/50 rounded-xl border border-zinc-200 dark:border-white/5 backdrop-blur-sm overflow-hidden transition-all duration-300",
            "lg:h-full",
            isExpanded ? "h-[60vh]" : "h-auto"
        )}>
            {/* Error Overlay */}
            {error && (
                <div className="absolute top-20 left-1/2 -translate-x-1/2 z-50 bg-red-500 text-white px-6 py-2 rounded-full shadow-lg animate-in fade-in slide-in-from-top-4 duration-300 text-sm font-medium">
                    {error}
                </div>
            )}

            {/* Edit (Creator) Control Bar */}
            {currentSong && isOwner && (
                <EditControlBar
                    onSearchClick={onSearchClick || (() => { })}
                    onEnrich={() => handleEnrich()}
                    enriching={enriching}
                    enrichProgress={enrichProgress}
                />
            )}

            {/* Playback Control Bar (Always Visible) */}
            <PlaybackControlBar
                isExpanded={isExpanded}
                toggleExpand={() => setIsExpanded(!isExpanded)}
                onGenerateLanguage={handleGenerateLanguage}
            />

            {/* Lyrics Scroll Area */}
            <div
                ref={containerRef}
                className={clsx(
                    "flex-1 overflow-y-auto px-6 py-12 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-zinc-300 dark:scrollbar-thumb-zinc-700 transition-all duration-300",
                    !isExpanded && "hidden lg:block lg:flex-1"
                )}
                style={{ maxHeight: !isExpanded ? '0px' : undefined }}
            >
                {currentSong && currentSong.lyrics.length > 0 ? (
                    <div className="space-y-8">
                        <div className="h-[20vh] lg:hidden" />

                        {currentSong.lyrics.map((line, idx) => {
                            const isActive = idx === activeLineIndex;
                            const m = Math.floor(line.time / 60);
                            const s = Math.floor(line.time % 60).toString().padStart(2, '0');
                            const timeStr = `${m}:${s}`;

                            return (
                                <div
                                    key={idx}
                                    ref={isActive ? activeLineRef : null}
                                    onClick={() => handleLineClick(line.time)}
                                    className={clsx(
                                        "transition-all duration-300 flex items-start space-x-6 cursor-pointer group/line",
                                        isActive ? "opacity-100 scale-105 origin-left" : "opacity-30 blur-[0.5px] scale-100 hover:opacity-70"
                                    )}
                                >
                                    <div className={clsx(
                                        "flex-shrink-0 w-12 text-sm font-mono pt-2 text-right",
                                        isActive ? "text-indigo-600 dark:text-indigo-400" : "text-zinc-500 dark:text-zinc-600"
                                    )}>
                                        {timeStr}
                                    </div>

                                    <div className="flex flex-col space-y-1">
                                        <p className={clsx(
                                            "text-2xl font-bold tracking-tight leading-normal",
                                            isActive ? "text-zinc-900 dark:text-white" : "text-zinc-500 dark:text-zinc-300"
                                        )}>
                                            {line.source}
                                        </p>

                                        {showPronunciation && line.pron && (
                                            <p className="text-base font-mono text-indigo-600 dark:text-indigo-300/80 tracking-wide">
                                                {/* @ts-ignore */}
                                                {typeof line.pron === 'string' ? line.pron : (line.pron[t('language_code', { defaultValue: 'en' })] || line.pron['en'] || Object.values(line.pron)[0])}
                                            </p>
                                        )}

                                        {showTranslation && line.trans && (
                                            <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400 mt-1">
                                                {/* @ts-ignore */}
                                                {typeof line.trans === 'string' ? line.trans : (line.trans[t('language_code', { defaultValue: 'en' })] || line.trans['en'] || Object.values(line.trans)[0])}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                        <div className="h-[50vh]" />
                    </div>
                ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center p-8 text-center space-y-4">
                        <div className="w-16 h-16 bg-zinc-200 dark:bg-zinc-800 rounded-full flex items-center justify-center mb-4">
                            <Music className="w-8 h-8 text-zinc-400 dark:text-zinc-500" />
                        </div>
                        <h3 className="text-xl font-bold text-zinc-900 dark:text-white">{t('player.no_lyrics_title')}</h3>

                        {canCreate ? (
                            <div className="space-y-4">
                                <p className="text-zinc-600 dark:text-zinc-400 max-w-xs">
                                    No song info found. You can register it!
                                </p>
                                <button
                                    onClick={onRegisterClick}
                                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-xl font-medium transition-colors flex items-center gap-2 mx-auto"
                                >
                                    <Plus className="w-4 h-4" />
                                    Register Song
                                </button>
                            </div>
                        ) : !user ? (
                            <div className="space-y-4">
                                <p className="text-zinc-600 dark:text-zinc-400 max-w-xs">
                                    Sign in to view more songs or register new ones.
                                </p>
                                <Link
                                    to="/login"
                                    state={{ returnUrl: location.pathname + location.search }}
                                    className="inline-flex bg-zinc-900 dark:bg-white text-white dark:text-black px-6 py-2.5 rounded-xl font-medium transition-colors items-center gap-2"
                                >
                                    <Lock className="w-4 h-4" />
                                    Sign In
                                </Link>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <p className="text-zinc-600 dark:text-zinc-400 max-w-xs">
                                    No public lyrics available yet.
                                </p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};
