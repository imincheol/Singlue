import React, { useEffect, useState, useMemo } from 'react';
import { useAppStore } from '../store/useAppStore';
import { clsx } from 'clsx';

export const ThreeLineLyrics: React.FC = () => {
    const { currentSong, currentTime, userOffset } = useAppStore();
    const [activeLineIndex, setActiveLineIndex] = useState<number>(-1);

    const globalOffset = currentSong?.global_offset || 0;
    const totalOffset = globalOffset + userOffset;
    const syncedTime = currentTime - totalOffset;

    useEffect(() => {
        if (!currentSong) return;
        const index = currentSong.lyrics.findLastIndex((line) => line.time <= syncedTime);
        setActiveLineIndex(index);
    }, [syncedTime, currentSong]);

    // Get 3 lines: prev, current, next
    const lines = useMemo(() => {
        if (!currentSong) return [];

        const prev = currentSong.lyrics[activeLineIndex - 1];
        const curr = currentSong.lyrics[activeLineIndex];
        const next = currentSong.lyrics[activeLineIndex + 1];

        return [
            { line: prev, type: 'prev' },
            { line: curr, type: 'curr' },
            { line: next, type: 'next' }
        ];
    }, [currentSong, activeLineIndex]);

    if (!currentSong) return null;

    return (
        <div className="w-full bg-zinc-100 dark:bg-black/40 border border-zinc-200 dark:border-white/5 rounded-xl p-8 flex flex-col items-center justify-center space-y-6 backdrop-blur-sm">
            {lines.map((item, idx) => {
                if (!item.line) {
                    // Placeholder for empty lines (start/end of song)
                    return <div key={idx} className="h-8" />;
                }

                const isCurrent = item.type === 'curr';

                return (
                    <div
                        key={`${activeLineIndex}-${idx}`}
                        className={clsx(
                            "text-center transition-all duration-300 max-w-2xl px-4",
                            isCurrent ? "scale-105 opacity-100" : "scale-95 opacity-40 blur-[0.5px]"
                        )}
                    >
                        <p className={clsx(
                            "font-bold leading-tight",
                            isCurrent ? "text-2xl text-zinc-900 dark:text-white md:text-3xl" : "text-lg text-zinc-600 dark:text-zinc-300"
                        )}>
                            {item.line.source}
                        </p>
                        {isCurrent && item.line.pron && (
                            <p className="text-sm text-indigo-600 dark:text-indigo-300/80 font-mono mt-1 tracking-wide">
                                {typeof item.line.pron === 'string'
                                    ? item.line.pron
                                    : (item.line.pron['ko'] || item.line.pron['en'] || Object.values(item.line.pron)[0] || '')}
                            </p>
                        )}
                        {isCurrent && item.line.trans && (
                            <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1 font-medium">
                                {typeof item.line.trans === 'string'
                                    ? item.line.trans
                                    : (item.line.trans['ko'] || item.line.trans['en'] || Object.values(item.line.trans)[0] || '')}
                            </p>
                        )}
                    </div>
                );
            })}
        </div>
    );
};
