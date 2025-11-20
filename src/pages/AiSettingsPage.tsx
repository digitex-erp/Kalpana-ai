import React, { useState, useEffect } from 'react';
import { getAiSettings, saveAiSettings } from '../services/aiService';
import { AiProviderSettings, AiProvider } from '../types';
import { PROVIDER_CONFIGS } from '../services/apiHealth';

export const AiSettingsPage: React.FC = () => {
  const [settings, setSettings] = useState<AiProviderSettings>(getAiSettings());
  const [showKeys, setShowKeys] = useState<Record<string, boolean>>({});
  const [localKeys, setLocalKeys] = useState<Record<string, string>>(settings.apiKeys || {});

  useEffect(() => {
    setLocalKeys(settings.apiKeys || {});
  }, [settings]);

  const handleKeyChange = (providerId: string, value: string) => {
    const newKeys = { ...localKeys, [providerId]: value };
    setLocalKeys(newKeys);
  };

  const saveKeys = () => {
    const newSettings = { ...settings, apiKeys: localKeys };
    setSettings(newSettings);
    saveAiSettings(newSettings);
    alert('API Keys saved successfully!');
  };

  const toggleShowKey = (providerId: string) => {
    setShowKeys(prev => ({ ...prev, [providerId]: !prev[providerId] }));
  };

  return (
    <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-semibold text-white flex items-center gap-2">
          <span className="text-2xl">🔑</span> API Key Configuration
        </h3>
        <button
          onClick={saveKeys}
          className="px-4 py-2 bg-green-600 hover:bg-green-500 text-white rounded-lg font-semibold transition-colors"
        >
          Save Keys
        </button>
      </div>

      <p className="text-gray-400 mb-6 text-sm">
        Enter your personal API keys here to override the system defaults.
        These keys are stored locally in your browser and sent directly to the proxy.
      </p>

      <div className="space-y-4">
        {Object.values(PROVIDER_CONFIGS).map(provider => (
          <div key={provider.id} className="bg-gray-700/30 p-4 rounded-lg border border-gray-600">
            <div className="flex items-center justify-between mb-2">
              <label className="text-white font-medium">{provider.name}</label>
              <div className="text-xs text-gray-500">
                {localKeys[provider.id] ? 'Custom Key Set' : 'Using System Default'}
              </div>
            </div>
            <div className="relative">
              <input
                type={showKeys[provider.id] ? "text" : "password"}
                value={localKeys[provider.id] || ''}
                onChange={(e) => handleKeyChange(provider.id, e.target.value)}
                placeholder={`Enter ${provider.name} API Key`}
                className="w-full bg-gray-900 border border-gray-600 rounded px-3 py-2 text-gray-200 focus:outline-none focus:border-cyan-500 pr-10"
              />
              <button
                onClick={() => toggleShowKey(provider.id)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
              >
                {showKeys[provider.id] ? '👁️' : '👁️‍🗨️'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AiSettingsPage;
