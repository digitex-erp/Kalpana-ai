// src/services/aiService.ts
import { AiProviderSettings, AiProvider } from "../types";

const SETTINGS_KEY = 'kalpana_ai_settings_v1';

// This function now calls the unified proxy
export async function callAI(options: {
  provider: string;
  endpoint?: string;
  body?: any;
  prompt?: string;
  images?: string[];
  systemPrompt?: string;
}): Promise<any> {
  try {
    const { provider, ...rest } = options;
    const settings = getAiSettings();
    const payload = {
      provider: provider || settings.provider,
      apiKeys: settings.apiKeys,
      ...rest
    };

    const response = await fetch('/api/ai-proxy', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      // The backend may return a rich error object. We throw the whole thing.
      // This allows the UI to display detailed error messages and fix instructions.
      throw data;
    }

    return data.data; // Return the standardized data from the proxy
  } catch (error: any) {
    console.error('[AI Service Error]:', error);
    // If the error is already a structured API error from our proxy, re-throw it.
    if (error && error.error && error.message) {
      throw error;
    }

    // Otherwise, wrap network/parsing errors in a standard error structure for the UI.
    throw {
      success: false,
      error: 'client_side_error',
      message: `🌐 Connection Error: ${error.message || 'Failed to communicate with the AI service. Please check your network connection.'}`,
      details: { raw: error.toString() },
      fix: {
        title: 'How to fix this:',
        steps: ['Verify your internet connection.', 'Check the Vercel deployment logs for server errors.']
      }
    };
  }
}

export const getAiSettings = (): AiProviderSettings => {
  const defaultSettings: AiProviderSettings = {
    provider: 'claude', // Default to a high-quality provider
    huggingFaceModel: 'mistralai/Mistral-7B-Instruct-v0.2',
    moonshotModel: 'moonshot-v1-8k',
    deepseekModel: 'deepseek-chat',
    ollamaModel: 'llava',
    ollamaServerUrl: 'http://localhost:11434',
  };
  try {
    const saved = localStorage.getItem(SETTINGS_KEY);
    const parsed = saved ? JSON.parse(saved) : {};
    // The preferredProvider is not given a default, so if it's not set by the user,
    // the auto-failover service will use its own priority list.
    const finalSettings = { ...defaultSettings, ...parsed };
    return finalSettings;
  } catch (e) {
    return defaultSettings;
  }
};

export const saveAiSettings = (settings: AiProviderSettings) => {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch (e) {
    console.error("Failed to save AI settings:", e);
  }
};