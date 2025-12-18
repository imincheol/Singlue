import React, { useEffect, useRef, useState } from 'react';
import { useAppStore } from '../store/useAppStore';
import { Type, Languages, Sparkles, Loader2, ChevronDown, ChevronUp, Music, Plus, Lock } from 'lucide-react';
import { clsx } from 'clsx';
import { useTranslation } from 'react-i18next';
import { enrichLyrics } from '../services/gemini';
import { saveSong } from '../services/supabase';
import type { Song } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';

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
        togglePronunciation,
        showTranslation,
        toggleTranslation,
        apiKey,
        requestSeek,
    } = useAppStore();
    const { t } = useTranslation();
    const { user } = useAuth();

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
            // 3 minutes estimated duration used in calculation below

            interval = setInterval(() => {
                const elapsed = Date.now() - startTime;
                // Use an asymptotic function to ensure it never exceeds 99% and never decreases.
                // Progress = 99 * (1 - e^(-t/tau)), where tau is a time constant.
                // After 180s (3 min), let's aim for ~90%. 1 - e^(-180/tau) = 0.9 => e^(-180/tau) = 0.1 => -180/tau = ln(0.1) ~ -2.3 => tau ~ 78
                const tau = 78000;
                const progress = 99 * (1 - Math.exp(-elapsed / tau));
                setEnrichProgress(Math.max(0.1, progress));
            }, 500);
        } else {
            // Quick finish animation
            if (enrichProgress > 0) {
                setEnrichProgress(100);
                setTimeout(() => setEnrichProgress(0), 1000);
            }
        }

        return () => clearInterval(interval);
    }, [enriching]);

    // Check if lyrics are "incomplete" (missing pron or trans)
    // Show AI enrich button if:
    // 1. Song has lyrics
    // 2. Data is missing content (checks for null, undefined, or empty object)
    // 3. Song is in stage 2 or below (not yet completed)
    const isIncomplete = currentSong && currentSong.lyrics.length > 0 &&
        currentSong.stage !== 3 &&
        (currentSong.lyrics.some(l => !l.pron || Object.keys(l.pron).length === 0) ||
            currentSong.lyrics.some(l => !l.trans || Object.keys(l.trans).length === 0));

    const handleEnrich = async () => {
        if (!currentSong || !apiKey) {
            if (!apiKey) {
                setError(t('curator.enter_api_key'));
                setTimeout(() => setError(null), 3000);
            }
            return;
        }

        setEnriching(true);
        try {
            const enrichedSong = await enrichLyrics(apiKey, currentSong, t('language_code', { defaultValue: 'en' }));

            // Stage 3: Promote to Public
            const finalSong: Song = {
                ...enrichedSong,
                stage: 3,
                is_public: true,
                published_at: new Date().toISOString()
            };

            // Save to Supabase (enriched lyrics)
            await saveSong(finalSong);

            setCurrentSong(finalSong);
        } catch (error) {
            console.error(error);
            setError(t('search.error'));
            setTimeout(() => setError(null), 3000);
            setEnrichProgress(0); // Reset progress on error
        } finally {
            setEnriching(false);
        }
    };

    // Calculate synchronized time
    const globalOffset = currentSong?.global_offset || 0;
    const totalOffset = globalOffset + userOffset;
    const syncedTime = currentTime - totalOffset;

    useEffect(() => {
        if (!currentSong) return;

        // Find active line
        const index = currentSong.lyrics.findLastIndex((line) => line.time <= syncedTime);
        setActiveLineIndex(index);
    }, [syncedTime, currentSong]);

    useEffect(() => {
        if (activeLineIndex !== -1 && containerRef.current && activeLineRef.current) {
            // Use scrollTo instead of scrollIntoView to prevent whole page scrolling on mobile
            const container = containerRef.current;
            const element = activeLineRef.current;

            // Calculate position to center the element
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
        // seekTime = lineTime + offset
        // If lyrics at 7s should show at video 10s (offset 3), we seek to 10s.
        requestSeek(lineTime + totalOffset);
    };

    return (
        <div className={clsx(
            "flex flex-col bg-zinc-100 dark:bg-zinc-900/50 rounded-xl border border-zinc-200 dark:border-white/5 backdrop-blur-sm overflow-hidden transition-all duration-300",
            "lg:h-full", // Desktop always full height of parent
            isExpanded ? "h-[60vh]" : "h-auto" // Mobile height control
        )}>
            {/* error message overlay */}
            {error && (
                <div className="absolute top-20 left-1/2 -translate-x-1/2 z-50 bg-red-500 text-white px-6 py-2 rounded-full shadow-lg animate-in fade-in slide-in-from-top-4 duration-300 text-sm font-medium">
                    {error}
                </div>
            )}
            {/* Controls Header - Always Visible */}
            <div className="flex flex-col border-b border-zinc-300 dark:border-white/5 shrink-0">
                <div className="flex items-center justify-between p-4 bg-zinc-200 dark:bg-black/20">
                    <div className="flex items-center gap-2">
                        {/* 가사 변경 버튼 */}
                        {currentSong && currentSong.stage !== 3 && currentSong.created_by === user?.id && (
                            <button
                                onClick={onSearchClick}
                                className="flex items-center gap-2 px-3 py-1.5 bg-zinc-500/10 hover:bg-zinc-500/20 text-zinc-600 dark:text-zinc-400 rounded-lg text-sm font-medium transition-colors border border-zinc-500/20"
                            >
                                <Languages className="w-4 h-4" />
                                가사 변경
                            </button>
                        )}
                        {isIncomplete && (
                            <button
                                onClick={handleEnrich}
                                disabled={enriching}
                                className="flex items-center gap-2 px-3 py-1.5 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 rounded-lg text-sm font-medium transition-colors border border-indigo-500/20"
                            >
                                {enriching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                                {enriching ? `생성 중... ${Math.round(enrichProgress)}%` : t('curator.enrich_btn') || "AI 발음/뜻 생성"}
                            </button>
                        )}
                    </div>
                    <div className="flex items-center space-x-2">
                        <button
                            onClick={togglePronunciation}
                            className={clsx(
                                "p-2 rounded-lg transition-colors hidden sm:block",
                                showPronunciation ? "bg-indigo-500/20 text-indigo-400" : "text-zinc-600 dark:text-zinc-600 hover:text-zinc-900 dark:hover:text-zinc-400"
                            )}
                            title={t('lyrics.toggle_pron')}
                        >
                            <Type size={18} />
                        </button>
                        <button
                            onClick={toggleTranslation}
                            className={clsx(
                                "p-2 rounded-lg transition-colors hidden sm:block",
                                showTranslation ? "bg-indigo-500/20 text-indigo-400" : "text-zinc-600 dark:text-zinc-600 hover:text-zinc-900 dark:hover:text-zinc-400"
                            )}
                            title={t('lyrics.toggle_trans')}
                        >
                            <Languages size={18} />
                        </button>

                        {/* Mobile Toggle Button */}
                        <button
                            onClick={() => setIsExpanded(!isExpanded)}
                            className="p-2 rounded-lg transition-colors bg-zinc-200 dark:bg-white/10 lg:hidden"
                        >
                            {isExpanded ? <ChevronDown size={18} /> : <ChevronUp size={18} />}
                        </button>
                    </div>
                </div>

                {/* Progress Bar Container */}
                {enrichProgress > 0 && (
                    <div className="w-full h-1 bg-zinc-200 dark:bg-white/5 relative overflow-hidden">
                        <div
                            className="h-full bg-indigo-500 transition-all duration-500 ease-out shadow-[0_0_8px_rgba(99,102,241,0.5)]"
                            style={{ width: `${enrichProgress}%` }}
                        />
                    </div>
                )}
            </div>

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
                        {/* Empty space at top for scrolling centering */}
                        <div className="h-[20vh] lg:hidden" />

                        {currentSong.lyrics.map((line, idx) => {
                            const isActive = idx === activeLineIndex;

                            // Format time
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
                                    {/* Timestamp */}
                                    <div className={clsx(
                                        "flex-shrink-0 w-12 text-sm font-mono pt-2 text-right",
                                        isActive ? "text-indigo-600 dark:text-indigo-400" : "text-zinc-500 dark:text-zinc-600"
                                    )}>
                                        {timeStr}
                                    </div>

                                    <div className="flex flex-col space-y-1">
                                        {/* Source (Original) - Bold */}
                                        <p className={clsx(
                                            "text-2xl font-bold tracking-tight leading-normal",
                                            isActive ? "text-zinc-900 dark:text-white" : "text-zinc-500 dark:text-zinc-300"
                                        )}>
                                            {line.source}
                                        </p>

                                        {/* Pronunciation */}
                                        {showPronunciation && line.pron && (
                                            <p className="text-base font-mono text-indigo-600 dark:text-indigo-300/80 tracking-wide">
                                                {/* @ts-ignore: Handle migration */}
                                                {typeof line.pron === 'string' ? line.pron : (line.pron[t('language_code', { defaultValue: 'en' })] || line.pron['en'] || Object.values(line.pron)[0])}
                                            </p>
                                        )}

                                        {/* Translation */}
                                        {showTranslation && line.trans && (
                                            <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400 mt-1">
                                                {/* @ts-ignore: Handle migration */}
                                                {typeof line.trans === 'string' ? line.trans : (line.trans[t('language_code', { defaultValue: 'en' })] || line.trans['en'] || Object.values(line.trans)[0])}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                        {/* Fill empty space at bottom for scrolling */}
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
