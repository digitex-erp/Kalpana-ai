// src/components/MusicPlayer.tsx
import React, { useState, useEffect, useRef } from 'react';

interface MusicPlayerProps {
    audioUrl: string;
    trackName: string;
    onError?: (error: string) => void;
    autoPlay?: boolean;
}

const MusicPlayer: React.FC<MusicPlayerProps> = ({
    audioUrl,
    trackName,
    onError,
    autoPlay = false
}) => {
    const audioRef = useRef<HTMLAudioElement>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [volume, setVolume] = useState(0.3); // Default 30%
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;

        // Set volume
        audio.volume = volume;

        // Event listeners
        const handleLoadedMetadata = () => {
            setDuration(audio.duration);
            setIsLoading(false);
        };

        const handleTimeUpdate = () => {
            setCurrentTime(audio.currentTime);
        };

        const handleEnded = () => {
            setIsPlaying(false);
            setCurrentTime(0);
        };

        const handleError = () => {
            const errorMsg = `Failed to load audio: ${trackName}`;
            setError(errorMsg);
            setIsLoading(false);
            onError?.(errorMsg);
        };

        const handleCanPlay = () => {
            setIsLoading(false);
            if (autoPlay) {
                audio.play().catch(err => {
                    console.error('[MusicPlayer] Auto-play failed:', err);
                });
            }
        };

        audio.addEventListener('loadedmetadata', handleLoadedMetadata);
        audio.addEventListener('timeupdate', handleTimeUpdate);
        audio.addEventListener('ended', handleEnded);
        audio.addEventListener('error', handleError);
        audio.addEventListener('canplay', handleCanPlay);

        return () => {
            audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
            audio.removeEventListener('timeupdate', handleTimeUpdate);
            audio.removeEventListener('ended', handleEnded);
            audio.removeEventListener('error', handleError);
            audio.removeEventListener('canplay', handleCanPlay);
        };
    }, [audioUrl, trackName, onError, autoPlay, volume]);

    const togglePlayPause = () => {
        const audio = audioRef.current;
        if (!audio) return;

        if (isPlaying) {
            audio.pause();
            setIsPlaying(false);
        } else {
            audio.play().then(() => {
                setIsPlaying(true);
            }).catch(err => {
                console.error('[MusicPlayer] Play failed:', err);
                setError('Playback failed. Please try again.');
            });
        }
    };

    const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
        const audio = audioRef.current;
        if (!audio) return;

        const newTime = parseFloat(e.target.value);
        audio.currentTime = newTime;
        setCurrentTime(newTime);
    };

    const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const audio = audioRef.current;
        const newVolume = parseFloat(e.target.value);
        setVolume(newVolume);
        if (audio) {
            audio.volume = newVolume;
        }
    };

    const formatTime = (seconds: number): string => {
        if (isNaN(seconds)) return '0:00';
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    if (error) {
        return (
            <div className="bg-red-500/10 border border-red-500 rounded-lg p-4">
                <p className="text-red-400 text-sm flex items-center gap-2">
                    <span>⚠️</span>
                    <span>{error}</span>
                </p>
            </div>
        );
    }

    return (
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
            <audio ref={audioRef} src={audioUrl} preload="metadata" />

            {/* Track Info */}
            <div className="mb-3">
                <p className="text-white font-semibold text-sm truncate">{trackName}</p>
                <p className="text-gray-400 text-xs">Preview</p>
            </div>

            {/* Progress Bar */}
            <div className="mb-3">
                <input
                    type="range"
                    min="0"
                    max={duration || 0}
                    value={currentTime}
                    onChange={handleSeek}
                    disabled={isLoading}
                    className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                    style={{
                        background: `linear-gradient(to right, #06b6d4 0%, #06b6d4 ${(currentTime / duration) * 100}%, #374151 ${(currentTime / duration) * 100}%, #374151 100%)`
                    }}
                />
                <div className="flex justify-between text-xs text-gray-400 mt-1">
                    <span>{formatTime(currentTime)}</span>
                    <span>{formatTime(duration)}</span>
                </div>
            </div>

            {/* Controls */}
            <div className="flex items-center gap-4">
                {/* Play/Pause Button */}
                <button
                    onClick={togglePlayPause}
                    disabled={isLoading}
                    className="w-10 h-10 flex items-center justify-center bg-cyan-500 hover:bg-cyan-600 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-full transition-colors"
                >
                    {isLoading ? (
                        <span className="text-white text-xs">...</span>
                    ) : isPlaying ? (
                        <span className="text-white">⏸</span>
                    ) : (
                        <span className="text-white">▶</span>
                    )}
                </button>

                {/* Volume Control */}
                <div className="flex items-center gap-2 flex-1">
                    <span className="text-gray-400 text-sm">🔊</span>
                    <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.01"
                        value={volume}
                        onChange={handleVolumeChange}
                        className="flex-1 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                    />
                    <span className="text-gray-400 text-xs w-10 text-right">
                        {Math.round(volume * 100)}%
                    </span>
                </div>
            </div>
        </div>
    );
};

export default MusicPlayer;
