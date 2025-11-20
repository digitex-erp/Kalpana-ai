import React from 'react';
import { VideoProject } from '../types';

interface ActivityFeedProps {
  projects: VideoProject[];
}

const ActivityFeed: React.FC<ActivityFeedProps> = ({ projects }) => {
  const sortedProjects = [...projects].sort((a, b) => b.updatedAt - a.updatedAt).slice(0, 5); // Get last 5 updated projects

  return (
    <div className="bg-gray-800/50 p-6 rounded-2xl shadow-lg border border-gray-700">
      <h3 className="text-xl font-semibold text-gray-200 mb-4">Recent Activity</h3>
      <ul className="space-y-4">
        {sortedProjects.length > 0 ? sortedProjects.map(p => (
            <li key={p.id} className="flex items-start gap-3">
                <div className="w-8 h-8 flex-shrink-0 bg-gray-700/50 rounded-full flex items-center justify-center text-cyan-400">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h5M20 12a8 8 0 10-2.337 5.663" /></svg>
                </div>
                <div>
                    <p className="text-sm text-gray-300">
                        <span className="font-semibold">{p.productName}</span> was updated.
                    </p>
                    <p className="text-xs text-gray-500">{new Date(p.updatedAt).toLocaleString()}</p>
                </div>
            </li>
        )) : (
            <p className="text-sm text-gray-500 text-center py-4">No recent activity.</p>
        )}
      </ul>
    </div>
  );
};

export default ActivityFeed;
