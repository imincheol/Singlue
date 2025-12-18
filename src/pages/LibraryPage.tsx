import { Link, useSearchParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { getMySongs, getRecentPublicSongs, getFavorites, getFavoriteIds, toggleFavorite } from '../services/supabase';
import { Play, Mic2, ChevronLeft, Globe, User, Heart } from 'lucide-react';
import type { Song } from '../types';
import { useAuth } from '../contexts/AuthContext';

type Tab = 'my' | 'public';

export default function LibraryPage() {
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
            alert('Please sign in to add favorites!');
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

    const SongCard = ({ song }: { song: Song }) => (
        <Link to={`/watch/${song.video_id}`} className="group relative block bg-zinc-100 dark:bg-zinc-900 rounded-xl overflow-hidden border border-zinc-200 dark:border-white/5 hover:border-indigo-500/50 transition-all hover:scale-[1.02]">
            <div className="aspect-video relative bg-zinc-200 dark:bg-zinc-800">
                <img
                    src={`https://img.youtube.com/vi/${song.video_id}/mqdefault.jpg`}
                    alt={song.title}
                    className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                    <Play className="w-12 h-12 text-white fill-white" />
                </div>

                {/* Stage / Status Badges */}
                <div className="absolute top-2 right-2 flex gap-1">
                    {song.stage !== 3 && (
                        <span className={`px-2 py-1 rounded text-xs font-medium ${song.stage === 2 ? 'bg-blue-500/80 text-white' :
                            'bg-yellow-500/80 text-white'
                            }`}>
                            {song.stage === 2 ? '가사 매칭' : '영상 등록'}
                        </span>
                    )}
                </div>

                {/* Favorite Button */}
                <button
                    onClick={(e) => handleToggleFavorite(e, song)}
                    className="absolute top-2 left-2 p-1.5 rounded-full bg-black/40 hover:bg-black/60 transition-colors"
                >
                    <Heart
                        className={`w-4 h-4 ${favoriteIds.has(song.id) ? 'fill-red-500 text-red-500' : 'text-white'}`}
                    />
                </button>
            </div>
            <div className="p-4">
                <h3 className="font-semibold text-zinc-900 dark:text-white line-clamp-1 text-lg mb-1">{song.title || 'Unknown Title'}</h3>
                <p className="text-sm text-zinc-600 dark:text-zinc-400 line-clamp-1">{song.artist || 'Unknown Artist'}</p>
                <div className="flex flex-col gap-2 mt-3">
                    <div className="flex justify-between items-center">
                        <p className="text-xs text-zinc-500 dark:text-zinc-600">
                            등록: {song.created_at ? new Date(song.created_at).toLocaleDateString('ko-KR') : '최근'}
                        </p>
                        {song.created_by === user?.id ? (
                            <span className="text-xs px-1.5 py-0.5 rounded bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 font-medium">내 노래</span>
                        ) : (
                            <span className="text-xs text-zinc-400">공개</span>
                        )}
                    </div>
                    {song.published_at && (
                        <p className="text-xs text-zinc-400 dark:text-zinc-600">
                            공개: {new Date(song.published_at).toLocaleDateString('ko-KR')}
                        </p>
                    )}
                </div>
            </div>
        </Link>
    );

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
                                Library
                            </h1>
                            <p className="text-zinc-600 dark:text-zinc-400 text-sm mt-1">
                                {activeTab === 'my' ? 'Manage your songs and favorites' : 'Explore songs from the community'}
                            </p>
                        </div>
                    </div>

                    {/* Tabs */}
                    <div className="flex bg-zinc-100 dark:bg-zinc-900 p-1 rounded-xl">
                        <button
                            onClick={() => {
                                if (!user) {
                                    alert('Please sign in to view your library.');
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
                            My Library
                        </button>
                        <button
                            onClick={() => setActiveTab('public')}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'public'
                                ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-sm'
                                : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'
                                }`}
                        >
                            <Globe className="w-4 h-4" />
                            Public Library
                        </button>
                    </div>
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
                                        즐겨찾기
                                    </h2>
                                    {myFavorites.length === 0 ? (
                                        <div className="text-zinc-500 text-sm italic py-4">아직 즐겨찾기가 없습니다. 공개 보관함에서 추가해보세요!</div>
                                    ) : (
                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                            {myFavorites.map(song => <SongCard key={song.id} song={song} />)}
                                        </div>
                                    )}
                                </section>

                                {/* Section: Completed (Stage 3) */}
                                {stage3Songs.length > 0 && (
                                    <section>
                                        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                                            <span className="w-2 h-8 bg-green-500 rounded-full"></span>
                                            공개된 노래
                                        </h2>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                            {stage3Songs.map(song => <SongCard key={song.id} song={song} />)}
                                        </div>
                                    </section>
                                )}

                                {/* Section: Stage 2 (Lyrics Matched) */}
                                {stage2Songs.length > 0 && (
                                    <section>
                                        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                                            <span className="w-2 h-8 bg-blue-500 rounded-full"></span>
                                            가사 매칭
                                        </h2>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                            {stage2Songs.map(song => <SongCard key={song.id} song={song} />)}
                                        </div>
                                    </section>
                                )}

                                {/* Section: Stage 1 (Video Registered) */}
                                {stage1Songs.length > 0 && (
                                    <section>
                                        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                                            <span className="w-2 h-8 bg-yellow-500 rounded-full"></span>
                                            영상 등록
                                        </h2>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                            {stage1Songs.map(song => <SongCard key={song.id} song={song} />)}
                                        </div>
                                    </section>
                                )}

                                {mySongs.length === 0 && myFavorites.length === 0 && (
                                    <div className="text-center py-20 bg-zinc-100 dark:bg-zinc-900/30 rounded-2xl border border-zinc-200 dark:border-white/5">
                                        <Mic2 className="w-16 h-16 text-zinc-400 dark:text-zinc-600 mx-auto mb-4" />
                                        <h2 className="text-xl font-semibold text-zinc-700 dark:text-zinc-300">보관함이 비어있습니다</h2>
                                        <p className="text-zinc-500 dark:text-zinc-500 mt-2">노래를 만들거나 공개 보관함에서 즐겨찾기를 추가해보세요.</p>
                                    </div>
                                )}
                            </div>
                        )}

                        {activeTab === 'public' && (
                            <div>
                                {publicSongs.length === 0 ? (
                                    <div className="text-center py-20 bg-zinc-100 dark:bg-zinc-900/30 rounded-2xl border border-zinc-200 dark:border-white/5">
                                        <Globe className="w-16 h-16 text-zinc-400 dark:text-zinc-600 mx-auto mb-4" />
                                        <h2 className="text-xl font-semibold text-zinc-700 dark:text-zinc-300">Public Library is Empty</h2>
                                        <p className="text-zinc-500 dark:text-zinc-500 mt-2">Be the first to share a completed song with the community!</p>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                        {publicSongs.map(song => <SongCard key={song.id} song={song} />)}
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
