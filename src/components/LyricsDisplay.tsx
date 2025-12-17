import React, { useEffect, useRef, useState } from 'react';
import { useAppStore } from '../store/useAppStore';
import { Type, Languages, Zap, Gauge } from 'lucide-react';
import { clsx } from 'clsx';

export const LyricsDisplay: React.FC = () => {
    const {
        currentSong,
        currentTime,
        userOffset,
        setUserOffset,
        showPronunciation,
        togglePronunciation,
        showTranslation,
        toggleTranslation,
        videoMapping,
        playbackRate,
        setPlaybackRate
    } = useAppStore();

    const containerRef = useRef<HTMLDivElement>(null);
    const activeLineRef = useRef<HTMLDivElement>(null);
    const [activeLineIndex, setActiveLineIndex] = useState<number>(-1);

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
                <p>No song loaded. Provide a YouTube link to start.</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full bg-zinc-900/50 rounded-xl border border-white/5 backdrop-blur-sm overflow-hidden">
            {/* Controls Header */}
            <div className="flex items-center justify-between p-4 border-b border-white/5 bg-black/20">
                <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                        <span className="text-xs font-mono text-zinc-400">SYNC</span>
                        <input
                            type="range"
                            min="-5"
                            max="5"
                            step="0.1"
                            value={userOffset}
                            onChange={(e) => setUserOffset(parseFloat(e.target.value))}
                            className="w-24 h-1 bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                        />
                        <span className="text-xs w-8 text-right text-indigo-400">{userOffset > 0 ? '+' : ''}{userOffset.toFixed(1)}s</span>
                    </div>
                </div>

                <div className="flex items-center space-x-2">
                    <button
                        onClick={togglePronunciation}
                        className={clsx(
                            "p-2 rounded-lg transition-colors",
                            showPronunciation ? "bg-indigo-500/20 text-indigo-400" : "text-zinc-600 hover:text-zinc-400"
                        )}
                        title="Toggle Pronunciation"
                    >
                        <Type size={18} />
                    </button>
                    <button
                        onClick={toggleTranslation}
                        className={clsx(
                            "p-2 rounded-lg transition-colors",
                            showTranslation ? "bg-indigo-500/20 text-indigo-400" : "text-zinc-600 hover:text-zinc-400"
                        )}
                        title="Toggle Translation"
                    >
                        <Languages size={18} />
                    </button>
                </div>
            </div>

            {/* Playback Controls Helper */}
            <div className="flex items-center justify-between px-4 py-2 border-b border-white/5 bg-black/10 text-xs text-zinc-500">
                <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                        <Gauge size={14} className="text-zinc-400" />
                        <span className="font-mono">
                            RATE:
                        </span>
                        {[0.5, 0.75, 1, 1.25, 1.5].map((rate) => (
                            <button
                                key={rate}
                                onClick={() => setPlaybackRate(rate)}
                                className={clsx(
                                    "px-1.5 py-0.5 rounded hover:bg-white/10 transition-colors",
                                    playbackRate === rate ? "text-indigo-400 font-bold bg-indigo-500/10" : "text-zinc-500"
                                )}
                            >
                                {rate}x
                            </button>
                        ))}
                    </div>
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
        </div>
    );
};
