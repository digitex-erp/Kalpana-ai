// src/services/productVisibilityService.ts
// Product visibility tracking and 80% rule enforcement

import { logger } from './logService';
import { CameraMovement } from './cinematographyService';

export interface Scene {
    visual: string;
    dialogue: string;
    duration: number;
    cameraMovement?: CameraMovement;
    productVisibility?: number;
    [key: string]: any;
}

export interface VisibilityViolation {
    sceneIndex: number;
    currentVisibility: number;
    requiredVisibility: number;
    severity: 'critical' | 'warning' | 'minor';
    recommendation: string;
}

export interface VisibilityMetrics {
    totalDuration: number;
    productVisibleDuration: number;
    visibilityPercentage: number;
    violations: VisibilityViolation[];
    recommendations: string[];
    passesRule: boolean;
}

/**
 * Calculate product visibility across all scenes
 */
export function calculateProductVisibility(scenes: Scene[]): VisibilityMetrics {
    logger.info('Visibility', `Calculating product visibility for ${scenes.length} scenes`);

    let totalDuration = 0;
    let productVisibleDuration = 0;
    const violations: VisibilityViolation[] = [];

    scenes.forEach((scene, index) => {
        const duration = scene.duration || 3;
        totalDuration += duration;

        // Get visibility from camera movement or default to 0.5
        const visibility = scene.cameraMovement?.productVisibility ?? scene.productVisibility ?? 0.5;
        productVisibleDuration += duration * visibility;

        // Check for violations (scenes with <40% visibility are problematic)
        if (visibility < 0.4) {
            violations.push({
                sceneIndex: index,
                currentVisibility: visibility,
                requiredVisibility: 0.4,
                severity: 'critical',
                recommendation: `Scene ${index + 1}: Product visibility too low (${Math.round(visibility * 100)}%). Use closer camera angles or hero shots.`
            });
        } else if (visibility < 0.6) {
            violations.push({
                sceneIndex: index,
                currentVisibility: visibility,
                requiredVisibility: 0.6,
                severity: 'warning',
                recommendation: `Scene ${index + 1}: Consider increasing product prominence (currently ${Math.round(visibility * 100)}%).`
            });
        }
    });

    const visibilityPercentage = totalDuration > 0 ? productVisibleDuration / totalDuration : 0;
    const passesRule = visibilityPercentage >= 0.8;

    const recommendations: string[] = [];
    if (!passesRule) {
        recommendations.push(
            `Overall visibility is ${Math.round(visibilityPercentage * 100)}%, below 80% target. Add more hero shots or product close-ups.`
        );
    }
    if (violations.filter(v => v.severity === 'critical').length > 0) {
        recommendations.push(
            `${violations.filter(v => v.severity === 'critical').length} scenes have critically low product visibility. Replace with product-focused shots.`
        );
    }

    logger.info('Visibility', `Product visibility: ${Math.round(visibilityPercentage * 100)}% (${passesRule ? 'PASS' : 'FAIL'})`);

    return {
        totalDuration,
        productVisibleDuration,
        visibilityPercentage,
        violations,
        recommendations,
        passesRule
    };
}

/**
 * Enforce 80% visibility rule by adjusting scene durations and types
 */
export function enforceVisibilityRule(
    scenes: Scene[],
    minimumVisibility: number = 0.8
): Scene[] {
    logger.info('Visibility', `Enforcing ${Math.round(minimumVisibility * 100)}% visibility rule`);

    const metrics = calculateProductVisibility(scenes);

    if (metrics.passesRule) {
        logger.info('Visibility', 'Scenes already meet visibility requirements');
        return scenes;
    }

    // Strategy: Increase duration of high-visibility scenes, decrease low-visibility scenes
    const adjustedScenes = scenes.map((scene, index) => {
        const visibility = scene.cameraMovement?.productVisibility ?? scene.productVisibility ?? 0.5;

        if (visibility >= 0.7) {
            // High visibility scenes: increase duration by 20%
            return {
                ...scene,
                duration: Math.min(scene.duration * 1.2, 5) // Cap at 5 seconds
            };
        } else if (visibility < 0.5) {
            // Low visibility scenes: decrease duration by 30%
            return {
                ...scene,
                duration: Math.max(scene.duration * 0.7, 1.5) // Minimum 1.5 seconds
            };
        }

        return scene;
    });

    // Verify adjustment worked
    const newMetrics = calculateProductVisibility(adjustedScenes);

    if (newMetrics.passesRule) {
        logger.info('Visibility', `Successfully adjusted to ${Math.round(newMetrics.visibilityPercentage * 100)}% visibility`);
        return adjustedScenes;
    }

    // If still not passing, add a hero shot at the beginning
    logger.info('Visibility', 'Adding additional hero shot to meet visibility target');

    return [
        {
            visual: 'Hero shot of product, beautifully lit and centered in frame',
            dialogue: '',
            duration: 2,
            productVisibility: 0.9,
            cameraMovement: {
                type: 'static_hero' as any,
                duration: 2,
                productVisibility: 0.9,
                description: 'Static hero shot',
                technicalNotes: 'Locked camera, product centered',
                purpose: 'Establish product presence'
            }
        },
        ...adjustedScenes
    ];
}

/**
 * Get visibility recommendations for improving a storyboard
 */
export function getVisibilityRecommendations(scenes: Scene[]): string[] {
    const metrics = calculateProductVisibility(scenes);
    const recommendations: string[] = [];

    // Overall visibility
    if (metrics.visibilityPercentage < 0.8) {
        recommendations.push(
            `📊 Overall product visibility: ${Math.round(metrics.visibilityPercentage * 100)}% (Target: 80%+)`
        );
        recommendations.push(
            `💡 Add ${Math.ceil((0.8 - metrics.visibilityPercentage) * metrics.totalDuration)} more seconds of product-focused shots`
        );
    } else {
        recommendations.push(
            `✅ Product visibility: ${Math.round(metrics.visibilityPercentage * 100)}% - Meets 80% target!`
        );
    }

    // Scene-specific violations
    const criticalViolations = metrics.violations.filter(v => v.severity === 'critical');
    if (criticalViolations.length > 0) {
        recommendations.push(
            `⚠️ ${criticalViolations.length} scene(s) with critically low product visibility:`
        );
        criticalViolations.forEach(v => {
            recommendations.push(`   - ${v.recommendation}`);
        });
    }

    // Suggested improvements
    if (!metrics.passesRule) {
        recommendations.push(`\n🎬 Suggested Improvements:`);
        recommendations.push(`   - Replace wide/ambient shots with product close-ups`);
        recommendations.push(`   - Use macro detail shots to showcase craftsmanship`);
        recommendations.push(`   - Add orbital or push-in movements for dynamic product focus`);
        recommendations.push(`   - Ensure product occupies 60-80% of frame in hero shots`);
    }

    return recommendations;
}

/**
 * Validate scene meets minimum visibility requirements
 */
export function validateScene(scene: Scene, minimumVisibility: number = 0.4): boolean {
    const visibility = scene.cameraMovement?.productVisibility ?? scene.productVisibility ?? 0.5;
    return visibility >= minimumVisibility;
}

/**
 * Get visibility status with color coding for UI
 */
export function getVisibilityStatus(visibilityPercentage: number): {
    status: 'excellent' | 'good' | 'warning' | 'critical';
    color: string;
    message: string;
} {
    if (visibilityPercentage >= 0.85) {
        return {
            status: 'excellent',
            color: '#10B981', // Green
            message: 'Excellent product visibility!'
        };
    } else if (visibilityPercentage >= 0.8) {
        return {
            status: 'good',
            color: '#3B82F6', // Blue
            message: 'Good product visibility'
        };
    } else if (visibilityPercentage >= 0.7) {
        return {
            status: 'warning',
            color: '#F59E0B', // Orange
            message: 'Product visibility below target'
        };
    } else {
        return {
            status: 'critical',
            color: '#EF4444', // Red
            message: 'Critical: Product visibility too low'
        };
    }
}
