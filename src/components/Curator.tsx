import React, { useState } from 'react';
import { useAppStore } from '../store/useAppStore';
import { generateLyrics } from '../services/gemini';
import type { Song, VideoMapping } from '../types';
import { Loader2, Sparkles, Save, Key } from 'lucide-react';

interface Props {
    videoId: string;
}

export const Curator: React.FC<Props> = ({ videoId }) => {
    const {
        apiKey, setApiKey,
        setCurrentSong,
        setVideoMapping
    } = useAppStore();

    const [inputKey, setInputKey] = useState('');
    const [hint, setHint] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [previewSong, setPreviewSong] = useState<Song | null>(null);

    const handleSaveKey = () => {
        if (inputKey.trim()) {
            setApiKey(inputKey.trim());
        }
    };

    const handleGenerate = async () => {
        if (!apiKey) return;
        setIsLoading(true);
        setError(null);
        try {
            // For now, allow user to input title manually or fetch from YouTube API?
            // Since we don't have YouTube Data API key setup for this specifically, 
            // we rely on user providing valid context or just using the ID.
            // But Gemini needs the Title to search/know lyrics.
            // We'll ask user for "Song Title / Artist" in the hint or separate field if needed.
            // For this MVP, let's assume the user Hint contains "Artist - Title".

            const song = await generateLyrics(apiKey, `Video ID: ${videoId}`, hint);
            setPreviewSong(song);
        } catch (err: any) {
            setError(err.message || 'Failed to generate lyrics');
        } finally {
            setIsLoading(false);
        }
    };

    const handleConfirm = () => {
        if (previewSong) {
            setCurrentSong(previewSong);

            const mapping: VideoMapping = {
                videoId,
                songId: previewSong.id,
                globalOffset: 0 // Default 0
            };
            setVideoMapping(mapping);
        }
    };

    if (!apiKey) {
        return (
            <div className="flex flex-col items-center justify-center p-8 bg-zinc-900 rounded-xl border border-zinc-800 space-y-4">
                <div className="bg-indigo-500/10 p-4 rounded-full">
                    <Key className="w-8 h-8 text-indigo-400" />
                </div>
                <h3 className="text-xl font-bold text-white">Enter Gemini API Key</h3>
                <p className="text-zinc-400 text-center text-sm max-w-md">
                    To use the AI Curator, you need a Google Gemini API key.
                    Your key is stored locally in your browser.
                </p>
                <div className="flex w-full max-w-sm space-x-2">
                    <input
                        type="password"
                        placeholder="Metric Key..."
                        value={inputKey}
                        onChange={(e) => setInputKey(e.target.value)}
                        className="flex-1 bg-black/50 border border-zinc-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-indigo-500"
                    />
                    <button
                        onClick={handleSaveKey}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                    >
                        Save
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full bg-zinc-900 rounded-xl border border-zinc-800 overflow-hidden">
            {/* Header */}
            <div className="p-6 border-b border-zinc-800">
                <div className="flex items-center space-x-3 mb-2">
                    <Sparkles className="w-6 h-6 text-indigo-400" />
                    <h2 className="text-2xl font-bold text-white">Singlue Curator Mode</h2>
                </div>
                <p className="text-zinc-400 text-sm">
                    Generate synchronized lyrics for this video using Gemini 1.5 Flash.
                </p>
            </div>

            <div className="p-6 flex-1 overflow-y-auto space-y-6">
                {/* Input Section */}
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-zinc-300 mb-1">
                            Song Title & Artist (Hint)
                        </label>
                        <input
                            type="text"
                            placeholder="e.g. NewJeans - ETA"
                            value={hint}
                            onChange={(e) => setHint(e.target.value)}
                            className="w-full bg-black/50 border border-zinc-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-indigo-500 placeholder-zinc-600"
                        />
                    </div>

                    <button
                        onClick={handleGenerate}
                        disabled={isLoading || !hint}
                        className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white py-3 rounded-lg font-bold transition-all shadow-lg shadow-indigo-500/20 flex items-center justify-center space-x-2"
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin" />
                                <span>AI가 가사와 발음을 뚝딱 만들고 있어요...</span>
                            </>
                        ) : (
                            <>
                                <Sparkles className="w-5 h-5" />
                                <span>Generate Lyrics</span>
                            </>
                        )}
                    </button>

                    {error && (
                        <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg text-sm">
                            {error}
                        </div>
                    )}
                </div>

                {/* Preview Section */}
                {previewSong && (
                    <div className="mt-8 space-y-4 animate-in fade-in slide-in-from-bottom-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-semibold text-white">Preview Result</h3>
                            <button
                                onClick={handleConfirm}
                                className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center space-x-2 transition-colors"
                            >
                                <Save className="w-4 h-4" />
                                <span>Save & Start</span>
                            </button>
                        </div>

                        <div className="bg-black/30 rounded-lg p-4 max-h-60 overflow-y-auto border border-zinc-800 space-y-2">
                            {previewSong.lyrics.slice(0, 5).map((line, i) => (
                                <div key={i} className="text-zinc-400 text-sm">
                                    <span className="text-indigo-400 font-mono mr-2">[{line.time}s]</span>
                                    <span>{line.source}</span>
                                </div>
                            ))}
                            {previewSong.lyrics.length > 5 && (
                                <div className="text-zinc-600 text-center text-xs py-2">
                                    ... {previewSong.lyrics.length - 5} more lines ...
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
