import { useEffect, useState } from 'react';
import { supabase } from '../../services/supabase';
import type { Profile } from '../../types';
import { Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function AdminDashboard() {
    const { t } = useTranslation();
    const [profiles, setProfiles] = useState<Profile[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
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
        fetchProfiles();
    }, []);

    if (loading) {
        return <div className="min-h-screen pt-24 flex justify-center"><Loader2 className="animate-spin w-8 h-8" /></div>;
    }

    return (
        <div className="min-h-screen pt-24 px-6 max-w-7xl mx-auto">
            <h1 className="text-3xl font-bold text-zinc-900 dark:text-white mb-8">{t('admin.title')}</h1>

            <div className="bg-white dark:bg-zinc-900 rounded-xl shadow overflow-hidden border border-zinc-200 dark:border-zinc-800">
                <table className="min-w-full divide-y divide-zinc-200 dark:divide-zinc-800">
                    <thead className="bg-zinc-50 dark:bg-zinc-800/50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">{t('admin.nickname')}</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">{t('admin.email')}</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">{t('admin.role')}</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">{t('admin.created_at')}</th>
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
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-500 dark:text-zinc-400">
                                    {new Date(profile.created_at).toLocaleDateString()}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
