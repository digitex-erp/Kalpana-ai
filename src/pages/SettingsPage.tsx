// src/pages/SettingsPage.tsx
import React, { useState } from 'react';
import DirectorMemoryManager from '../components/DirectorMemoryManager';
import ApiHealthDashboard from '../components/ApiHealthDashboard';
import AiSettingsPage from './AiSettingsPage';
import { getAiSettings, saveAiSettings } from '../services/aiService';
import { AiProvider, AiProviderSettings } from '../types';
import { PROVIDER_CONFIGS } from '../services/apiHealth';


interface SettingsPageProps {
  onBack: () => void;
}

const SettingsPage: React.FC<SettingsPageProps> = ({ onBack }) => {
  const [settings, setSettings] = useState<AiProviderSettings>(getAiSettings());
  const availableProviders = Object.values(PROVIDER_CONFIGS);

  const handleProviderChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newProvider = e.target.value as AiProvider;
    const newSettings = { ...settings, preferredProvider: newProvider };
    setSettings(newSettings);
    saveAiSettings(newSettings);
    alert(`Preferred provider set to ${PROVIDER_CONFIGS[newProvider]?.name || newProvider}.`);
  };

  return (
    <div className="bg-gray-800/50 p-6 rounded-2xl shadow-lg border border-gray-700 flex flex-col gap-8 animate-fade-in max-w-4xl mx-auto">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-200">System & API Settings</h2>
          <p className="text-gray-400">Monitor API health and manage application data.</p>
        </div>
        <button onClick={onBack} className="py-2 px-4 bg-gray-600 text-white font-bold rounded-lg hover:bg-gray-500 transition-colors">
          ← Back
        </button>
      </div>

      <div className="space-y-8">
        {/* New Preferred Provider Selector */}
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <h3 className="text-xl font-semibold text-white">Preferred AI Provider</h3>
          <p className="text-gray-400 mt-1 mb-4">Select the primary AI provider to be used for all generations. The system will automatically failover to other active providers if your preferred choice is unavailable.</p>
          <select
            value={settings.preferredProvider || 'claude'}
            onChange={handleProviderChange}
            className="w-full max-w-sm p-3 bg-gray-700 border border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-cyan-500 focus:border-cyan-500"
            aria-label="Select Preferred AI Provider"
          >
            {availableProviders.map(provider => (
              <option key={provider.id} value={provider.id}>{provider.name}</option>
            ))}
          </select>
        </div>

        {/* API Key Configuration */}
        <AiSettingsPage />

        {/* API Health Dashboard */}
        <ApiHealthDashboard />

        {/* Director Memory Manager remains */}
        <DirectorMemoryManager />
      </div>

      <div className="mt-4 border-t border-gray-700 pt-6 flex justify-end">
        <p className="text-sm text-gray-500 italic">
          The preferred provider is used first, then the system automatically fails over to other active providers.
        </p>
      </div>
    </div>
  );
};

export default SettingsPage;