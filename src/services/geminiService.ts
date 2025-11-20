// src/services/geminiService.ts
import { TrainingAnalysisReport } from '../types';
import { createTrainingAnalysisPrompt } from './promptService';
import { callAI } from './aiService';

const safelyParseJson = <T>(jsonString: string, errorMessage: string): T => {
    try {
        // Handle markdown code blocks
        const match = jsonString.match(/```(json)?\s*([\s\S]*?)\s*```/);
        const jsonToParse = match ? match[2] : jsonString;
        return JSON.parse(jsonToParse.trim());
    } catch (e) {
        console.error(errorMessage, { jsonString, error: e });
        throw new Error(`${errorMessage} The AI returned a response that was not valid JSON.`);
    }
};

/**
 * Calls the Gemini service to generate a performance analysis report.
 * @param sanitizedProjects Sanitized array of recent projects.
 * @returns A structured training analysis report.
 */
export const generateTrainingAnalysis = async (sanitizedProjects: any[]): Promise<TrainingAnalysisReport> => {
    const prompt = createTrainingAnalysisPrompt(sanitizedProjects);
    const body = {
        contents: prompt,
        config: {
            responseMimeType: "application/json",
        },
    };
    
    // Specifically call the Gemini provider via the proxy
    const responseText = await callAI({ provider: 'gemini', endpoint: 'generateContent', body });
    return safelyParseJson<TrainingAnalysisReport>(responseText, "Failed to parse Gemini training analysis report.");
};
