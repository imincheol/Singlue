import React from 'react';
import { Play, Pause, SkipBack, SkipForward } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';

export const PlayerControls: React.FC = () => {
    const {
        isPlaying,
        setIsPlaying,
        currentTime,
        videoDuration,
        requestSeek
    } = useAppStore();

    const formatTime = (time: number) => {
        const m = Math.floor(time / 60);
        const s = Math.floor(time % 60).toString().padStart(2, '0');
        return `${m}:${s}`;
    };

    const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
        const time = parseFloat(e.target.value);
        requestSeek(time);
        // Optimistically update logic handled by player sync
    };

    const togglePlay = () => {
        setIsPlaying(!isPlaying);
    };

    const seekBy = (seconds: number) => {
        requestSeek(Math.min(Math.max(currentTime + seconds, 0), videoDuration));
    };

    return (
        <div className="w-full bg-zinc-900/80 border border-white/10 rounded-xl p-4 flex flex-col gap-3 backdrop-blur-sm shadow-lg">
            {/* Progress Bar */}
            <div className="flex items-center gap-3 text-xs font-mono text-zinc-400">
                <span className="w-10 text-right">{formatTime(currentTime)}</span>
                <div className="relative flex-1 h-8 flex items-center group">
                    {/* Custom Range Input */}
                    <input
                        type="range"
                        min={0}
                        max={videoDuration || 100}
                        value={currentTime}
                        onChange={handleSeek}
                        className="w-full h-1 bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-indigo-500 group-hover:h-2 transition-all"
                    />
                </div>
                <span className="w-10">{formatTime(videoDuration)}</span>
            </div>

            {/* Controls */}
            <div className="flex items-center justify-center gap-6">
                <button
                    onClick={() => seekBy(-5)}
                    className="p-2 text-zinc-400 hover:text-white hover:bg-white/10 rounded-full transition-colors"
                >
                    <SkipBack size={20} />
                </button>

                <button
                    onClick={togglePlay}
                    className="p-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-full transition-all hover:scale-105 active:scale-95 shadow-lg shadow-indigo-500/30"
                >
                    {isPlaying ? <Pause size={24} fill="currentColor" /> : <Play size={24} fill="currentColor" ml-1 />}
                </button>

                <button
                    onClick={() => seekBy(5)}
                    className="p-2 text-zinc-400 hover:text-white hover:bg-white/10 rounded-full transition-colors"
                >
                    <SkipForward size={20} />
                </button>
            </div>
        </div>
    );
};
