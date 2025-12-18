import React from 'react';
import { Play, Pause } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';

interface PlayerControlsProps {
}

export const PlayerControls: React.FC<PlayerControlsProps> = () => {
    const {
        isPlaying,
        setIsPlaying,
        currentTime,
        videoDuration,
        requestSeek,
        playbackRate,
        setPlaybackRate
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


    return (
        <div className="w-full bg-zinc-100 dark:bg-zinc-900/80 border border-zinc-300 dark:border-white/10 rounded-xl px-4 py-3 flex flex-col gap-3 backdrop-blur-sm shadow-sm transition-colors duration-300">
            {/* Row 1: Unified Controls (Play | Time | Slider | Speed) */}
            <div className="flex items-center gap-3 w-full">
                {/* 1. Play Button */}
                <button
                    onClick={togglePlay}
                    className="p-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-full transition-all hover:scale-105 active:scale-95 shadow-md flex-shrink-0"
                >
                    {isPlaying ? <Pause size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" className="ml-0.5" />}
                </button>

                {/* 2. Time Info */}
                <div className="text-xs font-mono text-zinc-600 dark:text-zinc-400 flex-shrink-0 min-w-[80px] text-center">
                    <span className="text-zinc-900 dark:text-zinc-200 font-medium">{formatTime(currentTime)}</span>
                    <span className="opacity-50 mx-1">/</span>
                    <span className="opacity-70">{formatTime(videoDuration)}</span>
                </div>

                {/* 3. Slider (Progress Bar) */}
                <div className="relative flex-1 h-8 flex items-center group">
                    <input
                        type="range"
                        min={0}
                        max={videoDuration || 100}
                        value={currentTime}
                        onChange={handleSeek}
                        className="w-full h-1.5 bg-zinc-300 dark:bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-indigo-500 group-hover:h-2 transition-all"
                    />
                </div>

                {/* 4. Speed Control */}
                <div className="flex items-center space-x-1 flex-shrink-0 bg-zinc-200 dark:bg-zinc-800 rounded-lg px-2 py-1.5 border border-zinc-300 dark:border-white/5">
                    <span className="text-[10px] uppercase font-bold text-zinc-500 dark:text-zinc-400">Rate</span>
                    <select
                        value={playbackRate}
                        onChange={(e) => setPlaybackRate(parseFloat(e.target.value))}
                        className="bg-transparent text-xs font-medium text-zinc-900 dark:text-zinc-200 border-none outline-none appearance-none text-center cursor-pointer min-w-[2.5rem]"
                    >
                        {[0.5, 0.75, 1, 1.25, 1.5, 2.0].map(r => (
                            <option key={r} value={r}>{r}x</option>
                        ))}
                    </select>
                </div>
            </div>
        </div>
    );
};
