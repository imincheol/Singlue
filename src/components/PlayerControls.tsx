import React, { useState } from 'react';
import { Play, Pause, SkipBack, SkipForward, Gauge, Clock, SearchCode, Save, Loader2 } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';

interface PlayerControlsProps {
    onSearchClick: () => void;
}

export const PlayerControls: React.FC<PlayerControlsProps> = ({ onSearchClick }) => {
    const {
        isPlaying,
        setIsPlaying,
        currentTime,
        videoDuration,
        requestSeek,
        playbackRate,
        setPlaybackRate,
        userOffset,
        setUserOffset,
        saveCurrentOffset
    } = useAppStore();

    const [isSaving, setIsSaving] = useState(false);

    // Wrap save function to handle loading state
    const handleSave = async () => {
        setIsSaving(true);
        try {
            await saveCurrentOffset();
        } catch (err) {
            console.error(err);
            alert("Failed to save sync offset");
        } finally {
            setIsSaving(false);
        }
    };

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

    const adjustSync = (delta: number) => {
        setUserOffset(parseFloat((userOffset + delta).toFixed(1)));
    };

    return (
        <div className="w-full bg-zinc-900/80 border border-white/10 rounded-xl p-6 flex flex-col gap-6 backdrop-blur-sm shadow-lg">
            {/* Row 1: Progress Bar */}
            <div className="flex items-center gap-3 text-xs font-mono text-zinc-400 w-full">
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

            {/* Row 2: Main Playback Controls (Video) */}
            <div className="flex items-center justify-center gap-8">
                <button
                    onClick={() => seekBy(-10)}
                    className="p-3 text-zinc-400 hover:text-white hover:bg-white/10 rounded-full transition-colors relative group"
                    title="-10s"
                >
                    <SkipBack size={24} />
                    <span className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-[10px] font-mono opacity-0 group-hover:opacity-100 transition-opacity">10</span>
                </button>

                <button
                    onClick={togglePlay}
                    className="p-5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-full transition-all hover:scale-105 active:scale-95 shadow-xl shadow-indigo-500/30"
                >
                    {isPlaying ? <Pause size={32} fill="currentColor" /> : <Play size={32} fill="currentColor" className="ml-1" />}
                </button>

                <button
                    onClick={() => seekBy(10)}
                    className="p-3 text-zinc-400 hover:text-white hover:bg-white/10 rounded-full transition-colors relative group"
                    title="+10s"
                >
                    <SkipForward size={24} />
                    <span className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-[10px] font-mono opacity-0 group-hover:opacity-100 transition-opacity">10</span>
                </button>
            </div>

            {/* Row 3: Subtitle Controls (Speed, Sync, Change Lyrics) */}
            <div className="grid grid-cols-3 items-center pt-2 border-t border-white/5">
                {/* Left: Speed */}
                <div className="flex justify-start">
                    <div className="flex items-center space-x-2 bg-black/20 rounded-lg px-2 py-1.5 border border-white/5">
                        <Gauge size={14} className="text-zinc-500" />
                        <select
                            value={playbackRate}
                            onChange={(e) => setPlaybackRate(parseFloat(e.target.value))}
                            className="bg-transparent text-xs text-zinc-400 border-none outline-none appearance-none text-center min-w-[3rem] cursor-pointer hover:text-white transition-colors"
                        >
                            {[0.5, 0.75, 1, 1.25, 1.5, 2.0].map(r => (
                                <option key={r} value={r}>{r}x</option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Center: Sync */}
                <div className="flex justify-center">
                    <div className="flex items-center space-x-2 bg-black/20 rounded-lg px-2 py-1.5 border border-white/5">
                        <Clock size={14} className="text-zinc-500" />
                        <div className="flex items-center gap-0.5">
                            <button onClick={() => adjustSync(-1.0)} className="px-1.5 py-0.5 text-[10px] text-zinc-500 hover:text-white rounded transition-colors font-mono" title="-1.0s">-1</button>
                            <button onClick={() => adjustSync(-0.1)} className="px-1.5 py-0.5 text-[10px] text-zinc-500 hover:text-white rounded transition-colors font-mono" title="-0.1s">-.1</button>

                            <input
                                type="number"
                                step="0.1"
                                value={userOffset.toFixed(1)}
                                onChange={(e) => setUserOffset(parseFloat(e.target.value) || 0)}
                                className="w-10 bg-transparent text-center text-xs text-indigo-400 outline-none appearance-none font-mono font-bold"
                            />

                            <button onClick={() => adjustSync(0.1)} className="px-1.5 py-0.5 text-[10px] text-zinc-500 hover:text-white rounded transition-colors font-mono" title="+0.1s">+.1</button>
                            <button onClick={() => adjustSync(1.0)} className="px-1.5 py-0.5 text-[10px] text-zinc-500 hover:text-white rounded transition-colors font-mono" title="+1.0s">+1</button>
                        </div>

                        {/* Save Button - Only show if offset is modified */}
                        {userOffset !== 0 && (
                            <button
                                onClick={handleSave}
                                disabled={isSaving}
                                className="ml-2 px-2 py-1 bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-400 rounded text-[10px] font-medium transition-colors flex items-center gap-1 border border-indigo-500/20 animate-in fade-in zoom-in duration-300"
                                title="Save Sync to Database"
                            >
                                {isSaving ? <Loader2 className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />}
                                <span>Save</span>
                            </button>
                        )}
                    </div>
                </div>

                {/* Right: Change Lyrics */}
                <div className="flex justify-end">
                    <button
                        onClick={onSearchClick}
                        className="flex items-center gap-2 bg-black/20 hover:bg-indigo-500/10 text-zinc-400 hover:text-indigo-400 text-xs font-medium px-3 py-1.5 rounded-lg border border-white/5 hover:border-indigo-500/30 transition-all"
                    >
                        <SearchCode size={14} />
                        <span>Lyrics</span>
                    </button>
                </div>
            </div>
        </div>
    );
};
