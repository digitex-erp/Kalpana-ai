// functions/api/generate-script-and-video.ts
// Cloudflare Workers-compatible version
import {
    uploadImageToCloudinary,
    uploadVideoToCloudinary,
    combineVideoClipsUrl,
    generateCloudinaryUrl
} from './cloudinary-helpers';

// Cloudflare Pages environment interface
interface Env {
    CLOUDINARY_CLOUD_NAME: string;
    CLOUDINARY_API_KEY: string;
    CLOUDINARY_API_SECRET: string;
    RUNWAY_API_KEY: string;
}



/**
 * Combines multiple video clips into a single video using Cloudinary's transformations.
 * @param clipPublicIds - An array of Cloudinary public_ids for the video clips.
 * @param audioPublicId - An optional public_id for a background audio track.
 * @param clipDuration - The duration of each individual clip.
 * @returns A URL for the final concatenated video.
 */
async function combineVideoClipsWithCloudinary(
    clipPublicIds: string[],
    cloudName: string,
    audioPublicId?: string,
    clipDuration: number = 5
): Promise<string> {
    console.log(`[Cloudinary] Combining ${clipPublicIds.length} clips...`);

    // Use the helper function which doesn't need SDK
    const finalVideoUrl = combineVideoClipsUrl(clipPublicIds, cloudName, audioPublicId, clipDuration);

    console.log('[Cloudinary] ✅ Final dynamic video URL generated.');
    return finalVideoUrl;
}


// Validate and normalize image URL
async function validateAndNormalizeImageUrl(imageUrl: string): Promise<string> {
    if (!imageUrl || typeof imageUrl !== 'string') {
        throw new Error('Image URL is missing or invalid.');
    }

    if (imageUrl.startsWith('data:image/')) {
        return imageUrl;
    }

    if (imageUrl.startsWith('https://')) {
        return imageUrl;
    }

    if (imageUrl.startsWith('http://')) {
        return imageUrl.replace('http://', 'https://');
    }

    if (imageUrl.startsWith('//res.cloudinary.com')) {
        return 'https:' + imageUrl;
    }

    throw new Error(`Invalid image URL format: ${imageUrl.substring(0, 50)}...`);
}

// Upload images to Cloudinary using Workers-compatible helper
async function uploadImageToCloudinaryWrapper(
    base64DataUrl: string,
    cloudName: string,
    apiKey: string,
    apiSecret: string
): Promise<string> {
    if (!base64DataUrl || !base64DataUrl.startsWith('data:image/')) {
        throw new Error('Invalid base64 data URL for upload.');
    }
    try {
        const result = await uploadImageToCloudinary(
            base64DataUrl,
            cloudName,
            apiKey,
            apiSecret,
            'kalpana-runway-assets'
        );
        console.log(`[Cloudinary] ✅ Upload successful: ${result.secure_url}`);
        return result.secure_url;
    } catch (error: any) {
        console.error('[Cloudinary] ❌ Image upload for Runway failed:', error.message);
        throw new Error(`Failed to upload image to Cloudinary: ${error.message}`);
    }
}


// Detect product physical form and usage type
function analyzeProductType(projectData: any): {
    productForm: string;
    usageType: string;
    materialType: string;
    demonstrationType: string;
} {
    const analysis = projectData?.analysisReport || {};
    const product = projectData?.product || {};
    const productName = (product.name || '').toLowerCase();
    const category = (analysis.category || '').toLowerCase();
    const summary = (analysis.inspirationSummary || '').toLowerCase();

    console.log('[Analysis] Detecting product type from:', productName);

    const isFlatProduct =
        (productName.includes('sticker') && !productName.includes('swastik') && !productName.includes('meenakari')) ||
        productName.includes('decal') ||
        productName.includes('poster') ||
        productName.includes('print') ||
        productName.includes('card') ||
        productName.includes('mat') ||
        productName.includes('sheet') ||
        (summary.includes('peel') && summary.includes('stick')) ||
        (summary.includes('adhesive') && summary.includes('backing')) ||
        category.toLowerCase().includes('sticker') ||
        category.toLowerCase().includes('decal');

    const isMetalDecorative =
        productName.includes('meenakari') ||
        productName.includes('metal') ||
        productName.includes('brass') ||
        productName.includes('copper') ||
        (productName.includes('swastik') && !productName.includes('sticker')) ||
        productName.includes('decorative') ||
        category.includes('metal') ||
        category.includes('brass') ||
        category.includes('decorative') ||
        summary.includes('enamel') ||
        summary.includes('metallic');

    const isWearable =
        category.includes('apparel') ||
        category.includes('clothing') ||
        category.includes('jewelry') ||
        productName.includes('shirt') ||
        productName.includes('dress') ||
        productName.includes('bracelet') ||
        productName.includes('necklace');

    let materialType = 'standard';
    if (productName.includes('pvc') || summary.includes('pvc')) materialType = 'pvc';
    if (productName.includes('vinyl')) materialType = 'vinyl';
    if (productName.includes('paper')) materialType = 'paper';
    if (productName.includes('metal')) materialType = 'metal';
    if (productName.includes('wood')) materialType = 'wood';
    if (productName.includes('fabric')) materialType = 'fabric';

    let productForm = 'physical-3d';
    if (isFlatProduct && !isMetalDecorative) {
        productForm = 'flat-2d';
    } else if (isMetalDecorative) {
        productForm = 'decorative-3d';
    } else if (isWearable) {
        productForm = 'wearable';
    }

    let usageType = 'hold-and-use';
    if (isFlatProduct && (summary.includes('floor') || summary.includes('ground'))) {
        usageType = 'peel-and-stick-floor';
    } else if (isFlatProduct && summary.includes('wall')) {
        usageType = 'peel-and-stick-wall';
    } else if (isFlatProduct) {
        usageType = 'peel-and-stick';
    } else if (isWearable) {
        usageType = 'wear';
    } else if (isMetalDecorative) {
        usageType = 'display-decorative';
    }

    let demonstrationType = 'hands-using';
    if (usageType.includes('peel-and-stick')) {
        demonstrationType = 'hands-peeling-placing';
    } else if (isWearable) {
        demonstrationType = 'model-wearing';
    } else if (isMetalDecorative) {
        demonstrationType = 'hands-displaying';
    }

    const result = { productForm, usageType, materialType, demonstrationType };
    console.log('[Analysis] Product type detected:', result);
    return result;
}

// Build story-driven prompt
function buildStoryDrivenPrompt(
    productName: string,
    productType: any,
    projectData: any,
    duration: number,
    clipNumber?: number
): string {

    console.log('[Story Prompt] Building narrative-driven prompt...');

    const storyboard = projectData?.storyboard;
    const scenes = storyboard?.scenes || [];
    const culturalContext = storyboard?.culturalContext;
    const narrativeStyle = storyboard?.narrativeStyle;

    const sceneIndex = clipNumber ? clipNumber - 1 : 0;
    const focusScene = scenes[sceneIndex] || scenes[0];

    if (!focusScene || !focusScene.visual) {
        console.warn('[Story Prompt] No valid scene found, using generic prompt');
        return `A professional ${duration}s video of ${productName}.`;
    }

    console.log('[Story Prompt] Focus scene emotion:', focusScene.emotion);

    let prompt = '';

    if (narrativeStyle) {
        prompt += `${narrativeStyle}. `;
    }

    if (culturalContext && sceneIndex === 0) {
        prompt += `${culturalContext.tradition} context. ${culturalContext.symbolism}. `;
    }

    prompt += `${focusScene.visual} `;

    if (productType.productForm === 'flat-2d') {
        prompt += `The product is a flat ${productName}. Show as completely flat with no 3D depth. `;
    } else if (productType.productForm === 'decorative-3d') {
        prompt += `The product is a decorative ${productName}. Show craftsmanship and ornamental details. `;
    }

    if (focusScene.emotion) {
        prompt += `Evoke a feeling of ${focusScene.emotion}. `;
    }

    if (focusScene.cameraAngle) {
        prompt += `Use a ${focusScene.cameraAngle}. `;
    }

    prompt += `The product should be the clear focus. `;
    prompt += `${duration}s professional video. Cinematic quality.`;

    console.log('[Story Prompt] Final prompt length:', prompt.length);

    if (prompt.length > 900) {
        console.warn('[Story Prompt] Prompt too long, condensing...');
        prompt = prompt.substring(0, 850) + '... Professional demonstration.';
    }

    return prompt;
}

// Runway video generation with polling
async function generateRunwayVideo(prompt: string, imageUrl: string, referenceImages: string[], apiKey: string, duration: number): Promise<string> {
    const model = 'gen4_turbo';
    const ratio = '720:1280';

    const runwayImageInput = await validateAndNormalizeImageUrl(imageUrl);

    const requestBody: any = {
        promptImage: runwayImageInput,
        promptText: prompt,
        model,
        duration,
        ratio,
    };

    if (referenceImages && referenceImages.length > 0) {
        requestBody.references = await Promise.all(referenceImages.map(async (imgUrl: string) => ({
            type: 'image',
            uri: await validateAndNormalizeImageUrl(imgUrl)
        })));
    }

    console.log('[Runway] Starting generation with config:', { model, duration, ratio, promptLength: prompt.length, referenceImagesCount: referenceImages.length });

    const createResponse = await fetch('https://api.dev.runwayml.com/v1/image_to_video', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json', 'X-Runway-Version': '2024-11-06' },
        body: JSON.stringify(requestBody)
    });

    if (!createResponse.ok) {
        const errorText = await createResponse.text();
        throw new Error(`Runway API error (${createResponse.status}): ${errorText}`);
    }

    const taskData = await createResponse.json();
    const taskId = taskData.id;

    console.log('[Runway] ✅ Task created:', taskId);

    for (let attempt = 1; attempt <= 120; attempt++) {
        await new Promise(resolve => setTimeout(resolve, 5000));
        const statusResponse = await fetch(`https://api.dev.runwayml.com/v1/tasks/${taskId}`, {
            headers: { 'Authorization': `Bearer ${apiKey}`, 'X-Runway-Version': '2024-11-06' }
        });
        if (!statusResponse.ok) continue;

        const status = await statusResponse.json();
        if (attempt % 6 === 0) console.log(`[Runway] Progress (${Math.floor(attempt * 5 / 60)}m): Status is ${status.status}`);

        if (status.status === 'SUCCEEDED' && status.output?.length > 0) {
            console.log('[Runway] ✅ Video ready!');
            return status.output[0];
        } else if (status.status === 'FAILED') {
            throw new Error(`Video generation failed: ${status.error || 'Unknown error'}`);
        }
    }

    throw new Error('Video generation timeout after 10 minutes');
}

// NEW: Wrapper with retry logic
async function generateRunwayVideoWithRetry(prompt: string, imageUrl: string, referenceImages: string[], apiKey: string, duration: number, maxRetries = 3): Promise<string> {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            return await generateRunwayVideo(prompt, imageUrl, referenceImages, apiKey, duration);
        } catch (error: any) {
            console.error(`[Runway] ❌ Clip generation failed on attempt ${attempt}/${maxRetries}:`, error.message);
            if (attempt === maxRetries) {
                console.error('[Runway] ❌ All retries failed. Throwing final error.');
                throw error; // Throw error after the last attempt
            }
            const delay = 5000 * attempt; // Increasing delay for backoff
            console.log(`[Runway] ⏳ Waiting ${delay / 1000}s before next retry...`);
            await new Promise(resolve => setTimeout(resolve, delay));
        }
    }
    throw new Error('All clip generation retries failed.'); // Should not be reached
}

async function generateBackgroundAudio(productName: string, visualTheme: string, duration: number, apiKey: string): Promise<string | null> {
    console.log('[Audio] 🎵 Starting background music generation...');
    try {
        let audioPrompt = `Professional upbeat background music for ${productName} product demonstration.`;
        const themeLower = (visualTheme || '').toLowerCase();
        if (themeLower.includes('cinematic')) audioPrompt = `Epic cinematic background music for ${productName}.`;
        if (themeLower.includes('vibrant') || themeLower.includes('modern')) audioPrompt = `Upbeat modern electronic music for ${productName}.`;
        if (themeLower.includes('minimal') || themeLower.includes('clean')) audioPrompt = `Minimal ambient background music for ${productName}.`;

        const response = await fetch('https://api.dev.runwayml.com/v1/sound_effect', {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json', 'X-Runway-Version': '2024-11-06' },
            body: JSON.stringify({ model: 'eleven_text_to_sound_v2', promptText: audioPrompt, duration: Math.min(duration, 30), loop: false })
        });

        if (!response.ok) throw new Error(`API error: ${await response.text()}`);
        const taskData = await response.json();
        const taskId = taskData.id;
        console.log('[Audio] ✅ Task created:', taskId);

        for (let i = 0; i < 60; i++) {
            await new Promise(r => setTimeout(r, 2000));
            const statusRes = await fetch(`https://api.dev.runwayml.com/v1/tasks/${taskId}`, { headers: { 'Authorization': `Bearer ${apiKey}`, 'X-Runway-Version': '2024-11-06' } });
            if (!statusRes.ok) continue;
            const status = await statusRes.json();
            if (status.status === 'SUCCEEDED') return status.output[0];
            if (status.status === 'FAILED') throw new Error('Generation failed');
        }
        throw new Error('Timeout');
    } catch (error: any) {
        console.error('[Audio] ❌ Exception:', error.message);
        return null;
    }
}

// MODIFIED: Generates clips sequentially, uploads to Cloudinary, then combines with Cloudinary
async function generateExtendedVideo(
    projectData: any,
    productName: string,
    requestedDuration: number,
    cloudName: string,
    apiKey: string,
    apiSecret: string,
    runwayApiKey: string
): Promise<{
    videoUrl: string;
    audioUrl?: string;
    clips: string[];
    cost: number;
    actualDuration: number;
    method: string;
}> {
    console.log('[Extended Video] 🎬 Generating', requestedDuration, 'second video using sequential Cloudinary flow.');
    const clipDuration = 5;
    const numClips = Math.ceil(requestedDuration / clipDuration);
    const actualDuration = numClips * clipDuration;
    console.log(`[Extended Video] Will generate ${numClips} clips of ${clipDuration}s each. Total: ${actualDuration}s`);

    // 1. Upload all base images to Cloudinary first
    console.log('[Extended Video] ☁️ Uploading base images to Cloudinary...');
    const mainImageUrl = await uploadImageToCloudinaryWrapper(
        `data:${projectData.mainImage.mimeType};base64,${projectData.mainImage.base64}`,
        cloudName,
        apiKey,
        apiSecret
    );
    const referenceImageUrls = await Promise.all(
        (projectData.referenceImages || []).map((img: any) =>
            uploadImageToCloudinaryWrapper(`data:${img.mimeType};base64,${img.base64}`, cloudName, apiKey, apiSecret)
        )
    );
    console.log('[Extended Video] ✅ Base images uploaded.');

    const clipPublicIds: string[] = [];
    const clipUrls: string[] = [];
    let totalCost = 0;
    const productType = analyzeProductType(projectData);

    // 2. Generate clips sequentially and upload each to Cloudinary
    for (let i = 0; i < numClips; i++) {
        console.log(`[Extended Video] 🎬 Generating clip ${i + 1}/${numClips}...`);
        const videoPrompt = buildStoryDrivenPrompt(productName, productType, projectData, clipDuration, i + 1);
        const clipResultUrl = await generateRunwayVideoWithRetry(videoPrompt, mainImageUrl, referenceImageUrls, runwayApiKey, clipDuration);

        console.log(`[Extended Video] ☁️ Uploading clip ${i + 1} to Cloudinary...`);
        const uploadResult = await uploadVideoToCloudinary(
            clipResultUrl,
            cloudName,
            apiKey,
            apiSecret,
            "kalpana-runway-clips"
        );

        clipPublicIds.push(uploadResult.public_id);
        clipUrls.push(uploadResult.secure_url);

        totalCost += 25;
        console.log(`[Extended Video] ✅ Clip ${i + 1} ready & uploaded. Public ID: ${uploadResult.public_id}. Cost so far: ${totalCost} credits.`);
    }

    if (clipPublicIds.length === 0) throw new Error('No clips generated successfully.');
    console.log(`[Extended Video] ✅ Generated and uploaded ${clipPublicIds.length}/${numClips} clips`);

    // Audio integration - support both pre-selected music and generated audio
    let audioPublicId: string | undefined;
    let audioUrl: string | undefined;

    // Check if user selected pre-defined music from MusicSelectionPage
    if (projectData?.music?.cloudinaryId) {
        audioPublicId = projectData.music.cloudinaryId;
        audioUrl = `https://res.cloudinary.com/${cloudName}/video/upload/${audioPublicId}.mp3`;
        console.log(`[Extended Video] 🎵 Using pre-selected music: ${projectData.music.name} (${audioPublicId})`);
    }
    // Otherwise, generate audio via Runway (if enabled and requested)
    else if (projectData?.includeAudio && runwayApiKey) {
        console.log('[Extended Video] 🎵 Generating background audio via Runway...');
        const generatedAudioUrl = await generateBackgroundAudio(productName, projectData?.visualTheme, actualDuration, runwayApiKey);
        if (generatedAudioUrl) {
            console.log('[Extended Video] ☁️ Uploading generated audio to Cloudinary...');
            const audioUploadResult = await uploadVideoToCloudinary(
                generatedAudioUrl,
                cloudName,
                apiKey,
                apiSecret,
                'kalpana-audio-tracks'
            );
            audioPublicId = audioUploadResult.public_id;
            audioUrl = audioUploadResult.secure_url;
            totalCost += Math.ceil(actualDuration / 6);
            console.log(`[Extended Video] ✅ Audio uploaded. Public ID: ${audioPublicId}`);
        }
    }

    let finalVideoUrl: string;
    let method: string;
    if (clipPublicIds.length > 1 || audioPublicId) {
        console.log('[Extended Video] 🔗 Combining clips with Cloudinary...');
        finalVideoUrl = await combineVideoClipsWithCloudinary(clipPublicIds, cloudName, audioPublicId, clipDuration);
        method = 'combined-with-cloudinary';
        // FIX: Add delay after generating the combined URL to allow processing
        console.log('[Extended Video] ⏳ Waiting 6 seconds for Cloudinary to process the transformation...');
        await new Promise(resolve => setTimeout(resolve, 6000));
    } else {
        finalVideoUrl = clipUrls[0];
        method = 'single-clip-no-audio';
    }

    // FIX: Add cache-busting query parameter
    const finalUrlWithCacheBust = `${finalVideoUrl.replace(/\?.*$/, '')}?v=${Date.now()}`;

    return {
        videoUrl: finalUrlWithCacheBust,
        audioUrl,
        cost: totalCost,
        clips: clipUrls,
        method,
        actualDuration
    };
}


// Cloudflare Pages Function Handler
export async function onRequest(context: {
    request: Request;
    env: Env;
    params: any;
}) {
    // Environment validation
    console.log('[Video Gen] ========== ENVIRONMENT CHECK ==========');
    const cloudName = context.env.CLOUDINARY_CLOUD_NAME;
    const apiKey = context.env.CLOUDINARY_API_KEY;
    const apiSecret = context.env.CLOUDINARY_API_SECRET;
    const runwayKey = context.env.RUNWAY_API_KEY;

    const missingConfigs = [];
    if (!cloudName) missingConfigs.push('CLOUDINARY_CLOUD_NAME');
    if (!apiKey) missingConfigs.push('CLOUDINARY_API_KEY');
    if (!apiSecret) missingConfigs.push('CLOUDINARY_API_SECRET');

    if (missingConfigs.length > 0) {
        return new Response(JSON.stringify({
            success: false,
            error: 'missing_configuration',
            message: `Server configuration incomplete. Missing: ${missingConfigs.join(', ')}`,
            details: { missingConfigs },
            fix: {
                title: 'How to fix this:',
                steps: [
                    '1. Go to Cloudflare Pages Dashboard → Settings → Environment Variables',
                    '2. Add missing variables: ' + missingConfigs.join(', '),
                    '3. Set for Production and Preview environments',
                    '4. Redeploy'
                ]
            }
        }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }

    // Test Cloudinary connection with fetch-based ping
    try {
        const pingUrl = `https://api.cloudinary.com/v1_1/${cloudName}/resources/image?max_results=1`;
        const pingResponse = await fetch(pingUrl, {
            headers: {
                'Authorization': `Basic ${btoa(`${apiKey}:${apiSecret}`)}`
            }
        });
        if (!pingResponse.ok) {
            throw new Error(`Cloudinary ping failed: ${pingResponse.status}`);
        }
        console.log('[Cloudinary] ✅ Connection verified');
    } catch (pingError: any) {
        return new Response(JSON.stringify({
            success: false,
            error: 'cloudinary_connection_failed',
            message: 'Cloudinary credentials are invalid or connection failed',
            details: { error: pingError.message, cloudName },
            fix: {
                title: 'Cloudinary connection failed',
                steps: [
                    '1. Verify Cloudinary credentials are correct',
                    '2. Check cloud name',
                    '3. Check API key and secret are not expired'
                ]
            }
        }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }

    if (context.request.method !== 'POST') {
        return new Response(JSON.stringify({
            success: false,
            error: 'Method not allowed'
        }), {
            status: 405,
            headers: { 'Content-Type': 'application/json' }
        });
    }

    let projectData: any, productName: string;
    try {
        const body = await context.request.json();
        projectData = body.projectData;
        productName = projectData?.product?.name;
        if (!productName || !projectData?.mainImage?.base64) throw new Error('Missing image or name');
    } catch {
        return new Response(JSON.stringify({
            success: false,
            error: 'missing_input',
            message: 'Product image and name are required.'
        }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' }
        });
    }

    const hasRunwayKey = !!runwayKey;
    const requestedDuration = projectData?.videoLength || 10;

    if (hasRunwayKey) {
        try {
            // Use the new, robust extended video generation flow for all Runway requests
            const extendedResult = await generateExtendedVideo(
                projectData,
                productName,
                requestedDuration,
                cloudName,
                apiKey,
                apiSecret,
                runwayKey
            );
            return new Response(JSON.stringify({
                success: true,
                videoUrl: extendedResult.videoUrl,
                audioUrl: extendedResult.audioUrl,
                allClips: extendedResult.clips,
                clipCount: extendedResult.clips.length,
                multiClip: true,
                generationMethod: extendedResult.method,
                cost: extendedResult.cost,
                duration: extendedResult.actualDuration,
                message: `✅ Generated ${extendedResult.clips.length} clips (${extendedResult.actualDuration}s total) and combined with Cloudinary.`
            }), {
                status: 200,
                headers: { 'Content-Type': 'application/json' }
            });
        } catch (extendedError: any) {
            console.error('[Video Gen] ❌ Extended video flow failed:', extendedError.message);
            return new Response(JSON.stringify({
                success: false,
                error: 'video_generation_failed',
                message: `Runway video generation failed: ${extendedError.message}`,
                details: { stage: 'runway_extended_flow', errorMessage: extendedError.message },
                suggestions: ['Check Runway API key & credits', 'Try a shorter video duration']
            }), {
                status: 500,
                headers: { 'Content-Type': 'application/json' }
            });
        }
    }

    // Fallback to Cloudinary if Runway is not configured or fails
    console.log('[Video Gen] ========== CLOUDINARY FALLBACK ==========');
    try {
        const productImageUrl = `data:${projectData.mainImage.mimeType};base64,${projectData.mainImage.base64}`;
        const validImageUrl = await validateAndNormalizeImageUrl(productImageUrl);
        const uploadResult = await uploadImageToCloudinary(
            validImageUrl,
            cloudName,
            apiKey,
            apiSecret,
            'kalpana-product-images'
        );

        const transformations: string[] = ['w_1080,h_1920,c_fill,g_center,q_auto:good'];

        // Add text overlay for product name
        const encodedProductName = encodeURIComponent(productName);
        transformations.push(`l_text:Arial_80_bold:${encodedProductName},co_white,g_south,y_150,e_shadow:100`);

        // Add brand logo if present
        const brandLogoUrl = projectData.brandKit?.logo ? `data:${projectData.brandKit.logo.mimeType};base64,${projectData.brandKit.logo.base64}` : null;
        if (brandLogoUrl) {
            try {
                const logoResult = await uploadImageToCloudinary(brandLogoUrl, cloudName, apiKey, apiSecret, 'kalpana-brand-logos');
                const logoPublicId = logoResult.public_id.replace(/\//g, ':');
                transformations.push(`l_${logoPublicId},w_0.15,g_north_east,x_30,y_30,o_90`);
            } catch (logoError: any) { console.error('[Cloudinary] ⚠️ Logo overlay failed:', logoError.message); }
        }

        // Generate Cloudinary URL manually
        const videoUrl = generateCloudinaryUrl(
            uploadResult.public_id,
            cloudName,
            [transformations.join('/')],
            'image',
            'jpg'
        );

        return new Response(JSON.stringify({
            success: true,
            videoUrl,
            audioUrl: undefined,
            cloudinaryPublicId: uploadResult.public_id,
            generationMethod: 'cloudinary-static-with-branding',
            cost: 0.001
        }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });

    } catch (cloudinaryError: any) {
        const errorMessage = cloudinaryError.message || 'Unknown Cloudinary error';
        return new Response(JSON.stringify({
            success: false,
            error: 'video_generation_failed',
            message: `Video generation failed: ${errorMessage}`,
            details: { stage: 'cloudinary_fallback', errorMessage },
            suggestions: ['Check image validity', 'Verify Cloudinary credentials']
        }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}
