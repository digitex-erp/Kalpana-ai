import React, { useState, useRef, useEffect } from 'react';
// FIX: Corrected import path for types.
import { BrandKit, Storyboard } from '../types';

interface VideoPlayerProps {
  videoUrl: string;
  brandKit: BrandKit;
  storyboard: Storyboard;
  videoLength: number;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ videoUrl, brandKit, storyboard, videoLength }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [currentSceneIndex, setCurrentSceneIndex] = useState(0);

  const sceneDuration = videoLength / storyboard.scenes.length;

  useEffect(() => {
    const videoElement = videoRef.current;
    if (!videoElement) return;

    const handleTimeUpdate = () => {
      const currentTime = videoElement.currentTime;
      const newSceneIndex = Math.min(
        Math.floor(currentTime / sceneDuration),
        storyboard.scenes.length - 1
      );
      if (newSceneIndex !== currentSceneIndex) {
        setCurrentSceneIndex(newSceneIndex);
      }
    };

    videoElement.addEventListener('timeupdate', handleTimeUpdate);
    return () => {
      videoElement.removeEventListener('timeupdate', handleTimeUpdate);
    };
  }, [sceneDuration, currentSceneIndex, storyboard.scenes.length]);

  const currentTextOverlay = storyboard.scenes[currentSceneIndex]?.textOverlay;
  const logoUrl = brandKit.logo ? `data:${brandKit.logo.mimeType};base64,${brandKit.logo.base64}` : null;

  return (
    <div className="relative w-full aspect-video bg-black rounded-lg overflow-hidden shadow-2xl border border-gray-700">
      <video
        ref={videoRef}
        key={videoUrl}
        src={videoUrl}
        controls
        autoPlay
        className="w-full h-full object-contain"
      />
      
      {/* Overlays Wrapper */}
      <div className="absolute inset-0 pointer-events-none p-4 flex flex-col justify-between">
        {/* Top Overlay: Logo */}
        <div className="flex justify-end">
            {logoUrl && (
                 <img src={logoUrl} alt="Brand Logo" className="w-16 h-auto opacity-80" />
            )}
        </div>

        {/* Middle Overlay: Text */}
        <div className="flex-grow flex items-center justify-center">
             {currentTextOverlay && (
                <p 
                    key={currentSceneIndex} // Force re-render for animation
                    className="text-white text-xl md:text-3xl font-bold text-center bg-black/50 px-4 py-2 rounded-lg animate-fade-in"
                    style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.7)' }}
                >
                    {currentTextOverlay}
                </p>
             )}
        </div>

        {/* Bottom Overlay: Contact Info */}
        <div className="flex justify-start">
            {brandKit.contactInfo && (
                <p className="text-white text-sm font-semibold bg-black/50 px-3 py-1 rounded-lg">
                    {brandKit.contactInfo}
                </p>
            )}
        </div>
      </div>
    </div>
  );
};

export default VideoPlayer;