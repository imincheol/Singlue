import React, { useEffect, useState, useMemo } from 'react';
import { useAppStore } from '../store/useAppStore';
import { Minimize, Play, Pause, Maximize, Type, Languages, Mic2, Plus, Minus } from 'lucide-react';
import { clsx } from 'clsx';
import { useTranslation } from 'react-i18next'; // Used for button labels if needed

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

    // View Options State
    const [showSource, setShowSource] = useState(true);
    const [showPronunciation, setShowPronunciation] = useState(true);
    const [showTranslation, setShowTranslation] = useState(true);
    const [fontSizeScale, setFontSizeScale] = useState(1.0); // 1.0 = Default (5vmin)

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

    // Base font size in vmin
    const baseSize = 5 * fontSizeScale;

    return (
        <div className="absolute bottom-0 left-0 w-full max-h-[50%] flex flex-col z-20 pointer-events-none">
            {/* Main Content Container (Rounded Top, Pointer Events Auto) */}
            <div className="flex-1 w-full bg-black/60 backdrop-blur-sm rounded-t-3xl flex flex-col overflow-hidden pointer-events-auto transition-all duration-300">

                {/* Lyrics Area */}
                <div className="flex-1 min-h-0 flex flex-col items-center justify-center px-8 pb-2 pt-6 relative group/lyrics">

                    {/* View Toggles (Floating Top Right within Lyrics Area) */}
                    <div className="absolute top-4 right-6 flex gap-2 opacity-0 group-hover/lyrics:opacity-100 transition-opacity duration-300 bg-black/40 p-1.5 rounded-full backdrop-blur-md">
                        <button
                            onClick={() => setShowSource(!showSource)}
                            className={clsx("w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors", showSource ? "bg-white text-black" : "bg-white/10 text-white/50")}
                            title="Toggle Source"
                        >
                            Aa
                        </button>
                        <button
                            onClick={() => setShowPronunciation(!showPronunciation)}
                            className={clsx("w-8 h-8 rounded-full flex items-center justify-center transition-colors", showPronunciation ? "bg-indigo-500 text-white" : "bg-white/10 text-white/50")}
                            title="Toggle Pronunciation"
                        >
                            <Type size={14} />
                        </button>
                        <button
                            onClick={() => setShowTranslation(!showTranslation)}
                            className={clsx("w-8 h-8 rounded-full flex items-center justify-center transition-colors", showTranslation ? "bg-emerald-500 text-white" : "bg-white/10 text-white/50")}
                            title="Toggle Translation"
                        >
                            <Languages size={14} />
                        </button>
                    </div>

                    {currentLine ? (
                        <div className="text-center animate-in fade-in slide-in-from-bottom-4 duration-300 flex flex-col gap-[1vmin]">
                            {/* Source */}
                            {showSource && (
                                <p
                                    className="font-bold text-white drop-shadow-md leading-tight transition-all duration-300"
                                    style={{ fontSize: `${baseSize}vmin` }}
                                >
                                    {currentLine.source}
                                </p>
                            )}

                            {/* Pronunciation */}
                            {showPronunciation && currentLine.pronunciation && (
                                <p
                                    className="text-indigo-300 drop-shadow-md leading-tight transition-all duration-300 font-medium"
                                    style={{ fontSize: `${baseSize * 0.5}vmin` }}
                                >
                                    {currentLine.pronunciation}
                                </p>
                            )}

                            {/* Translation */}
                            {showTranslation && currentLine.translation && (
                                <p
                                    className="text-emerald-300 drop-shadow-md leading-tight transition-all duration-300 font-medium"
                                    style={{ fontSize: `${baseSize * 0.45}vmin` }}
                                >
                                    {currentLine.translation}
                                </p>
                            )}
                        </div>
                    ) : (
                        <div className="text-white/30 italic">
                            ...
                        </div>
                    )}
                </div>

                {/* Controls Area */}
                <div className="h-[70px] w-full flex flex-col justify-end px-6 pb-5 shrink-0 bg-gradient-to-t from-black/20 to-transparent">
                    <div className="flex items-center gap-4 w-full">

                        {/* Playback Controls */}
                        <button
                            onClick={() => setIsPlaying(!isPlaying)}
                            className="p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors shrink-0"
                        >
                            {isPlaying ? <Pause size={20} fill="white" /> : <Play size={20} fill="white" />}
                        </button>

                        {/* Time & Slider */}
                        <span className="text-xs text-white/70 font-mono w-10 text-right shrink-0">{formatTime(currentTime)}</span>

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
                        <span className="text-xs text-white/70 font-mono w-10 shrink-0">{formatTime(videoDuration)}</span>

                        {/* Font Size Controls */}
                        <div className="flex items-center gap-1 bg-white/10 rounded-full p-1 ml-2 shrink-0">
                            <button
                                onClick={() => setFontSizeScale(Math.max(0.5, fontSizeScale - 0.1))}
                                className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-white/10 text-white/70 hover:text-white transition-colors"
                                title="Decrease Font Size"
                            >
                                <Minus size={14} />
                            </button>
                            <span className="text-[10px] text-white/50 w-8 text-center font-mono">
                                {Math.round(baseSize * 10) / 10}
                            </span>
                            <button
                                onClick={() => setFontSizeScale(Math.min(3.0, fontSizeScale + 0.1))}
                                className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-white/10 text-white/70 hover:text-white transition-colors"
                                title="Increase Font Size"
                            >
                                <Plus size={14} />
                            </button>
                        </div>

                        {/* Fullscreen Button */}
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
                            className="p-2 hover:bg-white/10 rounded-full text-white/70 hover:text-white transition-colors shrink-0"
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
