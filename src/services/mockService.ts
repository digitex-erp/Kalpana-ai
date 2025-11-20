// src/services/mockService.ts
import { TrainingAnalysisReport } from '../types';

/**
 * Returns a mock training analysis report for demo/testing purposes.
 * @param sanitizedProjects Ignored, as the result is mocked.
 * @returns A promise that resolves with a mock TrainingAnalysisReport.
 */
export const generateTrainingAnalysis = async (sanitizedProjects: any[]): Promise<TrainingAnalysisReport> => {
    console.log("Using mock service for training analysis.");

    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));

    return {
        overallProgress: "Steady improvement noted across recent projects.",
        trendAnalysis: {
            avgVideoDuration: "18s",
            avgScenesPerVideo: "5",
            improvementOverV1: "+25%",
        },
        topLearnedRules: [
            "Always include a close-up shot of the product texture.",
            "Use 'Vibrant & Modern' theme for festive products.",
            "Keep narration under 15 words per scene.",
        ],
        styleInsights: {
            dominantTone: "Friendly & Upbeat",
            camera: "Medium shots with slow pans",
            lighting: "Soft, warm lighting",
            text: "Minimal, bold white text",
        },
        weakPoints: [
            "Video hooks could be more engaging in the first 2 seconds.",
            "Transitions between scenes are sometimes too abrupt.",
        ],
    };
};
