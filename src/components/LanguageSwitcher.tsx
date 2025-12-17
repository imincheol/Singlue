import React from 'react';
import { useTranslation } from 'react-i18next';
import { Globe } from 'lucide-react';

export const LanguageSwitcher: React.FC = () => {
    const { i18n } = useTranslation();

    const changeLanguage = (lng: string) => {
        i18n.changeLanguage(lng);
    };

    const currentLang = i18n.resolvedLanguage || 'en';

    const languages = [
        { code: 'en', label: 'English' },
        { code: 'vi', label: 'Tiếng Việt' },
        { code: 'ko', label: '한국어' },
    ];

    return (
        <div className="relative group">
            <button className="flex items-center gap-2 bg-zinc-900/50 backdrop-blur-md border border-white/10 px-3 py-2 rounded-full text-zinc-400 hover:text-white transition-colors">
                <Globe size={16} />
                <span className="text-sm font-medium uppercase">{currentLang}</span>
            </button>
            <div className="absolute right-0 top-full mt-2 w-32 bg-zinc-900 border border-zinc-800 rounded-lg shadow-xl overflow-hidden invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-all transform origin-top-right">
                {languages.map((lang) => (
                    <button
                        key={lang.code}
                        onClick={() => changeLanguage(lang.code)}
                        className={`w-full text-left px-4 py-2 text-sm transition-colors ${currentLang === lang.code
                            ? 'bg-indigo-600 text-white'
                            : 'text-zinc-400 hover:bg-zinc-800 hover:text-white'
                            }`}
                    >
                        {lang.label}
                    </button>
                ))}
            </div>
        </div>
    );
};
