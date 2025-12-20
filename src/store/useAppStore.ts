import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { saveSong } from '../services/supabase';
import type { Song, HistoryItem } from '../types';
import type { LanguageCode } from '../constants/languages';

interface AppState {
    apiKey: string | null;
    setApiKey: (key: string) => void;

    currentSong: Song | null;
    setCurrentSong: (song: Song | null) => void;

    // Player State
    isPlaying: boolean;
    setIsPlaying: (isPlaying: boolean) => void;
    currentTime: number;
    setCurrentTime: (time: number) => void;
    playbackRate: number;
    setPlaybackRate: (rate: number) => void;
    videoDuration: number;
    setVideoDuration: (duration: number) => void;

    // Offset adjustment (temporary for current session)
    userOffset: number;
    setUserOffset: (offset: number) => void;

    // Edit Mode Shift (Draft)
    draftOffset: number;
    setDraftOffset: (offset: number) => void;

    // Settings
    showPronunciation: boolean;
    togglePronunciation: () => void;
    showTranslation: boolean;
    toggleTranslation: () => void;

    // View Modes
    isKaraokeMode: boolean;
    toggleKaraokeMode: () => void;

    // History
    history: HistoryItem[];
    addToHistory: (item: HistoryItem) => void;


    // Metadata
    metadataRefreshTrigger: number;
    triggerMetadataRefresh: () => void;

    // Localization Context
    contentLanguage: LanguageCode; // Target language for lyrics/translation
    setContentLanguage: (lang: LanguageCode) => void;

    // Player Sync
    requestedSeekTime: number | null;
    requestSeek: (time: number | null) => void;

    // Sync persistence (Edit Mode)
    // Shifts all lyrics by a certain amount (seconds) and saves to DB.
    updateLyricsTimeShift: (shiftAmount: number) => Promise<void>;
}

export const useAppStore = create<AppState>()(
    persist(
        (set, get) => ({
            apiKey: import.meta.env.VITE_GEMINI_API_KEY || null,
            setApiKey: (key) => set({ apiKey: key }),

            currentSong: null,
            setCurrentSong: (song) => set({ currentSong: song }),

            isPlaying: false,
            setIsPlaying: (isPlaying) => set({ isPlaying }),
            currentTime: 0,
            setCurrentTime: (currentTime) => set({ currentTime }),
            playbackRate: 1,
            setPlaybackRate: (playbackRate) => set({ playbackRate }),
            videoDuration: 0,
            setVideoDuration: (videoDuration) => set({ videoDuration }),

            userOffset: 0,
            setUserOffset: (userOffset) => set({ userOffset }),

            draftOffset: 0,
            setDraftOffset: (draftOffset) => set({ draftOffset }),

            showPronunciation: true,
            togglePronunciation: () => set((state) => ({ showPronunciation: !state.showPronunciation })),
            showTranslation: true,
            toggleTranslation: () => set((state) => ({ showTranslation: !state.showTranslation })),

            isKaraokeMode: false,
            toggleKaraokeMode: () => set((state) => ({ isKaraokeMode: !state.isKaraokeMode })),

            history: [],
            addToHistory: (item) => set((state) => {
                const filtered = state.history.filter(h => h.videoId !== item.videoId);
                return { history: [item, ...filtered].slice(0, 50) };
            }),

            metadataRefreshTrigger: 0,
            triggerMetadataRefresh: () => set((state) => ({ metadataRefreshTrigger: state.metadataRefreshTrigger + 1 })),

            contentLanguage: 'ko', // Default content language
            setContentLanguage: (lang) => set({ contentLanguage: lang }),

            requestedSeekTime: null,
            requestSeek: (time) => set({ requestedSeekTime: time }),

            saveCurrentOffset: async () => {
                // Deprecated in Order 03? 
                // We keep it for now if needed, but Order 03 focuses on updateLyricsTimeShift.
                // Or maybe we can reuse this for "Edit Sync" if we decided to use global_offset.
                // But user requested "change lyrics time itself".
                // So this might be unused or we repurpose it.
                // Let's implement updateLyricsTimeShift below.
            },

            updateLyricsTimeShift: async (shiftAmount: number) => {
                const state = get();
                const { currentSong } = state;
                if (!currentSong) return;

                // Create new lyrics with shifted times
                const newLyrics = currentSong.lyrics.map(line => {
                    let newTime = line.time + shiftAmount;
                    // Prevent negative time
                    if (newTime < 0) newTime = 0;
                    // Round to 1 decimal place (00.0s)
                    newTime = Math.round(newTime * 10) / 10;
                    return { ...line, time: newTime };
                });

                // Update Song object
                const updatedSong: Song = {
                    ...currentSong,
                    lyrics: newLyrics
                    // We do NOT change global_offset here, as we are baking the offset into the lyrics.
                };

                try {
                    await saveSong(updatedSong);

                    // Update local state
                    set({ currentSong: updatedSong });

                    console.log(`Lyrics shifted by ${shiftAmount}s and saved.`);
                } catch (error) {
                    console.error("Failed to shift lyrics time:", error);
                    throw error;
                }
            },


        }),
        {
            name: 'singlue-storage',
            partialize: (state) => ({
                apiKey: state.apiKey,
                showPronunciation: state.showPronunciation,
                showTranslation: state.showTranslation,
                history: state.history,
                contentLanguage: state.contentLanguage,
                // localSyncMap removed as per order 03 requirements (temporary sync only)
            }),
            merge: (persistedState, currentState) => {
                const merged = { ...currentState, ...(persistedState as object) } as AppState;
                // If persisted apiKey is null/empty but we have an env key, use the env key
                if (!merged.apiKey && import.meta.env.VITE_GEMINI_API_KEY) {
                    merged.apiKey = import.meta.env.VITE_GEMINI_API_KEY;
                }
                return merged;
            },
        }
    )
);
