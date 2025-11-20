// Cloudflare Workers-compatible Cloudinary helpers
// Replaces cloudinary SDK which uses Node.js https module

/**
 * Generate SHA-1 signature for Cloudinary authenticated uploads
 */
async function generateSHA1(message: string): Promise<string> {
    const msgBuffer = new TextEncoder().encode(message);
    const hashBuffer = await crypto.subtle.digest('SHA-1', msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    return hashHex;
}

/**
 * Upload image to Cloudinary using Upload API
 */
export async function uploadImageToCloudinary(
    base64DataUrl: string,
    cloudName: string,
    apiKey: string,
    apiSecret: string,
    folder: string = 'kalpana-uploads'
): Promise<{ secure_url: string; public_id: string }> {
    if (!base64DataUrl || !base64DataUrl.startsWith('data:image/')) {
        throw new Error('Invalid base64 data URL for upload.');
    }

    try {
        const timestamp = Math.floor(Date.now() / 1000);

        // Generate signature
        const stringToSign = `folder=${folder}&timestamp=${timestamp}${apiSecret}`;
        const signature = await generateSHA1(stringToSign);

        const formData = new FormData();
        formData.append('file', base64DataUrl);
        formData.append('folder', folder);
        formData.append('timestamp', timestamp.toString());
        formData.append('api_key', apiKey);
        formData.append('signature', signature);

        const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
            method: 'POST',
            body: formData
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Cloudinary upload failed (${response.status}): ${errorText}`);
        }

        const result = await response.json();
        console.log(`[Cloudinary] ✅ Image uploaded: ${result.secure_url}`);
        return { secure_url: result.secure_url, public_id: result.public_id };
    } catch (error: any) {
        console.error('[Cloudinary] ❌ Image upload failed:', error.message);
        throw new Error(`Failed to upload image to Cloudinary: ${error.message}`);
    }
}

/**
 * Upload video to Cloudinary using Upload API
 */
export async function uploadVideoToCloudinary(
    videoUrl: string,
    cloudName: string,
    apiKey: string,
    apiSecret: string,
    folder: string = 'kalpana-videos'
): Promise<{ secure_url: string; public_id: string }> {
    try {
        const timestamp = Math.floor(Date.now() / 1000);

        // Generate signature
        const stringToSign = `folder=${folder}&timestamp=${timestamp}${apiSecret}`;
        const signature = await generateSHA1(stringToSign);

        const formData = new FormData();
        formData.append('file', videoUrl);
        formData.append('folder', folder);
        formData.append('resource_type', 'video');
        formData.append('timestamp', timestamp.toString());
        formData.append('api_key', apiKey);
        formData.append('signature', signature);

        const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/video/upload`, {
            method: 'POST',
            body: formData
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Cloudinary video upload failed (${response.status}): ${errorText}`);
        }

        const result = await response.json();
        console.log(`[Cloudinary] ✅ Video uploaded: ${result.public_id}`);
        return { secure_url: result.secure_url, public_id: result.public_id };
    } catch (error: any) {
        console.error('[Cloudinary] ❌ Video upload failed:', error.message);
        throw new Error(`Failed to upload video to Cloudinary: ${error.message}`);
    }
}

/**
 * Generate Cloudinary transformation URL
 */
export function generateCloudinaryUrl(
    publicId: string,
    cloudName: string,
    transformations: string[] = [],
    resourceType: 'image' | 'video' = 'video',
    format: string = 'mp4'
): string {
    const baseUrl = `https://res.cloudinary.com/${cloudName}/${resourceType}/upload`;
    const transformationString = transformations.length > 0 ? transformations.join('/') + '/' : '';
    return `${baseUrl}/${transformationString}${publicId}.${format}`;
}

/**
 * Combine video clips using Cloudinary transformation URL
 */
export function combineVideoClipsUrl(
    clipPublicIds: string[],
    cloudName: string,
    audioPublicId?: string,
    clipDuration: number = 5
): string {
    if (clipPublicIds.length === 0) {
        throw new Error("Cannot combine zero clips.");
    }

    const baseVideoId = clipPublicIds[0];
    const transformations: string[] = [];

    // Set duration for first clip
    transformations.push(`du_${clipDuration}`);

    // Add subsequent clips
    for (let i = 1; i < clipPublicIds.length; i++) {
        transformations.push(`fl_splice,l_video:${clipPublicIds[i].replace(/\//g, ':')}`);
        transformations.push('e_fade:500');
        transformations.push('fl_layer_apply');
    }

    // Add audio if provided
    if (audioPublicId) {
        console.log(`[Cloudinary] Adding audio track: ${audioPublicId}`);
        transformations.push(`l_video:${audioPublicId.replace(/\//g, ':')}`);
        transformations.push('ac_aac');
        transformations.push('fl_layer_apply');
        transformations.push('so_30'); // Volume 30%
        transformations.push('fl_layer_apply');
    }

    // Add quality settings
    transformations.push('vc_auto');
    transformations.push('q_auto:good');

    return generateCloudinaryUrl(baseVideoId, cloudName, transformations, 'video', 'mp4');
}
