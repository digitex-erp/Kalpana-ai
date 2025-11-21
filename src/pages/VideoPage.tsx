// src/pages/VideoPage.tsx
import React, { useState, useEffect, useRef } from 'react';
import { VideoProject } from '../types';
import { saveProject } from '../services/dbService';
import Loader from '../components/Loader';
import ErrorMessage from '../components/ErrorMessage';

const WarningMessage: React.FC<{ message: string | null }> = ({ message }) => {
  if (!message) return null;
  return (
    <div className="p-4 bg-yellow-900/40 border border-yellow-700/60 text-yellow-200 rounded-lg mb-6 animate-fade-in">
      <h3 className="font-bold">Please Note</h3>
      <p className="text-sm mt-1">{message}</p>
    </div>
  );
};

export function VideoPage({ projectData, onNext, onBack }: { projectData: VideoProject; onNext: (data: any) => void; onBack: () => void; }) {
  const [generating, setGenerating] = useState(false);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [apiResponse, setApiResponse] = useState<any>(null);

  const [error, setError] = useState<any>(null);
  const [warning, setWarning] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState('');

  const [generationMethod, setGenerationMethod] = useState<string | null>(null);
  const [mediaLoaded, setMediaLoaded] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  const isImage = videoUrl?.toLowerCase().endsWith('.jpg') || videoUrl?.toLowerCase().endsWith('.png');
  const fileExtension = videoUrl?.split('.').pop()?.split('?')[0] || 'mp4';


  const handleGenerateVideo = async () => {
    try {
      setGenerating(true);
      setError(null);
      setWarning(null);
      setVideoUrl(null);
      setAudioUrl(null);
      setApiResponse(null);
      setMediaLoaded(false);
      setStatusMessage('🚀 Starting video generation job...');

      const mainImageForApi = projectData.mainImage ? `data:${projectData.mainImage.mimeType};base64,${projectData.mainImage.base64}` : null;
      if (!mainImageForApi) {
        throw new Error("Cannot generate video without a main product image.");
      }

      const response = await fetch('/api/generate-script-and-video', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectData })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || data.error || 'Failed to generate video');
      }

      // Handle Async Luma Generation (Polling)
      if (data.status === 'dreaming' && data.generationId) {
        setStatusMessage('Generating video with Luma AI (this takes 1-2 minutes)...');

        // Start polling loop
        let attempts = 0;
        const maxAttempts = 60; // 10 mins max
        let videoUrl = null;

        while (attempts < maxAttempts) {
          await new Promise(r => setTimeout(r, 10000)); // Wait 10s

          try {
            const statusRes = await fetch(`/api/check-luma-status?id=${data.generationId}`);
            const statusData = await statusRes.json();

            console.log('[Luma Poll]', statusData);

            if (statusData.data?.state === 'completed') {
              videoUrl = statusData.data.video.url;
              break;
            }

            if (statusData.data?.state === 'failed') {
              throw new Error(statusData.data.failure_reason || 'Luma generation failed');
            }

            setStatusMessage(`Generating video... (Luma status: ${statusData.data?.state})`);
          } catch (e) {
            console.warn('Polling error:', e);
          }
          attempts++;
        }

        if (!videoUrl) throw new Error('Video generation timed out');

        setVideoUrl(videoUrl);
        setApiResponse({
          success: true,
          videoUrl: videoUrl,
          message: 'Video generated successfully with Luma AI'
        });
        setGenerating(false);
        return;
      }

      // Handle Synchronous Result (Runway/Cloudinary)
      if (data.success) {
        setApiResponse(data);
        setGenerationMethod(data.generationMethod);
        if (data.generationMethod?.includes('runway')) {
          setStatusMessage('✨ Creating AI demonstration... this can take 2-5 minutes.');
        }

        if (!data.videoUrl || typeof data.videoUrl !== 'string') {
          throw new Error('Invalid video URL received from server.');
        }

        console.log('[VideoPage] ✅ Media URL received:', data.videoUrl);
        if (data.audioUrl) console.log('[VideoPage] ✅ Audio URL received:', data.audioUrl);

        if (data.warning || (data.durationLimited && data.message)) {
          setWarning(data.warning || data.message);
        }

        setVideoUrl(data.videoUrl);
        setAudioUrl(data.audioUrl || null);
        setStatusMessage('✅ Success! Loading media...');
      } else {
        throw new Error(data.message || 'Unknown error occurred');
      }

    } catch (err: any) {
      console.error('❌ Final error:', err);
      // FORCE DEBUG OUTPUT TO CONSOLE
      console.log('🐛 DEBUG DETAILS:', JSON.stringify(err.details, null, 2));

      if (err.details) {
        alert(`DEBUG INFO:\nCloud Name: ${err.details.cloudName}\nKey Length: ${err.details.apiKeyLength} (expected: ${err.details.expectedKeyLength})\nSecret Length: ${err.details.apiSecretLength} (expected: ${err.details.expectedSecretLength})\nKey Starts: ${err.details.apiKeyStart}\nSecret Starts: ${err.details.apiSecretStart}\nHas Spaces: ${err.details.hasSpaces}\n\nError: ${err.details.error}`);
      }

      setWarning(null);
      setError(err);
      setGenerating(false);
    }
  };

  // Sync video and audio playback
  useEffect(() => {
    const video = videoRef.current;
    const audio = audioRef.current;
    if (video && audio && audioUrl) {
      const syncPlay = () => audio.play();
      const syncPause = () => audio.pause();
      const syncSeek = () => { audio.currentTime = video.currentTime; };

      video.addEventListener('play', syncPlay);
      video.addEventListener('pause', syncPause);
      video.addEventListener('seeked', syncSeek);

      console.log('[VideoPage] Video and audio sync listeners attached.');

      return () => {
        video.removeEventListener('play', syncPlay);
        video.removeEventListener('pause', syncPause);
        video.removeEventListener('seeked', syncSeek);
      }
    }
  }, [audioUrl, mediaLoaded]);

  // Handle saving project after media is loaded and ready
  useEffect(() => {
    if (mediaLoaded && apiResponse) {
      const save = async () => {
        try {
          const projectId = projectData.id || `proj-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
          const completeProject: Partial<VideoProject> = {
            ...projectData,
            id: projectId,
            videoUrl: apiResponse.videoUrl,
            // audioUrl is not part of VideoProject type, so we don't save it directly
            cloudinaryPublicId: apiResponse.cloudinaryPublicId,
            createdAt: projectData.createdAt || Date.now(),
            updatedAt: Date.now(),
            stage: 'Completed',
          };
          await saveProject(completeProject as VideoProject);
          console.log(`[VideoPage] ✅ Project saved/updated in IndexedDB with ID: ${projectId}`);
        } catch (saveError: any) {
          console.error('[VideoPage] Failed to save project:', saveError.message);
          alert('Media generated but failed to save to library. You can still download it.');
        }
      };
      save();
      // Clear apiResponse to prevent re-saving
      setApiResponse(null);
    }
  }, [mediaLoaded, apiResponse, projectData]);


  const canGenerate = projectData && projectData.storyboard;

  if (error && !generating) {
    return (
      <div className="max-w-2xl mx-auto p-6 bg-red-900/40 border-2 border-red-700/60 rounded-lg text-red-200">
        <div className="flex items-start gap-3 mb-4">
          <span className="text-3xl">⚠️</span>
          <div className="flex-1">
            <h3 className="text-xl font-bold text-red-100 mb-2">
              {error.error === 'missing_configuration'
                ? 'Server Configuration Missing'
                : 'Video Generation Failed'
              }
            </h3>
            <p className="text-red-200 mb-4">
              {error.message || 'An unexpected error occurred.'}
            </p>
          </div>
        </div>

        {error.details && (
          <div className="bg-gray-800 p-4 rounded-lg mb-4 border border-red-900">
            <p className="font-semibold mb-2 text-gray-200">🔍 Debug Details (Please Screenshot):</p>
            <ul className="space-y-1 text-sm text-gray-300 font-mono">
              {/* Force display of key debug info */}
              {error.details.cloudName && <li>Cloud Name: {error.details.cloudName}</li>}
              {error.details.apiKeyLength && <li>API Key Length: {error.details.apiKeyLength} (expected: {error.details.expectedKeyLength || 15})</li>}
              {error.details.apiSecretLength && <li>Secret Length: {error.details.apiSecretLength} (expected: {error.details.expectedSecretLength || 27})</li>}
              {error.details.apiKeyStart && <li>Key Starts With: {error.details.apiKeyStart}</li>}
              {error.details.apiSecretStart && <li>Secret Starts With: {error.details.apiSecretStart}</li>}
              {error.details.hasSpaces !== undefined && <li>Has Spaces: {error.details.hasSpaces ? 'YES (Fix this!)' : 'No'}</li>}
              {error.details.error && <li className="mt-2 text-red-300">Error: {error.details.error}</li>}

              {error.details.missingConfigs && (
                <li>
                  <strong>Missing:</strong> {error.details.missingConfigs.join(', ')}
                </li>
              )}
              {error.details.environment && (
                <li>
                  <strong>Environment:</strong> {error.details.environment}
                </li>
              )}
              {error.details.errorMessage && (
                <li>
                  <strong>Error:</strong> {error.details.errorMessage}
                </li>
              )}
              {error.details.raw && (
                <li>
                  <strong>Raw Error:</strong> {error.details.raw}
                </li>
              )}
            </ul>
          </div>
        )}

        {error.fix && (
          <div className="bg-blue-900/30 p-4 rounded-lg mb-4 border border-blue-700">
            <p className="font-semibold mb-3 text-blue-200 flex items-center gap-2">
              <span>💡</span> {error.fix.title}
            </p>
            <ol className="space-y-2 text-sm text-blue-300">
              {error.fix.steps.map((step: string, index: number) => (
                <li key={index} className="flex gap-2">
                  <span className="font-semibold min-w-[20px]">{index + 1}.</span>
                  <span>{step}</span>
                </li>
              ))}
            </ol>
          </div>
        )}

        <div className="flex gap-3">
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg font-semibold transition"
          >
            🔄 Try Again
          </button>

          <button
            onClick={() => onNext({})}
            className="px-6 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded-lg font-semibold transition"
          >
            🏠 Dashboard
          </button>
        </div>

        <p className="mt-4 text-xs text-gray-500 text-center">
          If this error persists, contact support with error code: {error.error}
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-white mb-2">Generate Your Video <span className="text-xs bg-red-600 text-white px-2 py-1 rounded ml-2">DEBUG v2</span></h1>
        <p className="text-gray-400">Transform your storyboard into a professional video using AI.</p>
      </div>

      <WarningMessage message={warning} />

      {!videoUrl && !generating && (
        <div className="bg-gradient-to-br from-purple-900/50 to-blue-900/50 rounded-xl p-8 border-2 border-purple-500 text-center">
          <div className="text-6xl mb-4">🎬</div>
          <h2 className="text-2xl font-bold text-white mb-6">Ready to Create Your Video</h2>
          <button onClick={handleGenerateVideo} disabled={!canGenerate} className="px-8 py-4 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white rounded-lg font-bold text-lg transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed">
            {canGenerate ? '🎬 Generate Video' : 'Complete Storyboard First'}
          </button>
        </div>
      )}

      {generating && (
        <div className="mt-6 bg-gray-800 rounded-lg p-6">
          <Loader title="Generating Your Media..." message={statusMessage} />
          {generationMethod?.includes('runway') && (
            <div className="mt-4 p-4 bg-blue-500/10 border border-blue-500 rounded-lg text-center">
              <p className="text-blue-300 font-semibold">Creating AI-generated product demonstration.</p>
              <p className="text-blue-400 text-sm mt-1">This may take 2-5 minutes. Please be patient.</p>
            </div>
          )}
        </div>
      )}

      {videoUrl && (
        <div className="bg-gray-800 rounded-xl p-6 border-2 border-green-500 mb-6 animate-fade-in">
          <h3 className="text-2xl font-bold text-white mb-4 flex items-center gap-2"><span>🎉</span> Your Media is Ready!</h3>
          <div className="bg-black rounded-lg overflow-hidden mb-4 max-w-md mx-auto relative" style={{ aspectRatio: '9/16' }}>
            {!mediaLoaded && !error && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-900/80 z-10 p-4">
                <div className="text-center">
                  <div className="animate-spin text-4xl mb-4">⏳</div>
                  <p className="text-white text-lg font-semibold">Loading Media...</p>
                </div>
              </div>
            )}

            {isImage ? (
              <img
                src={videoUrl}
                alt={projectData.product?.name || 'Generated Media'}
                className={`w-full h-full object-contain transition-opacity duration-500 ${!mediaLoaded ? 'opacity-0' : 'opacity-100'}`}
                onLoad={() => { setMediaLoaded(true); setGenerating(false); }}
                onError={() => { setError('Image failed to load.'); setGenerating(false); }}
              />
            ) : (
              <>
                <video
                  ref={videoRef}
                  src={videoUrl}
                  playsInline
                  controls
                  crossOrigin="anonymous"
                  className={`w-full h-full object-contain transition-opacity duration-500 ${!mediaLoaded ? 'opacity-0' : 'opacity-100'}`}
                  onLoadedData={() => {
                    console.log('[VideoPage] Video loaded');
                    // If there's no audio, we are done loading. If there is audio, wait for it.
                    if (!audioUrl) {
                      setMediaLoaded(true);
                      setGenerating(false);
                    }
                  }}
                  onError={() => { setError('Video failed to load.'); setGenerating(false); }}
                />
                {audioUrl && (
                  <audio
                    ref={audioRef}
                    src={audioUrl}
                    className="hidden"
                    onLoadedData={() => {
                      console.log('[VideoPage] Audio loaded');
                      // When audio loads, the whole media package is ready
                      setMediaLoaded(true);
                      setGenerating(false);
                    }}
                    onError={() => {
                      console.warn('[VideoPage] Audio failed to load. Video will be silent.');
                      // Mark as loaded anyway to show the silent video
                      setMediaLoaded(true);
                      setGenerating(false);
                    }}
                  />
                )}
              </>
            )}
          </div>
          {mediaLoaded && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-w-2xl mx-auto">
              <a href={videoUrl} download={`${projectData.product?.name || 'video'}.${fileExtension}`} target="_blank" rel="noopener noreferrer" className="px-6 py-3 bg-cyan-500 hover:bg-cyan-600 text-white rounded-lg text-center font-semibold transition-colors">
                📥 Download Video
              </a>
              {audioUrl && (
                <a href={audioUrl} download={`${projectData.product?.name || 'audio'}.mp3`} target="_blank" rel="noopener noreferrer" className="px-6 py-3 bg-green-500 hover:bg-green-600 text-white rounded-lg text-center font-semibold transition-colors">
                  🎵 Download Audio
                </a>
              )}
            </div>
          )}
          <div className="bg-green-500/10 border border-green-500 rounded-lg p-4 mt-4 text-center">
            <p className="text-green-300 text-sm">{mediaLoaded ? '✅ Media saved to your library!' : 'Processing...'}</p>
          </div>
        </div>
      )}

      {error && !generating && (
        <div className="bg-red-500/10 border-2 border-red-500 rounded-lg p-6 mb-6 animate-fade-in">
          <ErrorMessage message={error} />
          <button onClick={() => { setError(null); setVideoUrl(null); }} className="mt-4 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded text-sm">
            Try Again
          </button>
        </div>
      )}

      <div className="flex justify-between mt-8">
        <button onClick={onBack} className="px-6 py-3 bg-gray-600 hover:bg-gray-500 text-white rounded-lg font-semibold">← Back to Storyboard</button>
        <button onClick={() => onNext({})} disabled={!mediaLoaded} className="px-6 py-3 bg-green-600 hover:bg-green-500 text-white rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed">
          Finish to Dashboard ✔️
        </button>
      </div>
    </div>
  );
}