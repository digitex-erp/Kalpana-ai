// src/services/ecgMarketingService.ts
// ECG (Emotional Connection Generation) Marketing Service
// Optimized for viral social media videos

import { logger } from './logService';

export interface EmotionalTrigger {
    primary: string;      // Main emotion (joy, nostalgia, aspiration, trust)
    secondary: string[];  // Supporting emotions
    intensity: number;    // 1-10 scale
}

export interface ViralHook {
    type: 'question' | 'shock' | 'curiosity' | 'emotion' | 'benefit';
    text: string;
    duration: number;     // Seconds to hold attention
    visualCue: string;    // What to show
}

export interface SocialProofElement {
    type: 'testimonial' | 'stats' | 'trending' | 'celebrity' | 'ugc';
    message: string;
    credibility: number;  // 1-10 scale
}

export interface ECGStrategy {
    emotionalTriggers: EmotionalTrigger;
    viralHooks: ViralHook[];
    socialProof: SocialProofElement[];
    callToAction: string;
    shareability: number;     // 1-10 score
    platformOptimization: {
        instagram: string[];    // Reels-specific tactics
        facebook: string[];     // FB-specific tactics
        youtube: string[];      // Shorts-specific tactics
    };
}

/**
 * Generate ECG marketing strategy for product
 */
export function generateECGStrategy(
    productName: string,
    category: string,
    targetAudience: 'B2B' | 'B2C',
    platform: 'instagram' | 'facebook' | 'youtube' | 'all',
    culturalContext: any = null
): ECGStrategy {

    logger.info('ECG', `Generating viral marketing strategy for ${productName} on ${platform}`);

    const categoryLower = category.toLowerCase();
    const nameLower = productName.toLowerCase();

    // Detect product characteristics
    const isFestival = nameLower.includes('diwali') || nameLower.includes('rangoli') ||
        nameLower.includes('ganesh') || culturalContext?.festival;
    const isDecor = categoryLower.includes('decor') || categoryLower.includes('sticker');
    const isTraditional = culturalContext !== null;

    // 1. Determine Emotional Triggers
    const emotionalTriggers = determineEmotionalTriggers(
        productName,
        category,
        targetAudience,
        isFestival,
        isTraditional
    );

    // 2. Generate Viral Hooks
    const viralHooks = generateViralHooks(
        productName,
        category,
        targetAudience,
        emotionalTriggers,
        isFestival
    );

    // 3. Create Social Proof Elements
    const socialProof = generateSocialProof(
        productName,
        category,
        targetAudience,
        isFestival
    );

    // 4. Generate CTA
    const callToAction = generateViralCTA(
        productName,
        targetAudience,
        platform,
        emotionalTriggers.primary
    );

    // 5. Calculate Shareability Score
    const shareability = calculateShareability(
        emotionalTriggers,
        viralHooks,
        socialProof,
        isFestival
    );

    // 6. Platform-Specific Optimizations
    const platformOptimization = generatePlatformOptimizations(
        platform,
        emotionalTriggers,
        isFestival,
        isDecor
    );

    logger.info('ECG', `Strategy generated with ${viralHooks.length} hooks, shareability: ${shareability}/10`);

    return {
        emotionalTriggers,
        viralHooks,
        socialProof,
        callToAction,
        shareability,
        platformOptimization
    };
}

/**
 * Determine primary and secondary emotional triggers
 */
function determineEmotionalTriggers(
    productName: string,
    category: string,
    targetAudience: 'B2B' | 'B2C',
    isFestival: boolean,
    isTraditional: boolean
): EmotionalTrigger {

    if (targetAudience === 'B2B') {
        return {
            primary: 'trust',
            secondary: ['confidence', 'growth', 'partnership'],
            intensity: 7
        };
    }

    if (isFestival) {
        return {
            primary: 'joy',
            secondary: ['nostalgia', 'tradition', 'celebration', 'family'],
            intensity: 9
        };
    }

    if (isTraditional) {
        return {
            primary: 'nostalgia',
            secondary: ['pride', 'heritage', 'authenticity'],
            intensity: 8
        };
    }

    // Default: Aspiration
    return {
        primary: 'aspiration',
        secondary: ['transformation', 'pride', 'satisfaction'],
        intensity: 7
    };
}

/**
 * Generate viral hooks for first 3 seconds
 */
function generateViralHooks(
    productName: string,
    category: string,
    targetAudience: 'B2B' | 'B2C',
    emotionalTriggers: EmotionalTrigger,
    isFestival: boolean
): ViralHook[] {

    const hooks: ViralHook[] = [];

    if (targetAudience === 'B2B') {
        hooks.push({
            type: 'benefit',
            text: `Want to 10X your sales? This product sells itself!`,
            duration: 3,
            visualCue: 'Product with profit graph overlay'
        });
        hooks.push({
            type: 'question',
            text: `Why are 500+ retailers stocking ${productName}?`,
            duration: 3,
            visualCue: 'Multiple stores with product'
        });
    } else if (isFestival) {
        hooks.push({
            type: 'emotion',
            text: `This Diwali tradition will make you cry happy tears 😭✨`,
            duration: 3,
            visualCue: 'Family gathering around product'
        });
        hooks.push({
            type: 'curiosity',
            text: `The secret to the PERFECT Diwali decoration? Watch this!`,
            duration: 3,
            visualCue: 'Before/after transformation'
        });
        hooks.push({
            type: 'shock',
            text: `You've been doing Diwali decorations WRONG! Here's why...`,
            duration: 3,
            visualCue: 'Common mistake vs. correct way'
        });
    } else {
        hooks.push({
            type: 'question',
            text: `Why is everyone obsessed with ${productName}?`,
            duration: 3,
            visualCue: 'Product close-up with trending badge'
        });
        hooks.push({
            type: 'benefit',
            text: `Transform your space in 60 seconds! Watch this...`,
            duration: 3,
            visualCue: 'Fast-motion transformation'
        });
        hooks.push({
            type: 'curiosity',
            text: `The home decor hack nobody talks about 🤫`,
            duration: 3,
            visualCue: 'Product reveal with surprise effect'
        });
    }

    return hooks;
}

/**
 * Generate social proof elements
 */
function generateSocialProof(
    productName: string,
    category: string,
    targetAudience: 'B2B' | 'B2C',
    isFestival: boolean
): SocialProofElement[] {

    const proof: SocialProofElement[] = [];

    if (targetAudience === 'B2B') {
        proof.push({
            type: 'stats',
            message: 'Trusted by 500+ retailers across India',
            credibility: 9
        });
        proof.push({
            type: 'testimonial',
            message: '"Our customers love this! Repeat orders every month" - Mumbai Retailer',
            credibility: 8
        });
    } else if (isFestival) {
        proof.push({
            type: 'trending',
            message: '10,000+ families celebrated with this',
            credibility: 9
        });
        proof.push({
            type: 'ugc',
            message: 'See what customers are creating! 📸',
            credibility: 10
        });
    } else {
        proof.push({
            type: 'stats',
            message: 'Rated 4.8★ by 5,000+ happy customers',
            credibility: 9
        });
        proof.push({
            type: 'trending',
            message: 'Trending in Home Decor #1',
            credibility: 8
        });
    }

    return proof;
}

/**
 * Generate viral call-to-action
 */
function generateViralCTA(
    productName: string,
    targetAudience: 'B2B' | 'B2C',
    platform: string,
    primaryEmotion: string
): string {

    if (targetAudience === 'B2B') {
        return '📞 DM us "WHOLESALE" to stock this bestseller!';
    }

    if (platform === 'instagram') {
        return '💖 Double tap if you want this! Link in bio 👆';
    } else if (platform === 'facebook') {
        return '👉 Tag someone who needs this! Shop now ⬇️';
    } else if (platform === 'youtube') {
        return '👍 Like & Subscribe for more! Link in description 📝';
    }

    // Default
    return '✨ Get yours now! Limited stock! 🔥';
}

/**
 * Calculate shareability score (1-10)
 */
function calculateShareability(
    emotionalTriggers: EmotionalTrigger,
    viralHooks: ViralHook[],
    socialProof: SocialProofElement[],
    isFestival: boolean
): number {

    let score = 5; // Base score

    // High-intensity emotions boost shareability
    if (emotionalTriggers.intensity >= 8) score += 2;
    else if (emotionalTriggers.intensity >= 6) score += 1;

    // Multiple viral hooks increase chances
    if (viralHooks.length >= 3) score += 1;

    // Strong social proof helps
    const avgCredibility = socialProof.reduce((sum, p) => sum + p.credibility, 0) / socialProof.length;
    if (avgCredibility >= 8) score += 1;

    // Festival content is highly shareable
    if (isFestival) score += 1;

    return Math.min(10, score);
}

/**
 * Generate platform-specific optimizations
 */
function generatePlatformOptimizations(
    platform: string,
    emotionalTriggers: EmotionalTrigger,
    isFestival: boolean,
    isDecor: boolean
): { instagram: string[]; facebook: string[]; youtube: string[] } {

    const optimizations = {
        instagram: [] as string[],
        facebook: [] as string[],
        youtube: [] as string[]
    };

    // Instagram Reels Optimizations
    optimizations.instagram = [
        '🎵 Use trending audio for algorithm boost',
        '📱 Vertical 9:16 format, text-heavy for sound-off viewing',
        '⚡ Hook in first 1 second, keep under 15 seconds',
        '🏷️ Use 5-10 hashtags: #homedecor #diwali #trending',
        '💬 Add poll sticker "Which color?" to boost engagement',
        '🔄 End with "Follow for more" + product link in bio'
    ];

    // Facebook Optimizations
    optimizations.facebook = [
        '👥 Tag friends feature: "Tag 3 friends who need this"',
        '📝 Longer captions work (100-150 words) with story',
        '🎯 Use Facebook Groups for niche targeting',
        '💰 Add "Shop Now" button for direct purchase',
        '📊 Post at 1-3 PM for maximum reach',
        '🔗 Share to relevant groups (home decor, festival prep)'
    ];

    // YouTube Shorts Optimizations
    optimizations.youtube = [
        '🎬 First frame must be eye-catching thumbnail',
        '⏱️ Keep under 60 seconds, ideal 30-45 seconds',
        '📝 SEO-optimized title with keywords',
        '💬 Pin comment asking question to boost engagement',
        '🔔 End with "Subscribe for more product reviews"',
        '🔗 Add product link in description + pinned comment'
    ];

    // Festival-specific additions
    if (isFestival) {
        optimizations.instagram.push('🪔 Use Diwali/festival stickers and filters');
        optimizations.facebook.push('🎉 Create Facebook Event for festival prep');
        optimizations.youtube.push('🎊 Add to "Festival Decor" playlist');
    }

    return optimizations;
}

/**
 * Get emotion-specific visual cues
 */
export function getEmotionVisualCues(emotion: string): {
    colors: string[];
    pacing: string;
    music: string;
    cameraMovement: string;
} {

    const cues: Record<string, any> = {
        joy: {
            colors: ['bright yellow', 'orange', 'vibrant red'],
            pacing: 'fast, energetic',
            music: 'upbeat, celebratory',
            cameraMovement: 'dynamic, sweeping'
        },
        nostalgia: {
            colors: ['warm sepia', 'golden hour', 'soft pastels'],
            pacing: 'slow, contemplative',
            music: 'traditional, instrumental',
            cameraMovement: 'slow pan, gentle zoom'
        },
        aspiration: {
            colors: ['gold', 'silver', 'elegant whites'],
            pacing: 'medium, building',
            music: 'inspiring, uplifting',
            cameraMovement: 'rising crane, reveal'
        },
        trust: {
            colors: ['blue', 'green', 'professional grays'],
            pacing: 'steady, confident',
            music: 'professional, reassuring',
            cameraMovement: 'stable, static'
        }
    };

    return cues[emotion] || cues.aspiration;
}

/**
 * Generate hashtag strategy
 */
export function generateHashtagStrategy(
    productName: string,
    category: string,
    platform: string,
    isFestival: boolean
): string[] {

    const hashtags: string[] = [];

    // Product-specific
    hashtags.push(`#${productName.replace(/\s+/g, '')}`);
    hashtags.push(`#${category.replace(/\s+/g, '')}`);

    // Category-based
    if (category.toLowerCase().includes('decor')) {
        hashtags.push('#homedecor', '#interiordesign', '#homeaesthetic');
    }
    if (category.toLowerCase().includes('sticker')) {
        hashtags.push('#wallstickers', '#walldecor', '#homedecoration');
    }

    // Festival-specific
    if (isFestival) {
        hashtags.push('#diwali', '#diwali2025', '#festivevibes', '#indianfestival');
    }

    // Platform-specific
    if (platform === 'instagram') {
        hashtags.push('#reels', '#trending', '#viral', '#explorepage');
    } else if (platform === 'youtube') {
        hashtags.push('#shorts', '#youtubeshorts', '#viral');
    }

    // General engagement
    hashtags.push('#shopnow', '#musthave', '#trending2025');

    return hashtags.slice(0, 15); // Max 15 hashtags
}
