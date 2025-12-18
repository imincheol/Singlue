export interface LRCSearchResult {
    id: number;
    trackName: string;
    artistName: string;
    albumName: string;
    duration: number;
    instrumental: boolean;
    plainLyrics: string;
    syncedLyrics?: string | null; // This is the LRC content, can be null
}

export const searchLyrics = async (query: string): Promise<LRCSearchResult[]> => {
    const response = await fetch(`https://lrclib.net/api/search?q=${encodeURIComponent(query)}`);
    if (!response.ok) {
        throw new Error('Failed to fetch lyrics');
    }
    const data = await response.json();

    return data;
};
