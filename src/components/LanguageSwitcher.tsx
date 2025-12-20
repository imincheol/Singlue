import React from 'react';
import { useTranslation } from 'react-i18next';
import { Globe } from 'lucide-react';
import { Dropdown } from './ui/Dropdown';

export const LanguageSwitcher: React.FC = () => {
    const { i18n } = useTranslation();

    const languages = [
        { code: 'en', label: 'English' },
        { code: 'vi', label: 'Tiếng Việt' },
        { code: 'ko', label: '한국어' },
    ];

    const currentLang = i18n.resolvedLanguage || 'en';
    const currentLangConfig = languages.find(l => l.code === currentLang) || languages[0];

    const handleLanguageChange = (code: string) => {
        i18n.changeLanguage(code);
    };

    return (
        <Dropdown
            trigger={
                <button className="flex items-center gap-2 bg-zinc-200 dark:bg-zinc-900/50 backdrop-blur-md border border-zinc-300 dark:border-white/10 px-4 py-2 rounded-full text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors min-w-[120px] justify-center">
                    <Globe size={16} />
                    <span className="text-sm font-medium">{currentLangConfig.label}</span>
                </button>
            }
            dropdownClassName="w-40"
            align="right"
        >
            <div className="py-1">
                {languages.map((lang) => (
                    <button
                        key={lang.code}
                        onClick={() => handleLanguageChange(lang.code)}
                        className={`w-full text-left px-4 py-2.5 text-sm transition-colors flex items-center justify-between ${currentLang === lang.code
                            ? 'bg-indigo-600 text-white font-semibold'
                            : 'text-zinc-700 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-white'
                            }`}
                    >
                        <span>{lang.label}</span>
                        {currentLang === lang.code && <div className="w-1.5 h-1.5 rounded-full bg-white shadow-sm" />}
                    </button>
                ))}
            </div>
        </Dropdown>
    );
};

