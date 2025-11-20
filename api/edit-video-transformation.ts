// api/edit-video-transformation.ts
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

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    configureCloudinary();
    const cloudName = cloudinary.config().cloud_name;

    if (!cloudName) {
      console.error('[EditVideo] Error: Cloudinary is not configured.');
      return res.status(500).json({
        success: false,
        error: `🔧 Server Configuration Error: The Cloudinary service is not configured. Please set either the CLOUDINARY_URL environment variable OR all three of CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET in your Vercel project settings.`,
      });
    }

    console.log('[EditVideo] Processing edit request...');
    
    const { 
      basePublicId, productName, brandLogo, audioTrack, duration, backgroundColor 
    } = req.body;

    if (!basePublicId) {
      return res.status(400).json({ success: false, error: 'basePublicId is required' });
    }

    const transformations: any[] = [
      { width: 1080, height: 1920, crop: 'fill', gravity: 'center', quality: 'auto:good' },
      { duration: duration || 15, effect: 'transition', flags: 'animated' }
    ];

    if (audioTrack) {
      transformations.push({
        overlay: { resource_type: 'video', public_id: audioTrack },
        flags: 'layer_apply,no_overflow',
        audio_codec: 'aac'
      });
    }

    if (productName) {
      const encodedText = encodeURIComponent(productName)
        .replace(/,/g, '%2C').replace(/\(/g, '%28').replace(/\)/g, '%29')
        .replace(/'/g, '%27').replace(/"/g, '%22');
      transformations.push({
        overlay: { font_family: 'Arial', font_size: 60, font_weight: 'bold', text: encodedText },
        color: '#FFFFFF',
        background: backgroundColor || 'rgba(0,0,0,0.7)',
        gravity: 'south', y: 100, crop: 'fit', width: 900
      });
    }

    if (brandLogo) {
      transformations.push({
        overlay: { public_id: brandLogo },
        width: 150, gravity: 'north_east', x: 20, y: 20, flags: 'layer_apply'
      });
    }

    const videoUrl = cloudinary.url(basePublicId, {
      resource_type: 'image',
      transformation: transformations,
      format: 'mp4',
      sign_url: true
    });

    console.log('[EditVideo] ✅ Video transformation URL generated successfully');
    res.status(200).json({ success: true, videoUrl });

  } catch (error: any) {
    console.error('[EditVideo] ❌ Error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to edit video transformation'
    });
  }
}