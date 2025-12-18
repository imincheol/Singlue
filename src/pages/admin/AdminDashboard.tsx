import { useEffect, useState } from 'react';
import { supabase } from '../../services/supabase';
import type { Profile } from '../../types';
import { Check, X, Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function AdminDashboard() {
    const { t } = useTranslation();
    const [profiles, setProfiles] = useState<Profile[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchProfiles();
    }, []);

    const fetchProfiles = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching profiles:', error);
        } else {
            setProfiles(data as Profile[]);
        }
        setLoading(false);
    };

    const updateStatus = async (id: string, newStatus: 'approved' | 'rejected') => {
        const { error } = await supabase
            .from('profiles')
            .update({ status: newStatus })
            .eq('id', id);

        if (error) {
            console.error('Error updating status:', error);
            setError(t('admin.update_failed'));
            setTimeout(() => setError(null), 3000);
        } else {
            // Optimistic update
            setProfiles(profiles.map(p => p.id === id ? { ...p, status: newStatus } : p));
        }
    };

    if (loading) {
        return <div className="min-h-screen pt-24 flex justify-center"><Loader2 className="animate-spin w-8 h-8" /></div>;
    }

    return (
        <div className="min-h-screen pt-24 px-6 max-w-7xl mx-auto">
            <h1 className="text-3xl font-bold text-zinc-900 dark:text-white mb-8">{t('admin.title')}</h1>

            {error && (
                <div className="mb-4 bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 p-3 rounded-md text-sm">
                    {error}
                </div>
            )}

            <div className="bg-white dark:bg-zinc-900 rounded-xl shadow overflow-hidden border border-zinc-200 dark:border-zinc-800">
                <table className="min-w-full divide-y divide-zinc-200 dark:divide-zinc-800">
                    <thead className="bg-zinc-50 dark:bg-zinc-800/50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">{t('admin.nickname')}</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">{t('admin.email')}</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">{t('admin.role')}</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">{t('admin.status')}</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">{t('admin.created_at')}</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-zinc-500 uppercase tracking-wider">{t('admin.actions')}</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-zinc-900 divide-y divide-zinc-200 dark:divide-zinc-800">
                        {profiles.map((profile) => (
                            <tr key={profile.id}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-zinc-900 dark:text-white">
                                    {profile.nickname}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-500 dark:text-zinc-400">
                                    {profile.email || '-'}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-500 dark:text-zinc-400">
                                    {profile.role}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                                        ${profile.status === 'approved' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                                            profile.status === 'rejected' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' :
                                                'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'}`}>
                                        {profile.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-500 dark:text-zinc-400">
                                    {new Date(profile.created_at).toLocaleDateString()}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    {profile.status === 'pending' && (
                                        <div className="flex justify-end gap-2">
                                            <button
                                                onClick={() => updateStatus(profile.id, 'approved')}
                                                className="text-green-600 hover:text-green-900 dark:hover:text-green-400 p-1 bg-green-50 dark:bg-green-900/20 rounded"
                                                title="Approve"
                                            >
                                                <Check className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => updateStatus(profile.id, 'rejected')}
                                                className="text-red-600 hover:text-red-900 dark:hover:text-red-400 p-1 bg-red-50 dark:bg-red-900/20 rounded"
                                                title="Reject"
                                            >
                                                <X className="w-4 h-4" />
                                            </button>
                                        </div>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
