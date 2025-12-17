import { Link } from 'react-router-dom';
import { useAppStore } from '../store/useAppStore';
import { Clock, Play, Headphones, ChevronLeft } from 'lucide-react';

export default function LibraryPage() {
    const { history } = useAppStore();

    return (
        <div className="min-h-screen bg-black text-white p-6 pt-24">
            <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
                <div className="flex items-center gap-4">
                    <Link to="/" className="p-2 hover:bg-zinc-800 rounded-lg text-zinc-400 hover:text-white transition-colors">
                        <ChevronLeft className="w-6 h-6" />
                    </Link>
                    <h1 className="text-3xl font-bold flex items-center gap-3">
                        <Clock className="w-8 h-8 text-indigo-500" />
                        History
                    </h1>
                </div>

                {history.length === 0 ? (
                    <div className="text-center py-20 bg-zinc-900/30 rounded-2xl border border-white/5">
                        <Headphones className="w-16 h-16 text-zinc-600 mx-auto mb-4" />
                        <h2 className="text-xl font-semibold text-zinc-300">No history yet</h2>
                        <p className="text-zinc-500 mt-2">Start watching videos to build your library.</p>
                        <Link to="/" className="inline-block mt-6 px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full font-medium transition-colors">
                            Find a Video
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {history.map((item) => (
                            <Link key={item.videoId} to={`/watch/${item.videoId}`} className="group relative block bg-zinc-900 rounded-xl overflow-hidden border border-white/5 hover:border-indigo-500/50 transition-all hover:scale-[1.02]">
                                <div className="aspect-video relative bg-zinc-800">
                                    <img src={item.thumbnail || `https://img.youtube.com/vi/${item.videoId}/mqdefault.jpg`} alt={item.title} className="w-full h-full object-cover" />
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                        <Play className="w-12 h-12 text-white fill-white" />
                                    </div>
                                </div>
                                <div className="p-4">
                                    <h3 className="font-semibold text-white line-clamp-1 text-lg mb-1">{item.title || 'Unknown Video'}</h3>
                                    <p className="text-sm text-zinc-400 line-clamp-1">{item.author || 'YouTube'}</p>
                                    <p className="text-xs text-zinc-600 mt-3 text-right">
                                        {new Date(item.lastPlayedAt).toLocaleDateString()}
                                    </p>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
