// src/pages/DashboardPage.tsx
import { useState, useEffect } from 'react';
import { getAllProjects, deleteProject } from '../services/dbService';
import type { VideoProject } from '../types';

interface DashboardPageProps {
  onNavigate: (page: string, data?: any) => void;
}

export function DashboardPage({ onNavigate }: DashboardPageProps) {
  const [projects, setProjects] = useState<VideoProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    thisWeek: 0,
    thisMonth: 0
  });

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      setLoading(true);
      console.log('[Dashboard] Loading all projects from IndexedDB...');
      
      const allProjects = await getAllProjects();
      console.log('[Dashboard] Loaded projects:', allProjects.length);
      
      const validProjects: VideoProject[] = [];
      const invalidProjects: any[] = [];
      
      allProjects.forEach(p => {
        if (!p.id || typeof p.id !== 'string') {
          invalidProjects.push({ reason: 'Missing or invalid ID', project: p });
        } else if (!p.product || !p.product.name) {
          invalidProjects.push({ reason: 'Missing product name', project: p });
        } else {
          validProjects.push(p);
        }
      });
      
      if (invalidProjects.length > 0) {
        console.warn('[Dashboard] Invalid projects found and filtered out:', invalidProjects);
      }

      const sortedProjects = validProjects.sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));
      
      setProjects(sortedProjects);
      
      const now = Date.now();
      const weekAgo = now - 7 * 24 * 60 * 60 * 1000;
      const monthAgo = now - 30 * 24 * 60 * 60 * 1000;
      
      setStats({
        total: validProjects.length,
        thisWeek: validProjects.filter(p => p.createdAt && p.createdAt > weekAgo).length,
        thisMonth: validProjects.filter(p => p.createdAt && p.createdAt > monthAgo).length
      });
      
    } catch (error) {
      console.error('[Dashboard] Error loading projects:', error);
      alert('Failed to load projects. Check console for details.');
      setProjects([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProject = async (projectId: string) => {
    if (confirm('Are you sure you want to delete this project? This cannot be undone.')) {
      try {
        console.log('[Dashboard] Deleting project:', projectId);
        await deleteProject(projectId);
        await loadProjects(); // Refresh list
        console.log('[Dashboard] Project deleted successfully');
      } catch (error) {
        console.error('[Dashboard] Error deleting project:', error);
        alert('Failed to delete project');
      }
    }
  };

  const handleRecreateProject = (project: VideoProject) => {
    console.log('[Dashboard] Recreating project:', project.product?.name);
    
    const recreateData = {
      ...project,
      id: undefined,
      videoBlob: undefined,
      videoUrl: undefined,
      createdAt: undefined,
      updatedAt: undefined
    };
    
    onNavigate('newProjectFlow', recreateData);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-cyan-500 mx-auto mb-4"></div>
          <div className="text-white text-xl">Loading projects...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-white">📊 Dashboard</h1>
        <button
          onClick={() => onNavigate('newProjectFlow')}
          className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white rounded-lg font-semibold transition-all transform hover:scale-105"
        >
          ➕ New Project
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-gradient-to-br from-blue-900/50 to-blue-800/50 rounded-xl p-6 border-2 border-blue-500">
            <div className="text-blue-300 text-sm font-semibold mb-2">Total Projects</div>
            <div className="text-4xl font-bold text-white">{stats.total}</div>
        </div>
        <div className="bg-gradient-to-br from-green-900/50 to-green-800/50 rounded-xl p-6 border-2 border-green-500">
            <div className="text-green-300 text-sm font-semibold mb-2">This Week</div>
            <div className="text-4xl font-bold text-white">{stats.thisWeek}</div>
        </div>
        <div className="bg-gradient-to-br from-purple-900/50 to-purple-800/50 rounded-xl p-6 border-2 border-purple-500">
            <div className="text-purple-300 text-sm font-semibold mb-2">This Month</div>
            <div className="text-4xl font-bold text-white">{stats.thisMonth}</div>
        </div>
      </div>

      <div className="bg-gray-800 rounded-xl border-2 border-gray-700 overflow-hidden">
        <div className="bg-gradient-to-r from-gray-900 to-gray-800 p-6 border-b-2 border-gray-700">
          <h2 className="text-xl font-semibold text-white">📁 Recent Projects</h2>
        </div>
        
        {projects.length === 0 ? (
          <div className="p-12 text-center">
            <div className="text-6xl mb-4">🎥</div>
            <div className="text-gray-400 text-lg mb-6">Create your first video project to get started!</div>
            <button
              onClick={() => onNavigate('newProjectFlow')}
              className="px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white rounded-lg font-semibold text-lg transition-all transform hover:scale-105"
            >
              🚀 Create Your First Project
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-900/50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-300 uppercase tracking-wider">Product</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-300 uppercase tracking-wider">Brand</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-300 uppercase tracking-wider">Created</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-300 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {projects.map((project) => (
                  <tr key={project.id} className="hover:bg-gray-700/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {project.mainImage && (
                          <img 
                            src={project.mainImage.previewUrl} 
                            alt={project.product?.name}
                            className="w-16 h-16 object-cover rounded-lg border-2 border-gray-600"
                          />
                        )}
                        <div>
                          <div className="text-white font-semibold">{project.product?.name || 'Unnamed'}</div>
                          <div className="text-gray-400 text-xs">{project.product?.category || 'No category'}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-300 font-medium">{project.brandKit?.brandName || 'No Brand'}</td>
                    <td className="px-6 py-4">
                      <div className="text-gray-300 text-sm">
                        {project.createdAt ? new Date(project.createdAt).toLocaleDateString('en-IN') : 'Unknown'}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button onClick={() => onNavigate('library')} className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm font-semibold">👁️ View</button>
                        <button onClick={() => handleRecreateProject(project)} className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg text-sm font-semibold">🔄 Recreate</button>
                        <button onClick={() => handleDeleteProject(project.id!)} className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm font-semibold">🗑️ Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}