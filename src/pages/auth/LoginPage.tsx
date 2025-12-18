import { useState } from 'react';
import { supabase } from '../../services/supabase';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../contexts/AuthContext';
import { Loader2 } from 'lucide-react';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();
    const { profile } = useAuth();
    // const { t } = useTranslation(); // TODO: Add translation keys later

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

            if (error) throw error;

            if (data.user) {
                console.log('User found, fetching profile status...');
                // Fetch profile status
                const { data: profile, error: profileError } = await supabase
                    .from('profiles')
                    .select('status')
                    .eq('id', data.user.id)
                    .single();

                console.log('Profile fetch result:', { profile, profileError });

                if (profile?.status === 'pending') {
                    console.log('Status pending, signing out...');
                    await supabase.auth.signOut();
                    throw new Error('Your account is pending approval by an administrator.');
                }

                if (profile?.status === 'rejected') {
                    console.log('Status rejected, signing out...');
                    await supabase.auth.signOut();
                    throw new Error('Your account registration has been rejected.');
                }
            }

            console.log('Navigating to root...');
            navigate('/');
        } catch (err: any) {
            console.error('Login error:', err);
            setError(err.message === 'Invalid login credentials' ? 'Invalid email or password' : err.message);
        } finally {
            console.log('Setting loading false');
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-white dark:bg-black p-6">
            <div className="w-full max-w-md space-y-8">
                <div className="text-center">
                    <h2 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-white">Sign in to Singlue</h2>
                </div>
                <form className="mt-8 space-y-6" onSubmit={handleLogin}>
                    <div className="space-y-4 rounded-md shadow-sm">
                        <input
                            type="email"
                            required
                            className="relative block w-full rounded-md border-0 py-2 px-3 text-zinc-900 ring-1 ring-inset ring-zinc-300 placeholder:text-zinc-400 focus:z-10 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 dark:bg-zinc-900 dark:text-white dark:ring-zinc-700"
                            placeholder="Email address"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                        <input
                            type="password"
                            required
                            className="relative block w-full rounded-md border-0 py-2 px-3 text-zinc-900 ring-1 ring-inset ring-zinc-300 placeholder:text-zinc-400 focus:z-10 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 dark:bg-zinc-900 dark:text-white dark:ring-zinc-700"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>

                    {error && (
                        <div className="text-red-500 text-sm text-center">{error}</div>
                    )}

                    <div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="group relative flex w-full justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-50"
                        >
                            {loading && <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4" />}
                            Sign in
                        </button>
                    </div>
                </form>
                <div className="text-center">
                    <Link to="/register" className="text-sm font-medium text-indigo-600 hover:text-indigo-500">
                        Don't have an account? Sign up
                    </Link>
                </div>
            </div>
        </div>
    );
}
