// src/App.tsx
import React, { useState, useCallback, useEffect } from 'react';
import {
  VideoProject,
  CategoryTemplate,
  VisualTheme,
  IntegratedAnalysisReport,
} from './types';
import { loadTemplate } from './services/templateService';

// Import Page Components from their designated re-exporters for consistency
import HomePage from './components/HomePage';
import CreativeBriefPage from './components/CreativeBriefPage';
import ProductEnrichmentPage from './components/ProductEnrichmentPage';
import MusicSelectionPage from './components/MusicSelectionPage';
import StoryboardPage from './components/StoryboardPage';
import VideoPage from './components/VideoPage';
import DashboardPage from './components/DashboardPage';
import VideoLibraryPage from './components/VideoLibraryPage';
import SettingsPage from './components/SettingsPage';
import AboutPage from './components/AboutPage';

// These pages do not have re-exporters, so they are imported directly
import NarrationVoicePage from './pages/NarrationVoicePage';
import TemplatesPage from './pages/TemplatesPage';


// Import Layout Components
import Sidebar from './components/Sidebar';

// FIX: Added 'editProject' to the Page type to match the type used in Sidebar.tsx, resolving the type mismatch error.
type Page = 'dashboard' | 'newProjectFlow' | 'library' | 'settings' | 'about' | 'templates' | 'editProject';

const App: React.FC = () => {
  const [page, setPage] = useState<Page>('dashboard');
  const [projectData, setProjectData] = useState<Partial<VideoProject>>({});
  const [editingProject, setEditingProject] = useState<VideoProject | null>(null);

  useEffect(() => {
    console.log('=== DATA FLOW DEBUG: App State Updated ===');
    console.log('Current Page:', page);
    console.log('Editing Project ID:', editingProject?.id);
    console.log('Fields present:', Object.keys(projectData));
    console.log('visualTheme:', projectData.visualTheme);
    console.log('product:', projectData.product?.name);
    console.log('brandKit:', projectData.brandKit?.brandName);
    console.log('storyboard:', projectData.storyboard ? 'Present' : 'Missing');
    // For deep debugging, uncomment the line below
    // console.log('Complete projectData object:', projectData);
    console.log('==========================================');
  }, [projectData, page, editingProject]);
  
  const handleNavigate = (page: Page, data?: any) => {
    console.log(`[App] Navigating to ${page}`, data ? { withData: true } : {});
    if (page === 'newProjectFlow') {
        if (data) {
            // This is a recreate flow from the dashboard
            console.log('[App] Handling recreate project flow.');
            setProjectData({
                ...data,
                // Clear storyboard and video to force regeneration
                storyboard: undefined,
                videoBlob: undefined,
                videoUrl: undefined,
            });
            setEditingProject(data); // Keep track of the original project
            setPage('newProjectFlow');
        } else {
            // This is a fresh "start new project" flow
            console.log('[App] Handling start new project flow.');
            setProjectData({});
            setEditingProject(null);
            setPage('newProjectFlow');
        }
    } else {
        setPage(page);
    }
  };


  const resetProjectFlow = useCallback(() => {
    setProjectData({});
    setEditingProject(null);
    setPage('dashboard');
  }, []);
  
  const handleLoadTemplate = useCallback((template: CategoryTemplate) => {
    // Reconstruct a partial VideoProject from the template
    const projectFromTemplate: Partial<VideoProject> = {
        targeting: template.targeting,
        language: template.language,
        music: template.music,
        narrationVoice: template.narrationVoice,
        // The analysisReport needs to be reconstructed partially
        analysisReport: {
            // FIX: Flattened the 'inspiration' object to match IntegratedAnalysisReport type.
            lightingStyle: template.creativeDirection.lighting,
            compositionIdeas: template.creativeDirection.composition,
            colorMood: '', // These will be generated
            inspirationSummary: '',
            popularUseCases: [],
            recommendedSceneStyles: [],
            exampleCaptions: [],
            visualTrends: [],
            // The rest will be generated in the enrichment step
            subject: '', category: '', productSummary: {} as any, videoGuidelines: {} as any, memoryUpdate: {} as any,
        },
        brandKit: {
            toneOfVoice: template.creativeDirection.tone,
        } as any, // Brand kit will be loaded in the brief page
    };
    alert(`Template "${template.name}" loaded! Please select a product and upload images to continue.`);
    setProjectData(projectFromTemplate);
    setEditingProject(null);
    setPage('newProjectFlow');
  }, []);


  const renderCurrentPage = () => {
    switch (page) {
      case 'dashboard':
        return <DashboardPage onNavigate={handleNavigate} />;
      
      // FIX: Added 'editProject' case to fall through to 'newProjectFlow', handling both states with the same UI flow.
      case 'editProject':
      case 'newProjectFlow':
        // This is a multi-step flow managed by the state of `projectData`
        if (!projectData.product || !projectData.mainImage) {
          return <HomePage onNext={(product, mainImage, referenceImages) => setProjectData(prev => ({ ...prev, product, mainImage, referenceImages }))} onLoadTemplate={handleLoadTemplate} />;
        }
        if (!projectData.brandKit || !projectData.targeting || !projectData.language) {
          return <CreativeBriefPage onNext={({ brandKit, targeting, language }) => setProjectData(prev => ({ ...prev, brandKit, targeting, language }))} onBack={() => setProjectData(prev => ({ ...prev, product: undefined, mainImage: undefined }))} initialData={projectData} />;
        }
        if (!projectData.analysisReport) {
            return <ProductEnrichmentPage 
                        product={projectData.product} 
                        mainImage={projectData.mainImage} 
                        referenceImages={projectData.referenceImages || []} 
                        targeting={projectData.targeting} 
                        language={projectData.language} 
                        brandKit={projectData.brandKit} 
                        onNext={(enrichedReport: IntegratedAnalysisReport & { visualTheme: VisualTheme }) => {
                            // FIX: Explicitly handle the incoming report to ensure visualTheme is correctly placed.
                            // The enrichedReport object contains the analysis data AND the visual theme.
                            // We set the analysisReport and also pull the visualTheme out to the top level of projectData.
                            const theme = enrichedReport.visualTheme;
                            console.log('[App] Received from Enrichment:', { enrichedReport, theme });
                            setProjectData(prev => ({
                                ...prev, 
                                analysisReport: enrichedReport, 
                                visualTheme: theme
                            }));
                        }} 
                        onBack={() => setProjectData(prev => ({...prev, brandKit: undefined, targeting: undefined, language: undefined}))} 
                    />
        }
        if (!projectData.music) {
            return <MusicSelectionPage onNext={(music) => setProjectData(prev => ({...prev, music}))} onBack={() => setProjectData(prev => ({...prev, analysisReport: undefined, visualTheme: undefined}))} />
        }
        if (!projectData.narrationVoice) {
            return <NarrationVoicePage onNext={(narrationVoice) => setProjectData(prev => ({...prev, narrationVoice}))} onBack={() => setProjectData(prev => ({...prev, music: undefined}))} />
        }
        if (!projectData.storyboard) {
            return <StoryboardPage 
                        projectData={projectData as any}
                        onStoryboardGenerated={(storyboard, videoLength, visualTheme, cameraMotion, negativePrompt, includeAudio) => setProjectData(prev => ({...prev, storyboard, videoLength, visualTheme, cameraMotion, negativePrompt, includeAudio}))} 
                        onBack={() => setProjectData(prev => ({...prev, narrationVoice: undefined}))} 
                    />
        }
        // The final step now uses the new EnhancedVideoPage
        return <VideoPage 
          projectData={projectData as VideoProject} 
          onNext={(finalProjectData) => {
            // Here you can add logic to save the final project data if needed, then reset
            console.log("Workflow complete, saving final data:", finalProjectData);
            resetProjectFlow();
          }} 
          onBack={() => setProjectData(prev => ({...prev, storyboard: undefined}))} 
        />;

      case 'library':
        return <VideoLibraryPage onBack={() => setPage('dashboard')} />;
      
      case 'templates':
        return <TemplatesPage onBack={() => setPage('dashboard')} onLoadTemplate={handleLoadTemplate} />;

      case 'settings':
        return <SettingsPage onBack={() => setPage('dashboard')} />;

      case 'about':
        return <AboutPage onBack={() => setPage('dashboard')} />;
      
      default:
        return <div>Page not found</div>;
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-200 flex">
        <Sidebar currentPage={page} onNavigate={setPage} />
        <main className="flex-1 overflow-y-auto">
            <div className="p-4 sm:p-6 lg:p-8">
              {renderCurrentPage()}
            </div>
        </main>
    </div>
  );
};

export default App;
