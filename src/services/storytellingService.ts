// src/services/storytellingService.ts
// @ts-nocheck

// Advanced storytelling framework for product videos

export interface StoryArc {
  act1_setup: string;      // Introduce problem/situation
  act2_conflict: string;   // Show need/challenge
  act3_resolution: string; // Product as solution
}

export interface EmotionalBeat {
  emotion: string;
  scene: string;
  visual: string;
}

export interface CulturalContext {
  festival?: string;
  tradition?: string;
  occasion?: string;
  symbolism?: string;
}

/**
 * Generate compelling story arc for product
 */
export function generateStoryArc(
  productName: string,
  category: string,
  analysisReport: any,
  targetAudience: 'B2B' | 'B2C'
): StoryArc {
  
  console.log('[Storytelling] Generating story arc for:', productName);
  console.log('[Storytelling] Target audience:', targetAudience);
  
  // Detect product type
  const isDecor = category.toLowerCase().includes('decor') || 
                  category.toLowerCase().includes('rangoli');
  const isFestival = productName.toLowerCase().includes('diwali') ||
                     productName.toLowerCase().includes('rangoli') ||
                     productName.toLowerCase().includes('diya');
  
  let storyArc: StoryArc;
  
  if (targetAudience === 'B2B') {
    // B2B: Problem → Solution → ROI
    storyArc = {
      act1_setup: `Professional presentation of ${productName}. Display product quality, craftsmanship, and premium materials that appeal to wholesale buyers.`,
      act2_conflict: `Demonstrate key features and unique selling points. Show why retailers choose this product: quality, pricing, market demand.`,
      act3_resolution: `Showcase product in retail-ready presentation. Display packaging, bulk options, and profit potential for resellers.`
    };
    
  } else if (isFestival) {
    // Festival products: Tradition → Celebration → Joy
    storyArc = {
      act1_setup: `Warm, inviting home setting. Family preparing for festival. Traditional atmosphere with soft lighting. Create anticipation and cultural connection.`,
      act2_conflict: `Hands lovingly placing ${productName} as part of decoration. Show the care and tradition. Multiple angles revealing intricate details and beauty.`,
      act3_resolution: `Complete festive scene with ${productName} as centerpiece. Warm lighting, family joy, cultural celebration. Product brings tradition to life.`
    };
    
  } else if (isDecor) {
    // Home decor: Bland → Transform → Beautiful
    storyArc = {
      act1_setup: `Simple, understated home space. Room needs character and warmth. Neutral tones, clean but lacking personality.`,
      act2_conflict: `Hands carefully placing ${productName}. Watch the transformation begin. Product becomes focal point, adding style and elegance.`,
      act3_resolution: `Transformed space with ${productName} as hero. Room now has character, warmth, style. Product elevates entire aesthetic.`
    };
    
  } else {
    // Generic products: Need → Discover → Satisfy
    storyArc = {
      act1_setup: `Person in everyday situation needing ${productName}. Relatable moment, authentic setting. Show the need naturally.`,
      act2_conflict: `Introducing ${productName} as solution. Hands demonstrating usage, showing features. Product quality becomes evident through interaction.`,
      act3_resolution: `Satisfied user with ${productName}. Problem solved, life improved. Product delivers on promise, creates positive outcome.`
    };
  }
  
  console.log('[Storytelling] Story arc generated:', storyArc.act1_setup.substring(0, 50) + '...');
  return storyArc;
}

/**
 * Add cultural context to storytelling
 */
export function addCulturalContext(
  productName: string,
  analysisReport: any
): CulturalContext | null {
  
  const nameLower = productName.toLowerCase();
  const summary = (analysisReport?.inspirationSummary || '').toLowerCase();
  
  // Diwali products
  if (nameLower.includes('diya') || nameLower.includes('diwali') || 
      nameLower.includes('rangoli') || summary.includes('diwali')) {
    return {
      festival: 'Diwali',
      tradition: 'Festival of Lights celebration',
      occasion: 'Lakshmi Puja, family gatherings, home decoration',
      symbolism: 'Light conquering darkness, prosperity, new beginnings'
    };
  }
  
  // Ganesh products
  if (nameLower.includes('ganesh') || nameLower.includes('ganapati')) {
    return {
      festival: 'Ganesh Chaturthi',
      tradition: 'Welcoming Lord Ganesha into home',
      occasion: 'Puja ceremonies, spiritual practices',
      symbolism: 'Removing obstacles, wisdom, new ventures'
    };
  }
  
  // Wedding/Mehndi
  if (nameLower.includes('mehndi') || nameLower.includes('wedding') || 
      nameLower.includes('shaadi')) {
    return {
      tradition: 'Indian wedding ceremonies',
      occasion: 'Weddings, engagement celebrations, bridal preparations',
      symbolism: 'Love, prosperity, auspicious beginnings'
    };
  }
  
  // Meenakari (traditional craft)
  if (nameLower.includes('meenakari')) {
    return {
      tradition: 'Traditional Indian enamel art',
      occasion: 'Home decoration, gifting, cultural preservation',
      symbolism: 'Heritage craftsmanship, royal aesthetics, cultural pride'
    };
  }
  
  // Rakhi
  if (nameLower.includes('rakhi')) {
    return {
      festival: 'Raksha Bandhan',
      tradition: 'Sister-brother bond celebration',
      occasion: 'Rakhi tying ceremony, family gatherings',
      symbolism: 'Protection, sibling love, family bonds'
    };
  }
  
  return null;
}

/**
 * Generate emotional beats for scenes
 */
export function generateEmotionalBeats(
  storyArc: StoryArc,
  culturalContext: CulturalContext | null,
  targetAudience: 'B2B' | 'B2C'
): EmotionalBeat[] {
  
  const beats: EmotionalBeat[] = [];
  
  if (targetAudience === 'B2B') {
    beats.push({
      emotion: 'Trust',
      scene: storyArc.act1_setup,
      visual: 'Professional lighting, clean background, product showcase quality'
    });
    beats.push({
      emotion: 'Confidence',
      scene: storyArc.act2_conflict,
      visual: 'Close-ups showing quality, craftsmanship, attention to detail'
    });
    beats.push({
      emotion: 'Opportunity',
      scene: storyArc.act3_resolution,
      visual: 'Multiple products, bulk presentation, profit potential visual'
    });
  } else {
    beats.push({
      emotion: culturalContext ? 'Nostalgia' : 'Curiosity',
      scene: storyArc.act1_setup,
      visual: culturalContext 
        ? 'Warm, traditional setting with cultural elements'
        : 'Modern, aspirational lifestyle setting'
    });
    beats.push({
      emotion: 'Delight',
      scene: storyArc.act2_conflict,
      visual: 'Hands-on interaction, product beauty revealed, tactile appeal'
    });
    beats.push({
      emotion: culturalContext ? 'Joy' : 'Satisfaction',
      scene: storyArc.act3_resolution,
      visual: culturalContext
        ? 'Festive atmosphere, family joy, tradition honored'
        : 'Problem solved, life improved, aesthetic pleasure'
    });
  }
  
  return beats;
}

/**
 * Generate cinematography notes for each scene
 */
export function generateCinematography(
  emotionalBeat: EmotionalBeat,
  visualTheme: string
): string {
  
  const theme = visualTheme.toLowerCase();
  
  let lighting = 'warm, soft';
  let camera = 'smooth, steady';
  let composition = 'balanced, centered';
  
  // Adjust based on theme
  if (theme.includes('cinematic')) {
    lighting = 'dramatic, golden hour';
    camera = 'slow, deliberate movements';
    composition = 'rule of thirds, depth of field';
  } else if (theme.includes('vibrant') || theme.includes('modern')) {
    lighting = 'bright, colorful';
    camera = 'dynamic, smooth transitions';
    composition = 'bold, contemporary framing';
  } else if (theme.includes('minimal') || theme.includes('clean')) {
    lighting = 'soft, diffused';
    camera = 'static, precise';
    composition = 'minimalist, negative space';
  } else if (theme.includes('luxury') || theme.includes('premium')) {
    lighting = 'sophisticated, ambient';
    camera = 'elegant, slow pan';
    composition = 'refined, editorial style';
  }
  
  return `${lighting} lighting. ${camera} camera movement. ${composition} composition. ${emotionalBeat.visual}.`;
}