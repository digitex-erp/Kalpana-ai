// src/services/trainingService.ts
import { VideoProject, TrainingAnalysisReport } from '../types';
// Fix: Corrected import paths to be relative.
import { generateTrainingAnalysis as callGeminiService } from './geminiService';
import { generateTrainingAnalysis as callMockService } from './mockService';
// Fix: Updated service to be aware of all providers and select dynamically.
import { getAiSettings } from './aiService';

/**
 * Sanitizes project data to send to the AI, removing large fields like blobs and base64 images.
 * @param projects The array of recent VideoProject objects.
 * @returns A lightweight array of project data suitable for the AI prompt.
 */
const sanitizeProjectsForAnalysis = (projects: VideoProject[]): any[] => {
    return projects.map(p => ({
        id: p.id,
        productName: p.productName,
        category: p.category,
        language: p.language,
        narrationVoice: p.narrationVoice,
        videoLength: p.videoLength,
        stage: p.stage,
        version: p.version,
        tweakHistory: p.tweakHistory,
        // Include any other metadata you want the AI to analyze
    }));
};


/**
 * Calls the selected API service to generate a performance analysis report based on recent projects.
 * @param allProjects All video projects from the database.
 * @returns A structured training analysis report.
 */
export const generateTrainingAnalysis = async (allProjects: VideoProject[]): Promise<TrainingAnalysisReport> => {
    if (allProjects.length === 0) {
        throw new Error("No projects available to analyze.");
    }

    const settings = getAiSettings();
    let callService: (projects: any[]) => Promise<TrainingAnalysisReport>;

    // Fix: Replaced outdated USE_MOCK_API flag with dynamic service selection.
    switch (settings.provider) {
        case 'gemini':
            callService = callGeminiService;
            break;
        case 'mock':
            callService = callMockService;
            break;
        default:
            console.warn(`Unsupported AI provider "${settings.provider}" for training, falling back to Gemini.`);
            callService = callGeminiService;
    }

    // Take the last 20 projects for analysis
    const recentProjects = allProjects.slice(0, 20);
    const sanitizedData = sanitizeProjectsForAnalysis(recentProjects);

    try {
        const report = await callService(sanitizedData);
        return report;
    } catch (err) {
        console.error("Error in training service:", err);
        throw err; // Re-throw the error to be caught by the UI component
    }
};
