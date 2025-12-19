import React, { useEffect, useState, useMemo } from 'react';
import { useAppStore } from '../store/useAppStore';

import { Minimize, Play, Pause, Maximize } from 'lucide-react';


export const KaraokeOverlay: React.FC = () => {
    const {
        currentSong,
        currentTime,
        userOffset,
        isPlaying,
        setIsPlaying,
        requestSeek,
        toggleKaraokeMode,
        videoDuration
    } = useAppStore();

    const [activeLineIndex, setActiveLineIndex] = useState<number>(-1);

    const globalOffset = currentSong?.global_offset || 0;
    const totalOffset = globalOffset + userOffset;
    const syncedTime = currentTime - totalOffset;

    useEffect(() => {
        if (!currentSong) return;
        const index = currentSong.lyrics.findLastIndex((line) => line.time <= syncedTime);
        setActiveLineIndex(index);
    }, [syncedTime, currentSong]);

    const currentLine = useMemo(() => {
        if (!currentSong || activeLineIndex === -1) return null;
        return currentSong.lyrics[activeLineIndex];
    }, [currentSong, activeLineIndex]);

    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60);
        const s = Math.floor(seconds % 60);
        return `${m}:${s.toString().padStart(2, '0')}`;
    };

    if (!currentSong) return null;

    return (
        <div className="absolute bottom-0 left-0 w-full max-h-[50%] flex flex-col z-20">
            {/* Background Overlay - Gradient for readability */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent pointer-events-none" />

            {/* Lyrics Area - Flexible Height */}
            <div className="flex-1 min-h-0 flex items-center justify-center px-8 pb-4 z-30">
                {currentLine ? (
                    <div className="text-center animate-in fade-in slide-in-from-bottom-4 duration-300">
                        <p className="text-[4vmin] font-bold text-white drop-shadow-md leading-tight">
                            {currentLine.source}
                        </p>
                        {/* Pronunciation can be optional here, but 'current line only' requirement implies simplicity */}
                    </div>
                ) : (
                    <div className="text-white/50 text-[2vmin]">
                        ...
                    </div>
                )}
            </div>

            {/* Controls Area - Fixed Height */}
            <div className="h-[80px] w-full flex flex-col justify-end px-6 pb-6 z-30">
                <div className="flex items-center gap-4 w-full">

                    {/* Time & Slider */}
                    <span className="text-xs text-white/70 font-mono w-10 text-right">{formatTime(currentTime)}</span>
                    <div className="flex-1 relative group h-6 flex items-center cursor-pointer">
                        {/* Track */}
                        <div className="absolute left-0 right-0 h-1 bg-white/20 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-indigo-500"
                                style={{ width: `${(currentTime / videoDuration) * 100}%` }}
                            />
                        </div>
                        {/* Thumb (visible on hover) */}
                        <input
                            type="range"
                            min={0}
                            max={videoDuration || 100}
                            value={currentTime}
                            onChange={(e) => requestSeek(parseFloat(e.target.value))}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        />
                    </div>
                    <span className="text-xs text-white/70 font-mono w-10">{formatTime(videoDuration)}</span>

                    {/* Buttons */}
                    <div className="flex items-center gap-3 ml-2">
                        <button
                            onClick={() => setIsPlaying(!isPlaying)}
                            className="p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors"
                        >
                            {isPlaying ? <Pause size={20} fill="white" /> : <Play size={20} fill="white" />}
                        </button>

                        <button
                            onClick={toggleKaraokeMode}
                            className="p-2 hover:bg-white/10 rounded-full text-white/70 hover:text-white transition-colors"
                            title="Exit Karaoke Mode"
                        >
                            <Minimize size={20} />
                        </button>

                        <button
                            onClick={() => {
                                const container = document.getElementById('video-container');
                                if (!container) return;
                                if (!document.fullscreenElement) {
                                    container.requestFullscreen().catch(err => console.error(err));
                                } else {
                                    document.exitFullscreen();
                                }
                            }}
                            className="p-2 hover:bg-white/10 rounded-full text-white/70 hover:text-white transition-colors"
                            title="Fullscreen"
                        >
                            <Maximize size={20} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
