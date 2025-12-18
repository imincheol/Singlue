import React, { useEffect, useState, useMemo } from 'react';
import { useAppStore } from '../store/useAppStore';
import { clsx } from 'clsx';
import { useTranslation } from 'react-i18next';
import { Type, Languages, Clock, Save, Loader2 } from 'lucide-react';

export const ThreeLineLyrics: React.FC = () => {
    const { t } = useTranslation();
    const { currentSong, currentTime, userOffset, showPronunciation, showTranslation } = useAppStore();
    const [activeLineIndex, setActiveLineIndex] = useState<number>(-1);

    const [isSaving, setIsSaving] = useState(false);
    const {
        setUserOffset,
        saveCurrentOffset,
        togglePronunciation,
        toggleTranslation
    } = useAppStore();

    const adjustSync = (delta: number) => {
        setUserOffset(parseFloat((userOffset + delta).toFixed(1)));
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            await saveCurrentOffset();
        } catch (err) {
            console.error(err);
            alert("Failed to save sync offset");
        } finally {
            setIsSaving(false);
        }
    };

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
        <div className="w-full bg-zinc-100 dark:bg-black/40 border border-zinc-200 dark:border-white/5 rounded-xl flex flex-col items-center justify-center backdrop-blur-sm overflow-hidden">
            {/* Header: Sync & TA Controls */}
            <div className="w-full flex items-center justify-between px-4 py-2 bg-zinc-200/50 dark:bg-white/5 border-b border-zinc-200 dark:border-white/5">
                {/* Left: Sync Control */}
                <div className="flex items-center gap-2">
                    <div className="flex items-center space-x-1 bg-zinc-50 dark:bg-black/20 rounded-md px-2 py-1 border border-zinc-200 dark:border-white/5">
                        <Clock size={12} className="text-zinc-400" />
                        <span className="text-[10px] text-zinc-500 mr-1 hidden sm:inline">Sync</span>

                        <div className="flex items-center gap-px">
                            <button onClick={() => adjustSync(-0.1)} className="px-1.5 py-0.5 text-[10px] text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors font-mono hover:bg-zinc-200 dark:hover:bg-white/10 rounded" title="-0.1s">-.1</button>

                            <input
                                type="number"
                                step="0.1"
                                value={userOffset.toFixed(1)}
                                onChange={(e) => setUserOffset(parseFloat(e.target.value) || 0)}
                                className="w-10 bg-transparent text-center text-xs text-indigo-600 dark:text-indigo-400 outline-none appearance-none font-mono font-bold"
                            />

                            <button onClick={() => adjustSync(0.1)} className="px-1.5 py-0.5 text-[10px] text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors font-mono hover:bg-zinc-200 dark:hover:bg-white/10 rounded" title="+0.1s">+.1</button>
                        </div>
                    </div>

                    {/* Save Button */}
                    {userOffset !== 0 && (
                        <button
                            onClick={handleSave}
                            disabled={isSaving}
                            className="px-2 py-1 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-500 dark:text-indigo-400 rounded text-[10px] font-medium transition-colors flex items-center gap-1.5 border border-indigo-500/20 animate-in fade-in slide-in-from-left-2 duration-300"
                            title="Save Sync"
                        >
                            {isSaving ? <Loader2 className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />}
                            <span className="hidden sm:inline">Save</span>
                        </button>
                    )}
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
            <div className="w-full p-8 flex flex-col items-center justify-center space-y-4">
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
                                    "transition-all duration-300",
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
