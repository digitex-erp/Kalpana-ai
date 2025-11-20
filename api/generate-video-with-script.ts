// api/generate-video-with-script.ts
import { v2 as cloudinary } from 'cloudinary';

const configureCloudinary = () => {
  // Return early if already configured to avoid re-running logic
  if (cloudinary.config().cloud_name) return;

  const CLOUDINARY_URL = process.env.CLOUDINARY_URL;
  const CLOUDINARY_CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME;
  const CLOUDINARY_API_KEY = process.env.CLOUDINARY_API_KEY;
  const CLOUDINARY_API_SECRET = process.env.CLOUDINARY_API_SECRET;

  if (CLOUDINARY_URL) {
    console.log('[Cloudinary] Configuring from CLOUDINARY_URL');
    cloudinary.config({ cloudinary_url: CLOUDINARY_URL, secure: true });
  } else if (CLOUDINARY_CLOUD_NAME && CLOUDINARY_API_KEY && CLOUDINARY_API_SECRET) {
    console.log('[Cloudinary] Configuring from separate environment variables');
    cloudinary.config({
      cloud_name: CLOUDINARY_CLOUD_NAME,
      api_key: CLOUDINARY_API_KEY,
      api_secret: CLOUDINARY_API_SECRET,
      secure: true,
    });
  }
};

type MusicMood = 'Traditional Festive (Shehnai, Sitar)' | 'Devotional & Serene' | 'Modern Indian Fusion' | 'Celebratory & Upbeat' | 'Professional & Corporate';
interface NarrationVoiceSetting { language: 'english' | 'hindi' | 'none'; gender: 'male' | 'female' | 'none'; style: string; }
type VercelRequest = any;
type VercelResponse = any;

const getSoundtrackUrl = (mood: MusicMood): string => { /* ... implementation ... */ return 'https://cdn.json2video.com/assets/music/upbeat-corporate.mp3'; };
// const getVoiceId = (settings: NarrationVoiceSetting): string | null => { /* ... implementation ... */ return null; };

const uploadImage = async (base64Data: string, mimeType: string): Promise<string> => {
    const placeholderUrl = 'https://via.placeholder.com/1080x1920/111827/FFFFFF?text=Image+Upload+Failed';
    if (!base64Data) return placeholderUrl;
    
    // The check for configuration is now handled centrally.
    if (!cloudinary.config().cloud_name) {
      console.error("[Cloudinary] Credentials missing for image upload.");
      return placeholderUrl;
    }

    try {
      const result = await cloudinary.uploader.upload(`data:${mimeType};base64,${base64Data}`, {
        resource_type: 'image',
        folder: 'kalpana-ai-videos'
      });
      return result.secure_url;
    } catch (error: any) {
      console.error('[Cloudinary] Image upload failed, using placeholder. Reason:', error.message);
      return placeholderUrl;
    }
};

function buildVideoScenes(script: any, projectData: any, mainImageUrl: string, referenceImageUrls: string[]): any[] { /* ... implementation ... */ return []; }

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    configureCloudinary();
    if (!cloudinary.config().cloud_name) {
      throw new Error(`🔧 Server Configuration Error: The Cloudinary service is not configured. Please set either the CLOUDINARY_URL environment variable OR all three of CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET in your Vercel project settings.`);
    }

    const { projectData, script } = req.body;
    if (!projectData || !script) {
      return res.status(400).json({ success: false, error: 'Missing projectData or a valid script.' });
    }

    const mainImageUrl = await uploadImage(projectData.mainImage.base64, projectData.mainImage.mimeType);
    const referenceImageUrls = await Promise.all(
      (projectData.referenceImages || []).map((img: any) => uploadImage(img.base64, img.mimeType))
    );

    const soundtrackUrl = getSoundtrackUrl(projectData.music.mood);
    const scenes = buildVideoScenes(script, projectData, mainImageUrl, referenceImageUrls);

    const finalPayload = {
      resolution: "1080x1920",
      quality: "high",
      fps: 30,
      soundtrack: { src: soundtrackUrl, volume: 30 },
      scenes: scenes,
    };

    const response = await fetch('https://api.json2video.com/v2/movies', {
      method: 'POST',
      headers: { 'x-api-key': process.env.JSON2VIDEO_API_KEY!, 'Content-Type': 'application/json' },
      body: JSON.stringify(finalPayload)
    });

    if (!response.ok) throw new Error(`JSON2Video API failed: ${await response.text()}`);

    const data = await response.json();
    const jobId = data.id || data.project;
    if (!jobId) throw new Error('JSON2Video API response did not include a valid job ID.');

    res.status(200).json({ success: true, jobId, provider: 'json2video' });

  } catch (error: any) {
    console.error('[VideoGen-with-Script] Error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
}
