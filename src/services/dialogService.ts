// src/services/dialogService.ts
// Persuasive copywriting and dialog generation service

import { logger } from './logService';
import { CulturalContext } from './storytellingService';

export interface PersuasiveDialog {
    hook: string;              // Attention-grabbing opening
    benefit: string;           // Primary benefit statement
    features: string[];        // 2-3 key features
    socialProof: string;       // Credibility element
    callToAction: string;      // Closing statement
    emotionalTrigger: string;  // Desire/aspiration element
}

export interface DialogVariation {
    english: string;
    hindi: string;
    hinglish: string;
}

export type Language = 'english' | 'hindi' | 'hinglish';
export type TargetAudience = 'B2B' | 'B2C';

/**
 * Generate persuasive dialog using AIDA framework
 * (Attention, Interest, Desire, Action)
 */
export function generatePersuasiveDialog(
    productName: string,
    category: string,
    targetAudience: TargetAudience,
    language: Language,
    culturalContext: CulturalContext | null
): PersuasiveDialog {
    logger.info('Dialog', `Generating persuasive copy for ${productName} (${targetAudience}, ${language})`);

    const categoryLower = category.toLowerCase();
    const nameLower = productName.toLowerCase();

    // Detect product characteristics
    const isFestival = nameLower.includes('diwali') || nameLower.includes('rangoli') ||
        nameLower.includes('diya') || culturalContext?.festival;
    const isDecor = categoryLower.includes('decor') || categoryLower.includes('decoration');
    const isHandmade = nameLower.includes('handmade') || nameLower.includes('hand') ||
        nameLower.includes('craft');
    const isTraditional = culturalContext !== null;

    let dialog: PersuasiveDialog;

    if (targetAudience === 'B2B') {
        // B2B: Focus on ROI, quality, profit potential
        dialog = {
            hook: `Premium ${productName} - Your customers' top choice`,
            benefit: `High-margin product with proven market demand and repeat purchase rate`,
            features: [
                'Premium quality that justifies higher price points',
                'Consistent supply and reliable delivery',
                'Ready-to-sell packaging and marketing support'
            ],
            socialProof: 'Trusted by 500+ retailers across India',
            callToAction: 'Stock up now for peak season demand',
            emotionalTrigger: 'Build customer loyalty with products they love'
        };
    } else if (isFestival) {
        // Festival products: Tradition, celebration, joy
        dialog = {
            hook: `Transform your ${culturalContext?.festival || 'celebration'} with ${productName}`,
            benefit: 'Bring centuries of tradition to your home in minutes',
            features: [
                isHandmade ? 'Authentic handcrafted artistry' : 'Intricate traditional design',
                'Ready to use, stunning for days',
                'Perfect for puja and decoration'
            ],
            socialProof: culturalContext ? `Celebrate ${culturalContext.tradition} with authentic beauty` : 'Loved by thousands of families',
            callToAction: 'Make this festival unforgettable',
            emotionalTrigger: 'Create memories that last a lifetime'
        };
    } else if (isDecor) {
        // Home decor: Transformation, aesthetics, lifestyle
        dialog = {
            hook: `Elevate your space with ${productName}`,
            benefit: 'Transform any room from ordinary to extraordinary',
            features: [
                'Premium materials and expert craftsmanship',
                'Versatile design that complements any style',
                'Easy to place, impossible to ignore'
            ],
            socialProof: 'Featured in top home decor collections',
            callToAction: 'Upgrade your home aesthetic today',
            emotionalTrigger: 'Live in the space you deserve'
        };
    } else {
        // Generic products: Problem-solution, quality, value
        dialog = {
            hook: `Discover the difference with ${productName}`,
            benefit: 'Quality you can see, value you can feel',
            features: [
                'Designed for everyday excellence',
                'Durable materials that last',
                'Thoughtful details that matter'
            ],
            socialProof: 'Rated 4.5+ stars by thousands',
            callToAction: 'Experience the quality difference',
            emotionalTrigger: 'You deserve the best'
        };
    }

    logger.info('Dialog', `Generated persuasive dialog with hook: "${dialog.hook.substring(0, 40)}..."`);
    return dialog;
}

/**
 * Generate scene-specific dialog (for storyboard scenes)
 */
export function generateSceneDialog(
    sceneType: 'hook' | 'feature' | 'usage' | 'lifestyle' | 'outro',
    persuasiveDialog: PersuasiveDialog,
    language: Language
): DialogVariation {
    let english = '';
    let hindi = '';
    let hinglish = '';

    switch (sceneType) {
        case 'hook':
            english = persuasiveDialog.hook;
            hindi = translateToHindi(persuasiveDialog.hook, 'hook');
            hinglish = createHinglish(persuasiveDialog.hook, 'hook');
            break;

        case 'feature':
            english = persuasiveDialog.benefit + '. ' + persuasiveDialog.features[0];
            hindi = translateToHindi(english, 'feature');
            hinglish = createHinglish(english, 'feature');
            break;

        case 'usage':
            english = persuasiveDialog.features.slice(1).join('. ') + '. ' + persuasiveDialog.emotionalTrigger;
            hindi = translateToHindi(english, 'usage');
            hinglish = createHinglish(english, 'usage');
            break;

        case 'lifestyle':
            english = persuasiveDialog.socialProof;
            hindi = translateToHindi(persuasiveDialog.socialProof, 'lifestyle');
            hinglish = createHinglish(persuasiveDialog.socialProof, 'lifestyle');
            break;

        case 'outro':
            english = persuasiveDialog.callToAction;
            hindi = translateToHindi(persuasiveDialog.callToAction, 'outro');
            hinglish = createHinglish(persuasiveDialog.callToAction, 'outro');
            break;
    }

    return { english, hindi, hinglish };
}

/**
 * Translate to Hindi with cultural sensitivity
 * Note: This is a simplified version. In production, use proper translation API
 */
function translateToHindi(text: string, context: string): string {
    // Common translations for product video context
    const translations: Record<string, string> = {
        'Transform your': 'अपने',
        'Elevate your space': 'अपने घर को सजाएं',
        'Discover the difference': 'फर्क महसूस करें',
        'Premium quality': 'उच्च गुणवत्ता',
        'Handcrafted': 'हस्तनिर्मित',
        'Traditional design': 'पारंपरिक डिज़ाइन',
        'Perfect for': 'के लिए बिल्कुल सही',
        'Make this festival unforgettable': 'इस त्योहार को यादगार बनाएं',
        'Experience the quality': 'गुणवत्ता का अनुभव करें',
        'You deserve the best': 'आप सर्वश्रेष्ठ के हकदार हैं'
    };

    // Simple replacement (in production, use proper translation)
    let translated = text;
    Object.entries(translations).forEach(([eng, hin]) => {
        translated = translated.replace(new RegExp(eng, 'gi'), hin);
    });

    return translated;
}

/**
 * Create Hinglish (Hindi-English mix) for younger audiences
 */
function createHinglish(text: string, context: string): string {
    // Mix English and Hindi for modern appeal
    const hinglishPatterns: Record<string, string> = {
        'Transform your': 'Apne',
        'Elevate your space': 'Apne ghar ko elevate karein',
        'Discover the difference': 'Difference feel karein',
        'Premium quality': 'Premium quality',
        'Handcrafted': 'Handcrafted',
        'Perfect for': 'Perfect hai',
        'Make this festival unforgettable': 'Is festival ko unforgettable banayein',
        'Experience the quality': 'Quality experience karein'
    };

    let hinglish = text;
    Object.entries(hinglishPatterns).forEach(([eng, hing]) => {
        hinglish = hinglish.replace(new RegExp(eng, 'gi'), hing);
    });

    return hinglish;
}

/**
 * Apply copywriting best practices to dialog
 */
export function enhanceDialog(dialog: string, style: 'benefit-first' | 'sensory' | 'urgent' | 'social'): string {
    switch (style) {
        case 'benefit-first':
            // Lead with benefit, not feature
            return dialog.replace(/^(This|The|A) /, 'Get ').replace(/has|features/, 'gives you');

        case 'sensory':
            // Add sensory language
            const sensoryWords = ['stunning', 'beautiful', 'elegant', 'vibrant', 'exquisite', 'radiant'];
            const randomSensory = sensoryWords[Math.floor(Math.random() * sensoryWords.length)];
            return dialog.replace(/product|item/, randomSensory + ' piece');

        case 'urgent':
            // Create urgency
            const urgencyPhrases = ['Limited time', 'Seasonal special', 'While stocks last', 'Don\'t miss'];
            const randomUrgency = urgencyPhrases[Math.floor(Math.random() * urgencyPhrases.length)];
            return randomUrgency + ': ' + dialog;

        case 'social':
            // Add social proof
            const socialPhrases = ['Loved by thousands', 'Customer favorite', 'Trending now', 'Best-seller'];
            const randomSocial = socialPhrases[Math.floor(Math.random() * socialPhrases.length)];
            return dialog + '. ' + randomSocial + '.';

        default:
            return dialog;
    }
}

/**
 * Get dialog length in characters (for subtitle timing)
 */
export function getDialogDuration(dialog: string, wordsPerSecond: number = 2.5): number {
    const words = dialog.split(/\s+/).length;
    return Math.ceil(words / wordsPerSecond);
}
