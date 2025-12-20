import React, { useEffect, useState, useMemo } from 'react';
import { useAppStore } from '../store/useAppStore';
import { Play, Pause, Maximize, Type, Languages, Plus, Minus, ArrowDownToLine } from 'lucide-react';
import { clsx } from 'clsx';

export const KaraokeOverlay: React.FC = () => {
    const {
        currentSong,
        currentTime,
        userOffset,
        draftOffset,
        isPlaying,
        setIsPlaying,
        requestSeek,
        videoDuration,
        showPronunciation,
        showTranslation,
        togglePronunciation,
        toggleTranslation,
        contentLanguage
    } = useAppStore();

    const [activeLineIndex, setActiveLineIndex] = useState<number>(-1);


    // View Options State
    // showSource removed (Always ON)
    const [showNextLine, setShowNextLine] = useState(true);

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

    // Helper: Calculate font size in vmin based on scale step
    const getFontSize = (step: number, mode: 'normal' | 'fullscreen'): string => {
        if (mode === 'normal') {
            // Normal: 1..10 -> 2.0cqi .. 6.0cqi
            const min = 2.0;
            const max = 6.0;
            const size = min + ((step - 1) / 9) * (max - min);
            return `${size.toFixed(2)}cqi`;
        } else {
            // Fullscreen: 1..20 -> 4.0cqi .. 16.0cqi
            const min = 4.0;
            const max = 16.0;
            const size = min + ((step - 1) / 19) * (max - min);
            return `${size.toFixed(2)}cqi`;
        }
    };

    const computedBaseSize = getFontSize(currentScale, isFullscreen ? 'fullscreen' : 'normal');

    const globalOffset = currentSong?.global_offset || 0;
    const totalOffset = globalOffset + userOffset + (draftOffset || 0);
    const syncedTime = currentTime - totalOffset;

    useEffect(() => {
        if (!currentSong) return;
        const index = currentSong.lyrics.findLastIndex((line) => line.time <= syncedTime);
        setActiveLineIndex(index);
    }, [syncedTime, currentSong]);

    const lyricsData = useMemo(() => {
        if (!currentSong || activeLineIndex === -1) return null;
        const current = currentSong.lyrics[activeLineIndex];
        const next = currentSong.lyrics[activeLineIndex + 1]; // Can be undefined
        return { current, next };
    }, [currentSong, activeLineIndex]);

    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60);
        const s = Math.floor(seconds % 60);
        return `${m}:${s.toString().padStart(2, '0')}`;
    };

    if (!currentSong) return null;

    return (
        <div className="absolute inset-x-0 bottom-0 w-full h-fit max-h-full flex flex-col z-overlay pointer-events-none">
            {/* Main Content Container (Rounded All to match Video Container) */}
            <div className="w-full bg-black/80 backdrop-blur-md rounded-t-3xl flex flex-col overflow-hidden pointer-events-auto transition-all duration-300 shadow-2xl">

                {/* Lyrics Area (z-10) */}
                <div className="flex-1 min-h-0 flex flex-col items-center justify-center px-8 pb-2 pt-6 relative group/lyrics z-fab">

                    {/* View Toggles (Floating Top Right within Lyrics Area) */}
                    <div className="absolute top-4 right-6 flex gap-2 opacity-0 group-hover/lyrics:opacity-100 transition-opacity duration-300 bg-black/40 p-1.5 rounded-full backdrop-blur-md z-tooltip pointer-events-auto">
                        <button
                            onClick={() => setShowNextLine(!showNextLine)}
                            className={clsx("w-8 h-8 rounded-full flex items-center justify-center transition-colors", showNextLine ? "bg-white text-black" : "bg-white/10 text-white/50")}
                            title="Toggle Next Line"
                        >
                            <ArrowDownToLine size={14} />
                        </button>
                        <button
                            onClick={togglePronunciation}
                            className={clsx("w-8 h-8 rounded-full flex items-center justify-center transition-colors", showPronunciation ? "bg-indigo-500 text-white" : "bg-white/10 text-white/50")}
                            title="Toggle Pronunciation"
                        >
                            <Type size={14} />
                        </button>
                        <button
                            onClick={toggleTranslation}
                            className={clsx("w-8 h-8 rounded-full flex items-center justify-center transition-colors", showTranslation ? "bg-emerald-500 text-white" : "bg-white/10 text-white/50")}
                            title="Toggle Translation"
                        >
                            <Languages size={14} />
                        </button>
                    </div>

                    {lyricsData ? (
                        <div className="text-center animate-in fade-in slide-in-from-bottom-4 duration-300 flex flex-col gap-[0.2em] transition-all" style={{ fontSize: computedBaseSize }}>

                            {/* Group 1: Source */}
                            <p className="font-bold text-white drop-shadow-md leading-tight transition-all duration-300" style={{ fontSize: '1em' }}>
                                {lyricsData.current.source}
                            </p>
                            {showNextLine && lyricsData.next && (
                                <p className="font-medium text-zinc-400 opacity-60 leading-tight transition-all duration-300" style={{ fontSize: '1em' }}>
                                    {lyricsData.next.source}
                                </p>
                            )}

                            {/* Group 2: Pronunciation */}
                            {showPronunciation && (
                                <>
                                    {lyricsData.current.pron && (
                                        <p className="text-indigo-300 drop-shadow-md leading-tight transition-all duration-300 font-medium mt-[0.3em]" style={{ fontSize: '0.6em' }}>
                                            {typeof lyricsData.current.pron === 'string'
                                                ? lyricsData.current.pron
                                                : (lyricsData.current.pron[contentLanguage] || lyricsData.current.pron['en'] || Object.values(lyricsData.current.pron)[0] || '')}
                                        </p>
                                    )}
                                    {showNextLine && lyricsData.next && lyricsData.next.pron && (
                                        <p className="text-indigo-200 opacity-50 leading-tight transition-all duration-300 font-medium" style={{ fontSize: '0.6em' }}>
                                            {typeof lyricsData.next.pron === 'string'
                                                ? lyricsData.next.pron
                                                : (lyricsData.next.pron[contentLanguage] || lyricsData.next.pron['en'] || Object.values(lyricsData.next.pron)[0] || '')}
                                        </p>
                                    )}
                                </>
                            )}

                            {/* Group 3: Translation */}
                            {showTranslation && (
                                <>
                                    {lyricsData.current.trans && (
                                        <p className="text-emerald-300 drop-shadow-md leading-tight transition-all duration-300 font-medium mt-[0.2em]" style={{ fontSize: '0.55em' }}>
                                            {typeof lyricsData.current.trans === 'string'
                                                ? lyricsData.current.trans
                                                : (lyricsData.current.trans[contentLanguage] || lyricsData.current.trans['en'] || Object.values(lyricsData.current.trans)[0] || '')}
                                        </p>
                                    )}
                                    {showNextLine && lyricsData.next && lyricsData.next.trans && (
                                        <p className="text-emerald-200 opacity-50 leading-tight transition-all duration-300 font-medium" style={{ fontSize: '0.55em' }}>
                                            {typeof lyricsData.next.trans === 'string'
                                                ? lyricsData.next.trans
                                                : (lyricsData.next.trans[contentLanguage] || lyricsData.next.trans['en'] || Object.values(lyricsData.next.trans)[0] || '')}
                                        </p>
                                    )}
                                </>
                            )}

                        </div>
                    ) : (
                        <div className="text-white/30 italic text-[2cqi]">
                            ...
                        </div>
                    )}
                </div>

                {/* Controls Area (z-gnb High-Z to prevent overlapping issues from large text) */}
                <div className="h-[70px] w-full flex flex-col justify-end px-6 pb-5 shrink-0 bg-gradient-to-t from-black/20 to-transparent relative z-gnb">
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
