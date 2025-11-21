// Luma AI helper functions for Cloudflare Workers
// API Documentation: https://docs.lumalabs.ai/

interface LumaGenerationRequest {
    prompt: string;
    model: string;
    keyframes?: {
        frame0: {
            type: 'image';
            url: string;
        };
    };
    aspect_ratio?: '16:9' | '9:16' | '4:3' | '3:4' | '21:9' | '9:21';
    loop?: boolean;
}

interface LumaGenerationResponse {
    id: string;
    state: 'queued' | 'dreaming' | 'completed' | 'failed';
    video?: {
        url: string;
        width: number;
        height: number;
        duration: number;
    };
    failure_reason?: string;
    created_at: string;
}

/**
 * Generate a video from an image using Luma AI (Synchronous - waits for completion)
 * WARNING: May timeout on Cloudflare Workers if generation takes > 30-60s
 */
export async function generateLumaVideo(
    imageUrl: string,
    prompt: string,
    apiKey: string
): Promise<string> {
    console.log('[Luma] Starting video generation...');
    console.log('[Luma] Image URL:', imageUrl);
    console.log('[Luma] Prompt:', prompt);

    // Step 1: Create generation
    const generationRequest: LumaGenerationRequest = {
        prompt: prompt,
        model: 'ray-2', // Using Ray 2 model
        keyframes: {
            frame0: {
                type: 'image',
                url: imageUrl
            }
        },
        aspect_ratio: '9:16', // Vertical format for social media
        loop: false
    };

    const createResponse = await fetch('https://api.lumalabs.ai/dream-machine/v1/generations', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(generationRequest)
    });

    if (!createResponse.ok) {
        const errorText = await createResponse.text();
        throw new Error(`Luma generation failed (${createResponse.status}): ${errorText}`);
    }

    const generation: LumaGenerationResponse = await createResponse.json();
    const generationId = generation.id;
    console.log('[Luma] Generation created:', generationId);

    // Step 2: Poll for completion
    // Cloudflare Workers have a limit of 50 subrequests. 
    // We use 30 attempts * 10s = 300s (5 mins) to stay safely under the limit.
    const maxAttempts = 30;
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
        await new Promise(resolve => setTimeout(resolve, 10000)); // Wait 10 seconds

        const statusResponse = await fetch(
            `https://api.lumalabs.ai/dream-machine/v1/generations/${generationId}`,
            {
                headers: {
                    'Authorization': `Bearer ${apiKey}`
                }
            }
        );

        if (!statusResponse.ok) {
            console.warn(`[Luma] Status check failed (${statusResponse.status}), retrying...`);
            continue;
        }

        const status: LumaGenerationResponse = await statusResponse.json();
        console.log(`[Luma] Status (attempt ${attempt + 1}/${maxAttempts}):`, status.state);

        if (status.state === 'completed' && status.video?.url) {
            console.log('[Luma] ✅ Video generation complete!');
            console.log('[Luma] Video URL:', status.video.url);
            return status.video.url;
        }

        if (status.state === 'failed') {
            throw new Error(`Luma generation failed: ${status.failure_reason || 'Unknown error'}`);
        }

        // Continue polling if still queued or dreaming
    }

    throw new Error('Luma generation timeout - video took too long to generate');
}

/**
 * Start a Luma video generation and return the ID immediately (Asynchronous)
 * Use this to avoid Cloudflare Worker timeouts
 */
export async function startLumaGeneration(
    imageUrl: string,
    prompt: string,
    apiKey: string
): Promise<string> {
    console.log('[Luma] Starting video generation (Async)...');

    const generationRequest: LumaGenerationRequest = {
        prompt: prompt,
        model: 'ray-2',
        keyframes: {
            frame0: {
                type: 'image',
                url: imageUrl
            }
        },
        aspect_ratio: '9:16',
        loop: false
    };

    const createResponse = await fetch('https://api.lumalabs.ai/dream-machine/v1/generations', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(generationRequest)
    });

    if (!createResponse.ok) {
        const errorText = await createResponse.text();
        throw new Error(`Luma generation failed (${createResponse.status}): ${errorText}`);
    }

    const generation: LumaGenerationResponse = await createResponse.json();
    console.log('[Luma] Generation started:', generation.id);

    return generation.id;
}

/**
 * Build a prompt for Luma AI based on product information
 */
export function buildLumaPrompt(
    productName: string,
    productType: string,
    visualTheme?: string
): string {
    const basePrompt = `Professional product showcase of ${productName}. `;

    const movements = [
        'Smooth slow zoom in revealing details',
        'Gentle 360-degree rotation',
        'Elegant pan across the product',
        'Subtle dolly movement highlighting features'
    ];

    const lighting = visualTheme?.toLowerCase().includes('premium')
        ? 'Soft studio lighting with elegant shadows'
        : 'Bright, vibrant lighting';

    const randomMovement = movements[Math.floor(Math.random() * movements.length)];

    return `${basePrompt}${randomMovement}. ${lighting}. Professional commercial quality. Clean background. High-end product photography style.`;
}
