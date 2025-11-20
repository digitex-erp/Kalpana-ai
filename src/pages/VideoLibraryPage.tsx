// src/pages/VideoLibraryPage.tsx
import React, { useState, useEffect } from 'react';
import { getAllProjects, deleteProject } from '../services/dbService';
import { EnhancedVideoPlayer } from '../components/EnhancedVideoPlayer';
import { VideoProject } from '../types';

interface VideoLibraryPageProps {
  onBack: () => void;
}

const VideoLibraryPage: React.FC<VideoLibraryPageProps> = ({ onBack }) => {
  const [videos, setVideos] = useState<VideoProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedVideo, setSelectedVideo] = useState<VideoProject | null>(null);

  useEffect(() => {
    loadVideos();
  }, []);

  const loadVideos = async () => {
    setLoading(true);
    try {
      const allProjects = await getAllProjects();
      // Prioritize projects with a direct videoUrl
      const completedVideos = allProjects.filter(p => p.stage === 'Completed' && (p.videoUrl || p.videoBlob));
      setVideos(completedVideos.sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0)));
    } catch (error) {
      console.error('Error loading videos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (projectId: string) => {
    if (window.confirm('Are you sure you want to delete this video project from your library? This cannot be undone.')) {
      await deleteProject(projectId);
      loadVideos();
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="text-white text-xl">Loading video library...</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 animate-fade-in">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-white">📹 Video Library</h1>
        <button onClick={onBack} className="py-2 px-4 bg-gray-600 text-white font-bold rounded-lg hover:bg-gray-500">
            ← Back
        </button>
      </div>

      {videos.length === 0 ? (
        <div className="bg-gray-800 rounded-lg p-12 text-center border border-dashed border-gray-700">
          <h3 className="text-xl font-semibold text-white">Library is Empty</h3>
          <p className="text-gray-400">Generated videos will appear here.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {videos.map(video => (
            <div key={video.id} className="bg-gray-800 rounded-lg overflow-hidden border border-gray-700 group flex flex-col">
              <div className="aspect-video bg-gray-700 relative cursor-pointer" onClick={() => setSelectedVideo(video)}>
                {video.mainImage?.previewUrl ? (
                  <img src={video.mainImage.previewUrl} alt={video.product.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="flex items-center justify-center h-full text-6xl opacity-50">🎬</div>
                )}
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="text-white text-4xl">▶️</span>
                </div>
              </div>
              <div className="p-4 flex flex-col flex-grow">
                <h3 className="text-white font-semibold mb-1 truncate" title={video.product.name}>{video.product.name}</h3>
                <p className="text-gray-500 text-xs mb-4">
                  Created: {new Date(video.createdAt).toLocaleDateString()}
                </p>
                <div className="flex gap-2 mt-auto">
                  <button onClick={() => setSelectedVideo(video)} className="flex-1 px-3 py-2 bg-cyan-500 hover:bg-cyan-600 text-white rounded text-sm font-semibold">Play</button>
                  <button onClick={() => handleDelete(video.id)} className="p-2 bg-red-800 hover:bg-red-700 text-white rounded" title="Delete Video">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm4 0a1 1 0 012 0v6a1 1 0 11-2 0V8z" clipRule="evenodd" /></svg>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedVideo && (selectedVideo.videoUrl || selectedVideo.videoBlob) && (
        <EnhancedVideoPlayer
          videoUrl={selectedVideo.videoUrl}
          videoBlob={selectedVideo.videoBlob}
          projectName={selectedVideo.product.name}
          storyboard={selectedVideo.storyboard}
          onClose={() => setSelectedVideo(null)}
        />
      )}
    </div>
  );
};

export default VideoLibraryPage;