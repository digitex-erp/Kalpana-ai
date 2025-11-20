// src/types.ts

// Basic types
export type Language = 'English' | 'Hindi';

// Image-related types
export interface ImageInfo {
  base64: string;
  mimeType: string;
  previewUrl: string;
}

// Product-related types
export interface Product {
  id: string;
  sku?: string;
  name: string;
  description: string;
  category: string;
  material?: string;
  size?: string;
  features?: string[];
  ideal_locations?: string[];
  visual_style?: {
    lighting: string;
    camera_focus: string;
    tone: string;
  };
  continuityBatch?: string;
  related_products?: string[];
  how_to_use?: string[];
  pack?: string;
  finish?: string;
  use_cases?: string[];
  visual_keywords?: string[];
}

// Brand-related types
export type ToneOfVoice = 'Professional' | 'Luxurious' | 'Playful' | 'Friendly';

export interface BrandKit {
  logo: ImageInfo | null;
  brandName: string;
  primaryColor: string;
  secondaryColor: string;
  contactInfo: string;
  toneOfVoice: ToneOfVoice;
  generateOutro: boolean;
}

export interface SavedBrandKit extends BrandKit {
  kitName: string;
}

// Targeting-related types
export type AspectRatio = '9:16' | '1:1' | '16:9';

export interface Targeting {
  audience: string;
  platform: string;
  aspectRatio: AspectRatio;
}

// Music and Narration
export interface Music {
  id: string;
  name: string;
  description: string;
  mood: string;
  cloudinaryId?: string;
  category: string;
  icon: string;
}

export interface NarrationVoiceSetting {
  language: 'english' | 'hindi' | 'none';
  gender: 'male' | 'female' | 'none';
  style: string;
}

// AI Analysis types
export interface IntegratedAnalysisReport {
  subject: string;
  category: string;
  productSummary?: {
    name: string;
    material?: string;
    texture?: string;
    colorPalette?: string[];
    idealUseCases?: string[];
  };
  inspirationSummary: string;
  colorMood: string;
  lightingStyle: string;
  compositionIdeas: string[];
  searchSources?: { web: { uri: string; title: string } }[];
  videoGuidelines?: {
    displayRatio: string;
    recommendedScenes: string[];
    audioGuidelines: {
      language: string;
      voiceTone: string;
    };
  };
  memoryUpdate?: {
    categoryMemoryRules: string[];
    inheritFromCategory: string;
    newLearnings: string[];
  };
  popularUseCases?: string[];
  recommendedSceneStyles?: string[];
  exampleCaptions?: string[];
  visualTrends?: string[];
}


export type VisualTheme = 'Vibrant & Modern' | 'Cinematic' | 'Clean & Minimalist';
export type CameraMotion = 'Low (Subtle)' | 'Medium (Standard)' | 'High (Dynamic)';

// Storyboard and Video types
export interface StoryArc {
  act1_setup: string;
  act2_conflict: string;
  act3_resolution: string;
}

export interface CulturalContext {
  festival?: string;
  tradition?: string;
  occasion?: string;
  symbolism?: string;
}

export interface Scene {
  visual: string;
  dialogue: string;
  dialogue_en: string;
  dialogue_hi: string;
  textOverlay?: string;
  cameraAngle?: string;
  transition?: string;
  duration?: number;
  emotion?: string;
}

export interface Storyboard {
  title: string;
  scenes: Scene[];
  brandTagline: string;
  musicStyle: string;
  storyArc?: StoryArc;
  culturalContext?: CulturalContext | null;
  narrativeStyle?: string;
}

// Main Project type
export interface VideoProject {
  id: string;
  product: Product;
  productName: string; // denormalized for easier access
  category: string; // denormalized for easier access
  mainImage: ImageInfo;
  referenceImages?: ImageInfo[];
  brandKit: BrandKit;
  targeting: Targeting;
  language: Language;
  analysisReport: IntegratedAnalysisReport;
  music: Music;
  narrationVoice: NarrationVoiceSetting;
  storyboard?: Storyboard;
  script?: any;
  videoLength: number;
  visualTheme: VisualTheme;
  cameraMotion: CameraMotion;
  negativePrompt?: string;
  includeAudio?: boolean;
  videoBlob?: Blob; // Made optional as we now prioritize videoUrl
  imageBase64?: string; // For thumbnail/poster
  imageMimeType?: string;
  createdAt: number;
  updatedAt: number;
  stage: 'In Progress' | 'Completed';
  version?: number;
  tweakHistory?: string[];
  videoUrl?: string; // For cloud-generated videos
  cloudinaryPublicId?: string;
}

// For Director Memory
export interface MemoryEntry {
    date: string;
    timestamp: number;
    projects: string[];
    feedback: string[];
    successes: string[];
    directives: string[];
}

// For Training Analysis
export interface TrainingAnalysisReport {
    overallProgress: string;
    trendAnalysis: {
        avgVideoDuration: string;
        avgScenesPerVideo: string;
        improvementOverV1: string;
    };
    topLearnedRules: string[];
    styleInsights: {
        dominantTone: string;
        camera: string;
        lighting: string;
        text: string;
    };
    weakPoints: string[];
}

// For Templates
export interface CategoryTemplate {
  id: string;
  name: string;
  category: string;
  brandKitName?: string;
  targeting: Targeting;
  language: Language;
  creativeDirection: {
    tone: ToneOfVoice;
    lighting: string;
    composition: string[];
  };
  music: Music;
  narrationVoice: NarrationVoiceSetting;
  createdAt: number;
}

// For AI Service
export type AiProvider = 'gemini' | 'mock' | 'claude' | 'deepseek' | 'moonshot' | 'ollama' | 'huggingface' | 'openai' | 'perplexity' | 'xai';

export interface AiProviderSettings {
  provider: AiProvider;
  preferredProvider?: AiProvider;
  huggingFaceModel: string;
  moonshotModel: string;
  deepseekModel: string;
  ollamaModel: string;
  ollamaServerUrl: string;
}

// Types for Professional Script Generation
export interface ProfessionalScript {
  hook: ScriptSegment;
  problem: ScriptSegment;
  solution: ScriptSegment;
  benefits: ScriptSegment[];
  socialProof: ScriptSegment;
  cta: ScriptSegment;
  metadata: {
    emotionalTone: string;
    targetAudience: string;
    uniqueAngle: string;
    competitiveDifferentiator: string;
  };
}

export interface ScriptSegment {
  narration: string;
  visualDescription: string;
  duration: number;
  emotionalGoal: string;
  musicMood: string;
  transitionType: string;
  dataSource: string;
}

export interface StoryboardScene {
  sceneNumber: number;
  title: string;
  duration: number;
  narration: string;
  visualElements: VisualElement[];
  cameraMovement: string;
  transition: string;
  musicCue: string;
  emotionalBeat: string;
}

export interface VisualElement {
  type: 'product' | 'text' | 'graphic' | 'comparison' | 'lifestyle';
  content: string;
  position: { x: string; y: string };
  animation: string;
  duration: number;
  style: any;
}