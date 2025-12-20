import React from 'react';
import { useTranslation } from 'react-i18next';
import { X, GitCommit } from 'lucide-react';
import { changelogData } from '../data/changelog';

interface ChangelogModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const ChangelogModal: React.FC<ChangelogModalProps> = ({ isOpen, onClose }) => {
    const { t } = useTranslation();

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 w-full max-w-2xl max-h-[80vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50">
                    <div className="flex items-center gap-2">
                        <div className="p-2 bg-indigo-500/10 rounded-lg">
                            <GitCommit className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-zinc-900 dark:text-white">
                                {t('changelog.title', 'Update History')}
                            </h2>
                            <p className="text-xs text-zinc-500">Singlue Release Notes</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded-full transition-colors text-zinc-500 hover:text-zinc-900 dark:hover:text-white"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Body (Scrollable) */}
                <div className="flex-1 overflow-y-auto p-6 space-y-8">
                    {changelogData.map((item) => (
                        <div key={item.version} className="relative pl-6 border-l-2 border-indigo-100 dark:border-indigo-500/20 last:border-0 last:pb-0">
                            {/* Dot */}
                            <div className="absolute top-0 left-[-7px] w-3 h-3 rounded-full bg-indigo-500 ring-4 ring-white dark:ring-zinc-900" />

                            <div className="flex items-baseline gap-3 mb-2">
                                <span className="text-2xl font-bold text-zinc-900 dark:text-white">v{item.version}</span>
                                <span className="text-sm font-mono text-zinc-500">{item.date}</span>
                            </div>

                            <h3 className="text-lg font-semibold text-zinc-800 dark:text-zinc-200 mb-3">
                                {item.title}
                            </h3>

                            <ul className="space-y-2">
                                {item.changes.map((change, idx) => (
                                    <li key={idx} className="flex items-start gap-2 text-sm text-zinc-600 dark:text-zinc-400">
                                        <span className="w-1.5 h-1.5 rounded-full bg-zinc-400 mt-1.5 shrink-0" />
                                        <span className="leading-relaxed">{change}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-sm font-medium hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-colors"
                    >
                        {t('common.close', 'Close')}
                    </button>
                </div>
            </div>
        </div>
    );
};
