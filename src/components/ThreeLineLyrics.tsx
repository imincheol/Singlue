import React, { useEffect, useState, useMemo } from 'react';
import { useAppStore } from '../store/useAppStore';
import { clsx } from 'clsx';
import { useTranslation } from 'react-i18next';
import { Type, Languages, Clock } from 'lucide-react';

export const ThreeLineLyrics: React.FC = () => {
    const { t } = useTranslation();
    const {
        currentSong,
        currentTime,
        userOffset,
        draftOffset,
        showPronunciation,
        showTranslation,
        contentLanguage
    } = useAppStore();
    const [activeLineIndex, setActiveLineIndex] = useState<number>(-1);

    const {
        setUserOffset,
        togglePronunciation,
        toggleTranslation
    } = useAppStore();

    const adjustSync = (delta: number) => {
        setUserOffset(parseFloat((userOffset + delta).toFixed(1)));
    };


    const globalOffset = currentSong?.global_offset || 0;
    const totalOffset = globalOffset + userOffset + (draftOffset || 0);
    const syncedTime = currentTime - totalOffset;

    useEffect(() => {
        if (!currentSong) return;
        const index = currentSong.lyrics.findLastIndex((line) => line.time <= syncedTime);
        setActiveLineIndex(index);
    }, [syncedTime, currentSong]);

    // Get distinct lines (current and next)
    const lines = useMemo(() => {
        if (!currentSong) return [];

        // Helper to find a line by skipping duplicates
        // Note: duplicates have same timestamp (approx).

        // 1. Identify which line index is "Current"
        // activeLineIndex is the last line <= syncedTime.
        // But if multiple lines match activeLineIndex's time, we want the FIRST one to be the "Active Display".

        let currIdx = activeLineIndex;
        if (currIdx !== -1) {
            const activeTime = currentSong.lyrics[currIdx].time;
            // Find the first index with this time
            currIdx = currentSong.lyrics.findIndex(l => Math.abs(l.time - activeTime) < 0.01);
        }

        // 2. Identify Next (first line with time > current time)
        let nextIdx = -1;
        if (currIdx !== -1) {
            const currTime = currentSong.lyrics[currIdx].time;
            nextIdx = currentSong.lyrics.findIndex((l, i) => i > currIdx && Math.abs(l.time - currTime) >= 0.01);
        } else {
            // If no current line started yet, next is 0?
            // If activeLineIndex is -1, it means we are before the first line.
            // But usually we just show nothing or the first line as "Next"?
            // Let's assume standard behavior: if nothing active, look for first line > syncedTime?
            // For now, simple logic:
            if (currentSong.lyrics.length > 0) nextIdx = 0;
        }

        const curr = currIdx !== -1 ? currentSong.lyrics[currIdx] : null;
        const next = nextIdx !== -1 ? currentSong.lyrics[nextIdx] : null;

        const items = [];
        if (curr) items.push({ line: curr, type: 'curr' });
        if (next) items.push({ line: next, type: 'next' });

        return items;
    }, [currentSong, activeLineIndex]);

    if (!currentSong) return null;

    const lang = contentLanguage;

    return (
        <div className="w-full bg-zinc-100 dark:bg-black/40 border border-zinc-200 dark:border-white/5 rounded-xl flex flex-col items-center justify-center backdrop-blur-sm overflow-hidden relative">

            {/* Header: Sync & TA Controls */}
            <div className="w-full flex items-center justify-between px-4 py-2 bg-zinc-200/50 dark:bg-white/5 border-b border-zinc-200 dark:border-white/5">
                {/* Left: Sync Control */}
                <div className="flex items-center gap-2">
                    <div className="flex items-center space-x-1 bg-zinc-50 dark:bg-black/20 rounded-md px-1 py-1 border border-zinc-200 dark:border-white/5">
                        <Clock size={12} className="text-zinc-400 ml-1" />
                        <span className="text-[10px] text-zinc-500 mr-2 font-bold tracking-wider">SYNC</span>

                        {/* 5-Button UI */}
                        <div className="flex items-center gap-px">
                            <button onClick={() => adjustSync(-1.0)} className="w-6 h-5 flex items-center justify-center text-[9px] text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors font-mono hover:bg-zinc-200 dark:hover:bg-white/10 rounded" title="-1.0s">-1.0</button>
                            <button onClick={() => adjustSync(-0.1)} className="w-6 h-5 flex items-center justify-center text-[9px] text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors font-mono hover:bg-zinc-200 dark:hover:bg-white/10 rounded" title="-0.1s">-0.1</button>

                            {/* Reset / Display */}
                            <button
                                onClick={() => setUserOffset(0)}
                                className={clsx(
                                    "px-1.5 h-5 flex items-center justify-center text-[9px] font-mono font-bold min-w-[24px] rounded transition-colors",
                                    userOffset !== 0 ? "text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/10" : "text-zinc-400 hover:text-zinc-600"
                                )}
                                title="Reset"
                            >
                                {userOffset === 0 ? "0.0" : userOffset.toFixed(1)}
                            </button>

                            <button onClick={() => adjustSync(0.1)} className="w-6 h-5 flex items-center justify-center text-[9px] text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors font-mono hover:bg-zinc-200 dark:hover:bg-white/10 rounded" title="+0.1s">+0.1</button>
                            <button onClick={() => adjustSync(1.0)} className="w-6 h-5 flex items-center justify-center text-[9px] text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors font-mono hover:bg-zinc-200 dark:hover:bg-white/10 rounded" title="+1.0s">+1.0</button>
                        </div>
                    </div>
                </div>

                {/* Right: TA Buttons */}
                <div className="flex items-center gap-1">
                    <button
                        onClick={togglePronunciation}
                        className={clsx(
                            "p-1.5 rounded-md transition-colors",
                            showPronunciation ? "bg-indigo-500/20 text-indigo-500 dark:text-indigo-400" : "text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
                        )}
                        title={t('lyrics.toggle_pron')}
                    >
                        <Type size={16} />
                    </button>
                    <button
                        onClick={toggleTranslation}
                        className={clsx(
                            "p-1.5 rounded-md transition-colors",
                            showTranslation ? "bg-indigo-500/20 text-indigo-500 dark:text-indigo-400" : "text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
                        )}
                        title={t('lyrics.toggle_trans')}
                    >
                        <Languages size={16} />
                    </button>
                </div>
            </div>

            {/* Lyrics Content */}
            <div className="w-full p-8 flex flex-col items-center justify-center space-y-6">
                {lines.map((item, idx) => {
                    if (!item.line) {
                        // Placeholder for empty lines (start/end of song)
                        return <div key={idx} className="h-4" />;
                    }

                    const isCurrent = item.type === 'curr';
                    const isNext = item.type === 'next';

                    return (
                        <div
                            key={`${activeLineIndex}-${idx}`}
                            className={clsx(
                                "text-center transition-all duration-300 max-w-2xl px-4 flex flex-col items-center",
                                isCurrent ? "scale-105 opacity-100" :
                                    isNext ? "scale-100 opacity-90" : // Opacity 90%
                                        "scale-90 opacity-20 blur-[1px]"
                            )}
                        >
                            <p className={clsx(
                                "font-bold leading-tight",
                                isCurrent ? "text-2xl text-zinc-900 dark:text-white md:text-2xl" : "text-base text-zinc-600 dark:text-zinc-300"
                            )}>
                                {item.line.source}
                            </p>

                            {/* Pronunciation (Base Size) */}
                            {showPronunciation && item.line.pron && (
                                <p className={clsx(
                                    "font-mono tracking-wide",
                                    "transition-all duration-300",
                                    isCurrent ? "text-base text-indigo-600 dark:text-indigo-300/80 mt-1" :
                                        isNext ? "text-base text-indigo-500/70 dark:text-indigo-400/70 mt-0.5" :
                                            "text-xs text-zinc-500 mt-0.5"
                                )}>
                                    {typeof item.line.pron === 'string'
                                        ? item.line.pron
                                        : (item.line.pron[lang] || item.line.pron['en'] || Object.values(item.line.pron)[0] || '')}
                                </p>
                            )}

                            {/* Translation (Small Size) */}
                            {showTranslation && item.line.trans && (
                                <p className={clsx(
                                    "font-medium",
                                    "transition-all duration-300",
                                    isCurrent ? "text-sm text-zinc-600 dark:text-zinc-400 mt-1" : "text-xs text-zinc-400 mt-0.5"
                                )}>
                                    {typeof item.line.trans === 'string'
                                        ? item.line.trans
                                        : (item.line.trans[lang] || item.line.trans['en'] || Object.values(item.line.trans)[0] || '')}
                                </p>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
