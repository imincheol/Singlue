import { Link } from 'react-router-dom';
import { Play, Heart, Music } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { Song } from '../types';
import { getFlagEmoji } from '../utils/country';

interface SongCardProps {
    song: Song;
    isFavorite?: boolean;
    onToggleFavorite?: (e: React.MouseEvent, song: Song) => void;
    showFavoriteButton?: boolean;
    showStatus?: boolean;
    showMySongBadge?: boolean;
    currentUserId?: string;
}

export const SongCard = ({
    song,
    isFavorite = false,
    onToggleFavorite,
    showFavoriteButton = false,
    showStatus = true,
    showMySongBadge = true,
    currentUserId
}: SongCardProps) => {
    const { t, i18n } = useTranslation();

    return (
        <Link to={`/watch/${song.video_id}`} className="group relative block bg-zinc-100 dark:bg-zinc-900 rounded-xl overflow-hidden border border-zinc-200 dark:border-white/5 hover:border-indigo-500/50 transition-all hover:scale-[1.02]">
            <div className="aspect-video relative bg-zinc-200 dark:bg-zinc-800">
                <img
                    src={`https://img.youtube.com/vi/${song.video_id}/mqdefault.jpg`}
                    alt={song.title}
                    className="w-full h-full object-cover"
                    loading="lazy"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                    <Play className="w-12 h-12 text-white fill-white" />
                </div>

                {/* Stage / Status Badges */}
                <div className="absolute top-2 right-2 flex flex-col items-end gap-1">
                    {song.country_code && (
                        <span className="text-2xl drop-shadow-md mb-1" title={song.country_code}>
                            {getFlagEmoji(song.country_code)}
                        </span>
                    )}
                    {showStatus && song.stage !== 3 && (
                        <span className={`px-2 py-1 rounded text-xs font-medium ${song.stage === 2 ? 'bg-blue-500/80 text-white' :
                            'bg-yellow-500/80 text-white'
                            }`}>
                            {song.stage === 2 ? t('library.stage_2') : t('library.stage_1')}
                        </span>
                    )}
                </div>

                {/* Favorite Button */}
                {showFavoriteButton && (
                    <button
                        onClick={(e) => onToggleFavorite?.(e, song)}
                        className="absolute top-2 left-2 p-1.5 rounded-full bg-black/40 hover:bg-black/60 transition-colors"
                    >
                        <Heart
                            className={`w-4 h-4 ${isFavorite ? 'fill-red-500 text-red-500' : 'text-white'}`}
                        />
                    </button>
                )}
            </div>
            <div className="p-4">
                <h3 className="font-semibold text-zinc-900 dark:text-white line-clamp-1 text-lg mb-1 group-hover:text-indigo-500 transition-colors">{song.title || 'Unknown Title'}</h3>
                <p className="text-sm text-zinc-600 dark:text-zinc-400 line-clamp-1">{song.artist || 'Unknown Artist'}</p>
                <div className="flex flex-col gap-2 mt-3">
                    <div className="flex justify-between items-center">
                        <p className="text-xs text-zinc-500 dark:text-zinc-600">
                            {t('library.registered')}: {song.created_at ? new Date(song.created_at).toLocaleDateString(i18n.language === 'ko' ? 'ko-KR' : 'en-US') : '...'}
                        </p>
                        {showMySongBadge && song.created_by === currentUserId && (
                            <span className="text-xs px-1.5 py-0.5 rounded bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 font-medium">{t('library.my_song')}</span>
                        )}
                        {!showMySongBadge && song.stage === 3 && (
                            <span className="flex items-center gap-1 text-xs text-zinc-400 dark:text-zinc-500">
                                <Music className="w-3 h-3" />
                                {t('home.synced_lyrics')}
                            </span>
                        )}
                    </div>
                    {song.published_at && (
                        <p className="text-xs text-zinc-400 dark:text-zinc-600">
                            {t('library.published')}: {new Date(song.published_at).toLocaleDateString(i18n.language === 'ko' ? 'ko-KR' : 'en-US')}
                        </p>
                    )}
                </div>
            </div>
        </Link>
    );
};
