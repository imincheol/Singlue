import { useState } from 'react';
import type { Song, LyricsLine } from '../types';
import { saveSong } from '../services/supabase';
import { Loader2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface Props {
    videoId: string;
    videoTitle?: string;
    videoAuthor?: string;
    onComplete: (song: Song) => void;
    onCancel: () => void;
}

import { useTranslation } from 'react-i18next';

export function SongCreationWizard({ videoId, videoTitle, videoAuthor, onComplete, onCancel }: Props) {
    const { user, profile } = useAuth();
    const { t } = useTranslation();
    // State for Wizard
    const [currentSong, setCurrentSong] = useState<Song | null>(null);
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);

    // Form State
    const [title, setTitle] = useState(videoTitle || '');
    const [artist, setArtist] = useState(videoAuthor || '');
    const [lyricsText, setLyricsText] = useState('');

    // Step 1: Create Basic Song
    const handleSaveStep1 = async () => {
        if (!user) return;
        setLoading(true);
        try {
            const newSong: Song = {
                id: crypto.randomUUID(),
                video_id: videoId,
                title,
                artist,
                lyrics: [],
                created_by: user.id,
                stage: 1,
                is_public: false,
                global_offset: 0
            };

            await saveSong(newSong);
            setCurrentSong(newSong);
            setStep(2);
        } catch (error) {
            console.error(error);
            alert('Failed to save song');
        } finally {
            setLoading(false);
        }
    };

    // Step 2: Save Lyrics
    const handleSaveStep2 = async () => {
        if (!currentSong) return;
        setLoading(true);

        try {
            // Parse Lyrics
            const parsedLyrics = parseLrcOrText(lyricsText);

            const updatedSong = {
                ...currentSong,
                lyrics: parsedLyrics,
                stage: 2
            };

            await saveSong(updatedSong);
            setCurrentSong(updatedSong);
            setStep(3);
        } catch (error) {
            console.error(error);
            alert('Failed to save lyrics');
        } finally {
            setLoading(false);
        }
    };

    // Step 3: AI Enrich
    const handleEnrich = async () => {
        if (!currentSong || !user) return;

        // Quota / BYOK Check
        const userKey = profile?.gemini_api_key;
        const currentUsage = profile?.usage_count || 0;
        const platformKey = import.meta.env.VITE_GEMINI_API_KEY;

        // Logic:
        // 1. If User has Key -> Use User Key (Unlimited)
        // 2. If User has No Key -> Check Quota (< 10)
        //    - If Quota OK -> Use Platform Key
        //    - If Quota Exceeded -> Block

        let activeKey = '';
        // let isUsingPlatformKey = false; // Not used yet, maybe for logging later

        if (userKey) {
            activeKey = userKey;
        } else {
            if (currentUsage >= 10) {
                alert("Free quota exceeded (10 songs). Please add your own Gemini API Key in Settings to continue.");
                return;
            }
            if (!platformKey) {
                alert("Platform configuration error: No Platform API Key available. Please contact support.");
                return;
            }
            activeKey = platformKey;
            // isUsingPlatformKey = true;
        }

        setLoading(true);
        try {
            const { enrichLyrics } = await import('../services/gemini');

            // Default to 'ko' target for now, or infer from user settings if we had them.
            const enrichedSong = await enrichLyrics(activeKey, currentSong, 'ko');

            const finalSong = {
                ...enrichedSong,
                stage: 3,
                is_public: true
            };

            await saveSong(finalSong);

            // Increment Usage Count
            // We do this client-side for now since RLS allows it.
            // Ideally should be a Database Trigger or RPC.
            const { error: profileError } = await import('../services/supabase').then(m => m.supabase
                .from('profiles')
                .update({ usage_count: currentUsage + 1 })
                .eq('id', user.id)
            );

            if (profileError) {
                console.error("Failed to update usage count", profileError);
                // Don't fail the song creation for this, just log it.
            }

            onComplete(finalSong);
        } catch (error: any) {
            console.error(error);
            alert('AI Enrichment Failed: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    // Helper: Simple LRC Parser
    const parseLrcOrText = (text: string): LyricsLine[] => {
        const lines = text.split('\n');
        const lyrics: LyricsLine[] = [];
        const timeReg = /\[(\d{2}):(\d{2})\.(\d{2,3})\]/;

        for (const line of lines) {
            const match = line.match(timeReg);
            if (match) {
                const min = parseInt(match[1]);
                const sec = parseInt(match[2]);
                const ms = parseInt(match[3].padEnd(3, '0'));
                const time = min * 60 + sec + ms / 1000;
                const content = line.replace(timeReg, '').trim();
                if (content) {
                    lyrics.push({ time, source: content });
                }
            } else if (line.trim()) {
                // No timestamp, default to previous + 2s or just 0?
                // Let's just add it with 0 or last + 1
                const lastTime = lyrics.length > 0 ? lyrics[lyrics.length - 1].time : 0;
                lyrics.push({ time: lastTime + 2, source: line.trim() });
            }
        }
        return lyrics;
    };

    return (
        <div className="bg-zinc-100 dark:bg-zinc-900 rounded-xl p-6 border border-zinc-200 dark:border-white/5 space-y-6">
            <h2 className="text-xl font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                {t('wizard.title')}
                <span className="text-sm font-normal text-zinc-500 bg-zinc-200 dark:bg-zinc-800 px-2 py-0.5 rounded">{t('wizard.step')} {step}/3</span>
            </h2>

            {step === 1 && (
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">{t('wizard.label_title')}</label>
                        <input
                            type="text"
                            className="mt-1 block w-full rounded-md border-zinc-300 dark:border-zinc-700 bg-white dark:bg-black text-zinc-900 dark:text-white px-3 py-2"
                            value={title}
                            onChange={e => setTitle(e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">{t('wizard.label_artist')}</label>
                        <input
                            type="text"
                            className="mt-1 block w-full rounded-md border-zinc-300 dark:border-zinc-700 bg-white dark:bg-black text-zinc-900 dark:text-white px-3 py-2"
                            value={artist}
                            onChange={e => setArtist(e.target.value)}
                        />
                    </div>
                    <div className="flex gap-2">
                        <button onClick={handleSaveStep1} disabled={loading} className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-500 disabled:opacity-50 flex items-center gap-2">
                            {loading && <Loader2 className="animate-spin w-4 h-4" />} {t('wizard.next_lyrics')}
                        </button>
                        <button onClick={onCancel} className="px-4 py-2 text-zinc-500">{t('wizard.cancel')}</button>
                    </div>
                </div>
            )}

            {step === 2 && (
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">{t('wizard.paste_lyrics')}</label>
                        <textarea
                            className="mt-1 block w-full rounded-md border-zinc-300 dark:border-zinc-700 bg-white dark:bg-black text-zinc-900 dark:text-white h-48 px-3 py-2 font-mono text-sm"
                            value={lyricsText}
                            onChange={e => setLyricsText(e.target.value)}
                            placeholder={t('wizard.lyrics_placeholder')}
                        />
                    </div>
                    <div className="flex gap-2">
                        <button onClick={handleSaveStep2} disabled={loading} className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-500 disabled:opacity-50 flex items-center gap-2">
                            {loading && <Loader2 className="animate-spin w-4 h-4" />} {t('wizard.next_enrichment')}
                        </button>
                    </div>
                </div>
            )}

            {step === 3 && (
                <div className="space-y-4">
                    <p className="text-zinc-600 dark:text-zinc-400">
                        {t('wizard.ai_desc')}
                    </p>
                    <div className="flex gap-2">
                        <button onClick={handleEnrich} disabled={loading} className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-500 disabled:opacity-50 flex items-center gap-2 w-full justify-center">
                            {loading && <Loader2 className="animate-spin w-4 h-4" />}
                            {loading ? t('wizard.generating') : t('wizard.generate_btn')}
                        </button>
                    </div>
                    <div className="text-xs text-zinc-500 text-center">
                        {t('wizard.wait_msg')}
                    </div>
                </div>
            )}
        </div>
    );
}
