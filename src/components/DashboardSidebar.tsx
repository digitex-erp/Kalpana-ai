import React from 'react';
import { VideoProject, TrainingAnalysisReport } from '../types';

interface DashboardSidebarProps {
  projects: VideoProject[];
  report: TrainingAnalysisReport | null;
}

const StatCard: React.FC<{ title: string; value: string; icon: React.ReactNode }> = ({ title, value, icon }) => (
    <div className="bg-gray-700/50 p-4 rounded-lg flex items-center gap-4">
        <div className="text-cyan-400">{icon}</div>
        <div>
            <p className="text-sm text-gray-400">{title}</p>
            <p className="text-lg font-bold text-white">{value}</p>
        </div>
    </div>
);


const DashboardSidebar: React.FC<DashboardSidebarProps> = ({ projects, report }) => {
    const completedProjects = projects.filter(p => p.stage === 'Completed').length;
    
  return (
    <div className="bg-gray-800/50 p-6 rounded-2xl shadow-lg border border-gray-700 space-y-4">
      <h3 className="text-xl font-semibold text-gray-200">Stats at a Glance</h3>
      <div className="space-y-3">
          <StatCard 
            title="Total Projects" 
            value={projects.length.toString()} 
            icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4M4 7l8 5 8-5" /></svg>}
          />
          <StatCard 
            title="Completed Videos" 
            value={completedProjects.toString()}
            icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
          />
          {report && (
               <StatCard 
                title="AI Improvement" 
                value={report.trendAnalysis.improvementOverV1}
                icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>}
                />
          )}
      </div>
    </div>
  );
};

export default DashboardSidebar;
