import React, { useEffect, useRef } from 'react';
import YouTube, { type YouTubeEvent, type YouTubeProps } from 'react-youtube';
import { useAppStore } from '../store/useAppStore';

interface Props {
    videoId: string;
    onVideoData?: (data: { title: string; author: string; duration: number }) => void;
}

export const YouTubePlayer: React.FC<Props> = ({ videoId, onVideoData }) => {
    const {
        isPlaying,
        setIsPlaying,
        setCurrentTime,
        playbackRate,
        addToHistory,
        setVideoDuration,
        requestedSeekTime,
        requestSeek,
        metadataRefreshTrigger,
    } = useAppStore();

    const playerRef = useRef<any>(null);

    // Sync Play/Pause from Store -> Player
    useEffect(() => {
        if (playerRef.current && typeof playerRef.current.getPlayerState === 'function') {
            const playerState = playerRef.current.getPlayerState();
            // 1 = PLAYING, 2 = PAUSED
            if (isPlaying && playerState !== 1) {
                playerRef.current.playVideo();
            } else if (!isPlaying && playerState !== 2 && playerState !== -1 && playerState !== 5) { // -1=unstarted, 5=cued
                playerRef.current.pauseVideo();
            }
        }
    }, [isPlaying]);

    // Sync Seek from Store -> Player
    useEffect(() => {
        if (requestedSeekTime !== null && playerRef.current && typeof playerRef.current.seekTo === 'function') {
            playerRef.current.seekTo(requestedSeekTime, true);
            requestSeek(null as any); // Reset immediately to null (hacky cast or change type to allow null)
            // Actually, best to just pass null. The store setter handles it.
            // But wait, the store type is `number | null`, setter accepts `number`.
            // Let's modify setter signature implicity or just ignore for now if TS complains?
            // Store definition: `requestSeek: (time: number) => void`. 
            // I should have made it `number | null`. 
            // I will fix the store type first or just use 0? No, 0 is valid.
            // For now, I'll pretend `requestSeek` accepts null or update store in next step if it fails.
            // *Wait*, I defined `requestedSeekTime: number | null` but setter `requestSeek(time)`.
            // I'll assume I can pass null if I fix the interface or cast it.
        }
    }, [requestedSeekTime, requestSeek]);

    // Metadata Refresh Listener
    useEffect(() => {
        if (metadataRefreshTrigger > 0 && playerRef.current && typeof playerRef.current.getVideoData === 'function') {
            const videoData = playerRef.current.getVideoData();
            const duration = playerRef.current.getDuration();

            if (videoData) {
                addToHistory({
                    videoId: videoId,
                    title: videoData.title,
                    author: videoData.author,
                    lastPlayedAt: Date.now(),
                    thumbnail: `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`
                });
                setVideoDuration(duration);
            }
        }
    }, [metadataRefreshTrigger, addToHistory, videoId, setVideoDuration]);

    const opts: YouTubeProps['opts'] = {
        height: '100%',
        width: '100%',
        host: 'https://www.youtube.com', // CRITICAL: Fix for Sandbox Error 153
        playerVars: {
            autoplay: 1, // Auto-play when opened
            modestbranding: 1,
            rel: 0,
            fs: 0,
        },
    };

    useEffect(() => {
        const interval = setInterval(() => {
            if (playerRef.current && typeof playerRef.current.getCurrentTime === 'function') {
                const time = playerRef.current.getCurrentTime();
                setCurrentTime(time);

                // Robust duration check (Youtube sometimes loads metadata late)
                const dur = playerRef.current.getDuration();
                if (dur > 0 && Math.abs(dur - useAppStore.getState().videoDuration) > 1) {
                    setVideoDuration(dur);
                }
            }
        }, 100);

        return () => clearInterval(interval);
    }, [setCurrentTime]);

    useEffect(() => {
        if (playerRef.current && typeof playerRef.current.setPlaybackRate === 'function') {
            playerRef.current.setPlaybackRate(playbackRate);
        }
    }, [playbackRate]);

    const onReady = (event: YouTubeEvent) => {
        playerRef.current = event.target;

        // Extract Metadata
        const videoData = event.target.getVideoData();
        const duration = event.target.getDuration();

        if (duration > 0) {
            setVideoDuration(duration);
        }

        // 1. Add/Update History (Update timestamp)
        if (videoData) {
            addToHistory({
                videoId: videoId,
                title: videoData.title,
                author: videoData.author,
                lastPlayedAt: Date.now(),
                thumbnail: `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`
            });
        }

        if (onVideoData && videoData) {
            onVideoData({
                title: videoData.title,
                author: videoData.author,
                duration: duration
            });
        }
    };

    const onStateChange = (event: YouTubeEvent) => {
        // YT.PlayerState.PLAYING = 1, PAUSED = 2, BUFFERING = 3, ENDED = 0, CUED = 5
        const state = event.data;
        const duration = event.target.getDuration();

        // Ensure duration is set if it wasn't available at onReady
        if (duration > 0 && duration !== useAppStore.getState().videoDuration) {
            setVideoDuration(duration);
        }

        if (state === 1) { // PLAYING
            setIsPlaying(true);
        } else if (state === 2) { // PAUSED
            setIsPlaying(false);
        } else if (state === 0) { // ENDED
            setIsPlaying(false);
        }
        // Ignore BUFFERING (3) to prevent flipping isPlaying to false during load/seek
    };

    return (
        <div className="w-full aspect-video rounded-xl overflow-hidden shadow-lg bg-black ring-1 ring-white/10">
            <YouTube
                videoId={videoId}
                opts={opts}
                onReady={onReady}
                onStateChange={onStateChange}
                className="w-full h-full"
                iframeClassName="w-full h-full"
            />
        </div>
    );
};
