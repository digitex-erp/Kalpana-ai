// Fix: Populated file with component implementation.
import React, { useMemo } from 'react';
// FIX: Corrected import path for types.
import { VideoProject } from '../types';

interface VideoLibraryProps {
  videos: VideoProject[];
  onRecreate: (video: VideoProject) => void;
  // FIX: Changed id type from 'number' to 'string' to match the VideoProject type.
  onDelete: (id: string) => void;
}

const VideoLibrary: React.FC<VideoLibraryProps> = ({ videos, onRecreate, onDelete }) => {

  const sortedVideos = useMemo(() => {
    return [...videos].sort((a, b) => b.updatedAt - a.updatedAt);
  }, [videos]);

  if (videos.length === 0) {
    return (
      <div className="text-center py-12 px-4 bg-gray-900/50 rounded-lg border border-dashed border-gray-700">
        <h3 className="text-lg font-semibold text-gray-400">Your Video Library is Empty</h3>
        <p className="text-gray-500 mt-2">Create your first video, and it will appear here for you to manage.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {sortedVideos.map((video) => {
        // Note: Object URLs should be managed carefully to avoid memory leaks.
        // For this component's lifecycle, it's acceptable, but in a larger app,
        // consider managing these URLs in a state management solution.
        const videoObjectUrl = video.videoBlob ? URL.createObjectURL(video.videoBlob) : '';
        const imageObjectUrl = video.imageBase64 ? `data:${video.imageMimeType};base64,${video.imageBase64}` : '';
        
        return (
          <div key={video.id} className="bg-gray-900/50 rounded-lg overflow-hidden border border-gray-700 group flex flex-col">
            <div className="relative aspect-video">
              {videoObjectUrl ? (
                <video
                  src={videoObjectUrl}
                  controls={false}
                  poster={imageObjectUrl}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gray-800 flex items-center justify-center text-gray-500">
                  <span>Video Not Found</span>
                </div>
              )}
               <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    {/* Future: Could add a play icon overlay here */}
               </div>
            </div>
            <div className="p-4 flex flex-col flex-grow">
              <h4 className="font-semibold text-gray-200 truncate" title={video.productName}>{video.productName}</h4>
              <p className="text-sm text-gray-400">Last Updated: {new Date(video.updatedAt).toLocaleDateString()}</p>
              <div className="mt-4 flex-grow flex items-end">
                <div className="flex w-full gap-2">
                  <button
                    onClick={() => onRecreate(video)}
                    className="flex-1 py-2 px-3 text-sm bg-cyan-600 text-white font-bold rounded-lg hover:bg-cyan-500 transition-colors"
                  >
                    Recreate
                  </button>
                  <button
                    onClick={() => onDelete(video.id)}
                    className="flex-1 py-2 px-3 text-sm bg-red-800 text-white font-bold rounded-lg hover:bg-red-700 transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  );
};

export default VideoLibrary;