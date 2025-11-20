# YouTube Competitor Analysis Integration

## Overview

The Kalpana AI Video Studio now includes YouTube competitor video analysis to enhance product enrichment with real-world competitive intelligence.

## How It Works

1.  **User uploads product** → System searches YouTube for similar product videos.
2.  **Top 5 videos analyzed** → Extracts titles, descriptions, tags, and engagement metrics.
3.  **AI synthesis** → Combines insights with product data into an enhanced prompt for Gemini.
4.  **Enhanced output** → The AI creates a video strategy that is aware of and aims to outperform existing competitor videos.

## Setup

### 1. Get a YouTube API Key (FREE)

1.  Go to the [Google Cloud Console](https://console.cloud.google.com/).
2.  Create a new project (or select an existing one).
3.  In the API Library, search for and enable the **YouTube Data API v3**.
4.  Go to `Credentials` → `Create Credentials` → `API Key`.
5.  Copy the generated API key.

**Free Quota:** The API provides a generous free quota of 10,000 units per day. One product analysis uses about 105 units, meaning you can analyze ~95 products per day for free.

### 2. Configure Environment Variable

Add the key to your `.env` file for local development, or to your Vercel project's environment variables for production.

```
VITE_YOUTUBE_API_KEY=AIzaSy...your_key_here
```

### 3. Enable in Settings

-   Go to the `Settings` page within the Kalpana application.
-   Enable the "YouTube Video Analysis" toggle.
-   The analysis will now run automatically during the Product Enrichment step.

## Benefits

| Before (No YouTube Analysis) | After (With YouTube Analysis) |
| :--- | :--- |
| Analysis based only on product images. | Analysis enhanced with real-world competitor insights. |
| Video strategies are generic. | Strategies are based on proven, successful patterns. |
| No competitive context. | Output is optimized for actual YouTube performance. |

This integration provides a significant quality boost to the AI's strategic output.

## Technical Details

-   **Files Added/Modified:**
    -   `src/services/youtubeService.ts` (new)
    -   `src/services/index.ts` (enhanced)
    -   `src/pages/SettingsPage.tsx` (toggle added)
-   **API Calls per Analysis:**
    1.  `search`: ~100 units
    2.  `videos` (for stats): ~5 units
    -   **Total:** ~105 units