// src/pages/ProductEnrichmentPage.tsx
import React, { useState, useEffect } from 'react';
import { Product, ImageInfo, Targeting, IntegratedAnalysisReport, Language, BrandKit, VisualTheme, VideoProject } from '../types';
import { performIntegratedAnalysis } from '../services/index';
import Loader from '../components/Loader';
import ErrorMessage from '../components/ErrorMessage';

interface ProductEnrichmentPageProps {
  product: Product;
  mainImage: ImageInfo;
  referenceImages: ImageInfo[];
  targeting: Targeting;
  language: Language;
  brandKit: BrandKit;
  onNext: (report: any) => void;
  onBack: () => void;
}

const VISUAL_THEMES: VisualTheme[] = ['Vibrant & Modern', 'Cinematic', 'Clean & Minimalist'];

const ProductEnrichmentPage: React.FC<ProductEnrichmentPageProps> = ({ product, mainImage, referenceImages, targeting, language, brandKit, onNext, onBack }) => {
  const [analysisData, setAnalysisData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [visualTheme, setVisualTheme] = useState<VisualTheme>('Vibrant & Modern');

  const handleAnalysis = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const projectDataForAnalysis: Partial<VideoProject> = {
          product, mainImage, referenceImages, targeting, language, brandKit, visualTheme
      };
      const result = await performIntegratedAnalysis(projectDataForAnalysis, true);
      setAnalysisData({ ...result, visualTheme });
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'An unknown error occurred during product analysis.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleNext = () => {
    if (analysisData) {
      onNext(analysisData);
    } else {
      alert('Please complete the product analysis first');
    }
  };
  
  const updateField = (field: keyof IntegratedAnalysisReport, value: any) => {
    setAnalysisData((prev: any) => (prev ? { ...prev, [field]: value } : null));
  };
  
  const renderReport = () => {
      const compositionValue = Array.isArray(analysisData?.compositionIdeas) 
        ? analysisData.compositionIdeas.join(', ') 
        : analysisData?.compositionIdeas || '';

      return (
        <div className="space-y-4 text-left animate-fade-in">
            <div className="bg-gray-800 rounded-lg p-6 mb-6">
              <h3 className="text-xl font-semibold text-white mb-4">
                Creative Direction (Editable)
              </h3>
              <div className="mb-4">
                <label className="block text-gray-300 mb-2 font-medium">
                  Inspiration Summary
                </label>
                <textarea
                  value={analysisData?.inspirationSummary || ''}
                  onChange={(e) => updateField('inspirationSummary', e.target.value)}
                  className="w-full p-3 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-cyan-500 focus:outline-none"
                  rows={3}
                  placeholder="Core message and creative inspiration..."
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-300 mb-2 font-medium">
                  Tone / Mood
                </label>
                <input
                  type="text"
                  value={analysisData?.colorMood || ''}
                  onChange={(e) => updateField('colorMood', e.target.value)}
                  className="w-full p-3 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-cyan-500 focus:outline-none"
                  placeholder="Overall tone and emotional mood..."
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-300 mb-2 font-medium">
                  Lighting Style
                </label>
                <textarea
                  value={analysisData?.lightingStyle || ''}
                  onChange={(e) => updateField('lightingStyle', e.target.value)}
                  className="w-full p-3 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-cyan-500 focus:outline-none"
                  rows={2}
                  placeholder="Lighting approach and style..."
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-300 mb-2 font-medium">
                  Camera Focus / Composition
                </label>
                <textarea
                  value={compositionValue}
                  onChange={(e) => updateField('compositionIdeas', e.target.value.split(',').map(s => s.trim()))}
                  className="w-full p-3 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-cyan-500 focus:outline-none"
                  rows={3}
                  placeholder="Camera angles, framing, and composition ideas..."
                />
              </div>
            </div>
            
            <div className="mb-6 bg-gray-800 rounded-lg p-6">
              <label className="block text-lg font-medium text-white mb-2">
                Visual Theme
              </label>
              <div className="grid grid-cols-3 gap-3">
                {VISUAL_THEMES.map(theme => (
                  <button
                    key={theme}
                    onClick={() => {
                        setVisualTheme(theme);
                        if (analysisData) {
                            updateField('visualTheme' as any, theme);
                        }
                    }}
                    className={`p-3 rounded-lg border-2 transition ${
                      visualTheme === theme
                        ? 'border-cyan-500 bg-cyan-500/10 text-cyan-400'
                        : 'border-gray-600 bg-gray-700/50 text-gray-300 hover:border-gray-500'
                    }`}
                  >
                    {theme}
                  </button>
                ))}
              </div>
            </div>

            {(analysisData?.searchSources && analysisData.searchSources.length > 0) && (
                <div className="bg-gray-800 rounded-lg p-6 mb-6">
                    <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                    <span>🔍</span> AI Research Sources
                    </h3>
                    <p className="text-gray-400 text-sm mb-4">The AI analyzed these sources to generate your creative strategy:</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {analysisData.searchSources.map((source: any, idx: number) => {
                        const urlString = typeof source === 'string' ? source : source?.web?.uri || source;
                        if (!urlString || typeof urlString !== 'string') return null;
                        try {
                            const url = new URL(urlString.startsWith('http') ? urlString : `https://${urlString}`);
                            return (
                                <a key={idx} href={url.toString()} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 p-3 bg-gray-700/50 rounded-lg border border-gray-600 hover:border-cyan-500 hover:bg-gray-700 transition-all group">
                                <div className="flex-1 min-w-0">
                                    <div className="text-cyan-400 text-sm font-medium truncate group-hover:text-cyan-300">{url.hostname.replace('www.', '')}</div>
                                </div>
                                <span className="text-gray-400 text-xs">↗</span>
                                </a>
                            );
                        } catch (e) {
                            return <div key={idx} className="p-3 bg-gray-700/50 rounded-lg border border-gray-600 text-gray-400 text-sm truncate">{urlString}</div>
                        }
                    })}
                    </div>
                </div>
                )
            }
        </div>
      );
  }

  return (
    <div className="bg-gray-800/50 p-6 rounded-2xl shadow-lg border border-gray-700 flex flex-col gap-6">
      <div>
        <h2 className="text-xl font-bold text-gray-200">Product Analysis & Strategy</h2>
        <p className="text-gray-400">Generate an AI-powered creative strategy for your product.</p>
      </div>

      {!analysisData && !isLoading && !error && (
        <div className="text-center p-4">
            <button onClick={handleAnalysis} className="w-full max-w-xs py-3 px-4 bg-cyan-600 text-white font-bold rounded-lg hover:bg-cyan-500 transition-colors">
                🔍 Analyze Product with AI
            </button>
        </div>
      )}

      {isLoading && <Loader title="Analyzing Product..." message="This may take a moment..." />}
      {error && <ErrorMessage message={error} />}
      
      {analysisData && renderReport()}
      
      <div className="flex flex-col sm:flex-row gap-4 mt-4">
        <button onClick={onBack} className="w-full py-3 px-4 bg-gray-600 text-white font-bold rounded-lg hover:bg-gray-500 transition-colors">← Back</button>
        <button onClick={handleNext} disabled={!analysisData || isLoading} className="w-full py-3 px-4 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed">Next: Select Music →</button>
      </div>
    </div>
  );
};

export default ProductEnrichmentPage;