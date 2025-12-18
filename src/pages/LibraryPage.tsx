import { Link, useSearchParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { getMySongs, getRecentPublicSongs, getFavorites, getFavoriteIds, toggleFavorite } from '../services/supabase';
import { Mic2, ChevronLeft, Globe, User } from 'lucide-react';
import type { Song } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { useTranslation } from 'react-i18next';

type Tab = 'my' | 'public';
import { SongCard } from '../components/SongCard';

export default function LibraryPage() {
    const { t } = useTranslation();
    const { user } = useAuth();
    const [searchParams] = useSearchParams();

    // Determine initial tab: 
    // 1. Query param
    // 2. 'public' if guest
    // 3. 'my' default for user
    const initialTab: Tab = (searchParams.get('tab') as Tab) || (!user ? 'public' : 'my');
    const [activeTab, setActiveTab] = useState<Tab>(initialTab);

    // Data states
    const [mySongs, setMySongs] = useState<Song[]>([]);
    const [myFavorites, setMyFavorites] = useState<Song[]>([]);
    const [publicSongs, setPublicSongs] = useState<Song[]>([]);

    // UI states
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());

    // Update tab if user status changes (e.g. logout -> force public)
    useEffect(() => {
        if (!user && activeTab === 'my') {
            setActiveTab('public');
        }
    }, [user, activeTab]);

    useEffect(() => {
        const loadData = async () => {
            setIsLoading(true);
            try {
                // Public songs are always fetched
                const pubPromise = getRecentPublicSongs();

                // User-specific data
                let myPromise: Promise<Song[]> = Promise.resolve([]);
                let favsPromise: Promise<Song[]> = Promise.resolve([]);
                let favIdsPromise: Promise<Set<string>> = Promise.resolve(new Set());

                if (user) {
                    myPromise = getMySongs(user.id);
                    favsPromise = getFavorites(user.id);
                    favIdsPromise = getFavoriteIds(user.id);
                }

                const [pub, my, favs, favIds] = await Promise.race([
                    Promise.all([
                        pubPromise,
                        myPromise,
                        favsPromise,
                        favIdsPromise
                    ]),
                    new Promise<never>((_, reject) =>
                        setTimeout(() => reject(new Error('Request timed out')), 5000)
                    )
                ]) as [Song[], Song[], Song[], Set<string>];

                setPublicSongs(pub || []);
                setMySongs(my || []);
                setMyFavorites(favs || []);
                setFavoriteIds(favIds);
            } catch (err) {
                console.error('Error loading library data:', err);
            } finally {
                setIsLoading(false);
            }
        };

        loadData();
    }, [user]);

    const handleToggleFavorite = async (e: React.MouseEvent, song: Song) => {
        e.preventDefault(); // Prevent navigation
        if (!user) {
            setError(t('library.signin_required'));
            setTimeout(() => setError(null), 3000);
            return;
        }

        // Optimistic update
        const isFav = favoriteIds.has(song.id);
        const newFavs = new Set(favoriteIds);
        if (isFav) {
            newFavs.delete(song.id);
            setMyFavorites(prev => prev.filter(s => s.id !== song.id));
        } else {
            newFavs.add(song.id);
            setMyFavorites(prev => [song, ...prev]);
        }
        setFavoriteIds(newFavs);

        // API call
        try {
            await toggleFavorite(user.id, song.id);
        } catch (err) {
            console.error('Failed to toggle favorite:', err);
            // Revert on error could be implemented here
        }
    };

    // Filter my songs by stage
    // Each song should appear in only ONE section based on its stage
    const stage1Songs = mySongs.filter(s => s.stage === 1); // Video Registered
    const stage2Songs = mySongs.filter(s => s.stage === 2); // Lyrics Matched
    const stage3Songs = mySongs.filter(s => s.stage === 3); // Completed

    return (
        <div className="min-h-screen bg-white dark:bg-black text-zinc-900 dark:text-white p-6 pt-24">
            <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <Link to="/" className="p-2 hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded-lg text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors">
                            <ChevronLeft className="w-6 h-6" />
                        </Link>
                        <div>
                            <h1 className="text-3xl font-bold flex items-center gap-3">
                                {activeTab === 'my' ? (<Mic2 className="w-8 h-8 text-indigo-500" />) : (<Globe className="w-8 h-8 text-green-500" />)}
                                {t('library.title')}
                            </h1>
                            <p className="text-zinc-600 dark:text-zinc-400 text-sm mt-1">
                                {activeTab === 'my' ? t('library.subtitle_my') : t('library.subtitle_public')}
                            </p>
                        </div>
                    </div>

                    {/* Tabs */}
                    <div className="flex bg-zinc-100 dark:bg-zinc-900 p-1 rounded-xl">
                        <button
                            onClick={() => {
                                if (!user) {
                                    setError(t('library.signin_required_view'));
                                    setTimeout(() => setError(null), 3000);
                                    return;
                                }
                                setActiveTab('my');
                            }}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'my'
                                ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-sm'
                                : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'
                                }`}
                        >
                            <User className="w-4 h-4" />
                            {t('library.tab_my')}
                        </button>
                        <button
                            onClick={() => setActiveTab('public')}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'public'
                                ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-sm'
                                : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'
                                }`}
                        >
                            <Globe className="w-4 h-4" />
                            {t('library.tab_public')}
                        </button>
                    </div>

                    {error && (
                        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-50 bg-red-500 text-white px-6 py-2 rounded-full shadow-lg animate-in fade-in slide-in-from-top-4 duration-300">
                            {error}
                        </div>
                    )}
                </div>

                {isLoading ? (
                    <div className="flex items-center justify-center py-20">
                        <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                ) : (
                    <>
                        {activeTab === 'my' && (
                            <div className="space-y-12">
                                {/* Section: Favorites */}
                                <section>
                                    <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                                        <span className="w-2 h-8 bg-pink-500 rounded-full"></span>
                                        {t('library.favorites')}
                                    </h2>
                                    {myFavorites.length === 0 ? (
                                        <div className="text-zinc-500 text-sm italic py-4">{t('library.empty_fav')}</div>
                                    ) : (
                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                            {myFavorites.map(song => (
                                                <SongCard
                                                    key={song.id}
                                                    song={song}
                                                    isFavorite={true}
                                                    onToggleFavorite={handleToggleFavorite}
                                                    showFavoriteButton={true}
                                                    currentUserId={user?.id}
                                                />
                                            ))}
                                        </div>
                                    )}
                                </section>

                                {/* Section: Completed (Stage 3) */}
                                {stage3Songs.length > 0 && (
                                    <section>
                                        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                                            <span className="w-2 h-8 bg-green-500 rounded-full"></span>
                                            {t('library.stage_3')}
                                        </h2>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                            {stage3Songs.map(song => (
                                                <SongCard
                                                    key={song.id}
                                                    song={song}
                                                    isFavorite={favoriteIds.has(song.id)}
                                                    onToggleFavorite={handleToggleFavorite}
                                                    showFavoriteButton={true}
                                                    currentUserId={user?.id}
                                                />
                                            ))}
                                        </div>
                                    </section>
                                )}

                                {/* Section: Stage 2 (Lyrics Matched) */}
                                {stage2Songs.length > 0 && (
                                    <section>
                                        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                                            <span className="w-2 h-8 bg-blue-500 rounded-full"></span>
                                            {t('library.stage_2')}
                                        </h2>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                            {stage2Songs.map(song => (
                                                <SongCard
                                                    key={song.id}
                                                    song={song}
                                                    isFavorite={favoriteIds.has(song.id)}
                                                    onToggleFavorite={handleToggleFavorite}
                                                    showFavoriteButton={true}
                                                    currentUserId={user?.id}
                                                />
                                            ))}
                                        </div>
                                    </section>
                                )}

                                {/* Section: Stage 1 (Video Registered) */}
                                {stage1Songs.length > 0 && (
                                    <section>
                                        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                                            <span className="w-2 h-8 bg-yellow-500 rounded-full"></span>
                                            {t('library.stage_1')}
                                        </h2>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                            {stage1Songs.map(song => (
                                                <SongCard
                                                    key={song.id}
                                                    song={song}
                                                    isFavorite={favoriteIds.has(song.id)}
                                                    onToggleFavorite={handleToggleFavorite}
                                                    showFavoriteButton={true}
                                                    currentUserId={user?.id}
                                                />
                                            ))}
                                        </div>
                                    </section>
                                )}

                                {mySongs.length === 0 && myFavorites.length === 0 && (
                                    <div className="text-center py-20 bg-zinc-100 dark:bg-zinc-900/30 rounded-2xl border border-zinc-200 dark:border-white/5">
                                        <Mic2 className="w-16 h-16 text-zinc-400 dark:text-zinc-600 mx-auto mb-4" />
                                        <h2 className="text-xl font-semibold text-zinc-700 dark:text-zinc-300">{t('library.empty_my').split('.')[0]}</h2>
                                        <p className="text-zinc-500 dark:text-zinc-500 mt-2">{t('library.empty_my').split('.')[1]}</p>
                                    </div>
                                )}
                            </div>
                        )}

                        {activeTab === 'public' && (
                            <div>
                                {publicSongs.length === 0 ? (
                                    <div className="text-center py-20 bg-zinc-100 dark:bg-zinc-900/30 rounded-2xl border border-zinc-200 dark:border-white/5">
                                        <Globe className="w-16 h-16 text-zinc-400 dark:text-zinc-600 mx-auto mb-4" />
                                        <h2 className="text-xl font-semibold text-zinc-700 dark:text-zinc-300">{t('library.empty_public').split('.')[0]}</h2>
                                        <p className="text-zinc-500 dark:text-zinc-500 mt-2">{t('library.empty_public').split('.')[1]}</p>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                        {publicSongs.map(song => (
                                            <SongCard
                                                key={song.id}
                                                song={song}
                                                isFavorite={favoriteIds.has(song.id)}
                                                onToggleFavorite={handleToggleFavorite}
                                                showFavoriteButton={!!user}
                                                currentUserId={user?.id}
                                            />
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}
