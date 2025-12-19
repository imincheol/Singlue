import React, { useEffect, useState, useMemo } from 'react';
import { useAppStore } from '../store/useAppStore';
import { useTranslation } from 'react-i18next';
import { Play, Pause, Maximize, Type, Languages, Plus, Minus } from 'lucide-react';
import { clsx } from 'clsx';

export const KaraokeOverlay: React.FC = () => {
    const {
        currentSong,
        currentTime,
        userOffset,
        isPlaying,
        setIsPlaying,
        requestSeek,
        videoDuration
    } = useAppStore();

    const [activeLineIndex, setActiveLineIndex] = useState<number>(-1);


    const { i18n } = useTranslation();
    const lang = i18n.language?.split('-')[0] || 'ko'; // Default to 'ko' or current language

    // View Options State - Default ALL VISIBLE - Default ALL VISIBLE
    const [showSource, setShowSource] = useState(true);
    const [showPronunciation, setShowPronunciation] = useState(true);
    const [showTranslation, setShowTranslation] = useState(true);

    // Font Size State - Independent for Normal/Fullscreen
    const [fontSizeScaleNormal, setFontSizeScaleNormal] = useState(3.0); // Default 3
    const [fontSizeScaleFullscreen, setFontSizeScaleFullscreen] = useState(10.0); // Default 10

    // Fullscreen detection
    const [isFullscreen, setIsFullscreen] = useState(false);

    useEffect(() => {
        const handleFullscreenChange = () => {
            const container = document.getElementById('video-container');
            setIsFullscreen(document.fullscreenElement === container);
        };
        document.addEventListener('fullscreenchange', handleFullscreenChange);
        return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
    }, []);

    const currentScale = isFullscreen ? fontSizeScaleFullscreen : fontSizeScaleNormal;

    const handleZoomIn = () => {
        if (isFullscreen) {
            setFontSizeScaleFullscreen(prev => Math.min(20, prev + 1));
        } else {
            setFontSizeScaleNormal(prev => Math.min(10, prev + 1));
        }
    };

    const handleZoomOut = () => {
        if (isFullscreen) {
            setFontSizeScaleFullscreen(prev => Math.max(1, prev - 1));
        } else {
            setFontSizeScaleNormal(prev => Math.max(1, prev - 1));
        }
    };

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

    // Scale Logic: vmin
    // Normal mode: 1~10 vmin (Default 3)
    // Fullscreen mode: 1~20 vmin (Default 10)
    const baseSize = currentScale;

    return (
        <div className="absolute bottom-0 left-0 w-full max-h-[50%] flex flex-col z-20 pointer-events-none">
            {/* Main Content Container (Rounded Top, Pointer Events Auto) */}
            <div className="flex-1 w-full bg-black/60 backdrop-blur-sm rounded-t-3xl flex flex-col overflow-hidden pointer-events-auto transition-all duration-300">

                {/* Lyrics Area (z-10) */}
                <div className="flex-1 min-h-0 flex flex-col items-center justify-center px-8 pb-2 pt-6 relative group/lyrics z-10">

                    {/* View Toggles (Floating Top Right within Lyrics Area) */}
                    <div className="absolute top-4 right-6 flex gap-2 opacity-0 group-hover/lyrics:opacity-100 transition-opacity duration-300 bg-black/40 p-1.5 rounded-full backdrop-blur-md z-30 pointer-events-auto">
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
                        <div className="text-center animate-in fade-in slide-in-from-bottom-4 duration-300 flex flex-col gap-[0.5em] transition-all" style={{ fontSize: `${baseSize}vmin` }}>
                            {/* Source */}
                            {showSource && (
                                <p
                                    className="font-bold text-white drop-shadow-md leading-tight transition-all duration-300"
                                    style={{ fontSize: '1em' }}
                                >
                                    {currentLine.source}
                                </p>
                            )}

                            {/* Pronunciation */}
                            {showPronunciation && currentLine.pron && (
                                <p
                                    className="text-indigo-300 drop-shadow-md leading-tight transition-all duration-300 font-medium"
                                    style={{ fontSize: '0.5em' }}
                                >
                                    {typeof currentLine.pron === 'string'
                                        ? currentLine.pron
                                        : (currentLine.pron[lang] || currentLine.pron['en'] || Object.values(currentLine.pron)[0] || '')}
                                </p>
                            )}

                            {/* Translation */}
                            {showTranslation && currentLine.trans && (
                                <p
                                    className="text-emerald-300 drop-shadow-md leading-tight transition-all duration-300 font-medium"
                                    style={{ fontSize: '0.45em' }}
                                >
                                    {typeof currentLine.trans === 'string'
                                        ? currentLine.trans
                                        : (currentLine.trans[lang] || currentLine.trans['en'] || Object.values(currentLine.trans)[0] || '')}
                                </p>
                            )}
                        </div>
                    ) : (
                        <div className="text-white/30 italic text-[2vmin]">
                            ...
                        </div>
                    )}
                </div>

                {/* Controls Area (z-50 High-Z to prevent overlapping issues from large text) */}
                <div className="h-[70px] w-full flex flex-col justify-end px-6 pb-5 shrink-0 bg-gradient-to-t from-black/20 to-transparent relative z-50">
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
                                onClick={handleZoomOut}
                                className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-white/10 text-white/70 hover:text-white transition-colors"
                                title="Decrease Font Size"
                            >
                                <Minus size={14} />
                            </button>
                            <span className="text-[10px] text-white/50 w-8 text-center font-mono">
                                {currentScale}
                            </span>
                            <button
                                onClick={handleZoomIn}
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
