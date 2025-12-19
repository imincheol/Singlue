import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAppStore } from '../store/useAppStore';
import { Type, Languages as LanguagesIcon, ChevronDown, Check, ChevronUp } from 'lucide-react';
import { clsx } from 'clsx';
import { LANGUAGES, getLanguageLabel } from '../constants/languages';
import { useAuth } from '../contexts/AuthContext';

interface PlaybackControlBarProps {
    isExpanded: boolean;
    toggleExpand: () => void;
    onGenerateLanguage: (lang: string) => void;
}

export const PlaybackControlBar: React.FC<PlaybackControlBarProps> = ({ isExpanded, toggleExpand, onGenerateLanguage }) => {
    const { t, i18n } = useTranslation();
    const { user } = useAuth();
    const {
        currentSong,
        showPronunciation,
        togglePronunciation,
        showTranslation,
        toggleTranslation,
        localSyncMap,
        setLocalSync,
        setUserOffset,
    } = useAppStore();

    // Local state for the slider to avoid too many store updates on drag
    const [sliderValue, setSliderValue] = useState(0);

    // Initialize slider from store (persisted localSyncMap)
    useEffect(() => {
        if (currentSong) {
            const savedOffset = localSyncMap[currentSong.id] || 0;
            setSliderValue(savedOffset);
            setUserOffset(savedOffset); // Apply immediately
        }
    }, [currentSong?.id, localSyncMap, setUserOffset]);

    const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = parseFloat(e.target.value);
        setSliderValue(val);
        if (currentSong) {
            setLocalSync(currentSong.id, val);
            setUserOffset(val); // Update live offset
        }
    };

    const handleLanguageChange = (code: string) => {
        // Check availability
        const hasPron = currentSong?.lyrics.some(l => l.pron && (l.pron as any)[code]);
        const hasTrans = currentSong?.lyrics.some(l => l.trans && (l.trans as any)[code]);
        const isAvailable = hasPron || hasTrans || code === 'en' || code === 'ko';
        const isCurrent = i18n.language === code;

        if (isAvailable || isCurrent) {
            i18n.changeLanguage(code);
        } else {
            // Prompt for generation
            if (!user) {
                // Non-member
                if (window.confirm(t('player.sign_in_to_generate', { defaultValue: "Sign in to generate lyrics for this language." }))) {
                    // Just show alert for now
                    alert("Please sign in to generate lyrics.");
                }
            } else {
                // Member: Quota deduction
                if (window.confirm(t('player.confirm_generate_lang', {
                    lang: getLanguageLabel(code),
                    defaultValue: `Generate ${getLanguageLabel(code)} lyrics? This will use 1 generation quota.`
                }))) {
                    onGenerateLanguage(code);
                }
            }
        }
    };

    return (
        <div className="flex flex-col border-b border-zinc-200 dark:border-white/5 bg-zinc-50/50 dark:bg-black/20 backdrop-blur-sm">
            {/* Top Row: Playback Sync Slider */}
            <div className="px-4 py-2 flex items-center gap-3 border-b border-zinc-200/50 dark:border-white/5">
                <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider shrink-0">
                    Sync
                </span>
                <input
                    type="range"
                    min="-5"
                    max="5"
                    step="0.1"
                    value={sliderValue}
                    onChange={handleSliderChange}
                    className="w-full h-1 bg-zinc-300 dark:bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-indigo-600 hover:accent-indigo-500"
                />
                <span className="text-xs font-mono text-zinc-500 w-12 text-right">
                    {sliderValue > 0 ? '+' : ''}{sliderValue.toFixed(1)}s
                </span>
            </div>

            {/* Bottom Row: Controls */}
            <div className="flex items-center justify-between p-3 px-4">
                {/* Left: Language Selector */}
                <div className="flex items-center gap-2">
                    <div className="relative group">
                        <button className="flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-white/5 border border-zinc-200 dark:border-white/10 rounded-lg text-sm font-medium hover:bg-zinc-50 dark:hover:bg-white/10 transition-colors text-zinc-700 dark:text-zinc-300">
                            <LanguagesIcon className="w-4 h-4" />
                            <span>{getLanguageLabel(i18n.language)}</span>
                            <ChevronDown className="w-3 h-3 opacity-50" />
                        </button>

                        {/* Dropdown */}
                        <div className="absolute top-full left-0 mt-2 w-48 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl shadow-xl overflow-hidden hidden group-hover:block z-50">
                            {LANGUAGES.map((lang) => {
                                // Check availability status
                                const hasPron = currentSong?.lyrics.some(l => l.pron && (l.pron as any)[lang.code]);
                                const hasTrans = currentSong?.lyrics.some(l => l.trans && (l.trans as any)[lang.code]);
                                const isAvailable = hasPron || hasTrans || lang.code === 'en' || lang.code === 'ko'; // Default fallback assumption
                                const isCurrent = i18n.language === lang.code;

                                return (
                                    <button
                                        key={lang.code}
                                        onClick={() => handleLanguageChange(lang.code)}
                                        className={clsx(
                                            "w-full text-left px-4 py-2.5 text-sm flex items-center justify-between",
                                            isCurrent ? "bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400" : "text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-white/5"
                                        )}
                                    >
                                        <div className="flex flex-col">
                                            <span>{lang.native}</span>
                                            <span className="text-xs text-zinc-500">{lang.label}</span>
                                        </div>
                                        {isCurrent && <Check className="w-4 h-4" />}
                                        {!isAvailable && !isCurrent && (
                                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-400">
                                                Empty
                                            </span>
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Right: Toggles */}
                <div className="flex items-center gap-1">
                    <button
                        onClick={togglePronunciation}
                        className={clsx(
                            "p-2 rounded-lg transition-colors flex items-center gap-2 text-xs font-semibold uppercase",
                            showPronunciation ? "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400" : "text-zinc-500 hover:bg-zinc-100 dark:hover:bg-white/5"
                        )}
                        title={t('lyrics.toggle_pron')}
                    >
                        <Type size={16} />
                        <span className="hidden sm:inline">Pron</span>
                    </button>
                    <button
                        onClick={toggleTranslation}
                        className={clsx(
                            "p-2 rounded-lg transition-colors flex items-center gap-2 text-xs font-semibold uppercase",
                            showTranslation ? "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400" : "text-zinc-500 hover:bg-zinc-100 dark:hover:bg-white/5"
                        )}
                        title={t('lyrics.toggle_trans')}
                    >
                        <LanguagesIcon size={16} />
                        <span className="hidden sm:inline">Trans</span>
                    </button>

                    {/* Mobile Toggle Button */}
                    <button
                        onClick={toggleExpand}
                        className="p-2 rounded-lg transition-colors bg-zinc-200 dark:bg-white/10 lg:hidden"
                    >
                        {isExpanded ? <ChevronDown size={18} /> : <ChevronUp size={18} />}
                    </button>
                </div>
            </div>
        </div>
    );
};
