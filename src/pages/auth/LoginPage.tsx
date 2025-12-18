import { useState, useEffect } from 'react';
import { supabase } from '../../services/supabase';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { Loader2, CheckCircle2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();
    const location = useLocation();
    const { t } = useTranslation();
    const [successMessage, setSuccessMessage] = useState<string | null>(location.state?.message || null);

    useEffect(() => {
        if (successMessage) {
            const timer = setTimeout(() => setSuccessMessage(null), 5000);
            return () => clearTimeout(timer);
        }
    }, [successMessage]);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        console.log('Login started');
        setLoading(true);
        setError(null);

        try {
            console.log('Calling signInWithPassword...');
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });
            console.log('signInWithPassword result:', { data, error });

            if (error) {
                if (error.message.includes('Email not confirmed')) {
                    throw new Error(t('auth.email_not_confirmed'));
                }
                throw error;
            }

            if (data.user) {
                console.log('User login successful');
            }

            console.log('Navigating to root...');
            navigate('/');
        } catch (err: any) {
            console.error('Login error:', err);
            setError(err.message === 'Invalid login credentials' ? t('auth.invalid_credentials') : err.message);
        } finally {
            console.log('Setting loading false');
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-white dark:bg-black p-6">
            <div className="w-full max-w-md space-y-8">
                <div className="text-center">
                    <h2 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-white">{t('auth.login_title')}</h2>
                </div>

                {successMessage && (
                    <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-4 flex items-center gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
                        <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                        <p className="text-sm text-emerald-600 dark:text-emerald-400 font-medium">
                            {successMessage}
                        </p>
                    </div>
                )}
                <form className="mt-8 space-y-6" onSubmit={handleLogin}>
                    <div className="space-y-4 rounded-md shadow-sm">
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
                            {t('nav.signin')}
                        </button>
                    </div>
                </form>
                <div className="text-center">
                    <Link to="/register" className="text-sm font-medium text-indigo-600 hover:text-indigo-500">
                        {t('auth.no_account')}
                    </Link>
                </div>
            </div>
        </div>
    );
}
