// src/services/promptService.ts
import {
  Product,
  BrandKit,
  Targeting,
  Music,
  Language,
  Storyboard,
  VideoProject,
} from '../types';
import { formatMemoryForPrompt } from './directorMemoryService';
import {
  generateStoryArc,
  addCulturalContext,
  generateEmotionalBeats,
  generateCinematography,
  generateUsageScenarios,
  generateAmbientBackground,
  ProductUsageScenario,
  AmbientBackground
} from './storytellingService';
import { StoryArc, CulturalContext } from '../types';
import { selectCameraMovements, generateCameraDirection, SceneType } from './cinematographyService';
import { generatePersuasiveDialog, generateSceneDialog } from './dialogService';
import { calculateProductVisibility, enforceVisibilityRule } from './productVisibilityService';
import { logger } from './logService';

// This will be a large file. I will create the prompts based on what the services need.

export const createTrainingAnalysisPrompt = (sanitizedProjects: any[]): any[] => {
  const projectData = JSON.stringify(sanitizedProjects, null, 2);
  const memory = formatMemoryForPrompt();

  return [{
    text: `
[SYSTEM]
You are an expert creative director's assistant. Your task is to analyze a list of recent video projects to identify performance trends, learned rules, and areas for improvement. Provide a concise, insightful report in JSON format. The user will provide a JSON array of sanitized project data and the AI Director's memory log.

Analyze the 'tweakHistory' for each project version to understand what changes were requested. A higher version number indicates a re-generation based on feedback.

Your output MUST be a valid JSON object matching this structure:
{
  "overallProgress": "A brief, one-sentence summary of the AI's learning trajectory.",
  "trendAnalysis": {
    "avgVideoDuration": "Average video duration in seconds (e.g., '18s').",
    "avgScenesPerVideo": "Average number of scenes per video (e.g., '5').",
    "improvementOverV1": "A qualitative or quantitative measure of improvement from version 1s (e.g., '+25% fewer tweaks', 'More consistent branding')."
  },
  "topLearnedRules": [
    "A key directive learned from feedback (e.g., 'Always include a close-up shot of the product texture.').",
    "Another key learning.",
    "A third key learning."
  ],
  "styleInsights": {
    "dominantTone": "The most common tone of voice used (e.g., 'Friendly & Upbeat').",
    "camera": "Common camera direction patterns (e.g., 'Medium shots with slow pans').",
    "lighting": "Common lighting styles observed (e.g., 'Soft, warm lighting').",
    "text": "Common on-screen text patterns (e.g., 'Minimal, bold white text')."
  },
  "weakPoints": [
    "An area where the AI still struggles (e.g., 'Video hooks could be more engaging in the first 2 seconds.').",
    "Another area for improvement."
  ]
}

[DATA]
Director's Memory:
${memory}

Recent Projects:
${projectData}

[TASK]
Generate the JSON analysis report.
`
  }];
};


export const createIntegratedAnalysisPrompt = (
  product: Product,
  targeting: Targeting,
  language: Language,
  youtubeAnalysis: string | null
): any[] => {
  const memory = formatMemoryForPrompt();
  const productDetails = JSON.stringify(product, null, 2);

  return [{
    text: `
[SYSTEM]
You are an expert market researcher and creative strategist. Your task is to perform an integrated analysis for a new product video. Your goal is to generate a comprehensive report in JSON format that will guide the video's creative direction.

Your output MUST be a valid JSON object matching this structure. Do NOT nest creative direction fields inside an 'inspiration' object.

{
  "subject": "The primary subject of the video.",
  "category": "The broader category of the product.",
  "productSummary": {
    "name": "The product's name.",
    "material": "The primary material.",
    "texture": "The key visual texture.",
    "colorPalette": ["List of key colors."],
    "idealUseCases": ["List 3-4 ideal uses."]
  },
  "inspirationSummary": "A one-sentence creative summary that sets the tone.",
  "colorMood": "The emotional mood to convey with colors (e.g., 'Warm, festive, vibrant').",
  "lightingStyle": "The recommended lighting style (e.g., 'Soft, natural light with gentle shadows').",
  "compositionIdeas": ["A list of 3-4 specific camera shot ideas, like 'Top-down shot of the rangoli being assembled.'"],
  "searchSources": ["A list of 3-5 relevant URLs from your research."],
  "videoGuidelines": {
    "displayRatio": "The target display ratio (e.g., '9:16').",
    "recommendedScenes": ["List of 3-4 must-have scene types."],
    "audioGuidelines": { "language": "The narration language.", "voiceTone": "The recommended voice tone." }
  },
  "memoryUpdate": {
    "categoryMemoryRules": ["List rules for this category."],
    "inheritFromCategory": "Name of the category to inherit from.",
    "newLearnings": ["List any new learnings."]
  }
}

Use Google Search to research the product and its category.

[CONTEXT]
Director's Memory:
${memory}

${youtubeAnalysis || ''}

[DATA]
Product: ${productDetails}
Targeting: Audience is ${targeting.audience}, Platform is ${targeting.platform}, Aspect Ratio is ${targeting.aspectRatio}.
Language: ${language}

[TASK]
Generate the JSON analysis report.
`
  }];
};

export const createStoryboardPrompt = (
  projectData: VideoProject,
): { prompt: any[], storyArc: StoryArc, culturalContext: CulturalContext | null, narrativeStyle: string } => {
  const { product, language, brandKit, targeting, music, analysisReport, visualTheme } = projectData;

  logger.info('Prompt', 'Generating enhanced storyboard prompt with PhD-level production logic');

  // 1. Generate Narrative Structure using the new framework
  // @ts-ignore
  const targetAudience = targeting.audience.toLowerCase().includes('b2b') || targeting.audience.toLowerCase().includes('wholesale') ? 'B2B' : 'B2C';
  const storyArc = generateStoryArc(product.name, product.category, analysisReport, targetAudience);
  const culturalContext = addCulturalContext(product.name, analysisReport);
  // @ts-ignore
  const emotionalBeats = generateEmotionalBeats(storyArc, culturalContext, targetAudience);
  const narrativeStyle = targetAudience === 'B2B' ?
    'Professional, ROI-focused, quality showcase' :
    culturalContext ?
      'Emotional, cultural, traditional celebration' :
      'Aspirational, lifestyle, transformation';

  // 2. Generate Enhanced Components
  const usageScenarios = generateUsageScenarios(product.name, product.category, []);
  const ambientBackground = generateAmbientBackground(product.category, culturalContext, visualTheme || 'professional');
  const persuasiveDialog = generatePersuasiveDialog(
    product.name,
    product.category,
    targetAudience,
    language === 'Hindi' ? 'hindi' : language === 'English' ? 'english' : 'hinglish',
    culturalContext
  );

  logger.info('Prompt', `Generated ${usageScenarios.length} usage scenarios and ambient background`);
  logger.info('Prompt', `Persuasive dialog hook: "${persuasiveDialog.hook.substring(0, 50)}..."`);

  // 3. Map emotional beats to scene types for camera selection
  const sceneTypes: SceneType[] = emotionalBeats.map((beat, index) => {
    if (index === 0) return 'hero';
    if (index === emotionalBeats.length - 1) return 'outro';
    if (beat.emotion.toLowerCase().includes('delight') || beat.emotion.toLowerCase().includes('confidence')) return 'feature';
    if (beat.emotion.toLowerCase().includes('trust') || beat.emotion.toLowerCase().includes('opportunity')) return 'usage';
    return 'lifestyle';
  });

  // 4. Build enhanced scene structure with camera movements and backgrounds
  const scenesStructure = emotionalBeats.map((beat, index) => {
    // @ts-ignore
    const cinematography = generateCinematography(beat, visualTheme);
    const duration = index === 0 ? 3 : (index === emotionalBeats.length - 1 ? 4 : 3);
    const sceneType = sceneTypes[index];

    // Select camera movements for this scene
    const cameraMovements = selectCameraMovements(sceneType, product.category, beat.emotion, duration);
    const cameraDirection = cameraMovements.map(m => generateCameraDirection(m)).join('\n');

    // Get usage scenario if applicable
    const usageScenario = sceneType === 'usage' && usageScenarios.length > 0
      ? usageScenarios[Math.min(index, usageScenarios.length - 1)]
      : null;

    // Get dialog for this scene
    const sceneDialog = generateSceneDialog(
      sceneType === 'hero' ? 'hook' :
        sceneType === 'feature' ? 'feature' :
          sceneType === 'usage' ? 'usage' :
            sceneType === 'lifestyle' ? 'lifestyle' : 'outro',
      persuasiveDialog,
      language === 'Hindi' ? 'hindi' : language === 'English' ? 'english' : 'hinglish'
    );

    return `
---
### SCENE ${index + 1} (Act ${index + 1}: ${beat.emotion}) - ${sceneType.toUpperCase()}
**NARRATIVE GOAL:** ${beat.scene}

**CAMERA MOVEMENTS:**
${cameraDirection}

**PRODUCT VISIBILITY TARGET:** ${Math.round(cameraMovements.reduce((sum, m) => sum + m.productVisibility, 0) / cameraMovements.length * 100)}%

**BACKGROUND & AMBIENCE:**
Setting: ${ambientBackground.setting}
Lighting: ${ambientBackground.lighting}
Props: ${ambientBackground.props.join(', ')}
Color Palette: ${ambientBackground.colorPalette.join(', ')}
Depth of Field: ${ambientBackground.depthOfField}
Ambience: ${ambientBackground.ambience}

${usageScenario ? `**PRODUCT USAGE DEMONSTRATION:**
Action: ${usageScenario.action}
Hands: ${usageScenario.hands}
Camera Focus: ${usageScenario.cameraFocus}
Description: ${usageScenario.description}
` : ''}

**PERSUASIVE DIALOG:**
English: ${sceneDialog.english}
Hindi: ${sceneDialog.hindi}
Hinglish: ${sceneDialog.hinglish}

**CINEMATOGRAPHY:** ${cinematography}
**DURATION:** ${duration} seconds.
---
    `
  }).join('\n');

  const totalDuration = emotionalBeats.reduce((sum, beat, index) => sum + (index === 0 ? 3 : (index === emotionalBeats.length - 1 ? 4 : 3)), 0);

  logger.info('Prompt', `Generated enhanced scene structure with ${emotionalBeats.length} scenes, total ${totalDuration}s`);

  const promptText = `
[SYSTEM]
You are an AI Video Director and expert copywriter for the Indian market. Your task is to create a creative storyboard based on a pre-defined narrative structure with PhD-level video production principles.

**🎯 CRITICAL REQUIREMENT: 80% PRODUCT VISIBILITY RULE**
The product MUST be visible and prominent in at least 80% of the total video duration. This is NON-NEGOTIABLE.

**PRODUCT VISIBILITY GUIDELINES:**
- Hero shots: Product occupies 60-80% of frame
- Feature shots: Product fills 80-100% of frame (macro details)
- Usage shots: Product visible in 50-70% of frame (with hands/context)
- Lifestyle shots: Product visible in 40-60% of frame (in environment)
- Outro: Product visible in 70-90% of frame (final impression)

**SHOT COMPOSITION RULES:**
1. Rule of Thirds: Position product at intersection points for visual interest
2. Leading Lines: Use background elements to guide eye to product
3. Negative Space: Leave 20-30% empty space for text overlays
4. Depth Layers: Foreground (product) + Midground (context) + Background (ambience)
5. Color Contrast: Product must stand out from background (30%+ contrast)
6. Lighting Priority: Product must be 2x brighter than background
7. Focus Plane: Product always in sharpest focus
8. Symmetry/Balance: Centered for hero shots, off-center for lifestyle

**NARRATIVE STRUCTURE & ENHANCED CINEMATOGRAPHY:**
You have been given a 3-act story structure with emotional beats, camera movements, product visibility targets, ambient backgrounds, usage demonstrations, and persuasive dialogs for each scene.

${scenesStructure}

**OVERALL NARRATIVE STYLE:** ${narrativeStyle}
${culturalContext ? `**CULTURAL CONTEXT:** ${culturalContext.tradition} - ${culturalContext.symbolism}` : ''}

**PRODUCT:** ${product.name}
**CATEGORY:** ${product.category}
**TARGETING:** ${targeting.platform} for ${targeting.audience}
**LANGUAGE:** ${language}
**TOTAL DURATION:** ${totalDuration}s

**TASK:**
For EACH scene defined above, generate the creative elements. The total duration of all scenes combined MUST equal exactly ${totalDuration} seconds.

**CRITICAL: Return ONLY a raw JSON object matching this structure. No markdown or explanations.**

{
  "title": "A catchy title for the video script.",
  "scenes": [
    {
      "visual": "A detailed, creative visual description for Scene 1 based on its NARRATIVE GOAL, CAMERA MOVEMENTS, and BACKGROUND. MUST show product prominently (max 150 chars).",
      "dialogue": "Primary narration in ${language} for Scene 1 using the PERSUASIVE DIALOG provided (max 150 chars).",
      "dialogue_en": "The English version of the narration for Scene 1.",
      "dialogue_hi": "Creative and culturally relevant Hindi narration for Scene 1. Make it sound natural and persuasive for an Indian audience.",
      "textOverlay": "On-screen text for Scene 1 (max 50 chars).",
      "cameraAngle": "Use the CAMERA MOVEMENT specified (e.g., 'Static hero shot', 'Push-in', 'Orbital 360°')",
      "transition": "e.g., 'Cut to', 'Dissolve', 'Wipe'",
      "duration": 3,
      "emotion": "The emotion for Scene 1 (e.g., 'Nostalgia', 'Trust')",
      "productVisibility": 0.8
    }
  ],
  "brandTagline": "A short, memorable tagline for the brand.",
  "musicStyle": "${music.mood}",
  "productVisibilityScore": 0.85
}

**RULES:**
1. The number of scenes in your output JSON must exactly match the number of scenes in the narrative structure provided (${emotionalBeats.length} scenes).
2. The "duration" for each scene must match the duration specified in the structure.
3. The "emotion" for each scene must match the emotion specified.
4. The "productVisibility" for each scene must meet or exceed the target specified.
5. The overall "productVisibilityScore" must be at least 0.80 (80%).
6. Use the CAMERA MOVEMENTS specified for each scene in the "cameraAngle" field.
7. Use the PERSUASIVE DIALOG provided for each scene, adapted to ${language}.
8. Incorporate the BACKGROUND & AMBIENCE details into the "visual" description.
9. If a PRODUCT USAGE DEMONSTRATION is specified, include it in the "visual" description.
10. If 'generateOutro' is true (${brandKit.generateOutro}), make the final scene a branded outro.

**GENERATE THE STORYBOARD JSON NOW.**
`;

  return {
    prompt: [{ text: promptText }],
    storyArc,
    culturalContext,
    narrativeStyle
  };
};

export const createAlternativeHooksPrompt = (
  product: Product,
  brandKit: BrandKit,
  targeting: Targeting,
  music: Music
): any[] => {
  return [{
    text: `
[SYSTEM]
You are an expert social media marketer specializing in creating viral video hooks for the Indian market.
Your task is to generate 3 alternative opening scenes (hooks) for a video about the product provided.
Each hook should be designed to grab the viewer's attention within the first 2 seconds.
The output MUST be a valid JSON array of Scene objects.

JSON Structure:
[
    {
      "visual": "A detailed visual description for the opening scene.",
      "dialogue": "The opening line of narration in the primary language.",
      "dialogue_en": "The English version of the hook.",
      "dialogue_hi": "Creative and culturally relevant Hindi hook. Make it punchy and engaging for a Hindi-speaking audience.",
      "textOverlay": "A short, punchy text overlay."
    }
]

Think about different angles:
1. Problem/Solution: Start with a common problem the product solves.
2. Aspirational: Show an ideal, beautiful outcome.
3. Intrigue: Ask a question or show something unexpected.

[DATA]
Product: ${JSON.stringify(product, null, 2)}
Brand/Targeting: ${JSON.stringify({ brandKit, targeting, music }, null, 2)}

[TASK]
Generate a JSON array with exactly 3 alternative hook scenes.
`
  }];
};

export const createVideoGenerationPrompt = (storyboard: Storyboard, product: Product, narrationVoice: any): string => {
  // Determine the narration script based on the selected language
  const fullNarrationScript = storyboard.scenes
    .map(scene => {
      if (narrationVoice.language === 'hindi' && scene.dialogue_hi) {
        return scene.dialogue_hi;
      }
      if (narrationVoice.language === 'english' && scene.dialogue_en) {
        return scene.dialogue_en;
      }
      // Fallback to the main dialogue field if the language-specific one is missing
      return scene.dialogue;
    })
    .filter(dialogue => dialogue && dialogue.trim() !== '')
    .join(' \n');

  // Generate scene descriptions
  const visualPrompts = storyboard.scenes.map(scene => {
    let visual = scene.visual;
    if (scene.textOverlay) {
      visual += ` with on-screen text that says "${scene.textOverlay}".`;
    }
    return visual;
  });

  // Create the narration part of the prompt
  let narrationPromptSection = '';
  if (narrationVoice.language === 'none' || !fullNarrationScript) {
    narrationPromptSection = `**Narration:**
This video should have NO spoken narration or voice-over. It will be music-only.`;
  } else {
    narrationPromptSection = `**Narration Script & Voice Direction:**
The video MUST be narrated with the following script. The voice should be a **${narrationVoice.gender}** voice, speaking in **${narrationVoice.language}** with a **${narrationVoice.style}** tone.

**Script:**
"${fullNarrationScript}"`;
  }


  return `
Generate a video for a product named "${product.name}".

**Overall Style:**
The video should have a ${product.visual_style?.tone || 'professional and engaging'} tone.
The lighting should be ${product.visual_style?.lighting || 'clean and well-lit'}.
The overall mood should be consistent with the product's category: "${product.category}".

${narrationPromptSection}

**Scene Descriptions:**
The video should follow this sequence of scenes:
${visualPrompts.map((vp, i) => `${i + 1}. ${vp}`).join('\n')}

**Product Focus:**
Ensure the product, "${product.name}", is the hero of the video. The visual style, especially camera focus on ${product.visual_style?.camera_focus}, is critical.
`;
};