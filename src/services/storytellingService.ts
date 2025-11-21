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

/**
 * Product usage scenario for demonstration scenes
 */
export interface ProductUsageScenario {
  action: string;           // "Applying mehndi", "Arranging rangoli"
  hands: 'visible' | 'hidden'; // Show hands for demonstration
  productState: 'before' | 'during' | 'after';
  cameraFocus: 'hands' | 'product' | 'result';
  duration: number;
  description: string;
}

/**
 * Generate product usage scenarios for demonstration
 */
export function generateUsageScenarios(
  productName: string,
  category: string,
  features: string[] = []
): ProductUsageScenario[] {

  console.log('[Storytelling] Generating usage scenarios for:', productName);

  const nameLower = productName.toLowerCase();
  const categoryLower = category.toLowerCase();
  const scenarios: ProductUsageScenario[] = [];

  // Diwali/Rangoli products
  if (nameLower.includes('rangoli') || nameLower.includes('diwali')) {
    scenarios.push({
      action: 'Placing rangoli design',
      hands: 'visible',
      productState: 'during',
      cameraFocus: 'product',
      duration: 3,
      description: 'Hands carefully placing rangoli at entrance, revealing intricate patterns'
    });
    scenarios.push({
      action: 'Lighting diyas around rangoli',
      hands: 'visible',
      productState: 'after',
      cameraFocus: 'result',
      duration: 3,
      description: 'Complete festive setup with rangoli and diyas, warm glowing lights'
    });
  }
  // Diya/Lamp products
  else if (nameLower.includes('diya') || nameLower.includes('lamp')) {
    scenarios.push({
      action: 'Lighting the diya',
      hands: 'visible',
      productState: 'during',
      cameraFocus: 'product',
      duration: 2,
      description: 'Hand lighting diya with matchstick, flame coming to life'
    });
    scenarios.push({
      action: 'Arranging multiple diyas',
      hands: 'visible',
      productState: 'after',
      cameraFocus: 'result',
      duration: 3,
      description: 'Beautiful arrangement of lit diyas creating warm ambience'
    });
  }
  // Decor/Home products
  else if (categoryLower.includes('decor') || categoryLower.includes('home')) {
    scenarios.push({
      action: 'Placing product in space',
      hands: 'visible',
      productState: 'during',
      cameraFocus: 'product',
      duration: 2,
      description: 'Hands carefully positioning product in room, finding perfect spot'
    });
    scenarios.push({
      action: 'Admiring final placement',
      hands: 'hidden',
      productState: 'after',
      cameraFocus: 'result',
      duration: 3,
      description: 'Product beautifully integrated into space, transforming the room'
    });
  }
  // Jewelry/Accessories
  else if (categoryLower.includes('jewelry') || categoryLower.includes('accessory')) {
    scenarios.push({
      action: 'Wearing/displaying product',
      hands: 'visible',
      productState: 'during',
      cameraFocus: 'product',
      duration: 2,
      description: 'Product being worn or displayed, showcasing elegance'
    });
    scenarios.push({
      action: 'Close-up of product in use',
      hands: 'hidden',
      productState: 'after',
      cameraFocus: 'product',
      duration: 3,
      description: 'Beautiful close-up showing product enhancing appearance'
    });
  }
  // Food/Kitchen products
  else if (categoryLower.includes('food') || categoryLower.includes('kitchen')) {
    scenarios.push({
      action: 'Using product in kitchen',
      hands: 'visible',
      productState: 'during',
      cameraFocus: 'hands',
      duration: 3,
      description: 'Hands using product for cooking/preparation, showing functionality'
    });
    scenarios.push({
      action: 'Final dish presentation',
      hands: 'hidden',
      productState: 'after',
      cameraFocus: 'result',
      duration: 2,
      description: 'Beautiful final result showcasing product\'s purpose'
    });
  }
  // Generic products
  else {
    scenarios.push({
      action: 'Demonstrating product use',
      hands: 'visible',
      productState: 'during',
      cameraFocus: 'product',
      duration: 3,
      description: 'Hands demonstrating product features and usage'
    });
    scenarios.push({
      action: 'Product in ideal setting',
      hands: 'hidden',
      productState: 'after',
      cameraFocus: 'result',
      duration: 2,
      description: 'Product shown in perfect use case scenario'
    });
  }

  console.log(`[Storytelling] Generated ${scenarios.length} usage scenarios`);
  return scenarios;
}

/**
 * Ambient background for product context
 */
export interface AmbientBackground {
  setting: string;          // "Modern kitchen", "Traditional home"
  lighting: string;         // "Warm, golden hour"
  props: string[];          // ["Flowers", "Diyas", "Fabric"]
  colorPalette: string[];   // ["#FFD700", "#8B4513"]
  depthOfField: 'shallow' | 'medium' | 'deep';
  ambience: string;         // Overall mood description
}

/**
 * Generate ambient background based on product and context
 */
export function generateAmbientBackground(
  productCategory: string,
  culturalContext: CulturalContext | null,
  visualTheme: string
): AmbientBackground {

  console.log('[Storytelling] Generating ambient background for:', productCategory);

  const categoryLower = productCategory.toLowerCase();
  const themeLower = visualTheme.toLowerCase();

  // Diwali/Festival products
  if (culturalContext?.festival === 'Diwali' || categoryLower.includes('diwali')) {
    return {
      setting: 'Traditional Indian home entrance decorated for Diwali',
      lighting: 'Warm, golden hour with soft diya glow',
      props: ['Marigold flowers', 'Diyas', 'Rangoli powder', 'Decorative fabrics'],
      colorPalette: ['#FFD700', '#FF6B35', '#8B4513', '#FFA500'],
      depthOfField: 'medium',
      ambience: 'Festive, warm, traditional celebration atmosphere'
    };
  }

  // Ganesh products
  if (culturalContext?.festival === 'Ganesh Chaturthi') {
    return {
      setting: 'Home puja room with traditional decorations',
      lighting: 'Soft, warm lighting with incense smoke ambience',
      props: ['Flowers', 'Incense', 'Puja thali', 'Decorative cloth'],
      colorPalette: ['#FFD700', '#FF0000', '#FFA500', '#8B4513'],
      depthOfField: 'shallow',
      ambience: 'Spiritual, peaceful, devotional atmosphere'
    };
  }

  // Home Decor
  if (categoryLower.includes('decor') || categoryLower.includes('home')) {
    if (themeLower.includes('modern') || themeLower.includes('minimal')) {
      return {
        setting: 'Modern minimalist living room with clean lines',
        lighting: 'Bright, natural daylight with soft shadows',
        props: ['Indoor plants', 'Coffee table books', 'Neutral cushions'],
        colorPalette: ['#FFFFFF', '#F5F5F5', '#C0C0C0', '#808080'],
        depthOfField: 'shallow',
        ambience: 'Clean, contemporary, sophisticated atmosphere'
      };
    } else {
      return {
        setting: 'Cozy traditional living room with warm tones',
        lighting: 'Warm, ambient lighting with golden hour glow',
        props: ['Decorative cushions', 'Traditional artifacts', 'Wooden furniture'],
        colorPalette: ['#8B4513', '#D2691E', '#FFD700', '#CD853F'],
        depthOfField: 'medium',
        ambience: 'Warm, inviting, homely atmosphere'
      };
    }
  }

  // Kitchen/Food products
  if (categoryLower.includes('kitchen') || categoryLower.includes('food')) {
    return {
      setting: 'Modern kitchen counter with marble surface',
      lighting: 'Bright, clean lighting with soft fill',
      props: ['Fresh ingredients', 'Utensils', 'Cutting board', 'Herbs'],
      colorPalette: ['#FFFFFF', '#F0F0F0', '#4CAF50', '#FF6B6B'],
      depthOfField: 'shallow',
      ambience: 'Fresh, clean, culinary atmosphere'
    };
  }

  // Jewelry/Fashion
  if (categoryLower.includes('jewelry') || categoryLower.includes('fashion')) {
    return {
      setting: 'Elegant minimalist studio with soft backdrop',
      lighting: 'Soft, diffused lighting with gentle highlights',
      props: ['Velvet fabric', 'Mirror', 'Jewelry box'],
      colorPalette: ['#000000', '#FFFFFF', '#FFD700', '#C0C0C0'],
      depthOfField: 'shallow',
      ambience: 'Elegant, luxurious, premium atmosphere'
    };
  }

  // Professional/B2B
  if (categoryLower.includes('professional') || categoryLower.includes('office')) {
    return {
      setting: 'Clean professional workspace or studio',
      lighting: 'Bright, even lighting with minimal shadows',
      props: ['Clean surface', 'Minimal props', 'Professional backdrop'],
      colorPalette: ['#FFFFFF', '#000000', '#3B82F6', '#10B981'],
      depthOfField: 'medium',
      ambience: 'Professional, trustworthy, quality-focused atmosphere'
    };
  }

  // Default/Generic
  return {
    setting: 'Neutral, well-lit space with clean background',
    lighting: 'Soft, natural lighting with balanced exposure',
    props: ['Minimal decorative elements', 'Clean surface'],
    colorPalette: ['#FFFFFF', '#F5F5F5', '#E0E0E0', '#BDBDBD'],
    depthOfField: 'medium',
    ambience: 'Clean, professional, versatile atmosphere'
  };
}