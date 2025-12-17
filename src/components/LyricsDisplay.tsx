import React, { useEffect, useRef, useState } from 'react';
import { useAppStore } from '../store/useAppStore';
import { Type, Languages, Zap, Sparkles, Loader2 } from 'lucide-react';
import { clsx } from 'clsx';
import { useTranslation } from 'react-i18next';
import { enrichLyrics } from '../services/gemini';

export const LyricsDisplay: React.FC = () => {
    const {
        currentSong,
        setCurrentSong,
        currentTime,
        userOffset,
        showPronunciation,
        togglePronunciation,
        showTranslation,
        toggleTranslation,
        videoMapping,
        apiKey,
        linkSongToHistory
    } = useAppStore();
    const { t } = useTranslation();

    const containerRef = useRef<HTMLDivElement>(null);
    const activeLineRef = useRef<HTMLDivElement>(null);
    const [activeLineIndex, setActiveLineIndex] = useState<number>(-1);
    const [enriching, setEnriching] = useState(false);

    // Check if lyrics are "incomplete" (missing pron and trans)
    // We check if more than 50% of lines define pron or trans as empty.
    const isIncomplete = currentSong && currentSong.lyrics.length > 0 &&
        (currentSong.lyrics.filter(l => !l.pron).length > currentSong.lyrics.length / 2) &&
        (currentSong.lyrics.filter(l => !l.trans).length > currentSong.lyrics.length / 2);

    const handleEnrich = async () => {
        if (!currentSong || !apiKey) {
            if (!apiKey) alert(t('curator.enter_api_key'));
            return;
        }

        setEnriching(true);
        try {
            const enrichedSong = await enrichLyrics(apiKey, currentSong);
            setCurrentSong(enrichedSong);

            // Also update history
            if (videoMapping?.videoId) {
                linkSongToHistory(videoMapping.videoId, enrichedSong);
            }
        } catch (error) {
            console.error(error);
            alert(t('search.error'));
        } finally {
            setEnriching(false);
        }
    };

    // Calculate synchronized time
    // If offset is positive (~3s), it means we want to delay the lyrics matching
    // or delay the video time?
    // Let's stick to standard: adjustedTime = currentTime - offset.
    // If offset is 3s, and current time is 10s, we look for lyrics at 7s.
    // This effectively "delays" the lyrics (lyrics at 10s will show when video is at 13s).
    const globalOffset = videoMapping?.globalOffset || 0;
    const totalOffset = globalOffset + userOffset;
    const syncedTime = currentTime - totalOffset;

    useEffect(() => {
        if (!currentSong) return;

        // Find active line
        // The active line is the one where time <= syncedTime, and the next line is > syncedTime
        const index = currentSong.lyrics.findLastIndex((line) => line.time <= syncedTime);
        setActiveLineIndex(index);
    }, [syncedTime, currentSong]);

    useEffect(() => {
        if (activeLineIndex !== -1 && activeLineRef.current) {
            activeLineRef.current.scrollIntoView({
                behavior: 'smooth',
                block: 'center',
            });
        }
    }, [activeLineIndex]);

    if (!currentSong) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-zinc-500 space-y-4">
                <Zap className="w-12 h-12 opacity-20" />
                <p>{t('lyrics.no_song')}</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full bg-zinc-900/50 rounded-xl border border-white/5 backdrop-blur-sm overflow-hidden">
            {/* Controls Header */}
            <div className="flex items-center justify-between p-4 border-b border-white/5 bg-black/20">
                <div className="flex items-center">
                    {isIncomplete && (
                        <button
                            onClick={handleEnrich}
                            disabled={enriching}
                            className="flex items-center gap-2 px-3 py-1.5 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 rounded-lg text-sm font-medium transition-colors border border-indigo-500/20"
                        >
                            {enriching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                            {enriching ? t('curator.generating') : t('curator.enrich_btn') || "AI 채우기"}
                        </button>
                    )}
                </div>
                <div className="flex items-center space-x-2">
                    <button
                        onClick={togglePronunciation}
                        className={clsx(
                            "p-2 rounded-lg transition-colors",
                            showPronunciation ? "bg-indigo-500/20 text-indigo-400" : "text-zinc-600 hover:text-zinc-400"
                        )}
                        title={t('lyrics.toggle_pron')}
                    >
                        <Type size={18} />
                    </button>
                    <button
                        onClick={toggleTranslation}
                        className={clsx(
                            "p-2 rounded-lg transition-colors",
                            showTranslation ? "bg-indigo-500/20 text-indigo-400" : "text-zinc-600 hover:text-zinc-400"
                        )}
                        title={t('lyrics.toggle_trans')}
                    >
                        <Languages size={18} />
                    </button>
                </div>
            </div>

            {/* Lyrics Scroll Area */}
            <div ref={containerRef} className="flex-1 overflow-y-auto px-6 py-12 space-y-8 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-zinc-700">
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
                            className={clsx(
                                "transition-all duration-300 flex items-start space-x-6",
                                isActive ? "opacity-100 scale-105 origin-left" : "opacity-30 blur-[0.5px] scale-100"
                            )}
                        >
                            {/* Timestamp */}
                            <div className={clsx(
                                "flex-shrink-0 w-12 text-sm font-mono pt-2 text-right",
                                isActive ? "text-indigo-400" : "text-zinc-600"
                            )}>
                                {timeStr}
                            </div>

                            <div className="flex flex-col space-y-1">
                                {/* Source (Original) - Bold */}
                                <p className={clsx(
                                    "text-2xl font-bold tracking-tight leading-normal",
                                    isActive ? "text-white" : "text-zinc-300"
                                )}>
                                    {line.source}
                                </p>

                                {/* Pronunciation - Faint/Blurry unless active */}
                                {showPronunciation && line.pron && (
                                    <p className="text-sm font-mono text-indigo-300/80 tracking-wide">
                                        {line.pron}
                                    </p>
                                )}

                                {/* Translation - Small */}
                                {showTranslation && line.trans && (
                                    <p className="text-base font-medium text-zinc-400 mt-1">
                                        {line.trans}
                                    </p>
                                )}
                            </div>
                        </div>
                    );
                })}

                {/* Fill empty space at bottom for scrolling */}
                <div className="h-[50vh]" />
            </div>
        </div >
    );
};
