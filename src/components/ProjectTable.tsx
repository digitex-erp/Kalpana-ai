import React from 'react';
import { VideoProject } from '../types';

interface ProjectTableProps {
  projects: VideoProject[];
  onRecreate: (project: VideoProject) => void;
  onEdit: (project: VideoProject) => void;
  onDelete: (project: VideoProject) => void;
}

const ProjectTable: React.FC<ProjectTableProps> = ({ projects, onRecreate, onEdit, onDelete }) => {
  return (
    <div className="bg-gray-800/50 p-6 rounded-2xl shadow-lg border border-gray-700">
      <h3 className="text-xl font-semibold text-gray-200 mb-4">All Projects</h3>
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left text-gray-400">
          <thead className="text-xs text-gray-400 uppercase bg-gray-700/50">
            <tr>
              <th scope="col" className="px-6 py-3">Product Name</th>
              <th scope="col" className="px-6 py-3">Category</th>
              <th scope="col" className="px-6 py-3">Stage</th>
              <th scope="col" className="px-6 py-3">Last Updated</th>
              <th scope="col" className="px-6 py-3">Version</th>
              <th scope="col" className="px-6 py-3"><span className="sr-only">Actions</span></th>
            </tr>
          </thead>
          <tbody>
            {projects.length > 0 ? projects.map((p) => (
              <tr key={p.id} className="border-b border-gray-700 hover:bg-gray-700/30">
                <th scope="row" className="px-6 py-4 font-medium text-gray-200 whitespace-nowrap">{p.productName}</th>
                <td className="px-6 py-4">{p.category}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    p.stage === 'Completed' ? 'bg-green-900 text-green-300' :
                    p.stage === 'In Progress' ? 'bg-yellow-900 text-yellow-300' :
                    'bg-gray-600 text-gray-300'
                  }`}>{p.stage}</span>
                </td>
                <td className="px-6 py-4">{new Date(p.updatedAt).toLocaleDateString()}</td>
                <td className="px-6 py-4">{p.version || 1}</td>
                <td className="px-6 py-4 text-right space-x-2">
                  <button onClick={() => onRecreate(p)} className="font-medium text-cyan-400 hover:underline">Recreate</button>
                  <button onClick={() => onEdit(p)} className="font-medium text-purple-400 hover:underline">Edit</button>
                  <button onClick={() => onDelete(p)} className="font-medium text-red-500 hover:underline">Delete</button>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan={6} className="text-center py-8 text-gray-500">No projects found. Create one to get started!</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ProjectTable;
