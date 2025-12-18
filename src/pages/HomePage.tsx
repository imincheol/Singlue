import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Search, Music, Headphones, Archive, Globe } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const getVideoId = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
};

export default function HomePage() {
    const [urlInput, setUrlInput] = useState('');
    const navigate = useNavigate();
    const { user, isApproved, isAdmin } = useAuth();
    const { t } = useTranslation();

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        const id = getVideoId(urlInput);
        if (id) {
            navigate(`/watch/${id}`);
        } else {
            alert(t('home.invalid_url'));
        }
    };

    return (
        <div className="flex-1 flex flex-col items-center justify-center space-y-8 animate-in fade-in zoom-in duration-500 min-h-[calc(100vh-4rem)] relative">

            <div className="text-center space-y-4 max-w-2xl">
                <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-b from-zinc-900 to-zinc-500 dark:from-white dark:to-zinc-600 whitespace-pre-line pb-2">
                    {t('home.title')}
                </h1>
                <p className="text-xl text-zinc-600 dark:text-zinc-400">
                    {t('home.subtitle')}
                </p>
            </div>

            <form onSubmit={handleSearch} className="w-full max-w-xl relative group">
                <div className="absolute inset-0 bg-indigo-500/20 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative flex items-center bg-zinc-100 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-full p-2 pl-6 shadow-2xl has-[:focus]:border-indigo-500 transition-colors">
                    <Search className="w-5 h-5 text-zinc-400 dark:text-zinc-500 mr-3" />
                    <input
                        type="text"
                        placeholder={t('home.placeholder')}
                        className="flex-1 bg-transparent border-none outline-none text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-600 h-10"
                        value={urlInput}
                        onChange={(e) => setUrlInput(e.target.value)}
                    />
                    <button
                        type="submit"
                        className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-full font-medium transition-colors"
                    >
                        {t('home.start')}
                    </button>
                </div>
            </form>

            <div className="flex items-center space-x-8 text-zinc-400 dark:text-zinc-500 text-sm mt-12">
                <div className="flex items-center space-x-2">
                    <Music className="w-4 h-4" />
                    <span>{t('home.synced_lyrics')}</span>
                </div>
                <div className="w-1 h-1 bg-zinc-800 rounded-full" />
                <div className="flex items-center space-x-2">
                    <Headphones className="w-4 h-4" />
                    <span>{t('home.ai_curator')}</span>
                </div>
            </div>

            <Link to={user ? "/library" : "/library?tab=public"} className="flex items-center gap-2 text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors mt-8">
                {user ? (
                    <>
                        <Archive className="w-4 h-4" />
                        <span>{t('home.go_to_library')}</span>
                    </>
                ) : (
                    <>
                        <Globe className="w-4 h-4" />
                        <span>Browse Public Library</span>
                    </>
                )}
            </Link>
        </div>
    );
}
