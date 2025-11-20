// api/check-video-status.ts
// This endpoint securely checks the status of a prediction job from various providers.

type VercelRequest = any;
type VercelResponse = any;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  const { jobId, provider } = req.body;

  if (!jobId || !provider) {
    return res.status(400).json({ success: false, error: 'Missing jobId or provider' });
  }

  // Handle the reliable-service mock provider
  if (provider === 'reliable-service') {
    console.log(`[Check Status] Mocking success for reliable-service job: ${jobId}`);
    
    // Simulate progress based on job start time embedded in the ID
    const jobTime = parseInt(jobId.split('-').pop() || Date.now().toString());
    const elapsed = Date.now() - jobTime;
    const simulationDuration = 8000; // 8 seconds total
    
    let status = elapsed < simulationDuration ? 'processing' : 'succeeded';

    // Use a list of reliable, working video URLs for the demo
    const workingVideoUrls = [
      'https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
      'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
      'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
      'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4'
    ];
    
    const videoUrl = status === 'succeeded' 
      ? workingVideoUrls[Math.floor(Math.random() * workingVideoUrls.length)]
      : null;

    return res.status(200).json({
      success: true,
      status: status,
      videoUrl: videoUrl,
      message: status === 'processing' ? 'Generating your video...' : 'Video ready for download!'
    });
  }

  // Handle Replicate providers
  if (provider.startsWith('replicate')) {
    if (!process.env.REPLICATE_API_TOKEN) {
      return res.status(500).json({ success: false, error: 'Replicate API token not configured on server.' });
    }

    try {
      const response = await fetch(`https://api.replicate.com/v1/predictions/${jobId}`, {
        headers: {
          'Authorization': `Token ${process.env.REPLICATE_API_TOKEN}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
          throw new Error(`Replicate API failed with status: ${response.status}`);
      }

      const prediction = await response.json();
      
      const responsePayload: {
          success: boolean;
          status: string;
          videoUrl?: string;
          error?: string;
      } = {
          success: true,
          status: prediction.status,
      };

      if (prediction.status === 'succeeded') {
          responsePayload.videoUrl = Array.isArray(prediction.output) ? prediction.output[0] : prediction.output;
      } else if (prediction.status === 'failed') {
          responsePayload.error = prediction.error;
      }

      return res.status(200).json(responsePayload);

    } catch (error: any) {
      console.error(`[Check Status] Error for Replicate job ${jobId}:`, error);
      return res.status(500).json({ success: false, error: error.message });
    }
  }

  // If provider is unknown
  return res.status(400).json({ success: false, error: `Unsupported provider for status check: ${provider}` });
}