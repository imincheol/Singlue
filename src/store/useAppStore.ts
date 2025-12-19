import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { saveSong } from '../services/supabase';
import type { Song, HistoryItem } from '../types';

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

    // Settings
    showPronunciation: boolean;
    togglePronunciation: () => void;
    showTranslation: boolean;
    toggleTranslation: () => void;

    // History
    history: HistoryItem[];
    addToHistory: (item: HistoryItem) => void;


    // Metadata
    metadataRefreshTrigger: number;
    triggerMetadataRefresh: () => void;

    // Player Sync
    requestedSeekTime: number | null;
    requestSeek: (time: number | null) => void;

    // Sync Persistence
    saveCurrentOffset: () => Promise<void>;

    // Persistent Local Sync Map (SongID -> Offset)
    localSyncMap: Record<string, number>;
    setLocalSync: (songId: string, offset: number) => void;
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

            showPronunciation: true,
            togglePronunciation: () => set((state) => ({ showPronunciation: !state.showPronunciation })),
            showTranslation: true,
            toggleTranslation: () => set((state) => ({ showTranslation: !state.showTranslation })),

            history: [],
            addToHistory: (item) => set((state) => {
                const filtered = state.history.filter(h => h.videoId !== item.videoId);
                return { history: [item, ...filtered].slice(0, 50) };
            }),

            metadataRefreshTrigger: 0,
            triggerMetadataRefresh: () => set((state) => ({ metadataRefreshTrigger: state.metadataRefreshTrigger + 1 })),

            requestedSeekTime: null,
            requestSeek: (time) => set({ requestedSeekTime: time }),

            saveCurrentOffset: async () => {
                const state = get();
                const { currentSong, userOffset } = state;

                if (!currentSong) return;

                const newGlobalOffset = (currentSong.global_offset || 0) + userOffset;

                try {
                    const updatedSong: Song = {
                        ...currentSong,
                        global_offset: newGlobalOffset
                    };

                    await saveSong(updatedSong);

                    // Update local state
                    set({
                        currentSong: updatedSong,
                        userOffset: 0 // Reset user offset as it's now merged
                    });
                } catch (error) {
                    console.error("Failed to save offset:", error);
                    throw error;
                }
            },

            // New: Persistent Local Sync Map
            localSyncMap: {},
            setLocalSync: (songId, offset) => set((state) => ({
                localSyncMap: { ...state.localSyncMap, [songId]: offset },
                userOffset: offset // Also update current session offset immediately if it matches? 
                // Actually, userOffset in the component usually tracks the slider. 
                // We should probably just rely on localSyncMap or init userOffset from it when song loads.
            })),
        }),
        {
            name: 'singlue-storage',
            partialize: (state) => ({
                apiKey: state.apiKey,
                showPronunciation: state.showPronunciation,
                showTranslation: state.showTranslation,
                history: state.history,
                localSyncMap: state.localSyncMap, // Persist this
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
