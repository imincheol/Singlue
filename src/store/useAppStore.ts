import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { updateVideoMappingOffset } from '../services/supabase';
import type { Song, VideoMapping, HistoryItem } from '../types';

interface AppState {
    apiKey: string | null;
    setApiKey: (key: string) => void;

    currentSong: Song | null;
    setCurrentSong: (song: Song | null) => void;

    videoMapping: VideoMapping | null;
    setVideoMapping: (mapping: VideoMapping | null) => void;

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
    linkSongToHistory: (videoId: string, song: Song) => void;

    // Metadata
    metadataRefreshTrigger: number;
    triggerMetadataRefresh: () => void;

    // Player Sync
    requestedSeekTime: number | null;
    requestSeek: (time: number | null) => void;

    // Sync Persistence
    saveCurrentOffset: () => Promise<void>;
}

export const useAppStore = create<AppState>()(
    persist(
        (set, get) => ({
            apiKey: import.meta.env.VITE_GEMINI_API_KEY || null,
            setApiKey: (key) => set({ apiKey: key }),

            currentSong: null,
            setCurrentSong: (song) => set({ currentSong: song }),

            videoMapping: null,
            setVideoMapping: (mapping) => set({ videoMapping: mapping }),

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
                // Check if exists
                const existingIndex = state.history.findIndex(h => h.videoId === item.videoId);
                let newItem = item;

                if (existingIndex !== -1) {
                    // Merge: Keep existing linkedSong if new item doesn't have it
                    // Actually, usually addToHistory is called on video load (without song).
                    // So we must preserve the existing song.
                    const existing = state.history[existingIndex];
                    newItem = {
                        ...item,
                        linkedSong: existing.linkedSong || item.linkedSong
                    };
                }

                const filtered = state.history.filter(h => h.videoId !== item.videoId);
                return { history: [newItem, ...filtered].slice(0, 50) };
            }),

            linkSongToHistory: (videoId, song) => set((state) => {
                const history = state.history.map(item => {
                    if (item.videoId === videoId) {
                        return { ...item, linkedSong: song };
                    }
                    return item;
                });
                return { history };
            }),

            metadataRefreshTrigger: 0,
            triggerMetadataRefresh: () => set((state) => ({ metadataRefreshTrigger: state.metadataRefreshTrigger + 1 })),

            requestedSeekTime: null,
            requestSeek: (time) => set({ requestedSeekTime: time }),

            saveCurrentOffset: async () => {
                const state = get();
                const { videoMapping, userOffset } = state;

                if (!videoMapping) return;

                const newGlobalOffset = (videoMapping.globalOffset || 0) + userOffset;

                try {
                    await updateVideoMappingOffset(videoMapping.videoId, newGlobalOffset);

                    // Update local state
                    set({
                        videoMapping: {
                            ...videoMapping,
                            globalOffset: newGlobalOffset
                        },
                        userOffset: 0 // Reset user offset as it's now merged
                    });
                } catch (error) {
                    console.error("Failed to save offset:", error);
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
            }),
        }
    )
);
