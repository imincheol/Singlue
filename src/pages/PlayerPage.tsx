import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAppStore } from '../store/useAppStore';
import { getSongsForVideo, saveSong } from '../services/supabase';
import { YouTubePlayer } from '../components/YouTubePlayer';
import { LyricsDisplay } from '../components/LyricsDisplay';
import LyricsSearchModal from '../components/LyricsSearchModal';
import { RefreshCw } from 'lucide-react';
import { PlayerControls } from '../components/PlayerControls';
import { ThreeLineLyrics } from '../components/ThreeLineLyrics';
import { useAuth } from '../contexts/AuthContext';
import { SongCreationWizard } from '../components/SongCreationWizard';
import type { Song, HistoryItem } from '../types';
import { getFlagEmoji } from '../utils/country';

export default function PlayerPage() {
    const { id } = useParams<{ id: string }>();
    const { t } = useTranslation();
    const { user } = useAuth();

    // State
    const [songs, setSongs] = useState<Song[]>([]);
    const [loading, setLoading] = useState(true);
    const [isCreating, setIsCreating] = useState(false);
    const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const { currentSong, setCurrentSong } = useAppStore();

    useEffect(() => {
        if (!id) return;

        loadSongs(id);
    }, [id, user]);

    const loadSongs = async (videoId: string) => {
        setLoading(true);
        const fetchedSongs = await getSongsForVideo(videoId);
        setSongs(fetchedSongs);

        // Auto-select logic
        if (fetchedSongs.length > 0) {
            // 1. Prefer my song
            const mySong = user ? fetchedSongs.find(s => s.created_by === user.id) : null;
            // 2. Fallback to public stage 3
            const publicSong = fetchedSongs.find(s => s.stage === 3 && s.is_public);

            const selected = mySong || publicSong;
            if (selected) {
                setCurrentSong(selected);
                // VideoMapping is now part of Song (global_offset)
                // setVideoMapping({
                //     videoId: selected.video_id,
                //     songId: selected.id,
                //     globalOffset: selected.global_offset
                // });
            } else {
                // Determine if we should show "Select a version" if multiple exist but none auto-selected?
                // For now, if no song selected, clear current
                setCurrentSong(null);
            }
        } else {
            setCurrentSong(null);
        }
        setLoading(false);
    };

    if (!id) return <div>Invalid Video ID</div>;

    // View State Logic
    const hasSelectedSong = currentSong !== null;
    const isMySong = currentSong?.created_by === user?.id;
    const canCreate = !!(user && !loading && !songs.find(s => s.created_by === user.id));

    return (
        <div className="min-h-screen bg-white dark:bg-black grid grid-cols-1 lg:grid-cols-12 gap-6 lg:h-[calc(100vh-8rem)] animate-in fade-in duration-500 pt-20 lg:pt-24 px-4 sm:px-6 max-w-7xl mx-auto lg:overflow-hidden relative pb-8">
            {error && (
                <div className="fixed top-24 left-1/2 -translate-x-1/2 z-50 bg-red-500 text-white px-6 py-2 rounded-full shadow-lg animate-in fade-in slide-in-from-top-4 duration-300 text-sm font-medium">
                    {error}
                </div>
            )}
            <div className="lg:col-span-7 flex flex-col space-y-4 h-full relative">
                {/* Video Player */}
                <div className="w-full shrink-0">
                    <YouTubePlayer
                        videoId={id}
                        onVideoData={async (data) => {
                            // Auto-Register Song (Stage 1)
                            if (user && !loading && !hasSelectedSong && !songs.find(s => s.created_by === user.id)) {
                                console.log("Auto-registering new song (Stage 1)...");
                                const newSong: Song = {
                                    id: crypto.randomUUID(),
                                    video_id: id,
                                    title: data.title,
                                    artist: data.author,
                                    lyrics: [],
                                    created_by: user.id,
                                    stage: 1,
                                    is_public: false,
                                    global_offset: 0,
                                    created_at: new Date().toISOString()
                                };

                                try {
                                    await saveSong(newSong);
                                    // Refresh songs to reflect the new entry
                                    loadSongs(id);
                                } catch (err) {
                                    console.error("Failed to auto-register song:", err);
                                }
                            }
                        }}
                    />
                </div>

                {/* Quick Info & Controls */}
                <div className="bg-zinc-100 dark:bg-zinc-900/50 p-4 rounded-xl border border-zinc-200 dark:border-white/5 mb-0 shrink-0 flex flex-col gap-2">
                    {/* Row 1: YouTube Info */}
                    <div className="flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-500 overflow-hidden">
                        <span className="truncate max-w-[150px] font-medium">{songs.find(s => s.video_id === id)?.artist || 'Unknown Channel'}</span>
                        <span className="shrink-0 text-zinc-300 dark:text-zinc-700">|</span>
                        <span className="truncate flex-1">{songs.find(s => s.video_id === id)?.title || 'Video Title'}</span>
                        <a
                            href={`https://youtu.be/${id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="shrink-0 p-1 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded transition-colors"
                            title="Open in YouTube"
                        >
                            <svg className="w-3 h-3 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m-6-6L10 14" />
                            </svg>
                        </a>
                    </div>

                    {/* Row 2: Metadata & Controls */}
                    <div className="flex items-center gap-3">
                        {/* Country Flag */}
                        {isMySong && currentSong?.country_code && (
                            <span className="text-2xl shrink-0" title={currentSong.country_code}>
                                {getFlagEmoji(currentSong.country_code)}
                            </span>
                        )}

                        {/* Song Info Inputs */}
                        <div className="flex-1 flex gap-2 items-center min-w-0">
                            {isMySong ? (
                                <>
                                    <input
                                        type="text"
                                        className="bg-transparent text-sm font-semibold text-zinc-900 dark:text-zinc-300 border-b border-transparent focus:border-indigo-500 outline-none w-1/3 min-w-[80px] transition-colors placeholder-zinc-400"
                                        value={currentSong?.artist || ''}
                                        placeholder="Artist"
                                        onChange={(e) => {
                                            if (currentSong) setCurrentSong({ ...currentSong, artist: e.target.value });
                                        }}
                                        onBlur={async (e) => {
                                            if (!currentSong) return;
                                            try {
                                                const { updateSongMetadata } = await import('../services/supabase');
                                                await updateSongMetadata(currentSong.id, currentSong.title, e.target.value, currentSong.country_code);
                                            } catch (err) {
                                                console.error('Failed to update artist:', err);
                                            }
                                        }}
                                    />
                                    <span className="text-zinc-300 dark:text-zinc-600">-</span>
                                    <input
                                        type="text"
                                        className="bg-transparent text-lg font-bold text-zinc-900 dark:text-white border-b border-transparent focus:border-indigo-500 outline-none flex-1 min-w-[100px] transition-colors placeholder-zinc-400"
                                        value={currentSong?.title || ''}
                                        placeholder="Song Title"
                                        onChange={(e) => {
                                            if (currentSong) setCurrentSong({ ...currentSong, title: e.target.value });
                                        }}
                                        onBlur={async (e) => {
                                            if (!currentSong) return;
                                            try {
                                                const { updateSongMetadata } = await import('../services/supabase');
                                                await updateSongMetadata(currentSong.id, e.target.value, currentSong.artist, currentSong.country_code);
                                            } catch (err) {
                                                console.error('Failed to update title:', err);
                                            }
                                        }}
                                    />
                                </>
                            ) : (
                                <div className="flex items-baseline gap-2 truncate">
                                    <span className="text-lg font-bold text-zinc-900 dark:text-white truncate">
                                        {currentSong?.title || t('player.unknown_track')}
                                    </span>
                                    <span className="text-sm text-zinc-600 dark:text-zinc-400 truncate">
                                        {currentSong?.artist}
                                    </span>
                                </div>
                            )}
                        </div>

                        {/* Controls */}
                        {isMySong && (
                            <div className="flex gap-2 shrink-0">
                                {isMySong && (
                                    <span className="hidden sm:inline-flex text-xs bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 px-2 py-1 rounded items-center">
                                        {currentSong?.stage === 3 ? '완료' : currentSong?.stage === 2 ? '가사 매칭' : '영상 등록'}
                                    </span>
                                )}

                                {currentSong && currentSong.stage < 3 && (
                                    <button
                                        onClick={async (e) => {
                                            if (!currentSong) return;
                                            const btn = e.currentTarget;
                                            if (btn.disabled) return;
                                            btn.disabled = true;
                                            const originalContent = btn.innerHTML;
                                            // Show spinner
                                            btn.innerHTML = `<svg class="animate-spin h-5 w-5 text-indigo-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>`;

                                            const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
                                            if (!apiKey) {
                                                setError(t('player.api_key_missing'));
                                                setTimeout(() => setError(null), 3000);
                                                btn.disabled = false;
                                                btn.innerHTML = originalContent;
                                                return;
                                            }

                                            try {
                                                const historyItems = useAppStore.getState().history;
                                                const videoInfo = historyItems.find((h: HistoryItem) => h.videoId === id);
                                                const titleToParse = videoInfo?.title || currentSong.title;

                                                const { parseVideoMetadata } = await import('../services/gemini');
                                                const { updateSongMetadata } = await import('../services/supabase');

                                                const { title: newTitle, artist: newArtist, country_code: newCountry } = await parseVideoMetadata(apiKey, titleToParse);

                                                // Update DB directly without confirmation but with notification via UI change
                                                await updateSongMetadata(currentSong.id, newTitle, newArtist, newCountry);

                                                // Update local state
                                                setCurrentSong({
                                                    ...currentSong,
                                                    title: newTitle,
                                                    artist: newArtist,
                                                    country_code: newCountry || currentSong.country_code
                                                });
                                            } catch (err: any) {
                                                console.error(err);
                                                setError(t('player.update_failed') + ': ' + err.message);
                                                setTimeout(() => setError(null), 5000);
                                            } finally {
                                                btn.disabled = false;
                                                btn.innerHTML = originalContent;
                                            }
                                        }}
                                        className="p-2 hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded-lg text-zinc-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                        title="AI 정보 업데이트"
                                    >
                                        <RefreshCw className="w-5 h-5" />
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex-1 min-h-0 flex flex-col gap-4 lg:overflow-y-auto pb-4 scrollbar-hide">
                    <PlayerControls />
                    <ThreeLineLyrics />
                </div>
            </div>

            <div className="lg:col-span-5 relative lg:h-full lg:overflow-hidden">
                {loading ? (
                    <div className="flex min-h-[300px] lg:h-full items-center justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500" />
                    </div>
                ) : isCreating ? (
                    <SongCreationWizard
                        videoId={id}
                        onComplete={() => {
                            // Reload or set song
                            setIsCreating(false);
                            loadSongs(id);
                        }}
                        onCancel={() => setIsCreating(false)}
                    />
                ) : (
                    <LyricsDisplay
                        onSearchClick={() => setIsSearchModalOpen(true)}
                        onRegisterClick={() => setIsCreating(true)}
                        canCreate={canCreate}
                    />
                )}
            </div>

            <LyricsSearchModal isOpen={isSearchModalOpen} onClose={() => setIsSearchModalOpen(false)} />
        </div>
    );
}

