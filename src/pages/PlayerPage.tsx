import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAppStore } from '../store/useAppStore';
import { YouTubePlayer } from '../components/YouTubePlayer';
import { LyricsDisplay } from '../components/LyricsDisplay';
import LyricsSearchModal from '../components/LyricsSearchModal';
import { Search, Music, RefreshCw } from 'lucide-react';
import { PlayerControls } from '../components/PlayerControls';
import { ThreeLineLyrics } from '../components/ThreeLineLyrics';

export default function PlayerPage() {
    const { id } = useParams<{ id: string }>();
    const { t } = useTranslation();
    const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);

    if (!id) {
        return <div className="text-white text-center pt-24">{t('player.video_not_found')}</div>;
    }

    const { currentSong, history, triggerMetadataRefresh } = useAppStore();

    const isConfigured = !!currentSong;

    // Logic to find current display info
    // 1. Current Song (Lyrics metadata)
    // 2. History Item (Video metadata)
    const currentHistory = history.find(h => h.videoId === id);

    // Default Unknown
    let displayTitle = t('player.unknown_track');
    let displayArtist = t('player.load_lyrics_msg');
    let showRefetch = false;

    if (currentSong?.title) {
        displayTitle = currentSong.title;
        displayArtist = currentSong.artist;
    } else if (currentHistory?.title) {
        displayTitle = currentHistory.title;
        displayArtist = currentHistory.author || t('player.unknown_track');
    } else {
        // Really unknown, allow refetch
        showRefetch = true;
    }

    // Verify if history title itself is "unknown" or empty? 
    // Usually YouTube API might return empty if adblock or error.
    if (!currentHistory?.title || displayTitle === t('player.unknown_track')) {
        showRefetch = true;
    }

    // ...

    return (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[calc(100vh-8rem)] animate-in fade-in duration-500 pt-24 px-6 max-w-7xl mx-auto overflow-hidden relative">
            <div className="lg:col-span-7 flex flex-col space-y-4 h-full relative">
                {/* Video Player + Controls Wrapper */}

                {/* Aspect Ratio Container for Video */}
                <div className="w-full shrink-0">
                    <YouTubePlayer videoId={id} />
                </div>

                {/* Quick Info */}
                <div className="bg-zinc-900/50 p-4 rounded-xl border border-white/5 flex justify-between items-center mb-0 shrink-0">
                    <div>
                        <h2 className="text-lg font-bold text-white mb-1 flex items-center gap-2">
                            {displayTitle}
                            {showRefetch && (
                                <button
                                    onClick={triggerMetadataRefresh}
                                    title={t('player.refetch_info')}
                                    className="p-1 rounded-full bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white transition-colors"
                                >
                                    <RefreshCw className="w-3 h-3" />
                                </button>
                            )}
                        </h2>
                        <p className="text-zinc-400 text-sm">
                            {displayArtist}
                        </p>
                    </div>
                </div>

                {/* Controls & Mini Lyrics */}
                <div className="flex-1 min-h-0 flex flex-col gap-4 overflow-y-auto pb-4 scrollbar-hide">
                    <PlayerControls onSearchClick={() => setIsSearchModalOpen(true)} />
                    <ThreeLineLyrics />
                </div>
            </div>

            <div className="lg:col-span-5 h-full relative overflow-hidden">
                {isConfigured ? (
                    <LyricsDisplay />
                ) : (
                    <div className="w-full h-full bg-zinc-900/30 rounded-2xl border border-white/5 flex flex-col items-center justify-center p-8 text-center space-y-4">
                        <div className="w-16 h-16 bg-zinc-800 rounded-full flex items-center justify-center mb-4">
                            <Music className="w-8 h-8 text-zinc-500" />
                        </div>
                        <h3 className="text-xl font-bold text-white">{t('player.no_lyrics_title')}</h3>
                        <p className="text-zinc-400 max-w-xs">
                            {t('player.no_lyrics_desc')}
                        </p>
                        <button
                            onClick={() => setIsSearchModalOpen(true)}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-xl font-medium transition-colors flex items-center gap-2"
                        >
                            <Search className="w-4 h-4" />
                            {t('player.search_lyrics')}
                        </button>
                    </div>
                )}
            </div>

            <LyricsSearchModal isOpen={isSearchModalOpen} onClose={() => setIsSearchModalOpen(false)} />
        </div>
    );
}
