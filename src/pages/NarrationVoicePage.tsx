// src/pages/NarrationVoicePage.tsx
import React, { useState } from 'react';
import { NarrationVoiceSetting } from '../types';

interface NarrationVoicePageProps {
  onNext: (narrationVoice: NarrationVoiceSetting) => void;
  onBack: () => void;
}

const VOICES: { setting: NarrationVoiceSetting; title: string; description: string; icon: React.ReactNode }[] = [
    { 
        setting: { language: 'hindi', gender: 'male', style: 'Deep, authoritative' }, 
        title: 'Male Voice (Hindi)', 
        description: 'A deep, authoritative, and professional voice for Hindi narration.',
        icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" x2="12" y1="19" y2="22"/></svg>
    },
    { 
        setting: { language: 'hindi', gender: 'female', style: 'Warm, friendly' }, 
        title: 'Female Voice (Hindi)', 
        description: 'A warm, friendly, and engaging voice for Hindi narration.',
        icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" x2="12" y1="19" y2="22"/></svg>
    },
    { 
        setting: { language: 'english', gender: 'male', style: 'Professional, clear' }, 
        title: 'Male Voice (English)', 
        description: 'A professional, clear, and confident voice for English narration.',
        icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" x2="12" y1="19" y2="22"/></svg>
    },
    { 
        setting: { language: 'english', gender: 'female', style: 'Engaging, warm' }, 
        title: 'Female Voice (English)', 
        description: 'An engaging, warm, and friendly voice for English narration.',
        icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" x2="12" y1="19" y2="22"/></svg>
    },
    { 
        setting: { language: 'none', gender: 'none', style: 'Music only' }, 
        title: 'No Narration', 
        description: 'The video will feature only background music, with no voice-over.',
        icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>
    },
];

const NarrationVoicePage: React.FC<NarrationVoicePageProps> = ({ onNext, onBack }) => {
  const [selectedVoice, setSelectedVoice] = useState<NarrationVoiceSetting | null>(null);

  const handleNext = () => {
    if (selectedVoice) {
      onNext(selectedVoice);
    }
  };

  return (
    <div className="bg-gray-800/50 p-6 rounded-2xl shadow-lg border border-gray-700 flex flex-col gap-6 animate-fade-in max-w-2xl mx-auto">
      <div>
        <h2 className="text-xl font-bold text-gray-200">Select Narration Voice</h2>
        <p className="text-gray-400">Choose the voice that best fits your brand and video message.</p>
      </div>

      <div className="space-y-3">
        {VOICES.map((voiceOption) => {
            const isSelected = selectedVoice?.style === voiceOption.setting.style;
            return (
                 <button 
                    key={voiceOption.title} 
                    onClick={() => setSelectedVoice(voiceOption.setting)} 
                    className={`w-full p-4 text-left rounded-lg border-2 transition-all flex items-center gap-4 ${isSelected ? 'bg-cyan-900/50 border-cyan-500' : 'bg-gray-700/50 border-gray-600 hover:border-gray-500'}`}>
                    <div className="text-2xl text-cyan-400">{voiceOption.icon}</div>
                    <div>
                        <p className={`font-semibold ${isSelected ? 'text-cyan-400' : 'text-gray-200'}`}>{voiceOption.title}</p>
                        <p className="text-sm text-gray-400">{voiceOption.description}</p>
                    </div>
                </button>
            )
        })}
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mt-4">
        <button
          onClick={onBack}
          className="w-full py-3 px-4 bg-gray-600 text-white font-bold rounded-lg hover:bg-gray-500 transition-colors"
        >
          ← Back
        </button>
        <button
          onClick={handleNext}
          disabled={!selectedVoice}
          className="w-full py-3 px-4 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Next: Generate Storyboard →
        </button>
      </div>
    </div>
  );
};

export default NarrationVoicePage;
