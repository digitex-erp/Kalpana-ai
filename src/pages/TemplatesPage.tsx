// src/pages/TemplatesPage.tsx
import React, { useState, useEffect } from 'react';
import { CategoryTemplate } from '../types';
import { getAllTemplates, deleteTemplate } from '../services/templateService';

interface TemplatesPageProps {
  onBack: () => void;
  onLoadTemplate: (template: CategoryTemplate) => void;
}

const TemplatesPage: React.FC<TemplatesPageProps> = ({ onBack, onLoadTemplate }) => {
  const [templates, setTemplates] = useState<(CategoryTemplate & { isDefault?: boolean })[]>([]);

  useEffect(() => {
    setTemplates(getAllTemplates());
  }, []);

  const handleDelete = (id: string) => {
    if (window.confirm("Are you sure you want to delete this template? This cannot be undone.")) {
      deleteTemplate(id);
      setTemplates(getAllTemplates());
    }
  };

  return (
    <div className="bg-gray-800/50 p-6 rounded-2xl shadow-lg border border-gray-700 flex flex-col gap-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-gray-200">Category Templates</h2>
          <p className="text-gray-400">Manage your saved workflow templates to speed up creation.</p>
        </div>
        <button onClick={onBack} className="py-2 px-4 bg-gray-600 text-white font-bold rounded-lg hover:bg-gray-500 transition-colors">
          ← Back
        </button>
      </div>
      
      <p className="text-sm text-gray-400 bg-gray-900/50 p-3 rounded-md border border-gray-700">
        To create a new template, start a new video project, complete all steps up to the storyboard, and then click "Save as Template" on the Storyboard page.
      </p>

      <div className="border-t border-gray-700"></div>

      {templates.length === 0 ? (
        <div className="text-center py-12 px-4 bg-gray-900/50 rounded-lg border border-dashed border-gray-700">
          <h3 className="text-lg font-semibold text-gray-400">No Templates Found</h3>
          <p className="text-gray-500 mt-2">Create your first template to see it here.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {templates.map(template => {
            const isDefault = template.isDefault;
            return (
              <div key={template.id} className="bg-gray-900/50 p-4 rounded-lg border border-gray-700 flex flex-col gap-3">
                <h4 className="font-semibold text-cyan-400 truncate">{template.name}</h4>
                <p className="text-sm text-gray-400"><strong className="text-gray-300">Category:</strong> {template.category}</p>
                <p className="text-sm text-gray-400"><strong className="text-gray-300">Platform:</strong> {template.targeting.platform}</p>
                <p className="text-sm text-gray-400"><strong className="text-gray-300">Music:</strong> {template.music.mood}</p>
                <div className="mt-auto pt-3 border-t border-gray-600 flex gap-2">
                  <button onClick={() => onLoadTemplate(template)} className="flex-1 py-2 text-sm bg-cyan-600 text-white font-bold rounded-lg hover:bg-cyan-500 transition-colors">Load</button>
                  <button 
                    onClick={() => handleDelete(template.id)} 
                    className="py-2 px-3 bg-red-800 text-white font-bold rounded-lg hover:bg-red-700 transition-colors disabled:bg-gray-700 disabled:cursor-not-allowed disabled:hover:bg-gray-700" 
                    title={isDefault ? "Default templates cannot be deleted" : "Delete Template"}
                    disabled={isDefault}
                  >
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default TemplatesPage;