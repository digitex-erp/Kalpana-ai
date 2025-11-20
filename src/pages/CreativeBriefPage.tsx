import React, { useState, useEffect } from 'react';
import { BrandKit, ImageInfo, Targeting, SavedBrandKit, Language, VideoProject } from '../types';
import { fileToImageInfo } from '../utils/fileUtils';
import FileUpload from '../components/FileUpload';

const BRAND_KIT_STORAGE_KEY = 'ai_video_brand_kits_v2';

const getSavedBrandKits = (): SavedBrandKit[] => {
    try {
        const saved = localStorage.getItem(BRAND_KIT_STORAGE_KEY);
        return saved ? JSON.parse(saved) : [];
    } catch (e) {
        console.error("Failed to get brand kits from localStorage", e);
        return [];
    }
};

const saveOrUpdateBrandKit = (kit: SavedBrandKit, existingKits: SavedBrandKit[]): SavedBrandKit[] => {
    const newKits = [...existingKits];
    const existingIndex = newKits.findIndex(k => k.kitName === kit.kitName);
    if (existingIndex > -1) {
        newKits[existingIndex] = kit;
    } else {
        newKits.push(kit);
    }
    localStorage.setItem(BRAND_KIT_STORAGE_KEY, JSON.stringify(newKits));
    return newKits;
};

const deleteBrandKit = (kitName: string, existingKits: SavedBrandKit[]): SavedBrandKit[] => {
    const newKits = existingKits.filter(k => k.kitName !== kitName);
    localStorage.setItem(BRAND_KIT_STORAGE_KEY, JSON.stringify(newKits));
    return newKits;
};

const TONES: { name: BrandKit['toneOfVoice'], description: string }[] = [
    { name: 'Professional', description: 'Clear, formal, and trustworthy.' },
    { name: 'Luxurious', description: 'Elegant, sophisticated, and aspirational.' },
    { name: 'Playful', description: 'Fun, energetic, and humorous.' },
    { name: 'Friendly', description: 'Warm, relatable, and conversational.' },
];

const AUDIENCES = [ 'Young Adults (18-24)', 'Millennials (25-40)', 'Parents & Families', 'Professionals & B2B', 'General Audience' ];
const PLATFORMS = [ 'Instagram Reels', 'TikTok', 'YouTube Shorts', 'Facebook Feed', 'LinkedIn' ];

const ASPECT_RATIOS: { name: Targeting['aspectRatio'], label: string, icon: React.ReactNode }[] = [
    { name: '9:16', label: 'Vertical', icon: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6"><rect x="8" y="3" width="8" height="18" rx="2" /></svg> },
    { name: '1:1', label: 'Square', icon: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6"><rect x="4" y="4" width="16" height="16" rx="2" /></svg> },
    { name: '16:9', label: 'Landscape', icon: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6"><rect x="3" y="8" width="18" height="8" rx="2" /></svg> },
];

interface CreativeBriefPageProps {
  onNext: (data: { brandKit: BrandKit, targeting: Targeting, language: Language }) => void;
  onBack: () => void;
  initialData?: Partial<VideoProject>;
}

const CreativeBriefPage: React.FC<CreativeBriefPageProps> = ({ onNext, onBack, initialData }) => {
  // Form State
  const [logo, setLogo] = useState<ImageInfo | null>(initialData?.brandKit?.logo || null);
  const [brandName, setBrandName] = useState(initialData?.brandKit?.brandName || '');
  const [contactInfo, setContactInfo] = useState(initialData?.brandKit?.contactInfo || '');
  const [primaryColor, setPrimaryColor] = useState(initialData?.brandKit?.primaryColor ||'#06b6d4');
  const [secondaryColor, setSecondaryColor] = useState(initialData?.brandKit?.secondaryColor || '#3b82f6');
  const [toneOfVoice, setToneOfVoice] = useState<BrandKit['toneOfVoice']>(initialData?.brandKit?.toneOfVoice || 'Professional');
  const [generateOutro, setGenerateOutro] = useState(initialData?.brandKit?.generateOutro ?? true);
  const [audience, setAudience] = useState(initialData?.targeting?.audience || AUDIENCES[4]);
  const [platform, setPlatform] = useState(initialData?.targeting?.platform || PLATFORMS[0]);
  const [aspectRatio, setAspectRatio] = useState<Targeting['aspectRatio']>(initialData?.targeting?.aspectRatio || '9:16');
  const [language, setLanguage] = useState<Language>(initialData?.language || 'English');
  
  // Kit Management State
  const [savedKits, setSavedKits] = useState<SavedBrandKit[]>([]);
  const [selectedKitName, setSelectedKitName] = useState<string>('none');
  const [kitNameInput, setKitNameInput] = useState('');
  const [error, setError] = useState<string | null>(null);
  
  const clearForm = () => {
    setLogo(null);
    setBrandName('');
    setContactInfo('');
    setToneOfVoice('Professional');
  };

  useEffect(() => {
    const kits = getSavedBrandKits();
    setSavedKits(kits);
    if (!initialData?.brandKit && kits.length > 0) {
        applySavedKit(kits[0].kitName, kits);
    }
  }, [initialData]);

  const applySavedKit = (kitName: string, kits: SavedBrandKit[]) => {
    setSelectedKitName(kitName);
    if (kitName === 'none') {
        clearForm();
        return;
    }
    const kitToApply = kits.find(k => k.kitName === kitName);
    if (kitToApply) {
        setLogo(kitToApply.logo);
        setBrandName(kitToApply.brandName);
        setContactInfo(kitToApply.contactInfo);
        setPrimaryColor(kitToApply.primaryColor);
        setSecondaryColor(kitToApply.secondaryColor);
        setToneOfVoice(kitToApply.toneOfVoice);
        setGenerateOutro(kitToApply.generateOutro);
    }
  };
  
  const handleSaveKit = () => {
    if (!kitNameInput.trim()) {
      setError('Please provide a name for the brand kit to save it.');
      return;
    }
    setError(null);
    const currentKitData: SavedBrandKit = {
        kitName: kitNameInput.trim(), logo, brandName, contactInfo, primaryColor, secondaryColor, toneOfVoice, generateOutro,
    };
    const newKits = saveOrUpdateBrandKit(currentKitData, savedKits);
    setSavedKits(newKits);
    setSelectedKitName(currentKitData.kitName);
    setKitNameInput('');
    alert(`Brand Kit "${currentKitData.kitName}" has been saved!`);
  };

  const handleDeleteKit = () => {
    if (selectedKitName === 'none' || !window.confirm(`Are you sure you want to delete the "${selectedKitName}" brand kit?`)) return;
    const newKits = deleteBrandKit(selectedKitName, savedKits);
    setSavedKits(newKits);
    setSelectedKitName('none');
    clearForm();
  };
  
  const handleFileSelect = async (files: File[]) => {
    if (files.length === 0) return;
    try {
      setError(null);
      const info = await fileToImageInfo(files[0]);
      setLogo(info);
    } catch (err) {
      console.error(err);
      setError("Could not process the selected file. Please try another image.");
    }
  };

  const handleNext = () => {
    const brandKit: BrandKit = { logo, brandName, primaryColor, secondaryColor, contactInfo, toneOfVoice, generateOutro };
    const targeting: Targeting = { audience, platform, aspectRatio };
    onNext({ brandKit, targeting, language });
  };

  return (
    <div className="bg-gray-800/50 p-6 rounded-2xl shadow-lg border border-gray-700 flex flex-col gap-8 animate-fade-in">
      <div>
        <h2 className="text-xl font-bold text-gray-200">Set Up Your Creative Brief</h2>
        <p className="text-sm text-gray-400">Define your brand and audience to give the AI clear creative direction.</p>
      </div>

        {/* BRAND KIT MANAGER */}
        <section className="p-4 bg-gray-900/50 rounded-lg border border-gray-700 space-y-3">
             <h3 className="font-semibold text-lg text-cyan-400">Brand Kit Manager</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
                <div>
                    <label htmlFor="kit-select" className="block text-sm font-medium text-gray-300 mb-1">Load Saved Kit</label>
                    <select id="kit-select" value={selectedKitName} onChange={(e) => applySavedKit(e.target.value, savedKits)} className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-cyan-500 focus:border-cyan-500 transition">
                        <option value="none">-- New / Manual Entry --</option>
                        {savedKits.map(k => <option key={k.kitName} value={k.kitName}>{k.kitName}</option>)}
                    </select>
                </div>
                { selectedKitName !== 'none' && (
                    <button onClick={handleDeleteKit} className="w-full md:w-auto py-3 px-4 bg-red-800/80 text-white font-bold rounded-lg hover:bg-red-700 transition-colors">Delete Selected Kit</button>
                )}
            </div>
             <div className="flex flex-col sm:flex-row gap-2 pt-2 border-t border-gray-700/50">
                <input type="text" value={kitNameInput} onChange={(e) => setKitNameInput(e.target.value)} placeholder="Enter new kit name to save" className="flex-grow p-2 bg-gray-700 border border-gray-600 rounded-lg"/>
                <button onClick={handleSaveKit} className="py-2 px-4 bg-cyan-700 text-white font-bold rounded-lg hover:bg-cyan-600 transition-colors">Save Current as Kit</button>
            </div>
        </section>


      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Brand Kit Section */}
        <section className="space-y-4 p-4 bg-gray-900/30 rounded-lg border border-gray-700">
            <h3 className="font-semibold text-cyan-400">Brand Identity</h3>
            <div className="space-y-4">
                 <div>
                    <label className="block text-sm font-medium text-gray-300">Brand Logo (Optional)</label>
                    <FileUpload onFilesSelect={handleFileSelect} imagePreviewUrl={logo ? `data:${logo.mimeType};base64,${logo.base64}` : null} />
                </div>
                 <div>
                    <label htmlFor="brand-name" className="block text-sm font-medium text-gray-300">Brand Name</label>
                    <input id="brand-name" type="text" value={brandName} onChange={(e) => setBrandName(e.target.value)} placeholder="e.g., Aura Crafts" className="mt-1 w-full p-2 bg-gray-700 border border-gray-600 rounded-lg"/>
                </div>
                <div>
                    <label htmlFor="contact-info" className="block text-sm font-medium text-gray-300">Contact / Website</label>
                    <input id="contact-info" type="text" value={contactInfo} onChange={(e) => setContactInfo(e.target.value)} placeholder="e.g., www.auracrafts.com" className="mt-1 w-full p-2 bg-gray-700 border border-gray-600 rounded-lg"/>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-300">Tone of Voice</label>
                    <div className="mt-2 grid grid-cols-2 gap-2">
                        {TONES.map((tone) => (
                            <button key={tone.name} onClick={() => setToneOfVoice(tone.name)} className={`p-3 text-left rounded-lg border-2 transition-all ${toneOfVoice === tone.name ? 'bg-cyan-900/50 border-cyan-500' : 'bg-gray-700/50 border-gray-600 hover:border-gray-500'}`}>
                                <p className={`font-semibold text-sm ${toneOfVoice === tone.name ? 'text-cyan-400' : 'text-gray-200'}`}>{tone.name}</p>
                                <p className="text-xs text-gray-400">{tone.description}</p>
                            </button>
                        ))}
                    </div>
                </div>
                 <div className="relative flex items-start">
                    <div className="flex h-6 items-center">
                        <input id="outro-checkbox" name="outro-checkbox" type="checkbox" checked={generateOutro} onChange={(e) => setGenerateOutro(e.target.checked)} className="h-4 w-4 rounded border-gray-500 bg-gray-700 text-cyan-600 focus:ring-cyan-600"/>
                    </div>
                    <div className="ml-3 text-sm leading-6">
                        <label htmlFor="outro-checkbox" className="font-medium text-gray-300">Generate Branded Outro</label>
                        <p className="text-gray-400">Automatically create a final scene with your logo and contact info.</p>
                    </div>
                </div>
            </div>
        </section>
        
        {/* Targeting Section */}
        <section className="space-y-4 p-4 bg-gray-900/30 rounded-lg border border-gray-700">
             <h3 className="font-semibold text-cyan-400">Audience & Platform</h3>
             <div className="space-y-4">
                <div>
                    <label htmlFor="audience-select" className="block text-sm font-medium text-gray-300 mb-1">Target Audience</label>
                    <select id="audience-select" value={audience} onChange={(e) => setAudience(e.target.value)} className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-cyan-500 focus:border-cyan-500 transition">
                        {AUDIENCES.map(a => <option key={a} value={a}>{a}</option>)}
                    </select>
                </div>
                 <div>
                    <label htmlFor="language-select" className="block text-sm font-medium text-gray-300 mb-1">Narration Language</label>
                    <select id="language-select" value={language} onChange={(e) => setLanguage(e.target.value as Language)} className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-cyan-500 focus:border-cyan-500 transition">
                        <option value="English">English</option>
                        <option value="Hindi">Hindi</option>
                    </select>
                </div>
                <div>
                    <label htmlFor="platform-select" className="block text-sm font-medium text-gray-300 mb-1">Social Media Platform</label>
                    <select id="platform-select" value={platform} onChange={(e) => setPlatform(e.target.value)} className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-cyan-500 focus:border-cyan-500 transition">
                        {PLATFORMS.map(p => <option key={p} value={p}>{p}</option>)}
                    </select>
                </div>
                 <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Aspect Ratio</label>
                    <div className="mt-2 grid grid-cols-3 gap-2">
                        {ASPECT_RATIOS.map((ratio) => (
                            <button key={ratio.name} onClick={() => setAspectRatio(ratio.name)} className={`p-3 flex flex-col items-center justify-center gap-2 text-center rounded-lg border-2 transition-all ${aspectRatio === ratio.name ? 'bg-cyan-900/50 border-cyan-500' : 'bg-gray-700/50 border-gray-600 hover:border-gray-500'}`}>
                                {ratio.icon}
                                <p className={`font-semibold text-sm ${aspectRatio === ratio.name ? 'text-cyan-400' : 'text-gray-200'}`}>{ratio.label}</p>
                                <p className="text-xs text-gray-500">{ratio.name}</p>
                            </button>
                        ))}
                    </div>
                </div>
             </div>
             {error && <p className="text-sm text-red-500 mt-4">{error}</p>}
        </section>
      </div>
     
      <div className="flex flex-col sm:flex-row gap-4 mt-4">
        <button onClick={onBack} className="w-full py-3 px-4 bg-gray-600 text-white font-bold rounded-lg hover:bg-gray-500 transition-colors">
          ← Back
        </button>
        <button onClick={handleNext} className="w-full py-3 px-4 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold rounded-lg hover:opacity-90 transition-opacity">
          Next: Product Analysis →
        </button>
      </div>
    </div>
  );
};

export default CreativeBriefPage;