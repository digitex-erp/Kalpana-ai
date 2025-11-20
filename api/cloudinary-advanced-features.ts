// api/cloudinary-advanced-features.ts
export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { videoUrl, features } = req.body;

  if (!videoUrl || !features) {
      return res.status(400).json({ success: false, error: 'Missing videoUrl or features payload.' });
  }

  try {
    const enhancements: string[] = [];
    if (features.removeBackground) enhancements.push('e_background_removal');
    if (features.enhanceColors) enhancements.push('e_improve:indoor:50');
    if (features.generateSubtitles) {
        enhancements.push('l_subtitles:arial_60');
    }
    
    if (features.platformOptimization) {
        const platforms: Record<string, string> = {
            instagram_story: 'ar_9:16,c_fill,g_auto',
            instagram_feed: 'ar_1:1,c_fill,g_auto',
            tiktok: 'ar_9:16,c_fill,g_auto',
            youtube_shorts: 'ar_9:16,c_fill,g_auto',
            youtube: 'ar_16:9,c_fill,g_auto'
        };
        const platformUrls: Record<string, string> = {};
        for (const [platform, transform] of Object.entries(platforms)) {
            const allTransforms = [transform, ...enhancements].join(',');
            platformUrls[platform] = videoUrl.replace('/upload/', `/upload/${allTransforms}/`);
        }
        return res.status(200).json({ success: true, urls: platformUrls });
    }

    if (enhancements.length > 0) {
      const enhancedUrl = videoUrl.replace('/upload/', `/upload/${enhancements.join(',')}/`);
      return res.status(200).json({ success: true, url: enhancedUrl });
    }

    res.status(200).json({ success: true, url: videoUrl });
  } catch (error: any) {
    console.error('[Advanced Features] Error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
}
