// src/services/cinematographyService.ts
// Advanced cinematography framework with 12 professional camera movements

import { logger } from './logService';

export enum CameraMovementType {
    STATIC_HERO = 'static_hero',
    PUSH_IN = 'push_in',
    PULL_OUT = 'pull_out',
    ORBITAL = 'orbital',
    TOP_DOWN = 'top_down',
    TRACKING = 'tracking',
    DOLLY_SLIDE = 'dolly_slide',
    CRANE = 'crane',
    HANDHELD_POV = 'handheld_pov',
    MACRO_DETAIL = 'macro_detail',
    WHIP_PAN = 'whip_pan',
    RACK_FOCUS = 'rack_focus'
}

export interface CameraMovement {
    type: CameraMovementType;
    duration: number;
    productVisibility: number; // 0-1 (0-100%)
    description: string;
    technicalNotes: string;
    purpose: string;
}

export type SceneType = 'hero' | 'feature' | 'usage' | 'lifestyle' | 'outro';

/**
 * Camera movement database with professional cinematography specifications
 */
const CAMERA_MOVEMENTS: Record<CameraMovementType, Omit<CameraMovement, 'duration'>> = {
    [CameraMovementType.STATIC_HERO]: {
        type: CameraMovementType.STATIC_HERO,
        productVisibility: 0.8,
        description: 'Static, perfectly framed hero shot of product',
        technicalNotes: 'Locked-off camera, product centered or rule-of-thirds positioned, sharp focus, minimal movement',
        purpose: 'Showcase product beauty and establish visual identity'
    },
    [CameraMovementType.PUSH_IN]: {
        type: CameraMovementType.PUSH_IN,
        productVisibility: 0.75,
        description: 'Slow, smooth push-in towards product',
        technicalNotes: 'Gradual zoom or dolly movement, maintain focus, build intimacy, 2-4 second duration',
        purpose: 'Build emotional connection and draw attention to details'
    },
    [CameraMovementType.PULL_OUT]: {
        type: CameraMovementType.PULL_OUT,
        productVisibility: 0.65,
        description: 'Pull-out reveal showing product in context',
        technicalNotes: 'Start tight on product, smoothly reveal surrounding environment, maintain product in frame',
        purpose: 'Show usage context and lifestyle integration'
    },
    [CameraMovementType.ORBITAL]: {
        type: CameraMovementType.ORBITAL,
        productVisibility: 0.7,
        description: '360-degree orbital rotation around product',
        technicalNotes: 'Circular camera path, product remains centered, constant distance, smooth rotation',
        purpose: 'Display all angles and dimensions of product'
    },
    [CameraMovementType.TOP_DOWN]: {
        type: CameraMovementType.TOP_DOWN,
        productVisibility: 0.6,
        description: 'Top-down flat lay perspective',
        technicalNotes: 'Bird\'s eye view, perfectly vertical angle, symmetrical composition, lifestyle aesthetic',
        purpose: 'Create Instagram-worthy aesthetic and show arrangement'
    },
    [CameraMovementType.TRACKING]: {
        type: CameraMovementType.TRACKING,
        productVisibility: 0.5,
        description: 'Tracking shot following product in use',
        technicalNotes: 'Camera follows subject/product movement, maintain consistent framing, smooth motion',
        purpose: 'Demonstrate product in action and real-world usage'
    },
    [CameraMovementType.DOLLY_SLIDE]: {
        type: CameraMovementType.DOLLY_SLIDE,
        productVisibility: 0.6,
        description: 'Elegant lateral slide revealing product',
        technicalNotes: 'Horizontal camera movement, parallax effect, smooth transition, reveal product gradually',
        purpose: 'Create cinematic reveal and professional polish'
    },
    [CameraMovementType.CRANE]: {
        type: CameraMovementType.CRANE,
        productVisibility: 0.5,
        description: 'Crane up or down for dramatic scale',
        technicalNotes: 'Vertical camera movement, establish or conclude scene, show environment scale',
        purpose: 'Add drama and establish spatial context'
    },
    [CameraMovementType.HANDHELD_POV]: {
        type: CameraMovementType.HANDHELD_POV,
        productVisibility: 0.6,
        description: 'Handheld POV showing user perspective',
        technicalNotes: 'Slight natural shake, first-person view, intimate and relatable, show hands interacting',
        purpose: 'Create personal connection and demonstrate ease of use'
    },
    [CameraMovementType.MACRO_DETAIL]: {
        type: CameraMovementType.MACRO_DETAIL,
        productVisibility: 1.0,
        description: 'Extreme close-up of texture and craftsmanship',
        technicalNotes: 'Macro lens effect, shallow depth of field, highlight texture/material/details',
        purpose: 'Showcase quality, craftsmanship, and premium materials'
    },
    [CameraMovementType.WHIP_PAN]: {
        type: CameraMovementType.WHIP_PAN,
        productVisibility: 0.5,
        description: 'Fast whip pan transition to product',
        technicalNotes: 'Rapid horizontal pan with motion blur, dynamic energy, quick transition between shots',
        purpose: 'Add energy and create dynamic transitions'
    },
    [CameraMovementType.RACK_FOCUS]: {
        type: CameraMovementType.RACK_FOCUS,
        productVisibility: 0.8,
        description: 'Rack focus from background to product',
        technicalNotes: 'Shift focus plane, blur to sharp, draw attention, cinematic depth storytelling',
        purpose: 'Direct viewer attention and create depth'
    }
};

/**
 * Select appropriate camera movements based on scene type and product category
 */
export function selectCameraMovements(
    sceneType: SceneType,
    productCategory: string,
    emotionalBeat: string,
    duration: number = 3
): CameraMovement[] {
    logger.info('Cinematography', `Selecting camera movement for ${sceneType} scene`);

    const movements: CameraMovement[] = [];
    const categoryLower = productCategory.toLowerCase();

    switch (sceneType) {
        case 'hero':
            // Opening hero shot - establish product beauty
            if (categoryLower.includes('jewelry') || categoryLower.includes('decor')) {
                movements.push({ ...CAMERA_MOVEMENTS[CameraMovementType.ORBITAL], duration });
            } else {
                movements.push({ ...CAMERA_MOVEMENTS[CameraMovementType.STATIC_HERO], duration });
            }
            break;

        case 'feature':
            // Feature showcase - highlight details
            movements.push({ ...CAMERA_MOVEMENTS[CameraMovementType.MACRO_DETAIL], duration: duration * 0.6 });
            movements.push({ ...CAMERA_MOVEMENTS[CameraMovementType.PUSH_IN], duration: duration * 0.4 });
            break;

        case 'usage':
            // Product in use - demonstrate application
            if (categoryLower.includes('food') || categoryLower.includes('kitchen')) {
                movements.push({ ...CAMERA_MOVEMENTS[CameraMovementType.TOP_DOWN], duration: duration * 0.5 });
                movements.push({ ...CAMERA_MOVEMENTS[CameraMovementType.HANDHELD_POV], duration: duration * 0.5 });
            } else {
                movements.push({ ...CAMERA_MOVEMENTS[CameraMovementType.TRACKING], duration: duration * 0.6 });
                movements.push({ ...CAMERA_MOVEMENTS[CameraMovementType.HANDHELD_POV], duration: duration * 0.4 });
            }
            break;

        case 'lifestyle':
            // Lifestyle context - show product in environment
            movements.push({ ...CAMERA_MOVEMENTS[CameraMovementType.PULL_OUT], duration: duration * 0.7 });
            movements.push({ ...CAMERA_MOVEMENTS[CameraMovementType.DOLLY_SLIDE], duration: duration * 0.3 });
            break;

        case 'outro':
            // Closing shot - memorable finale
            movements.push({ ...CAMERA_MOVEMENTS[CameraMovementType.RACK_FOCUS], duration: duration * 0.5 });
            movements.push({ ...CAMERA_MOVEMENTS[CameraMovementType.STATIC_HERO], duration: duration * 0.5 });
            break;
    }

    logger.info('Cinematography', `Selected ${movements.length} camera movements for ${sceneType}`);
    return movements;
}

/**
 * Generate detailed camera direction for Runway AI
 */
export function generateCameraDirection(movement: CameraMovement): string {
    return `
CAMERA MOVEMENT: ${movement.description}
TECHNICAL EXECUTION: ${movement.technicalNotes}
DURATION: ${movement.duration} seconds
PRODUCT VISIBILITY TARGET: ${Math.round(movement.productVisibility * 100)}%
PURPOSE: ${movement.purpose}
`.trim();
}

/**
 * Get all available camera movements (for UI selection)
 */
export function getAllCameraMovements(): CameraMovement[] {
    return Object.values(CAMERA_MOVEMENTS).map(movement => ({
        ...movement,
        duration: 3 // Default duration
    }));
}

/**
 * Calculate average product visibility for a sequence of movements
 */
export function calculateAverageVisibility(movements: CameraMovement[]): number {
    if (movements.length === 0) return 0;

    const totalDuration = movements.reduce((sum, m) => sum + m.duration, 0);
    const weightedVisibility = movements.reduce(
        (sum, m) => sum + (m.productVisibility * m.duration),
        0
    );

    return weightedVisibility / totalDuration;
}
