import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAppStore } from '../store/useAppStore';
import { getSongsForVideo } from '../services/supabase';
import { YouTubePlayer } from '../components/YouTubePlayer';
import { LyricsDisplay } from '../components/LyricsDisplay';
import LyricsSearchModal from '../components/LyricsSearchModal';
import { Music, Plus, Lock } from 'lucide-react';
import { PlayerControls } from '../components/PlayerControls';
import { ThreeLineLyrics } from '../components/ThreeLineLyrics';
import { useAuth } from '../contexts/AuthContext';
import { SongCreationWizard } from '../components/SongCreationWizard';
import type { Song } from '../types';

export default function PlayerPage() {
    const { id } = useParams<{ id: string }>();
    const { t } = useTranslation();
    const { user, isApproved } = useAuth();

    // State
    const [songs, setSongs] = useState<Song[]>([]);
    const [loading, setLoading] = useState(true);
    const [isCreating, setIsCreating] = useState(false);
    const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);

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
    const hasActiveSong = !!currentSong;
    const isMySong = currentSong?.created_by === user?.id;
    const canCreate = user && isApproved && !loading && !songs.find(s => s.created_by === user.id);

    return (
        <div className="min-h-screen bg-white dark:bg-black grid grid-cols-1 lg:grid-cols-12 gap-6 h-[calc(100vh-8rem)] animate-in fade-in duration-500 pt-24 px-6 max-w-7xl mx-auto overflow-hidden relative">
            <div className="lg:col-span-7 flex flex-col space-y-4 h-full relative">
                {/* Video Player */}
                <div className="w-full shrink-0">
                    <YouTubePlayer videoId={id} />
                </div>

                {/* Quick Info & Controls */}
                <div className="bg-zinc-100 dark:bg-zinc-900/50 p-4 rounded-xl border border-zinc-200 dark:border-white/5 flex justify-between items-center mb-0 shrink-0">
                    <div>
                        <h2 className="text-lg font-bold text-zinc-900 dark:text-white mb-1 flex items-center gap-2">
                            {currentSong?.title || t('player.unknown_track')}
                            {isMySong && <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded">My Version (Stage {currentSong?.stage})</span>}
                        </h2>
                        <p className="text-zinc-600 dark:text-zinc-400 text-sm">
                            {currentSong?.artist}
                        </p>
                    </div>
                    {isMySong && (
                        <div className="flex gap-2">
                            {/* TODO: Add Edit Controls here */}
                        </div>
                    )}
                </div>

                <div className="flex-1 min-h-0 flex flex-col gap-4 overflow-y-auto pb-4 scrollbar-hide">
                    <PlayerControls onSearchClick={() => setIsSearchModalOpen(true)} />
                    <ThreeLineLyrics />
                </div>
            </div>

            <div className="lg:col-span-5 h-full relative overflow-hidden">
                {loading ? (
                    <div className="flex h-full items-center justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500" />
                    </div>
                ) : hasActiveSong ? (
                    <LyricsDisplay />
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
                    <div className="w-full h-full bg-zinc-100 dark:bg-zinc-900/30 rounded-2xl border border-zinc-200 dark:border-white/5 flex flex-col items-center justify-center p-8 text-center space-y-4">
                        <div className="w-16 h-16 bg-zinc-200 dark:bg-zinc-800 rounded-full flex items-center justify-center mb-4">
                            <Music className="w-8 h-8 text-zinc-400 dark:text-zinc-500" />
                        </div>
                        <h3 className="text-xl font-bold text-zinc-900 dark:text-white">{t('player.no_lyrics_title')}</h3>

                        {canCreate ? (
                            <div className="space-y-4">
                                <p className="text-zinc-600 dark:text-zinc-400 max-w-xs">
                                    No song info found. You can register it!
                                </p>
                                <button
                                    onClick={() => setIsCreating(true)}
                                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-xl font-medium transition-colors flex items-center gap-2 mx-auto"
                                >
                                    <Plus className="w-4 h-4" />
                                    Register Song
                                </button>
                            </div>
                        ) : !user ? (
                            <div className="space-y-4">
                                <p className="text-zinc-600 dark:text-zinc-400 max-w-xs">
                                    Sign in to view more songs or register new ones.
                                </p>
                                <Link
                                    to="/login"
                                    className="inline-flex bg-zinc-900 dark:bg-white text-white dark:text-black px-6 py-2.5 rounded-xl font-medium transition-colors items-center gap-2"
                                >
                                    <Lock className="w-4 h-4" />
                                    Sign In
                                </Link>
                            </div>
                        ) : (
                            <p className="text-zinc-600 dark:text-zinc-400 max-w-xs">
                                No public lyrics available yet.
                            </p>
                        )}
                    </div>
                )}
            </div>

            <LyricsSearchModal isOpen={isSearchModalOpen} onClose={() => setIsSearchModalOpen(false)} />
        </div>
    );
}

