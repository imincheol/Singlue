export interface ParsedLyricLine {
    time: number;
    text: string;
}

export const parseLRC = (lrcString: string): ParsedLyricLine[] => {
    const lines = lrcString.split('\n');
    const regex = /^\[(\d{2}):(\d{2}\.\d{2})\](.*)$/;
    const result: ParsedLyricLine[] = [];

    for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed) continue;

        const match = trimmed.match(regex);
        if (match) {
            const minutes = parseInt(match[1], 10);
            const seconds = parseFloat(match[2]);
            const text = match[3].trim();

            if (text) { // Optionally filter out empty text lines if desired, but request said "ignore empty lines" which usually means empty source lines.
                // Keeping text even if empty string might be useful for instrumental breaks, but request implies "text" exists.
                result.push({
                    time: minutes * 60 + seconds,
                    text: text
                });
            }
        }
    }

    return result.sort((a, b) => a.time - b.time);
};
