// src/components/EnhancedVideoPlayer.tsx
import React, { useEffect, useRef, useState } from 'react';
import 'video.js/dist/video-js.css';
import videojs from 'video.js';
import { Storyboard } from '../types';

interface EnhancedVideoPlayerProps {
  videoUrl?: string;
  videoBlob?: Blob;
  projectName?: string;
  storyboard?: Storyboard;
  onClose?: () => void;
}

export function EnhancedVideoPlayer({ 
  videoUrl,
  videoBlob, 
  projectName, 
  storyboard,
  onClose 
}: EnhancedVideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const playerRef = useRef<any>(null);
  const [effectiveVideoUrl, setEffectiveVideoUrl] = useState<string>('');
  const [currentTextOverlay, setCurrentTextOverlay] = useState<string>('');
  const textOverlayRef = useRef<string>('');

  useEffect(() => {
    let objectUrl: string | null = null;
    
    if (videoUrl) {
      setEffectiveVideoUrl(videoUrl);
    } else if (videoBlob) {
      objectUrl = URL.createObjectURL(videoBlob);
      setEffectiveVideoUrl(objectUrl);
    }

    return () => {
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [videoUrl, videoBlob]);

  useEffect(() => {
    if (!videoRef.current || !effectiveVideoUrl || playerRef.current) return;

    const player = videojs(videoRef.current, {
      controls: true,
      autoplay: true,
      preload: 'auto',
      fluid: true,
      playbackRates: [0.5, 1, 1.5, 2],
    });

    playerRef.current = player;

    const handleTimeUpdate = () => {
      if (!storyboard?.scenes?.length) return;

      const currentTime = player.currentTime() || 0;
      let cumulativeTime = 0;
      let currentSceneText = '';

      for (const scene of storyboard.scenes) {
        const sceneEndTime = cumulativeTime + (scene.duration || 3); // Default duration
        if (currentTime >= cumulativeTime && currentTime < sceneEndTime) {
          currentSceneText = scene.textOverlay || '';
          break;
        }
        cumulativeTime = sceneEndTime;
      }
      
      if (currentSceneText !== textOverlayRef.current) {
        textOverlayRef.current = currentSceneText;
        setCurrentTextOverlay(currentSceneText);
      }
    };

    if (storyboard?.scenes?.length) {
        player.on('timeupdate', handleTimeUpdate);
    }

    return () => {
      if (playerRef.current && !playerRef.current.isDisposed()) {
        player.off('timeupdate', handleTimeUpdate);
        playerRef.current.dispose();
        playerRef.current = null;
      }
    };
  }, [effectiveVideoUrl, storyboard]);

  const handleDownload = () => {
    if (!effectiveVideoUrl) return;
    const a = document.createElement('a');
    a.href = effectiveVideoUrl;
    a.download = `${projectName || 'video'}.mp4`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4 animate-fade-in" onClick={onClose}>
      <div className="bg-gray-900 rounded-lg max-w-5xl w-full max-h-[90vh] overflow-auto flex flex-col border border-gray-700 shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <h3 className="text-xl font-semibold text-white truncate">{projectName}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white text-3xl">&times;</button>
        </div>
        <div className="p-4 sm:p-6 relative">
            <div data-vjs-player className="rounded-lg overflow-hidden">
                <video ref={videoRef} className="video-js vjs-big-play-centered" playsInline crossOrigin="anonymous">
                  <source src={effectiveVideoUrl} type="video/mp4" />
                </video>
            </div>
            {currentTextOverlay && (
                <div key={currentTextOverlay} className="absolute bottom-20 left-1/2 -translate-x-1/2 w-full px-8 pointer-events-none animate-fade-in">
                    <p className="text-white text-2xl font-bold text-center bg-black/60 px-4 py-2 rounded-lg" style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.8)' }}>
                        {currentTextOverlay}
                    </p>
                </div>
            )}
        </div>
        <div className="px-4 sm:px-6 pb-4 sm:pb-6 flex gap-3">
          <button onClick={handleDownload} className="flex-1 px-6 py-3 bg-cyan-500 hover:bg-cyan-600 text-white rounded-lg font-semibold">Download MP4</button>
          <button onClick={onClose} className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-semibold">Close</button>
        </div>
      </div>
    </div>
  );
}