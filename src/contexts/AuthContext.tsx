import { createContext, useContext, useEffect, useState } from 'react';
import type { User, Session } from '@supabase/supabase-js';
import { supabase } from '../services/supabase';
import type { Profile } from '../types';

interface AuthContextType {
    user: User | null;
    profile: Profile | null;
    session: Session | null;
    isLoading: boolean;
    isAdmin: boolean;
    isApproved: boolean;
    signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [session, setSession] = useState<Session | null>(null);
    const [profile, setProfile] = useState<Profile | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        console.log('[AuthContext] Initializing...');

        // Safety timeout: failed auth check shouldn't block app forever
        const safetyTimer = setTimeout(() => {
            console.warn('[AuthContext] Safety timeout triggered. Forcing loading completion.');
            setIsLoading(false);
        }, 3000);

        // Current session check
        supabase.auth.getSession().then(({ data: { session } }) => {
            console.log('[AuthContext] getSession result:', session ? 'Session found' : 'No session');
            clearTimeout(safetyTimer); // Clear safety timer if successful

            setSession(session);
            setUser(session?.user ?? null);
            if (session?.user) {
                console.log('[AuthContext] User found, fetching profile...');
                fetchProfile(session.user.id);
            } else {
                console.log('[AuthContext] No user, loading finished.');
                setIsLoading(false);
            }
        }).catch(err => {
            console.error('[AuthContext] getSession error:', err);
            setIsLoading(false);
        });

        // Listen for changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            console.log('[AuthContext] Auth state change:', event);
            setSession(session);
            setUser(session?.user ?? null);

            if (session?.user) {
                fetchProfile(session.user.id);
            } else {
                setProfile(null);
                setIsLoading(false);
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    const fetchProfile = async (userId: string) => {
        console.log('[AuthContext] fetchProfile starting for:', userId);
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', userId)
                .eq('id', userId)
                .single();

            console.log('[AuthContext] Supabase profile query finished. Data:', data, 'Error:', error);

            if (error) {
                console.error('[AuthContext] Error fetching profile:', error);
            } else {
                console.log('[AuthContext] Profile fetched successfully');

                // Strict Access Control: Force logout if pending or rejected
                if (data.status === 'pending' || data.status === 'rejected') {
                    console.warn('[AuthContext] User status is', data.status, '- forcing logout.');
                    await supabase.auth.signOut();
                    setProfile(null);
                    setUser(null);
                    setSession(null);
                    return;
                }

                setProfile(data);
                // Also log the role/status
                console.log('[AuthContext] Role:', data.role, 'Status:', data.status);
            }
        } catch (error) {
            console.error('[AuthContext] Error in fetchProfile:', error);
        } finally {
            console.log('[AuthContext] fetchProfile finally block - setting isLoading false');
            setIsLoading(false);
        }
    };

    const signOut = async () => {
        await supabase.auth.signOut();
        setProfile(null);
        setUser(null);
        setSession(null);
    };

    const value = {
        user,
        profile,
        session,
        isLoading,
        isAdmin: profile?.role === 'admin',
        isApproved: profile?.status === 'approved',
        signOut,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
