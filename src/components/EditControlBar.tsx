import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAppStore } from '../store/useAppStore';
import { Loader2, Search, Wand2, Save } from 'lucide-react';


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
    const { currentSong, updateLyricsTimeShift, draftOffset, setDraftOffset } = useAppStore();
    const [saving, setSaving] = useState(false);

    // Adjust the draft visual offset
    const handleAdjustOffset = (amount: number) => {
        const newOffset = Math.round((draftOffset + amount) * 10) / 10;
        setDraftOffset(newOffset);
    };

    // Commit the draft offset to DB
    const handleSaveSync = async () => {
        if (!currentSong || draftOffset === 0) return;

        if (!window.confirm(t('curator.confirm_sync_save', {
            defaultValue: `Apply sync shift of ${draftOffset > 0 ? '+' : ''}${draftOffset}s to all lyrics?`
        }))) return;

        setSaving(true);
        try {
            await updateLyricsTimeShift(draftOffset);
            setDraftOffset(0); // Reset draft offset since it's now baked into lyrics
        } catch (e) {
            console.error(e);
            alert("Failed to save sync changes.");
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="flex flex-col border-b border-zinc-200 dark:border-white/5 bg-amber-50/50 dark:bg-amber-900/10 backdrop-blur-sm">
            {/* Header / Label */}
            <div className="px-4 py-1.5 flex items-center justify-between bg-amber-100/50 dark:bg-amber-900/20 text-[10px] font-bold text-amber-600 dark:text-amber-500 uppercase tracking-widest">
                <span>{t('curator.ctrl_title', 'Creator Controls')}</span>
                <span>{t('curator.ctrl_editable', 'Editable')}</span>
            </div>

            {/* Global Sync Controls (Draft + Save) */}
            <div className="px-4 py-2 flex items-center justify-between border-b border-amber-200/20 dark:border-amber-500/10">
                <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider shrink-0 mr-2">
                        {t('curator.edit_sync', 'EDIT SYNC')}
                    </span>
                    {draftOffset !== 0 && (
                        <span className="text-xs font-mono font-bold text-amber-600 dark:text-amber-400 bg-amber-100 dark:bg-amber-900/40 px-1.5 py-0.5 rounded">
                            {draftOffset > 0 ? '+' : ''}{draftOffset.toFixed(1)}s
                        </span>
                    )}
                </div>

                <div className="flex items-center gap-2">
                    {/* Adjustment Buttons */}
                    <div className="flex items-center gap-1">
                        <button onClick={() => handleAdjustOffset(-1.0)} className="px-2 py-1 text-xs font-medium bg-white dark:bg-white/10 hover:bg-amber-50 border border-zinc-200 dark:border-white/10 rounded text-zinc-600 dark:text-zinc-300">-1.0</button>
                        <button onClick={() => handleAdjustOffset(-0.1)} className="px-2 py-1 text-xs font-medium bg-white dark:bg-white/10 hover:bg-amber-50 border border-zinc-200 dark:border-white/10 rounded text-zinc-600 dark:text-zinc-300">-0.1</button>
                        <button onClick={() => setDraftOffset(0)} className="px-2 py-1 text-xs font-medium bg-zinc-100 dark:bg-white/5 hover:bg-zinc-200 dark:hover:bg-white/15 border border-zinc-200 dark:border-white/10 rounded text-zinc-500 dark:text-zinc-400" title="Reset">0.0</button>
                        <button onClick={() => handleAdjustOffset(0.1)} className="px-2 py-1 text-xs font-medium bg-white dark:bg-white/10 hover:bg-amber-50 border border-zinc-200 dark:border-white/10 rounded text-zinc-600 dark:text-zinc-300">+0.1</button>
                        <button onClick={() => handleAdjustOffset(1.0)} className="px-2 py-1 text-xs font-medium bg-white dark:bg-white/10 hover:bg-amber-50 border border-zinc-200 dark:border-white/10 rounded text-zinc-600 dark:text-zinc-300">+1.0</button>
                    </div>

                    {/* Save Button */}
                    <button
                        onClick={handleSaveSync}
                        disabled={draftOffset === 0 || saving}
                        className={`flex items-center gap-1 px-3 py-1 rounded text-xs font-bold uppercase tracking-wider transition-colors ${draftOffset !== 0
                            ? "bg-amber-500 text-white hover:bg-amber-600 shadow-sm"
                            : "bg-zinc-200 text-zinc-400 cursor-not-allowed dark:bg-white/5 dark:text-zinc-600"
                            }`}
                    >
                        {saving ? <Loader2 className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />}
                        Save
                    </button>
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
