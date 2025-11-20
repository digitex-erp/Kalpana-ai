import React, { useState, useEffect } from 'react';
import { Storyboard, Scene, VideoProject, CategoryTemplate, VisualTheme, CameraMotion } from '../types';
import { generateStoryboard, generateAlternativeHooks } from '../services/index';
import { saveTemplate } from '../services/templateService';
import StoryboardViewer from '../components/StoryboardViewer';
import Loader from '../components/Loader';
import ErrorMessage from '../components/ErrorMessage';

interface StoryboardPageProps {
  projectData: VideoProject;
  onStoryboardGenerated: (storyboard: Storyboard, videoLength: number, visualTheme: VisualTheme, cameraMotion: any, negativePrompt: string, includeAudio: boolean) => void;
  onBack: () => void;
}

const storyboardLoadingMessages = [
    "Consulting the AI Director's Memory...",
    "Analyzing product manifest and creative brief...",
    "Brainstorming cinematic scene concepts...",
    "Writing compelling narration script...",
    "Designing on-screen text overlays...",
    "Assembling the final storyboard..."
];

const StoryboardPage: React.FC<StoryboardPageProps> = ({ projectData, onStoryboardGenerated, onBack }) => {
  const { product, language, brandKit, targeting, music, analysisReport, narrationVoice } = projectData;

  const [storyboard, setStoryboard] = useState<Storyboard | null>(projectData.storyboard || null);
  const [videoLength, setVideoLength] = useState(projectData.videoLength || 10);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progressMessage, setProgressMessage] = useState('');
  
  const [showHooksModal, setShowHooksModal] = useState(false);
  const [alternativeHooks, setAlternativeHooks] = useState<Scene[] | null>(null);
  const [isGeneratingHooks, setIsGeneratingHooks] = useState(false);

  const [visualTheme, setVisualTheme] = useState<VisualTheme>(projectData.visualTheme || 'Vibrant & Modern');
  const [cameraMotion, setCameraMotion] = useState<string>('Medium (Standard)');
  const [negativePrompt, setNegativePrompt] = useState(projectData.negativePrompt || '');
  const [includeAudio, setIncludeAudio] = useState(projectData.includeAudio ?? true);

  useEffect(() => {
    console.log('[Storyboard] Current projectData received:', {
        hasVisualTheme: !!projectData.visualTheme,
        visualTheme: projectData.visualTheme
    });
  }, [projectData]);
  
  useEffect(() => {
    if (isLoading) {
        setProgressMessage(storyboardLoadingMessages[0]);
        let messageIndex = 0;
        const interval = setInterval(() => {
            messageIndex = (messageIndex + 1) % storyboardLoadingMessages.length;
            setProgressMessage(storyboardLoadingMessages[messageIndex]);
        }, 3000);
        return () => clearInterval(interval);
    }
  }, [isLoading]);

  const handleGenerate = async () => {
    setIsLoading(true);
    setError(null);
    setStoryboard(null);
     console.log('[Storyboard] About to generate with:', {
        productName: projectData?.product?.name,
        visualTheme: projectData.visualTheme, // Use theme from projectData
     });
    try {
      if (!analysisReport) {
        throw new Error("Analysis report is missing, cannot generate storyboard.");
      }
      // Pass the entire projectData object to the service
      const result = await generateStoryboard(projectData as VideoProject);
      setStoryboard(result);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'An unknown error occurred while generating the storyboard.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateHooks = async () => {
    setIsGeneratingHooks(true);
    setError(null);
    try {
        const hooks = await generateAlternativeHooks(product, brandKit, targeting, music);
        setAlternativeHooks(hooks);
        setShowHooksModal(true);
    } catch (err: any) {
        console.error(err);
        setError(err.message || 'Could not generate alternative hooks.');
    } finally {
        setIsGeneratingHooks(false);
    }
  };
  
  const handleSelectHook = (hook: Scene) => {
    if (storyboard) {
        const newStoryboard = { ...storyboard };
        newStoryboard.scenes[0] = hook;
        setStoryboard(newStoryboard);
    }
    setShowHooksModal(false);
  };

  const handleProceed = () => {
     if (!storyboard) {
        alert("Please generate a storyboard first.");
        return;
     }
    if (!cameraMotion) {
      alert('Please select a camera motion setting');
      return;
    }
    
    const completeData = {
        ...projectData,
        storyboard: storyboard,
        cameraMotion: cameraMotion,
        includeAudio: includeAudio,
        updatedAt: new Date().toISOString()
    };
    
    console.log('[Storyboard] Proceeding with data:', completeData);

    onStoryboardGenerated(storyboard, videoLength, projectData.visualTheme, cameraMotion as CameraMotion, negativePrompt, includeAudio);
  };

  const handleSaveTemplate = () => {
    const templateName = prompt("Enter a name for this template (e.g., 'Diwali Decor Template'):");
    if (!templateName || !templateName.trim() || !analysisReport) return;

    const templateData: Omit<CategoryTemplate, 'id' | 'createdAt' | 'name'> = {
        category: product.category,
        brandKitName: brandKit.brandName,
        targeting,
        language,
        creativeDirection: {
            tone: brandKit.toneOfVoice,
            lighting: analysisReport.lightingStyle || '',
            composition: analysisReport.compositionIdeas || [],
        },
        music,
        narrationVoice,
    };

    saveTemplate(templateData, templateName.trim());
    alert(`Template "${templateName.trim()}" has been saved!`);
  };

  return (
    <>
    <div className="bg-gray-800/50 p-6 rounded-2xl shadow-lg border border-gray-700 flex flex-col gap-6 animate-fade-in">
      <div className="flex justify-between items-start">
        <div>
            <h2 className="text-xl font-bold text-gray-200">Generate & Finalize Storyboard</h2>
            <p className="text-gray-400">Set the final creative direction for <span className="font-semibold text-gray-300">{product.name}</span>, then edit the script below.</p>
        </div>
        <button onClick={handleSaveTemplate} disabled={!storyboard} className="py-2 px-3 bg-purple-700 text-white font-bold rounded-lg hover:bg-purple-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm">
            Save as Template
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
        <div>
          <label htmlFor="video-length-slider" className="block text-sm font-medium text-gray-300 mb-1">Video Length: <span className="font-semibold text-cyan-400">{videoLength} seconds</span></label>
          <input id="video-length-slider" type="range" min="10" max="30" step="5" value={videoLength} onChange={(e) => setVideoLength(Number(e.target.value))} className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer" disabled={isLoading || isGeneratingHooks}/>
          <p className="text-xs text-gray-500 mt-2">
            ℹ️ Videos over 10 seconds will be generated as multiple AI clips and automatically combined.
          </p>
        </div>
        <div className="relative flex items-start justify-self-start md:justify-self-end">
          <div className="flex h-6 items-center">
              <input id="audio-checkbox" name="audio-checkbox" type="checkbox" checked={includeAudio} onChange={(e) => setIncludeAudio(e.target.checked)} className="h-4 w-4 rounded border-gray-500 bg-gray-700 text-cyan-600 focus:ring-cyan-600"/>
          </div>
          <div className="ml-3 text-sm leading-6">
              <label htmlFor="audio-checkbox" className="font-medium text-gray-300">Generate Background Music</label>
              <p className="text-gray-400">Adds an AI-generated audio track (Runway Only).</p>
          </div>
        </div>
      </div>
      
      <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-4">
          <button onClick={handleGenerate} disabled={isLoading || isGeneratingHooks} className="w-full py-3 px-4 bg-gray-700 text-white font-bold rounded-lg hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-wait">
            {isLoading ? 'Generating...' : storyboard ? 'Re-generate Storyboard' : '✨ Generate with AI'}
          </button>
           <button onClick={handleGenerateHooks} disabled={!storyboard || isLoading || isGeneratingHooks} className="w-full py-3 px-4 bg-cyan-800 text-white font-bold rounded-lg hover:bg-cyan-700 transition-colors disabled:opacity-50 disabled:cursor-wait">
            {isGeneratingHooks ? 'Generating Hooks...' : '✨ Generate Alternative Hooks'}
          </button>
        </div>

      {isLoading && (
        <div className="flex justify-center items-center p-4">
            <Loader title="Crafting Your Story..." message={progressMessage} />
        </div>
      )}

      <ErrorMessage message={error} />
      
      <StoryboardViewer storyboard={storyboard} onStoryboardChange={setStoryboard} />
      
      {storyboard && (
        <div className="bg-gray-800 rounded-lg p-6 mb-6">
          <h3 className="text-xl font-semibold text-white mb-4">
            📹 Camera Motion Settings
          </h3>
          <p className="text-gray-300 mb-4 text-sm">
            Select the intensity of camera movements and transitions for your video
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { value: 'Low (Subtle)', title: 'Subtle', description: 'Minimal camera movement, smooth and gentle', icon: '🌊' },
              { value: 'Medium (Standard)', title: 'Standard', description: 'Balanced camera work with moderate motion', icon: '⚖️' },
              { value: 'High (Dynamic)', title: 'Dynamic', description: 'Energetic movements and dynamic transitions', icon: '⚡' }
            ].map(option => (
              <button
                key={option.value}
                type="button"
                onClick={() => setCameraMotion(option.value)}
                className={`p-4 rounded-lg border-2 transition-all ${
                  cameraMotion === option.value
                    ? 'border-cyan-500 bg-cyan-500/10 text-white'
                    : 'border-gray-600 bg-gray-700/50 text-gray-300 hover:border-gray-500'
                }`}
              >
                <div className="text-3xl mb-2">{option.icon}</div>
                <div className="font-semibold text-lg mb-2">{option.title}</div>
                <div className="text-xs opacity-75">{option.description}</div>
                {cameraMotion === option.value && (
                  <div className="mt-2 text-cyan-400 text-xs font-semibold">
                    ✓ Selected
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-4 mt-4">
        <button onClick={onBack} className="w-full py-3 px-4 bg-gray-600 text-white font-bold rounded-lg hover:bg-gray-500 transition-colors">
          ← Back
        </button>
        <button onClick={handleProceed} disabled={!storyboard || isLoading} className="w-full py-3 px-4 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed">
          Proceed to Video →
        </button>
      </div>
    </div>
    {showHooksModal && alternativeHooks && (
         <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4" onClick={() => setShowHooksModal(false)}>
             <div className="bg-gray-800 border border-gray-700 rounded-xl p-6 w-full max-w-2xl max-h-[90vh] flex flex-col gap-4" onClick={e => e.stopPropagation()}>
                <h3 className="text-xl font-bold text-cyan-400">Choose a New Hook</h3>
                <p className="text-sm text-gray-400">Select an alternative opening scene to make your video more engaging.</p>
                <div className="overflow-y-auto space-y-4 pr-2">
                    {alternativeHooks.map((hook, index) => (
                        <div key={index} className="p-4 bg-gray-900/50 rounded-lg border border-gray-600">
                            <p className="font-semibold text-gray-300">Option {index + 1}</p>
                            <p className="mt-2 text-sm text-gray-400"><strong className="text-gray-300">Visual:</strong> {hook.visual}</p>
                            <p className="mt-2 text-sm text-gray-400"><strong className="text-gray-300">Dialogue:</strong> <em>"{hook.dialogue}"</em></p>
                            <button onClick={() => handleSelectHook(hook)} className="mt-4 py-2 px-4 w-full bg-cyan-600 text-white font-bold rounded-lg hover:bg-cyan-500 transition-colors">
                                Use This Hook
                            </button>
                        </div>
                    ))}
                </div>
                 <button onClick={() => setShowHooksModal(false)} className="mt-2 py-2 px-4 bg-gray-600 text-white font-bold rounded-lg hover:bg-gray-500 transition-colors">
                    Cancel
                </button>
             </div>
         </div>
    )}
    </>
  );
};

export default StoryboardPage;