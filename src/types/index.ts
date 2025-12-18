export interface LyricsLine {
    time: number; // seconds
    source: string; // Original text
    pron?: Record<string, string>; // e.g. { ko: "씬 짜오", en: "Xin chao" }
    trans?: Record<string, string>; // e.g. { ko: "안녕", en: "Hello" }
}

export type UserRole = 'admin' | 'user';
export type UserStatus = 'pending' | 'approved' | 'rejected';

export interface Profile {
    id: string; // UUID
    nickname: string;
    role: UserRole;
    status: UserStatus;
    created_at: string;
}

export interface Song {
    id: string; // UUID
    video_id: string; // YouTube Video ID
    title: string;
    artist: string;
    lyrics: LyricsLine[];

    // New fields
    created_by: string; // Profile ID
    stage: number; // 1, 2, 3
    is_public: boolean;
    global_offset: number;
    created_at?: string;
    published_at?: string;
    country_code?: string; // ISO 3166-1 alpha-2 (e.g. KR, VN, US)
}


export interface HistoryItem {
    videoId: string;
    title?: string;
    author?: string;
    thumbnail: string;
    lastPlayedAt: number;
    songId?: string;
    linkedSong?: Song;
}
