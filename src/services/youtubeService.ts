

/**
 * YouTube Video Analysis Service
 * Searches and analyzes competitor product videos
 */

// Type definitions
interface VideoInsights {
  videoId: string;
  title: string;
  description: string;
  tags: string[];
  viewCount: number;
  likeCount: number;
  commentCount: number;
  duration: string;
  publishedAt: string;
  thumbnail: string;
  channelTitle: string;
}

interface VideoAnalysis {
  topPerformingVideos: VideoInsights[];
  commonKeywords: string[];
  averageEngagement: {
    views: number;
    likes: number;
    comments: number;
  };
  titlePatterns: string[];
  descriptionThemes: string[];
  videoLengthPattern: string;
  bestPractices: string[];
}

// YouTube API Configuration
// @ts-ignore
const YOUTUBE_API_KEY = import.meta.env.VITE_YOUTUBE_API_KEY || '';
const YOUTUBE_BASE_URL = 'https://www.googleapis.com/youtube/v3';

/**
 * Search YouTube for product-related videos
 */
export async function searchProductVideos(
  productName: string,
  category: string = '',
  maxResults: number = 5
): Promise<VideoInsights[]> {
  
  if (!YOUTUBE_API_KEY) {
    console.warn('[YouTube Service] API key not configured, skipping YouTube analysis');
    return [];
  }

  try {
    const searchTerms = [productName, category, 'video', 'review'].filter(Boolean).join(' ');
    console.log(`[YouTube Service] Searching for: "${searchTerms}"`);

    const searchUrl = new URL(`${YOUTUBE_BASE_URL}/search`);
    searchUrl.searchParams.append('part', 'snippet');
    searchUrl.searchParams.append('q', searchTerms);
    searchUrl.searchParams.append('type', 'video');
    searchUrl.searchParams.append('order', 'viewCount');
    searchUrl.searchParams.append('maxResults', maxResults.toString());
    searchUrl.searchParams.append('key', YOUTUBE_API_KEY);
    searchUrl.searchParams.append('regionCode', 'IN');
    searchUrl.searchParams.append('relevanceLanguage', 'en');

    const searchResponse = await fetch(searchUrl.toString());
    
    if (!searchResponse.ok) {
      const error = await searchResponse.json();
      console.error('[YouTube Service] Search failed:', error.error.message);
      return [];
    }

    const searchData = await searchResponse.json();
    if (!searchData.items || searchData.items.length === 0) {
      console.log('[YouTube Service] No videos found');
      return [];
    }

    const videoIds = searchData.items.map((item: any) => item.id.videoId).join(',');
    const statsUrl = new URL(`${YOUTUBE_BASE_URL}/videos`);
    statsUrl.searchParams.append('part', 'snippet,statistics,contentDetails');
    statsUrl.searchParams.append('id', videoIds);
    statsUrl.searchParams.append('key', YOUTUBE_API_KEY);

    const statsResponse = await fetch(statsUrl.toString());
    
    if (!statsResponse.ok) {
      const error = await statsResponse.json();
      console.error('[YouTube Service] Stats fetch failed:', error.error.message);
      return [];
    }

    const statsData = await statsResponse.json();
    const insights: VideoInsights[] = statsData.items.map((video: any) => ({
      videoId: video.id,
      title: video.snippet.title,
      description: video.snippet.description,
      tags: video.snippet.tags || [],
      viewCount: parseInt(video.statistics.viewCount || '0'),
      likeCount: parseInt(video.statistics.likeCount || '0'),
      commentCount: parseInt(video.statistics.commentCount || '0'),
      duration: video.contentDetails.duration,
      publishedAt: video.snippet.publishedAt,
      thumbnail: video.snippet.thumbnails.high?.url || video.snippet.thumbnails.default?.url,
      channelTitle: video.snippet.channelTitle
    }));

    console.log(`[YouTube Service] Found ${insights.length} videos`);
    return insights;

  } catch (error) {
    console.error('[YouTube Service] Error:', error);
    return [];
  }
}

/**
 * Analyze video insights to extract patterns and best practices
 */
export async function analyzeVideoInsights(videos: VideoInsights[]): Promise<VideoAnalysis | null> {
  if (videos.length === 0) return null;

  try {
    console.log(`[YouTube Service] Analyzing ${videos.length} videos`);

    const allTags = videos.flatMap(v => v.tags);
    const tagFrequency: Record<string, number> = {};
    allTags.forEach(tag => {
      const normalized = tag.toLowerCase();
      tagFrequency[normalized] = (tagFrequency[normalized] || 0) + 1;
    });

    const commonKeywords = Object.entries(tagFrequency).sort(([, a], [, b]) => b - a).slice(0, 15).map(([tag]) => tag);
    const totalViews = videos.reduce((sum, v) => sum + v.viewCount, 0);
    const totalLikes = videos.reduce((sum, v) => sum + v.likeCount, 0);
    const totalComments = videos.reduce((sum, v) => sum + v.commentCount, 0);

    const bestPractices: string[] = [];
    const shortVideos = videos.filter(v => v.duration.includes('PT') && !v.duration.includes('H')).length;
    if (shortVideos > videos.length / 2) {
      bestPractices.push('Most successful videos are short-form (under 1 minute)');
    }
    const avgTitleLength = videos.reduce((sum, v) => sum + v.title.length, 0) / videos.length;
    if (avgTitleLength < 60) {
      bestPractices.push('Successful titles are concise (under 60 characters)');
    }

    const analysis: VideoAnalysis = {
      topPerformingVideos: videos.slice(0, 3),
      commonKeywords,
      averageEngagement: {
        views: Math.round(totalViews / videos.length),
        likes: Math.round(totalLikes / videos.length),
        comments: Math.round(totalComments / videos.length)
      },
      titlePatterns: [], // Simplified for brevity
      descriptionThemes: [], // Simplified for brevity
      videoLengthPattern: shortVideos > videos.length / 2 ? 'short-form' : 'long-form',
      bestPractices
    };

    console.log('[YouTube Service] Analysis complete.');
    return analysis;

  } catch (error) {
    console.error('[YouTube Service] Analysis error:', error);
    return null;
  }
}

/**
 * Format video analysis for AI prompt enhancement
 */
export function formatAnalysisForPrompt(analysis: VideoAnalysis | null): string {
  if (!analysis) return '';
  return `
COMPETITIVE VIDEO INTELLIGENCE (from YouTube analysis):

TOP PERFORMING VIDEOS:
${analysis.topPerformingVideos.map((v, i) => `${i + 1}. "${v.title}" by ${v.channelTitle} (Views: ${v.viewCount.toLocaleString()})`).join('\n')}

COMMON KEYWORDS IN SUCCESSFUL VIDEOS:
${analysis.commonKeywords.join(', ')}

BEST PRACTICES IDENTIFIED:
${analysis.bestPractices.map((practice) => `- ${practice}`).join('\n')}

RECOMMENDATION:
Incorporate these successful patterns while highlighting the product's unique selling propositions.
`;
}