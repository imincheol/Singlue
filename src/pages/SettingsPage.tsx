import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../services/supabase';
import { Loader2, Key, Save, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function SettingsPage() {
    const { user, profile, isLoading: authLoading } = useAuth();
    const [nickname, setNickname] = useState('');
    const [apiKey, setApiKey] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    useEffect(() => {
        if (profile) {
            setNickname(profile.nickname || '');
            if (profile.gemini_api_key) {
                setApiKey(profile.gemini_api_key);
            }
        }
    }, [profile]);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;

        setIsSaving(true);
        setMessage(null);

        try {
            const updates = {
                nickname,
                gemini_api_key: apiKey
            };

            const { error } = await supabase
                .from('profiles')
                .update(updates)
                .eq('id', user.id);

            if (error) throw error;

            setMessage({ type: 'success', text: 'Settings saved successfully.' });
        } catch (error: any) {
            console.error('Error saving settings:', error);
            setMessage({ type: 'error', text: 'Failed to save settings.' });
        } finally {
            setIsSaving(false);
        }
    };

    if (authLoading) {
        return (
            <div className="min-h-screen pt-24 pb-12 px-4 sm:px-6 flex justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
            </div>
        );
    }

    if (!user) {
        return (
            <div className="min-h-screen pt-24 pb-12 px-4 sm:px-6 max-w-7xl mx-auto">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-zinc-900 dark:text-white">Access Denied</h2>
                    <p className="mt-2 text-zinc-600 dark:text-zinc-400">Please sign in to access settings.</p>
                    <Link to="/login" className="mt-4 inline-block px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
                        Sign In
                    </Link>
                </div>
            </div>
        );
    }

    const usageCount = profile?.usage_count || 0;
    const quotaValid = !!profile?.gemini_api_key || usageCount < 10;
    const userEmail = profile?.email || user.email;

    return (
        <div className="min-h-screen pt-24 pb-12 px-4 sm:px-6 max-w-3xl mx-auto">
            <h1 className="text-3xl font-bold text-zinc-900 dark:text-white mb-8">Settings</h1>

            <form onSubmit={handleSave} className="space-y-8">
                {/* Profile Section */}
                <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 shadow-sm">
                    <h2 className="text-xl font-semibold text-zinc-900 dark:text-white mb-4 flex items-center gap-2">
                        Profile Settings
                    </h2>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                                Email
                            </label>
                            <input
                                type="text"
                                value={userEmail || ''}
                                disabled
                                className="w-full px-4 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-500 cursor-not-allowed"
                            />
                        </div>
                        <div>
                            <label htmlFor="nickname" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                                Nickname
                            </label>
                            <input
                                type="text"
                                id="nickname"
                                value={nickname}
                                onChange={(e) => setNickname(e.target.value)}
                                className="w-full px-4 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all placeholder:text-zinc-400"
                            />
                        </div>
                    </div>
                </div>

                {/* Quota Section */}
                <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 shadow-sm">
                    <h2 className="text-xl font-semibold text-zinc-900 dark:text-white mb-4 flex items-center gap-2">
                        <AlertTriangle className={`w-5 h-5 ${quotaValid ? 'text-indigo-500' : 'text-amber-500'}`} />
                        Usage & Quota
                    </h2>

                    <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-lg">
                            <div>
                                <p className="text-sm font-medium text-zinc-900 dark:text-white">Free Song Generations</p>
                                <p className="text-xs text-zinc-500 mt-1">
                                    {profile?.gemini_api_key
                                        ? "Unlimited (Using your own API Key)"
                                        : "Limited to 10 songs for new users"}
                                </p>
                            </div>
                            <div className="text-right">
                                <span className={`text-2xl font-bold ${usageCount >= 10 && !profile?.gemini_api_key ? 'text-red-500' : 'text-indigo-600'}`}>
                                    {profile?.gemini_api_key ? '∞' : `${usageCount} / 10`}
                                </span>
                            </div>
                        </div>

                        {!quotaValid && (
                            <div className="p-3 bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-900/30 rounded-lg flex items-start gap-3">
                                <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5 shrink-0" />
                                <p className="text-sm text-red-700 dark:text-red-400">
                                    You have reached the free quota limit (10 songs). Please register your own Gemini API Key below to continue generating lyrics with AI.
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                {/* API Key Section */}
                <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 shadow-sm">
                    <h2 className="text-xl font-semibold text-zinc-900 dark:text-white mb-4 flex items-center gap-2">
                        <Key className="w-5 h-5 text-indigo-500" />
                        Gemini API Key
                    </h2>

                    <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-6">
                        Singlue uses Google's Gemini AI to analyze songs, generate pronunciations, and translate lyrics.
                        To ensure unlimited access and support the platform's sustainability, we utilize a
                        <strong> Bring Your Own Key (BYOK)</strong> model.
                    </p>

                    <div className="space-y-4">
                        <div>
                            <label htmlFor="apiKey" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                                Your Gemini API Key
                            </label>
                            <input
                                type="password"
                                id="apiKey"
                                value={apiKey}
                                onChange={(e) => setApiKey(e.target.value)}
                                placeholder="AIzaSy..."
                                className="w-full px-4 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all placeholder:text-zinc-400"
                            />
                            <p className="mt-1 text-xs text-zinc-500">
                                Don't have a key? <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-indigo-600 dark:text-indigo-400 hover:underline">Get one for free from Google AI Studio</a>.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Action Bar */}
                <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-zinc-900 border-t border-zinc-200 dark:border-zinc-800 p-4 z-10">
                    <div className="max-w-3xl mx-auto flex items-center justify-between">
                        <div className="flex-1">
                            {message && (
                                <div className={`text-sm flex items-center gap-2 ${message.type === 'success'
                                    ? 'text-green-600 dark:text-green-400'
                                    : 'text-red-600 dark:text-red-400'
                                    }`}>
                                    {message.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
                                    {message.text}
                                </div>
                            )}
                        </div>
                        <button
                            type="submit"
                            disabled={isSaving}
                            className="flex items-center gap-2 px-8 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transform active:scale-95"
                        >
                            {isSaving ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    Saving...
                                </>
                            ) : (
                                <>
                                    <Save className="w-5 h-5" />
                                    Save Changes
                                </>
                            )}
                        </button>
                    </div>
                </div>
                {/* Spacer for fixed bottom bar */}
                <div className="h-20" />
            </form>
        </div>
    );
}
