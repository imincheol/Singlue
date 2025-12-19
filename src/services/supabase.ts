import { createClient } from '@supabase/supabase-js';
import type { Song } from '../types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * Fetches songs for a specific video.
 * RLS policies ensure:
 * - Guests see only Public (Stage 3) songs.
 * - Users see Public (Stage 3) + their own songs (Stage 1-3).
 */
export const getSongsForVideo = async (videoId: string): Promise<Song[]> => {
    const { data, error } = await supabase
        .from('songs')
        .select('*')
        .eq('video_id', videoId)
        .order('stage', { ascending: false }) // Prioritize finished songs? Or my songs?
        // We can sort by updated_at or similar if needed.
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching songs for video:', error);
        return [];
    }

    return data as Song[];
};

export const getSongById = async (songId: string): Promise<Song | null> => {
    const { data, error } = await supabase
        .from('songs')
        .select('*')
        .eq('id', songId)
        .single();

    if (error) return null;
    return data as Song;
};

export const saveSong = async (song: Song) => {
    // Note: created_by should be handled by RLS 'default using auth.uid()' or passed in.
    // However, since we defined the column, we might need to rely on RLS insert policy validation.
    // Ideally, we don't send created_by from client if RLS/Default sets it, but Supabase 'users' ref usually needs it.
    // Actually, RLS policy `with check (auth.uid() = created_by)` requires us to send it, OR we rely on a database trigger/default.
    // Simplest is to send it from the authenticated context.

    const { error } = await supabase
        .from('songs')
        .upsert({
            id: song.id,
            video_id: song.video_id,
            title: song.title,
            artist: song.artist,
            lyrics: song.lyrics,
            created_by: song.created_by,
            stage: song.stage,
            is_public: song.is_public,
            global_offset: song.global_offset,
            country_code: song.country_code,
        });

    if (error) {
        throw error;
    }
};

export const getMySongs = async (userId?: string): Promise<Song[]> => {
    let targetUserId = userId;

    if (!targetUserId) {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return [];
        targetUserId = user.id;
    }

    const { data, error } = await supabase
        .from('songs')
        .select('*')
        .eq('created_by', targetUserId)
        .order('created_at', { ascending: false });

    if (error) throw error;
    return data as Song[];
};

/**
 * Replacement for getAllMappings, returns recent public songs.
 */

export const getRecentPublicSongs = async (): Promise<Song[]> => {
    const { data, error } = await supabase
        .from('songs')
        .select('*')
        .eq('is_public', true)
        .eq('stage', 3)
        .order('created_at', { ascending: false })
        .limit(20);

    if (error) throw error;
    return data as Song[];
};

// --- Favorites ---

export const getFavoriteIds = async (userId: string): Promise<Set<string>> => {
    const { data, error } = await supabase
        .from('favorites')
        .select('song_id')
        .eq('user_id', userId);

    if (error) {
        console.error('Error fetching favorites:', error);
        return new Set();
    }
    return new Set(data.map(f => f.song_id));
};

export const getFavorites = async (userId: string): Promise<Song[]> => {
    const { data, error } = await supabase
        .from('favorites')
        .select(`
            song_id,
            songs (*)
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

    if (error) throw error;

    // Map nested result back to Song array
    return data.map((item: any) => item.songs) as Song[];
};

export const toggleFavorite = async (userId: string, songId: string): Promise<boolean> => {
    // Check if exists
    const { data } = await supabase
        .from('favorites')
        .select('id')
        .eq('user_id', userId)
        .eq('song_id', songId)
        .single();

    if (data) {
        // Remove
        await supabase
            .from('favorites')
            .delete()
            .eq('user_id', userId)
            .eq('song_id', songId);
        return false; // Removed
    } else {
        // Add
        await supabase
            .from('favorites')
            .insert({ user_id: userId, song_id: songId });
        return true; // Added
    }
};

export const updateSongMetadata = async (songId: string, title: string, artist: string, country_code?: string) => {
    const updates: any = { title, artist };
    if (country_code) {
        updates.country_code = country_code;
    }

    const { error } = await supabase
        .from('songs')
        .update(updates)
        .eq('id', songId);

    if (error) throw error;
};

export const incrementUsageCount = async (userId: string) => {
    // call RPC or just update
    // Since we don't have an RPC for atomic increment, we can just fetch and update or use rpc if available.
    // For now, simple update is fine for MVP.
    // Ideally: supabase.rpc('increment_usage_count', { user_id: userId })
    // But let's assume we read-modify-write or just let it be loose.
    // Actually, let's try to do it via rpc if we can, but we don't have the rpc defined in the prompt.
    // So read-update.
    const { data: profile } = await supabase.from('profiles').select('usage_count').eq('id', userId).single();
    if (profile) {
        await supabase.from('profiles').update({ usage_count: (profile.usage_count || 0) + 1 }).eq('id', userId);
    }
};
