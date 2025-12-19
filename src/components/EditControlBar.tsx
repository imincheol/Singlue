import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAppStore } from '../store/useAppStore';
import { Loader2, Save, Search, Wand2 } from 'lucide-react';
import { saveSong } from '../services/supabase';
import type { Song } from '../types';

interface EditControlBarProps {
    onSearchClick: () => void;
    onEnrich: () => void;
    enriching: boolean;
    enrichProgress: number;
}

export const EditControlBar: React.FC<EditControlBarProps> = ({
    onSearchClick,
    onEnrich,
    enriching,
    enrichProgress
}) => {
    const { t } = useTranslation();
    const { currentSong, setCurrentSong } = useAppStore();
    const [saving, setSaving] = useState(false);

    // Global Sync Slider State
    const [globalOffset, setGlobalOffset] = useState(currentSong?.global_offset || 0);

    const handleGlobalOffsetChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = parseFloat(e.target.value);
        setGlobalOffset(val);
        // DB Save is debounced/manual usually, but for now lets do manual save button or debounce?
        // Spec says: "[원어 싱크 조절 Slider]: DB 데이터 수정"
        // Ideally we should just update local state and have a save button, OR debounce save.
        // Let's implement debounce save or just update store and rely on a sync mechanism?
        // The store `saveCurrentOffset` exists but that merges userOffset.
        // Here we want to edit `global_offset` directly.
    };

    const handleSaveGlobalSync = async () => {
        if (!currentSong) return;
        setSaving(true);
        try {
            const updated: Song = { ...currentSong, global_offset: globalOffset };
            await saveSong(updated);
            setCurrentSong(updated);
        } catch (e) {
            console.error(e);
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="flex flex-col border-b border-zinc-200 dark:border-white/5 bg-amber-50/50 dark:bg-amber-900/10 backdrop-blur-sm">
            {/* Header / Label */}
            <div className="px-4 py-1.5 flex items-center justify-between bg-amber-100/50 dark:bg-amber-900/20 text-[10px] font-bold text-amber-600 dark:text-amber-500 uppercase tracking-widest">
                <span>Creator Controls</span>
                <span>Editable</span>
            </div>

            {/* Global Sync Slider */}
            <div className="px-4 py-2 flex items-center gap-3 border-b border-amber-200/20 dark:border-amber-500/10">
                <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider shrink-0">
                    Global Sync
                </span>
                <input
                    type="range"
                    min="-5"
                    max="5"
                    step="0.1"
                    value={globalOffset}
                    onChange={handleGlobalOffsetChange}
                    className="w-full h-1 bg-zinc-300 dark:bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-amber-600 hover:accent-amber-500"
                />
                <div className="flex items-center gap-2 w-24 justify-end">
                    <span className="text-xs font-mono text-zinc-500 text-right">
                        {globalOffset > 0 ? '+' : ''}{globalOffset.toFixed(1)}s
                    </span>
                    {currentSong?.global_offset !== globalOffset && (
                        <button
                            onClick={handleSaveGlobalSync}
                            disabled={saving}
                            className="p-1 rounded bg-amber-500 text-white hover:bg-amber-600 transition-colors"
                        >
                            {saving ? <Loader2 className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />}
                        </button>
                    )}
                </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-2 p-2 px-4">
                <button
                    onClick={onSearchClick}
                    className="flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-white/5 hover:bg-zinc-50 dark:hover:bg-white/10 text-zinc-600 dark:text-zinc-400 rounded-lg text-sm font-medium transition-colors border border-zinc-200 dark:border-white/10"
                >
                    <Search className="w-3.5 h-3.5" />
                    {t('curator.search_lyrics') || "Search Lyrics"}
                </button>

                <button
                    onClick={onEnrich}
                    disabled={enriching}
                    className="flex items-center gap-2 px-3 py-1.5 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 rounded-lg text-sm font-medium transition-colors border border-indigo-500/20"
                >
                    {enriching ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Wand2 className="w-3.5 h-3.5" />}
                    {enriching ? `Generating... ${Math.round(enrichProgress)}%` : t('curator.enrich_btn') || "Auto-Fill AI"}
                </button>
            </div>

            {/* Progress Bar for Enrich */}
            {enrichProgress > 0 && (
                <div className="w-full h-1 bg-zinc-200 dark:bg-white/5 relative overflow-hidden">
                    <div
                        className="h-full bg-indigo-500 transition-all duration-300"
                        style={{ width: `${enrichProgress}%` }}
                    />
                </div>
            )}
        </div>
    );
};
