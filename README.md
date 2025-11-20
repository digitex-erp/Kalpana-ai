# Kalpana AI Video Studio

Kalpana is an advanced AI-powered application designed to generate professional product videos and facilitate live, spoken conversations with a creative AI assistant. It leverages Google's state-of-the-art Gemini and Veo models to transform simple product images into dynamic, engaging video content.

## Project Architecture

*   **Frontend**: A React application built with Vite and TypeScript.
*   **Backend**: A unified serverless function hosted on Vercel, acting as a secure proxy to multiple AI providers (Google Gemini, Moonshot, DeepSeek, Hugging Face).
*   **Styling**: Tailwind CSS for a utility-first styling approach.
*   **Local Database**: IndexedDB is used to store project data locally in the user's browser for persistence.

## Getting Started (Local Development)

Follow these instructions to get the project running on your local machine for development and testing.

### Prerequisites

*   Node.js (v18 or later recommended)
*   npm or yarn
*   Valid API keys for the AI services you intend to use.

### 1. Setup the Environment File

In the root directory of the project, create a new file named `.env`. This file will store your API keys securely for local development.

Open the `.env` file and add your keys. You only need to add the key for the service you plan to test. **Note:** These are server-side keys; do not use a `VITE_` or `NEXT_PUBLIC_` prefix unless specified.

```
# (REQUIRED) Key for the highest quality provider, Anthropic Claude 3.5 Sonnet.
# This is the default provider and will be tried first if available.
ANTHROPIC_API_KEY=YOUR_ANTHROPIC_API_KEY_HERE

# Key for Google services (Gemini). Used as a fallback.
GOOGLE_API_KEY=YOUR_GEMINI_API_KEY_HERE

# Keys for Cloudinary video generation (REQUIRED for video output)
CLOUDINARY_CLOUD_NAME=YOUR_CLOUDINARY_CLOUD_NAME
CLOUDINARY_API_KEY=YOUR_CLOUDINARY_API_KEY
CLOUDINARY_API_SECRET=YOUR_CLOUDINARY_API_SECRET

# (Optional) Keys for other AI providers used by the auto-failover system
# These will be used if both Claude and Gemini are unavailable.
DEEPSEEK_API_KEY=YOUR_DEEPSEEK_API_KEY_HERE
PERPLEXITY_API_KEY=YOUR_PERPLEXITY_API_KEY_HERE
MOONSHOT_API_KEY=YOUR_MOONSHOT_API_KEY_HERE
XAI_API_KEY=YOUR_XAI_API_KEY_HERE

# Key for Replicate video generation (Alternative, currently deprecated)
REPLICATE_API_TOKEN=your_replicate_api_token_here
```

Replace `YOUR_..._KEY_HERE` with your actual keys.

### 2. Install Dependencies

Open a terminal in the project's root directory and run the following command to install all the necessary packages:

```bash
npm install
```

### 3. (Required for Video Generation) Upload Cloudinary Audio Assets

For the final video to include background music, you must upload audio assets to your Cloudinary account.

1.  Log in to your Cloudinary account.
2.  Go to the **Media Library**.
3.  Create a new folder named `kalpana-assets`.
4.  Upload your audio files (e.g., in MP3 format) into this folder with the specified **Public IDs**:

| Mood                                     | Required Public ID                      |
| ---------------------------------------- | --------------------------------------- |
| Traditional Festive (Shehnai, Sitar)     | `indian-traditional-festive`            |
| Devotional & Serene                      | `serene-spiritual-indian`               |
| Modern Indian Fusion                     | `modern-indian-fusion-beat`             |
| Celebratory & Upbeat                     | `upbeat-celebratory-pop`                |
| Professional & Corporate (and default)   | `upbeat-corporate`                      |

**Where to Get Free Music:**
- YouTube Audio Library: https://www.youtube.com/audiolibrary
- Pixabay Music: https://pixabay.com/music/

**Important:** The Public ID must match exactly (without the file extension). For example, if you upload `upbeat-corporate.mp3`, ensure its Public ID in Cloudinary is set to `upbeat-corporate`.

### 4. Run the Application

This project uses Vercel's development server, which runs both your frontend and your serverless functions locally.

In your terminal, run the following command:

```bash
vercel dev
```

The command will start the development server, typically on `http://localhost:3000`. Open this URL in your web browser to use the application. The `vercel dev` command automatically reads your `.env` file and makes the API keys available to your local serverless functions.

## Production Deployment (Vercel)

The application is configured for easy deployment on Vercel.

1.  **Import Project**: Import your GitHub repository into Vercel.
2.  **Configure Build Settings**:
    *   **Framework Preset**: Vite
    *   **Build Command**: `vite build`
    *   **Output Directory**: `dist`
3.  **Configure Environment Variables**: In your Vercel project settings, add the following environment variables. **Important:** These are server-side keys and should NOT have the `NEXT_PUBLIC_` prefix.
    *   **Key**: `ANTHROPIC_API_KEY`, **Value**: Your Anthropic (Claude) API key. (Recommended Primary)
    *   **Key**: `GOOGLE_API_KEY`, **Value**: Your Gemini API key. (Fallback)
    *   **Key**: `DEEPSEEK_API_KEY`, **Value**: Your DeepSeek API key. (Fallback)
    *   **Key**: `PERPLEXITY_API_KEY`, **Value**: Your Perplexity API key. (Fallback)
    *   **Key**: `MOONSHOT_API_KEY`, **Value**: Your Moonshot AI API key. (Fallback)
    *   **Key**: `XAI_API_KEY`, **Value**: Your xAI (Grok) API key. (Optional Fallback)
    *   **Key**: `CLOUDINARY_CLOUD_NAME`, **Value**: Your Cloudinary Cloud Name.
    *   **Key**: `CLOUDINARY_API_KEY`, **Value**: Your Cloudinary API Key.
    *   **Key**: `CLOUDINARY_API_SECRET`, **Value**: Your Cloudinary API Secret.
    *   **Key**: `REPLICATE_API_TOKEN`, **Value**: Your Replicate API token. (Optional)
4.  **Deploy**: Vercel will automatically build and deploy your application. The serverless function in the `/api` directory will be deployed as well.

## Production Deployment (Cloudflare Pages)

The application is also configured for deployment on Cloudflare Pages with full serverless function support.

### Option 1: Deploy via Cloudflare Dashboard (Recommended)

1.  **Create Cloudflare Pages Project**:
    *   Go to [Cloudflare Dashboard](https://dash.cloudflare.com) → **Workers & Pages** → **Create Application** → **Pages**
    *   Choose **Connect to Git** and authorize Cloudflare to access your GitHub repository
    *   Select your repository (e.g., `kalpana-ai`)

2.  **Configure Build Settings**:
    *   **Project name**: `kalpana-ai` (or your preferred name)
    *   **Production branch**: `main` (or your default branch)
    *   **Framework preset**: None (or Vite if available)
    *   **Build command**: `npm run build`
    *   **Build output directory**: `dist`
    *   **Root directory**: `/` (leave empty)

3.  **Configure Environment Variables**:
    *   Navigate to **Settings** → **Environment Variables**
    *   Add the following variables for **Production**, **Preview**, and **Development** environments:
    
    | Variable Name | Description |
    |--------------|-------------|
    | `ANTHROPIC_API_KEY` | Claude 3.5 Sonnet API key (Primary AI) |
    | `GOOGLE_API_KEY` | Google Gemini API key (Fallback AI) |
    | `API_KEY` | Alternative Google API key |
    | `OPENAI_API_KEY` | OpenAI GPT-4 API key |
    | `DEEPSEEK_API_KEY` | DeepSeek API key (Budget AI) |
    | `MOONSHOT_API_KEY` | Moonshot AI API key |
    | `XAI_API_KEY` | xAI/Grok API key (Optional) |
    | `HUGGING_FACE_API_KEY` | Hugging Face API key |
    | `CLOUDINARY_CLOUD_NAME` | Your Cloudinary cloud name |
    | `CLOUDINARY_API_KEY` | Your Cloudinary API key |
    | `CLOUDINARY_API_SECRET` | Your Cloudinary API secret |
    | `CLOUDINARY_URL` | Full Cloudinary URL (format: `cloudinary://API_KEY:API_SECRET@CLOUD_NAME`) |
    | `JSON2VIDEO_API_KEY` | JSON2Video API key |

4.  **Deploy**:
    *   Click **Save and Deploy**
    *   Cloudflare will automatically build and deploy your application
    *   The serverless functions in `/functions/api` will be deployed automatically

5.  **Access Your Application**:
    *   Your app will be available at `https://kalpana-ai.pages.dev` (or your custom domain)
    *   API endpoints: `https://kalpana-ai.pages.dev/api/health` and `https://kalpana-ai.pages.dev/api/ai-proxy`

### Option 2: Deploy via Wrangler CLI

1.  **Install Wrangler**:
    ```bash
    npm install -g wrangler
    ```

2.  **Login to Cloudflare**:
    ```bash
    wrangler login
    ```

3.  **Deploy**:
    ```bash
    npm run build
    wrangler pages deploy dist --project-name=kalpana-ai
    ```

4.  **Set Environment Variables** (via CLI):
    ```bash
    wrangler pages secret put ANTHROPIC_API_KEY --project-name=kalpana-ai
    wrangler pages secret put GOOGLE_API_KEY --project-name=kalpana-ai
    # ... repeat for all other variables
    ```

### Continuous Deployment

Once connected to Git, Cloudflare Pages will automatically:
- Deploy on every push to your production branch
- Create preview deployments for pull requests
- Run the build command and deploy the `dist` folder
- Make serverless functions in `/functions/api` available at `/api/*` endpoints