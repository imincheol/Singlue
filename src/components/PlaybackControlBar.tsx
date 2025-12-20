import React from 'react';
import { useTranslation } from 'react-i18next';
import { useAppStore } from '../store/useAppStore';
import { Type, Languages as LanguagesIcon, ChevronDown, Check, ChevronUp } from 'lucide-react';
import { clsx } from 'clsx';
import { LANGUAGES, getLanguageLabel } from '../constants/languages';
import { useAuth } from '../contexts/AuthContext';
import { Dropdown } from './ui/Dropdown';

interface PlaybackControlBarProps {
    isExpanded: boolean;
    toggleExpand: () => void;
    onGenerateLanguage: (lang: string) => void;
    showSyncSlider?: boolean;
}

export const PlaybackControlBar: React.FC<PlaybackControlBarProps> = ({
    isExpanded,
    toggleExpand,
    onGenerateLanguage,
    showSyncSlider = true
}) => {
    const { t } = useTranslation();
    const { user } = useAuth();
    const {
        currentSong,
        showPronunciation,
        togglePronunciation,
        showTranslation,
        toggleTranslation,
        setUserOffset,
        userOffset,
        contentLanguage,
        setContentLanguage
    } = useAppStore();

    const handleLanguageChange = (code: string) => {
        // Check availability
        const hasPron = currentSong?.lyrics.some(l => l.pron && (l.pron as any)[code]);
        const hasTrans = currentSong?.lyrics.some(l => l.trans && (l.trans as any)[code]);

        // Comprehensive country to language mapping for source language recognition
        const countryToLang: Record<string, string> = {
            'kr': 'ko', 'vn': 'vi', 'jp': 'ja', 'cn': 'zh', 'tw': 'zh', 'hk': 'zh',
            'us': 'en', 'gb': 'en', 'ca': 'en', 'au': 'en'
        };
        const mappedLang = currentSong?.country_code ? countryToLang[currentSong.country_code.toLowerCase()] : null;
        const isSourceLanguage = mappedLang === code;

        const isAvailable = hasPron || hasTrans || code === 'en' || code === 'ko' || isSourceLanguage;
        const isCurrent = contentLanguage === code;

        if (isAvailable || isCurrent) {
            setContentLanguage(code as any);
        } else {
            if (!user) {
                if (window.confirm(t('player.sign_in_to_generate', { defaultValue: "Sign in to generate lyrics for this language." }))) {
                    alert("Please sign in to generate lyrics.");
                }
            } else {
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
        <div className="flex flex-col border-b border-zinc-200 dark:border-white/5 bg-zinc-50/50 dark:bg-black/20 backdrop-blur-sm relative z-20">
            {/* Top Row: Playback Sync Adjustment */}
            {showSyncSlider && (
                <div className="px-4 py-2 flex items-center justify-between border-b border-zinc-200/50 dark:border-white/5 bg-zinc-50/30 dark:bg-white/5">
                    <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider shrink-0 mr-2">
                            SYNC
                        </span>
                        <div className="flex items-center gap-1 min-w-[3.5rem] justify-end font-mono text-sm text-indigo-600 dark:text-indigo-400 font-bold bg-indigo-50 dark:bg-indigo-900/20 px-2 py-0.5 rounded border border-indigo-100 dark:border-indigo-500/20">
                            {userOffset > 0 ? '+' : ''}{userOffset.toFixed(1)}s
                        </div>
                    </div>

                    <div className="flex items-center gap-1">
                        <button onClick={() => setUserOffset(Math.round((userOffset - 1.0) * 10) / 10)} className="px-2 py-1 text-xs font-medium bg-white dark:bg-white/10 hover:bg-zinc-100 dark:hover:bg-white/20 border border-zinc-200 dark:border-white/10 rounded text-zinc-600 dark:text-zinc-300 transition-colors">-1.0</button>
                        <button onClick={() => setUserOffset(Math.round((userOffset - 0.1) * 10) / 10)} className="px-2 py-1 text-xs font-medium bg-white dark:bg-white/10 hover:bg-zinc-100 dark:hover:bg-white/20 border border-zinc-200 dark:border-white/10 rounded text-zinc-600 dark:text-zinc-300 transition-colors">-0.1</button>
                        <button onClick={() => setUserOffset(0)} className="px-2 py-1 text-xs font-medium bg-zinc-100 dark:bg-white/5 hover:bg-zinc-200 dark:hover:bg-white/15 border border-zinc-200 dark:border-white/10 rounded text-zinc-500 dark:text-zinc-400 transition-colors" title="Reset">0.0</button>
                        <button onClick={() => setUserOffset(Math.round((userOffset + 0.1) * 10) / 10)} className="px-2 py-1 text-xs font-medium bg-white dark:bg-white/10 hover:bg-zinc-100 dark:hover:bg-white/20 border border-zinc-200 dark:border-white/10 rounded text-zinc-600 dark:text-zinc-300 transition-colors">+0.1</button>
                        <button onClick={() => setUserOffset(Math.round((userOffset + 1.0) * 10) / 10)} className="px-2 py-1 text-xs font-medium bg-white dark:bg-white/10 hover:bg-zinc-100 dark:hover:bg-white/20 border border-zinc-200 dark:border-white/10 rounded text-zinc-600 dark:text-zinc-300 transition-colors">+1.0</button>
                    </div>
                </div>
            )}

            {/* Bottom Row: Controls */}
            <div className="flex items-center justify-between p-3 px-4">
                {/* Left: Language Selector */}
                <Dropdown
                    trigger={
                        <button className="flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-white/5 border border-zinc-200 dark:border-white/10 rounded-lg text-sm font-medium hover:bg-zinc-50 dark:hover:bg-white/10 transition-colors text-zinc-700 dark:text-zinc-300">
                            <LanguagesIcon className="w-4 h-4" />
                            <span>{getLanguageLabel(contentLanguage)}</span>
                            <ChevronDown className="w-3 h-3 opacity-50" />
                        </button>
                    }
                    dropdownClassName="w-48"
                    align="left"
                >
                    <div className="py-1">
                        {LANGUAGES.map((lang) => {
                            const hasPron = currentSong?.lyrics.some(l => l.pron && (l.pron as any)[lang.code]);
                            const hasTrans = currentSong?.lyrics.some(l => l.trans && (l.trans as any)[lang.code]);
                            const countryToLang: Record<string, string> = { 'kr': 'ko', 'vn': 'vi', 'jp': 'ja', 'cn': 'zh', 'us': 'en' };
                            const isSourceLanguage = currentSong?.country_code ? countryToLang[currentSong.country_code.toLowerCase()] === lang.code : false;
                            const isAvailable = hasPron || hasTrans || lang.code === 'en' || lang.code === 'ko' || isSourceLanguage;
                            const isCurrent = contentLanguage === lang.code;

                            return (
                                <button
                                    key={lang.code}
                                    onClick={() => handleLanguageChange(lang.code)}
                                    className={clsx(
                                        "w-full text-left px-4 py-2.5 text-sm flex items-center justify-between transition-colors",
                                        isCurrent ? "bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-semibold" : "text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-white/5"
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
                </Dropdown>

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
