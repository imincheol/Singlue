import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Search, Music, Headphones, Archive } from 'lucide-react';

const getVideoId = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
};

export default function HomePage() {
    const [urlInput, setUrlInput] = useState('');
    const navigate = useNavigate();

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        const id = getVideoId(urlInput);
        if (id) {
            navigate(`/watch/${id}`);
        } else {
            alert('Invalid YouTube URL');
        }
    };

    return (
        <div className="flex-1 flex flex-col items-center justify-center space-y-8 animate-in fade-in zoom-in duration-500 min-h-[calc(100vh-4rem)]">
            <div className="text-center space-y-4 max-w-2xl">
                <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-b from-white to-zinc-600">
                    Stick the Rhythm,<br />Master the Fluency.
                </h1>
                <p className="text-xl text-zinc-400">
                    AI-powered language learning through your favorite music videos.
                </p>
            </div>

            <form onSubmit={handleSearch} className="w-full max-w-xl relative group">
                <div className="absolute inset-0 bg-indigo-500/20 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative flex items-center bg-zinc-900 border border-zinc-700 rounded-full p-2 pl-6 shadow-2xl has-[:focus]:border-indigo-500 transition-colors">
                    <Search className="w-5 h-5 text-zinc-500 mr-3" />
                    <input
                        type="text"
                        placeholder="Paste YouTube URL..."
                        className="flex-1 bg-transparent border-none outline-none text-white placeholder-zinc-600 h-10"
                        value={urlInput}
                        onChange={(e) => setUrlInput(e.target.value)}
                    />
                    <button
                        type="submit"
                        className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-full font-medium transition-colors"
                    >
                        Start
                    </button>
                </div>
            </form>

            <div className="flex items-center space-x-8 text-zinc-500 text-sm mt-12">
                <div className="flex items-center space-x-2">
                    <Music className="w-4 h-4" />
                    <span>Synchronized Lyrics</span>
                </div>
                <div className="w-1 h-1 bg-zinc-800 rounded-full" />
                <div className="flex items-center space-x-2">
                    <Headphones className="w-4 h-4" />
                    <span>AI Curator</span>
                </div>
            </div>

            <Link to="/library" className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors mt-8">
                <Archive className="w-4 h-4" />
                <span>Go to Library</span>
            </Link>
        </div>
    );
}
