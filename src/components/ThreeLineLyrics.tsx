import React, { useEffect, useState, useMemo } from 'react';
import { useAppStore } from '../store/useAppStore';
import { clsx } from 'clsx';
import { useTranslation } from 'react-i18next';

export const ThreeLineLyrics: React.FC = () => {
    const { t } = useTranslation();
    const { currentSong, currentTime, userOffset, showPronunciation, showTranslation } = useAppStore();
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

    const lang = t('language_code', { defaultValue: 'en' });

    return (
        <div className="w-full bg-zinc-100 dark:bg-black/40 border border-zinc-200 dark:border-white/5 rounded-xl p-8 flex flex-col items-center justify-center space-y-4 backdrop-blur-sm">
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
                                isNext ? "scale-100 opacity-80" : // 시인성 상향 (70% -> 80%)
                                    "scale-90 opacity-20 blur-[1px]"
                        )}
                    >
                        <p className={clsx(
                            "font-bold leading-tight",
                            isCurrent ? "text-2xl text-zinc-900 dark:text-white md:text-3xl" : "text-base text-zinc-600 dark:text-zinc-300"
                        )}>
                            {item.line.source}
                        </p>

                        {/* Pronunciation */}
                        {showPronunciation && item.line.pron && (
                            <p className={clsx(
                                "font-mono tracking-wide",
                                isCurrent ? "text-sm text-indigo-600 dark:text-indigo-300/80 mt-1" :
                                    isNext ? "text-sm text-indigo-500/70 dark:text-indigo-400/70 mt-0.5" : // 다음 가사 발음 강조
                                        "text-xs text-zinc-500 mt-0.5"
                            )}>
                                {typeof item.line.pron === 'string'
                                    ? item.line.pron
                                    : (item.line.pron[lang] || item.line.pron['en'] || Object.values(item.line.pron)[0] || '')}
                            </p>
                        )}

                        {/* Translation */}
                        {showTranslation && item.line.trans && (
                            <p className={clsx(
                                "font-medium",
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
    );
};
