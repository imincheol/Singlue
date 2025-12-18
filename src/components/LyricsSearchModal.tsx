import { useState, useEffect } from 'react';
import { Search, X, Music, Loader2 } from 'lucide-react';
import { searchLyrics, type LRCSearchResult } from '../services/lyrics';
import { parseLRC } from '../utils/lrcParser';
import { useAppStore } from '../store/useAppStore';
import type { Song, LyricsLine } from '../types';
import { useTranslation } from 'react-i18next';
import { saveSong } from '../services/supabase';
import { useAuth } from '../contexts/AuthContext';

interface LyricsSearchModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function LyricsSearchModal({ isOpen, onClose }: LyricsSearchModalProps) {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<LRCSearchResult[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { t } = useTranslation();
    const { user } = useAuth();

    const {
        setCurrentSong,
        currentSong,
        videoDuration,
        history
    } = useAppStore();

    // Pre-fill query
    useEffect(() => {
        if (isOpen && !query) {
            // Try to find current video in history for title/artist
            // Note: We don't have videoId prop here easily unless passed.
            // Assumption: The most recent history item is the current video if playing.
            const currentVideo = history[0];
            const targetSong = currentSong || currentVideo?.linkedSong;

            if (targetSong) {
                setQuery(`${targetSong.title} - ${targetSong.artist}`);
            } else if (currentVideo) {
                const title = currentVideo.title || '';
                const author = currentVideo.author || '';
                setQuery(`${title} ${author}`);
            }
        }
    }, [isOpen, history, currentSong]);

    const handleSearch = async () => {
        if (!query.trim()) return;

        setLoading(true);
        setError(null);
        setResults([]);

        try {
            const data = await searchLyrics(query);
            if (data.length === 0) {
                setError(t('search.no_results'));
            } else {
                // Sort by duration match if videoDuration available
                let sortedData = data;
                if (videoDuration > 0) {
                    sortedData = data.sort((a, b) => {
                        const diffA = Math.abs(a.duration - videoDuration);
                        const diffB = Math.abs(b.duration - videoDuration);
                        return diffA - diffB;
                    });
                }
                setResults(sortedData);
            }
        } catch (err) {
            console.error(err);
            setError(t('search.error'));
        } finally {
            setLoading(false);
        }
    };

    const handleSelect = (item: LRCSearchResult) => {
        const parsedLyrics = parseLRC(item.syncedLyrics);

        const newLyrics: LyricsLine[] = parsedLyrics.map(line => ({
            time: line.time,
            source: line.text,
            pron: {},
            trans: {}
        }));

        const currentVideo = history[0];
        if (!currentVideo) {
            console.error("No current video context");
            return;
        }

        // Keep existing ID and owner if this is my song, otherwise new
        const isMyCurrentSong = currentSong && currentSong.created_by === user?.id;
        const songId = isMyCurrentSong ? currentSong.id : crypto.randomUUID();

        const newSong: Song = {
            id: songId,
            video_id: currentVideo.videoId,
            title: item.trackName,
            artist: item.artistName,
            lyrics: newLyrics,
            created_by: isMyCurrentSong ? currentSong.created_by : (user?.id || 'guest'),
            stage: 2,
            is_public: false,
            global_offset: isMyCurrentSong ? currentSong.global_offset : 0,
            created_at: isMyCurrentSong ? currentSong.created_at : new Date().toISOString()
        };

        setCurrentSong(newSong);


        // Only persist to Supabase if logged in
        if (user) {
            saveSong(newSong).catch(err => {
                console.error('Failed to save song to Supabase:', err);
            });
        }

        onClose();
    };

    const formatDuration = (seconds: number) => {
        const m = Math.floor(seconds / 60);
        const s = (Math.round(seconds) % 60).toString().padStart(2, '0');
        return `${m}:${s}`;
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 dark:bg-black/70 backdrop-blur-sm p-4">
            <div className="bg-white dark:bg-gray-900 w-full max-w-2xl rounded-2xl shadow-2xl border border-zinc-200 dark:border-gray-800 flex flex-col max-h-[80vh]">
                {/* Header */}
                <div className="p-4 border-b border-zinc-200 dark:border-gray-800 flex justify-between items-center">
                    <h2 className="text-xl font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                        <Music className="w-5 h-5 text-indigo-400" />
                        {t('search.title')}
                    </h2>
                    <button onClick={onClose} className="p-2 hover:bg-zinc-200 dark:hover:bg-gray-800 rounded-full text-zinc-500 dark:text-gray-400 hover:text-zinc-900 dark:hover:text-white transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Search Input */}
                <div className="p-4 border-b border-zinc-200 dark:border-gray-800 flex gap-2">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 dark:text-gray-400" />
                        <input
                            type="text"
                            className="w-full bg-zinc-100 dark:bg-gray-800 text-zinc-900 dark:text-white rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 border border-zinc-300 dark:border-gray-700 placeholder-zinc-500 dark:placeholder-gray-500"
                            placeholder={t('search.placeholder')}
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                        />
                    </div>
                    <button
                        onClick={handleSearch}
                        disabled={loading}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : t('search.search_btn')}
                    </button>
                </div>

                {/* Results List */}
                <div className="flex-1 overflow-y-auto p-2 space-y-2">
                    {loading && (
                        <div className="text-center py-8 text-zinc-500 dark:text-gray-500 flex flex-col items-center gap-2">
                            <Loader2 className="w-8 h-8 animate-spin" />
                            <span>{t('search.searching')}</span>
                        </div>
                    )}

                    {!loading && error && (
                        <div className="text-center py-8 text-red-400">
                            {error}
                        </div>
                    )}

                    {!loading && !error && results.length === 0 && (
                        <div className="text-center py-8 text-zinc-500 dark:text-gray-500">
                            {t('search.empty_state')}
                        </div>
                    )}

                    {!loading && results.map((result) => (
                        <div
                            key={result.id}
                            onClick={() => handleSelect(result)}
                            className="p-3 hover:bg-zinc-100 dark:hover:bg-gray-800 rounded-xl cursor-pointer transition-colors group flex items-center gap-4 border border-transparent hover:border-indigo-500/30"
                        >
                            <div className="w-12 h-12 bg-zinc-200 dark:bg-gray-700 rounded-lg flex items-center justify-center text-zinc-500 dark:text-gray-400 group-hover:bg-zinc-300 dark:group-hover:bg-gray-600 group-hover:text-zinc-900 dark:group-hover:text-white transition-colors">
                                <Music className="w-6 h-6" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <h3 className="text-zinc-900 dark:text-white font-semibold truncate">{result.trackName}</h3>
                                <p className="text-zinc-600 dark:text-gray-400 text-sm truncate">{result.artistName}</p>
                            </div>
                            <div className="flex flex-col items-end gap-1">
                                <span className={`text-xs font-mono px-2 py-0.5 rounded ${Math.abs(result.duration - videoDuration) < 5
                                    ? 'bg-green-500/20 text-green-400'
                                    : 'bg-zinc-200 dark:bg-gray-800 text-zinc-600 dark:text-gray-500'
                                    }`}>
                                    {formatDuration(result.duration)}
                                </span>
                                {videoDuration > 0 && (
                                    <span className="text-[10px] text-zinc-500 dark:text-gray-600">
                                        {Math.abs(result.duration - videoDuration) < 2 ? t('search.exact_match') :
                                            `${Math.abs(Math.round(result.duration - videoDuration))}${t('search.diff')}`}
                                    </span>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
