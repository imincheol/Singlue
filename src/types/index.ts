export interface LyricsLine {
    time: number; // seconds
    source: string; // Original text
    pron: string; // Pronunciation
    trans: string; // Translation
}

export interface Song {
    id: string;
    title: string;
    artist: string;
    lyrics: LyricsLine[];
}

export interface VideoMapping {
    videoId: string;
    songId: string;
    globalOffset: number; // +/- seconds adjustment
}

export interface HistoryItem {
    videoId: string;
    title?: string;
    author?: string;
    thumbnail: string;
    lastPlayedAt: number;
    songId?: string; // ID from LRCLIB
    linkedSong?: Song; // Persisted lyrics data
}
