import React from 'react';
import { TrainingAnalysisReport } from '../types';

interface TrainingDashboardProps {
  report: TrainingAnalysisReport;
}

const TrainingDashboard: React.FC<TrainingDashboardProps> = ({ report }) => {
  return (
    <div className="bg-gray-800/50 p-6 rounded-2xl shadow-lg border border-gray-700">
      <h3 className="text-xl font-semibold text-gray-200 mb-4">AI Training Analysis</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h4 className="font-semibold text-cyan-400 mb-2">Top Learned Rules</h4>
          <ul className="list-disc list-inside space-y-1 text-sm text-gray-300">
            {report.topLearnedRules.map((rule, i) => <li key={i}>{rule}</li>)}
          </ul>
        </div>
        <div>
          <h4 className="font-semibold text-cyan-400 mb-2">Weak Points & Suggestions</h4>
          <ul className="list-disc list-inside space-y-1 text-sm text-gray-300">
            {report.weakPoints.map((point, i) => <li key={i}>{point}</li>)}
          </ul>
        </div>
        <div className="md:col-span-2">
            <h4 className="font-semibold text-cyan-400 mb-2">Style Insights</h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
                <div className="bg-gray-700/50 p-3 rounded-lg">
                    <p className="text-xs text-gray-400">Dominant Tone</p>
                    <p className="font-bold text-gray-200">{report.styleInsights.dominantTone}</p>
                </div>
                 <div className="bg-gray-700/50 p-3 rounded-lg">
                    <p className="text-xs text-gray-400">Camera Style</p>
                    <p className="font-bold text-gray-200">{report.styleInsights.camera}</p>
                </div>
                 <div className="bg-gray-700/50 p-3 rounded-lg">
                    <p className="text-xs text-gray-400">Lighting</p>
                    <p className="font-bold text-gray-200">{report.styleInsights.lighting}</p>
                </div>
                 <div className="bg-gray-700/50 p-3 rounded-lg">
                    <p className="text-xs text-gray-400">On-Screen Text</p>
                    <p className="font-bold text-gray-200">{report.styleInsights.text}</p>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default TrainingDashboard;
