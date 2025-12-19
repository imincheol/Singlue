export const LANGUAGES = [
    { code: 'ko', label: 'Korean', native: '한국어' },
    { code: 'en', label: 'English', native: 'English' },
    { code: 'vi', label: 'Vietnamese', native: 'Tiếng Việt' },
    { code: 'ja', label: 'Japanese', native: '日本語' },
    { code: 'zh', label: 'Chinese', native: '中文' },
] as const;

export type LanguageCode = typeof LANGUAGES[number]['code'];

export const getLanguageLabel = (code: string) => {
    return LANGUAGES.find(l => l.code === code)?.native || code;
};
