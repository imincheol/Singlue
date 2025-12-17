import { createClient } from '@supabase/supabase-js';
import type { Song, VideoMapping } from '../types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseKey);

export const getSongByVideoId = async (videoId: string): Promise<{ song: Song | null, mapping: VideoMapping | null }> => {
    // 1. Get Mapping
    const { data: mappingData, error: mappingError } = await supabase
        .from('video_mappings')
        .select('*')
        .eq('video_id', videoId)
        .single();

    if (mappingError || !mappingData) {
        return { song: null, mapping: null };
    }

    const mapping: VideoMapping = {
        videoId: mappingData.video_id,
        songId: mappingData.song_id,
        globalOffset: mappingData.global_offset,
    };

    // 2. Get Song
    const { data: songData, error: songError } = await supabase
        .from('songs')
        .select('*')
        .eq('id', mapping.songId)
        .single();

    if (songError || !songData) {
        return { song: null, mapping };
    }

    const song: Song = {
        id: songData.id,
        title: songData.title,
        artist: songData.artist,
        lyrics: songData.lyrics,
    };

    return { song, mapping };
};

export const saveSongAndMapping = async (song: Song, mapping: VideoMapping) => {
    // 1. Upsert Song
    const { error: songError } = await supabase
        .from('songs')
        .upsert({
            id: song.id,
            title: song.title,
            artist: song.artist,
            lyrics: song.lyrics,
        });

    if (songError) throw songError;

    // 2. Upsert Mapping
    const { error: mappingError } = await supabase
        .from('video_mappings')
        .upsert({
            video_id: mapping.videoId,
            song_id: song.id, // Ensure we use the song UUID
            global_offset: mapping.globalOffset,
        });

    if (mappingError) throw mappingError;
};

export const updateVideoMappingOffset = async (videoId: string, globalOffset: number) => {
    const { error } = await supabase
        .from('video_mappings')
        .update({ global_offset: globalOffset })
        .eq('video_id', videoId);

    if (error) throw error;
};
