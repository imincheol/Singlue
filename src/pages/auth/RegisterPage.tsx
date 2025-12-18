import { useState } from 'react';
import { supabase } from '../../services/supabase';
import { useNavigate, Link } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function RegisterPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [nickname, setNickname] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isSuccess, setIsSuccess] = useState(false);
    const navigate = useNavigate();
    const { t } = useTranslation();

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            // 1. Sign Up
            const { data: authData, error: authError } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        nickname,
                    },
                },
            });

            if (authError) throw authError;

            if (authData.user) {
                // 2. Create Profile
                const { error: profileError } = await supabase
                    .from('profiles')
                    .insert({
                        id: authData.user.id,
                        nickname,
                        role: 'user', // Default
                        status: 'approved', // Default to approved as per new spec
                        email // Set email for display in admin
                    });

                if (profileError) {
                    console.error('Profile creation failed:', profileError);
                }

                // Show success UI instead of navigating
                setIsSuccess(true);
            }
        } catch (err: any) {
            console.error('Registration error:', err);
            if (err.message.includes('already registered')) {
                setError(t('auth.already_registered'));
            } else {
                setError(err.message);
            }
        } finally {
            setLoading(false);
        }
    };

    if (isSuccess) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-white dark:bg-black p-6">
                <div className="w-full max-w-md space-y-8 bg-zinc-50 dark:bg-white/5 p-8 rounded-2xl border border-zinc-200 dark:border-white/10 shadow-xl text-center">
                    <div className="mx-auto w-16 h-16 bg-indigo-100 dark:bg-indigo-500/20 rounded-full flex items-center justify-center mb-6">
                        <svg className="w-8 h-8 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                    </div>
                    <h2 className="text-2xl font-bold text-zinc-900 dark:text-white mb-2">
                        {t('auth.reg_success_title')}
                    </h2>
                    <p className="text-zinc-600 dark:text-zinc-400 mb-8 leading-relaxed">
                        {t('auth.reg_success_desc')}
                    </p>
                    <Link
                        to="/login"
                        className="inline-flex w-full justify-center rounded-md bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-500 transition-colors"
                    >
                        {t('auth.reg_success_action')}
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-white dark:bg-black p-6">
            <div className="w-full max-w-md space-y-8">
                <div className="text-center">
                    <h2 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-white">{t('auth.register_title')}</h2>
                </div>
                <form className="mt-8 space-y-6" onSubmit={handleRegister}>
                    <div className="space-y-4 rounded-md shadow-sm">
                        <input
                            type="text"
                            required
                            className="relative block w-full rounded-md border-0 py-2.5 px-3 text-zinc-900 ring-1 ring-inset ring-zinc-300 placeholder:text-zinc-400 focus:z-10 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 dark:bg-zinc-900 dark:text-white dark:ring-zinc-700 outline-none"
                            placeholder={t('auth.nickname')}
                            value={nickname}
                            onChange={(e) => setNickname(e.target.value)}
                        />
                        <input
                            type="email"
                            required
                            className="relative block w-full rounded-md border-0 py-2.5 px-3 text-zinc-900 ring-1 ring-inset ring-zinc-300 placeholder:text-zinc-400 focus:z-10 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 dark:bg-zinc-900 dark:text-white dark:ring-zinc-700 outline-none"
                            placeholder={t('auth.email')}
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                        <input
                            type="password"
                            required
                            className="relative block w-full rounded-md border-0 py-2.5 px-3 text-zinc-900 ring-1 ring-inset ring-zinc-300 placeholder:text-zinc-400 focus:z-10 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 dark:bg-zinc-900 dark:text-white dark:ring-zinc-700 outline-none"
                            placeholder={t('auth.password')}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>

                    {error && (
                        <div className="text-red-500 text-sm text-center font-medium bg-red-50 dark:bg-red-500/10 py-2 rounded-md border border-red-200 dark:border-red-500/20">{error}</div>
                    )}

                    <div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="group relative flex w-full justify-center rounded-md bg-indigo-600 px-3 py-2.5 text-sm font-semibold text-white hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-50 transition-all shadow-md active:scale-[0.98]"
                        >
                            {loading && <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4" />}
                            {t('nav.signup')}
                        </button>
                    </div>
                </form>
                <div className="text-center">
                    <Link to="/login" className="text-sm font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400">
                        {t('auth.already_have_account')}
                    </Link>
                </div>
            </div>
        </div>
    );
}
