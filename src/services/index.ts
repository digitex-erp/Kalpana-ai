// src/services/index.ts
import {
  Product, BrandKit, Targeting, Music, Language, Storyboard, Scene, IntegratedAnalysisReport, ImageInfo, VisualTheme, VideoProject
} from '../types';
import { callAI } from './aiService';
import { createStoryboardPrompt, createAlternativeHooksPrompt } from './promptService';
import { searchProductVideos, analyzeVideoInsights, formatAnalysisForPrompt } from './youtubeService';
import { autoFailover } from './autoFailover';

const cleanJsonString = (jsonStr: string): string => {
  if (!jsonStr || typeof jsonStr !== 'string') {
    console.warn('[JSON] Invalid input to cleanJsonString');
    return '{}';
  }
  console.log('[JSON] Cleaning response...');
  
  // Remove markdown code blocks and trim
  let cleaned = jsonStr.replace(/```(json)?/g, '').trim();
  
  // Find the first '{' and the last '}'
  const firstBrace = cleaned.indexOf('{');
  const lastBrace = cleaned.lastIndexOf('}');
  
  if (firstBrace === -1 || lastBrace === -1) {
    throw new Error('No valid JSON object found in the response.');
  }
  
  cleaned = cleaned.substring(firstBrace, lastBrace + 1);
  
  // Fix common formatting errors
  cleaned = cleaned
    .replace(/,(\s*[}\]])/g, '$1') // Fix trailing commas
    .replace(/[\x00-\x1F\x7F]/g, ''); // Remove control characters
    
  console.log('[JSON] Cleaned string is ready for parsing.');
  return cleaned;
};


const safelyParseJson = <T>(jsonString: string, errorMessage: string): T => {
  try {
    const cleaned = cleanJsonString(jsonString);
    return JSON.parse(cleaned);
  } catch (e: any) {
    console.error(errorMessage, { jsonString, error: e });
    // Try a more aggressive final cleanup
    try {
        const ultraClean = jsonString
            .replace(/```json/g, '')
            .replace(/```/g, '')
            .trim();
        const parsed = JSON.parse(ultraClean);
        console.log('[JSON] ✅ Parsed after ultra-clean');
        return parsed;
    } catch (finalError: any) {
       throw new Error(`Failed to parse AI response: ${finalError.message}. The AI may have returned an invalid format.`);
    }
  }
};

export const performIntegratedAnalysis = async (
  projectData: Partial<VideoProject>,
  enableVisualResearch: boolean
): Promise<any> => {
  const { product, mainImage, referenceImages, targeting, language, brandKit } = projectData;

  if (!product || !mainImage || !targeting || !language || !brandKit) {
      throw new Error("Incomplete project data provided for analysis.");
  }
    
  console.log('[Analysis] Starting with auto-failover enabled...');
  let youtubeAnalysis = null;
  if (enableVisualResearch) {
    try {
      const videos = await searchProductVideos(product.name, product.category);
      youtubeAnalysis = formatAnalysisForPrompt(await analyzeVideoInsights(videos));
    } catch (e) { console.warn("YouTube analysis failed, proceeding without it.", e); }
  }
  
  const productName = product?.name || 'product';

  const prompt = `
For the product "${productName}":
- Search e-commerce sites like Amazon.in, Flipkart, Indiamart, TradeIndia for similar products. Analyze descriptions, use cases, applications, customer reviews, prices, and images.
- Check social media: YouTube videos, Instagram posts/reels, Facebook ads/groups for real-user content and trends.
- Generate an inspiration summary: 3-5 key ideas from e-commerce/social, including use cases (e.g., home decor, gifting), applications (e.g., festivals), and differentiators.
- Determine color mood, lighting, and composition based on product images/reviews.

CRITICAL INSTRUCTIONS:
1. Your output MUST be a single, raw JSON object.
2. Do NOT wrap the JSON in markdown code blocks.
3. Do NOT include any text before or after the JSON object.
4. Include 10-15 RELEVANT e-commerce or social media research sources (URLs).

REQUIRED JSON STRUCTURE:
{
  "subject": "The primary subject of the video.",
  "category": "The broader category of the product.",
  "inspirationSummary": "...",
  "colorMood": "...",
  "lightingStyle": "...",
  "compositionIdeas": ["...", "..."],
  "searchSources": ["https://www.amazon.in/...", "https://www.instagram.com/..."]
}
`;
  
  const images = [mainImage, ...(referenceImages || [])].map(img => `data:${img.mimeType};base64,${img.base64}`);

  try {
    const result = await autoFailover.callWithAutoFailover(prompt, {
      images,
      systemPrompt: 'You are a professional video marketing strategist and expert copywriter who returns only valid, raw JSON.',
      requireVision: true,
      maxRetries: 3,
    });
    console.log(`[Analysis] ✅ Success! Provider: ${result.provider}, Attempts: ${result.attempts}`);
    
    const responseText = typeof result.data === 'string' ? result.data : JSON.stringify(result.data);
    const parsed = safelyParseJson<any>(responseText, "Failed to parse AI response.");

    // Helper functions for robust data extraction
    const getNestedValue = (obj: any, path: string): any => {
        if (!path || typeof path !== 'string') return undefined;
        return path.split('.').reduce((acc, part) => acc && acc[part], obj);
    };

    const findValue = (obj: any, paths: string[]): any => {
        for (const path of paths) {
            const value = getNestedValue(obj, path);
            if (value !== undefined && value !== null) {
                return value;
            }
        }
        return undefined;
    };
    
    // Helper to ensure a value is an array of strings, handling both array and comma-separated string inputs.
    const ensureStringArray = (value: any): string[] => {
        if (Array.isArray(value)) {
            return value.filter(item => typeof item === 'string');
        }
        if (typeof value === 'string') {
            return value.split(',').map(s => s.trim()).filter(Boolean);
        }
        return [];
    };

    // Transform the parsed data into the expected IntegratedAnalysisReport structure
    const compositionIdeasRaw = findValue(parsed, ['compositionIdeas', 'inspiration.compositionIdeas', 'creative_direction.composition']);
    const searchSourcesRaw = findValue(parsed, ['searchSources', 'researchSources', 'sources']);

    const transformed: Partial<IntegratedAnalysisReport> = {
      subject: findValue(parsed, ['subject', 'productSummary.name', 'product_analysis.subject', 'product_analysis.product_name']) || projectData.product!.name,
      category: findValue(parsed, ['category', 'product_analysis.category']) || projectData.product!.category,
      inspirationSummary: findValue(parsed, ['inspirationSummary', 'inspiration.summary', 'creative_direction.inspiration', 'summary']) || `A showcase of the ${projectData.product!.name}, highlighting its unique features.`,
      colorMood: findValue(parsed, ['colorMood', 'inspiration.colorMood', 'creative_direction.tone', 'mood']) || 'Warm, inviting, and culturally authentic.',
      lightingStyle: findValue(parsed, ['lightingStyle', 'inspiration.lightingStyle', 'creative_direction.lighting', 'lighting']) || 'Bright, natural lighting to highlight product details.',
      compositionIdeas: ensureStringArray(compositionIdeasRaw).length > 0 ? ensureStringArray(compositionIdeasRaw) : ['Dynamic angles', 'Product close-ups', 'Lifestyle context shots'],
      // FIX: Robustly check if the raw value is an array before attempting to map it.
      // This prevents the ".map is not a function" crash if the AI returns a string or object.
      searchSources: (Array.isArray(searchSourcesRaw) ? searchSourcesRaw : []).map((source: any) => {
          const urlString = typeof source === 'string' ? source : source?.web?.uri || source.uri;
          if (!urlString) return null;
          try {
              const url = new URL(urlString.startsWith('http') ? urlString : `https://${urlString}`);
              const title = source?.web?.title || source.title || url.hostname.replace('www.', '');
              return { web: { uri: url.toString(), title } };
          } catch {
              return null;
          }
      }).filter(Boolean),
    };

    console.log('[Analysis] ✅ Transformation complete!', transformed);
    return transformed;

  } catch (error: any) {
    console.error('[Analysis] ❌ All providers failed:', error);
    throw new Error(`Unable to analyze product: ${error.message}. Please check API keys in Settings.`);
  }
};


export const generateStoryboard = async (
  projectData: VideoProject,
): Promise<Storyboard> => {
  console.log('[Service] Generating storyboard with new framework...');
  
  // 1. Get the detailed prompt and the structural data from the prompt service
  const { prompt, storyArc, culturalContext, narrativeStyle } = createStoryboardPrompt(projectData);
  
  // 2. Call the AI with the new, detailed prompt
  const { data } = await autoFailover.callWithAutoFailover(prompt[0].text, { requireVision: false });
  
  // 3. Parse the AI's creative output
  const aiGeneratedStoryboard = safelyParseJson<Storyboard>(data, "Failed to parse storyboard from AI response.");
  
  // 4. Combine the locally generated structure with the AI's creative output
  const finalStoryboard: Storyboard = {
    ...aiGeneratedStoryboard,
    storyArc,
    culturalContext,
    narrativeStyle,
  };
  
  console.log('[Service] ✅ Enhanced storyboard complete.', finalStoryboard);
  return finalStoryboard;
};


export const generateAlternativeHooks = async (
    product: Product, brandKit: BrandKit, targeting: Targeting, music: Music,
): Promise<Scene[]> => {
    console.log('[Service] Generating alternative hooks...');
    const prompt = createAlternativeHooksPrompt(product, brandKit, targeting, music)[0].text;
    const { data } = await autoFailover.callWithAutoFailover(prompt, { requireVision: false });
    return safelyParseJson<Scene[]>(data, "Failed to parse alternative hooks from AI response.");
};