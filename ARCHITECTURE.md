# Kalpana AI Video Studio - Architecture Document

This document provides a comprehensive overview of the Kalpana AI Video Studio's architecture, technology stack, data flow, and key components.

## 1. System Overview

-   **Application Name:** Kalpana AI Video Studio
-   **Purpose:** To empower creators and businesses to generate professional, narrated product videos for social media using AI. It transforms product images into dynamic video content.
-   **Target Users:** E-commerce businesses, social media managers, marketing professionals, and small business owners.
-   **Key Value Propositions:**
  -   **Automated Video Creation:** Reduces time and cost of video production.
  -   **AI-Powered Strategy:** Leverages AI for product analysis, scriptwriting, and storyboarding.
  -   **Multi-Provider Support:** Flexible backend proxy to integrate with various AI models.
-   **Deployment Status:** Live and deployed on Vercel.

---

## 2. Technology Stack

| Category  | Technology                               | Purpose                                     |
| :-------- | :--------------------------------------- | :------------------------------------------ |
| **Frontend**  | `React 18`, `Vite`, `TypeScript`         | Core framework for building the user interface. |
|           | `Tailwind CSS`                           | Utility-first CSS framework for styling.    |
|           | `useState`, `useEffect`                  | Local component state management.           |
| **Backend**   | `Vercel Serverless Functions`            | Scalable, event-driven backend logic.       |
|           | `Node.js` Runtime                        | JavaScript runtime for serverless functions.|
| **AI/ML**     | `Google Gemini (2.5 Flash, Veo)`         | Primary models for analysis and video gen.  |
|           | `Hugging Face`, `Moonshot`, `DeepSeek`   | Secondary, configurable AI providers.       |
|           | `Cloudinary`                             | Programmatic image & video generation.      |
|           | `/api/ai-proxy`                          | Unified proxy for all AI API calls.         |
| **Storage**   | `IndexedDB`                              | Client-side database for storing projects.  |
|           | `localStorage`                           | Storing settings, templates, and memory.    |

---

## 3. Project Structure

```
kalpana/
├─ api/
│  ├─ ai-proxy.ts        # Unified serverless function for all AI provider requests.
│  └─ health.js          # Health check endpoint for the API.
├─ src/
│  ├─ pages/
│  │  ├─ HomePage.tsx         # Step 1: Product and image selection.
│  │  ├─ CreativeBriefPage.tsx # Step 2: Brand kit and targeting setup.
│  │  ├─ ProductEnrichmentPage.tsx # Step 3: AI analysis and creative direction editing.
│  │  ├─ MusicSelectionPage.tsx # Step 4: Music mood selection.
│  │  ├─ NarrationVoicePage.tsx # Step 5: Voice style selection.
│  │  ├─ StoryboardPage.tsx   # Step 6: Storyboard generation and editing.
│  │  ├─ VideoPage.tsx        # Step 7: Final video generation and tweaking.
│  │  ├─ DashboardPage.tsx    # Main landing page, shows project overview.
│  │  ├─ VideoLibraryPage.tsx # View and manage saved videos.
│  │  ├─ TemplatesPage.tsx    # Manage and load creative templates.
│  │  └─ SettingsPage.tsx     # Configure AI providers and other settings.
│  ├─ components/
│  │  ├─ Sidebar.tsx          # Main navigation sidebar.
│  │  ├─ Loader.tsx           # Reusable loading spinner component.
│  │  ├─ ErrorBoundary.tsx    # Catches runtime errors to prevent app crashes.
│  │  ├─ ProjectTable.tsx     # Displays list of projects on the dashboard.
│  │  └─ StoryboardViewer.tsx # Interactive component for editing storyboards.
│  ├─ services/
│  │  ├─ index.ts             # Main service orchestrator for the user workflow.
│  │  ├─ aiService.ts         # Handles calls to the backend AI proxy.
│  │  ├─ dbService.ts         # Manages all IndexedDB operations for projects.
│  │  ├─ promptService.ts     # Constructs detailed prompts for the AI models.
│  │  └─ templateService.ts   # Manages CRUD operations for local storage templates.
│  ├─ types/
│  │  └─ types.ts           # Centralized TypeScript type and interface definitions.
│  └─ utils/
│     └─ fileUtils.ts       # Helper functions for image processing and resizing.
└─ README.md               # Project documentation and setup guide.
```

---

## 4. User Workflow

The application follows a linear, multi-step workflow for creating a new video:

1.  **Dashboard (`DashboardPage.tsx`)**
    -   **Actions:** Start a new project, view existing projects.
2.  **Product Selection (`HomePage.tsx`)**
    -   **Actions:** Select a product, upload a main image, upload reference images.
    -   **Data:** `Product`, `ImageInfo[]`.
3.  **Creative Brief (`CreativeBriefPage.tsx`)**
    -   **Actions:** Define brand kit, target audience, platform, aspect ratio.
    -   **Data:** `BrandKit`, `Targeting`.
4.  **Product Enrichment (`ProductEnrichmentPage.tsx`)**
    -   **Actions:** AI performs analysis (with optional Google Search), user can edit creative direction.
    -   **Data:** `IntegratedAnalysisReport`.
5.  **Music & Voice (`MusicSelectionPage.tsx`, `NarrationVoicePage.tsx`)**
    -   **Actions:** Select music mood and narration voice style.
    -   **Data:** `Music`, `NarrationVoiceSetting`.
6.  **Storyboard Generation (`StoryboardPage.tsx`)**
    -   **Actions:** AI generates storyboard, user can edit scenes, script, and text overlays.
    -   **Data:** `Storyboard`.
7.  **Video Generation (`VideoPage.tsx`)**
    -   **Actions:** AI generates the final video, user can tweak and re-generate.
    -   **Data:** `videoBlob`. Project is saved to IndexedDB.

---

## 5. API Endpoints

The application uses a single, powerful proxy endpoint to manage all AI interactions.

-   **Endpoint:** `/api/ai-proxy`
-   **Method:** `POST`
-   **Purpose:** Acts as a secure gateway to multiple AI providers (Gemini, Hugging Face, etc.). It prevents client-side exposure of API keys and handles complex request/response cycles.
-   **Input Parameters (JSON Body):**
    -   `provider`: `string` (e.g., 'gemini', 'huggingface')
    -   `endpoint`: `string` (e.g., 'generateContent', 'generateVideos')
    -   `body`: `object` (The specific payload for the target AI model)
-   **Output Format:** `{ success: boolean, data: any, error?: string }`
-   **External Calls:** Google GenAI SDK, Hugging Face API, etc.
-   **Error Handling:** Catches API errors, quota issues, and network failures, returning a structured error response.

---

## 6. Data Flow Diagram

```
[User on Frontend]
       |
(1. Provides Product Info, Images, Brand Kit)
       ↓
[React Components (src/pages/*)]
       |
(2. Gathers data into a 'VideoProject' object)
       ↓
[Analysis Service (src/services/index.ts -> performIntegratedAnalysis)]
       |
(3. Builds detailed prompt, calls AI proxy)
       ↓
[API Proxy Endpoint (/api/ai-proxy.ts)]
       |
(4. Receives request, selects provider, forwards to AI with server-side key)
       ↓
[External AI Service (e.g., Google Gemini API)]
       |
(5. Processes prompt and images, returns JSON or operation status)
       ↓
[API Proxy Endpoint (/api/ai-proxy.ts)]
       |
(6. Cleans/parses response, returns structured data to frontend)
       ↓
[Analysis Service (src/services/index.ts)]
       |
(7. Receives parsed data, transforms it for UI)
       ↓
[React Components (ProductEnrichmentPage.tsx)]
       |
(8. Displays results, user edits and proceeds through workflow)
       ↓
[DB Service (src/services/dbService.ts)]
       |
(9. On final step, saves the complete project with video blob to IndexedDB)
```

---

## 7. Key Functions & Algorithms

1.  **`performIntegratedAnalysis()`** in `src/services/index.ts`
    -   **Purpose:** Orchestrates the most complex step of the workflow. It builds a prompt using product, targeting, brand data, and competitor insights, calls the AI proxy, and transforms the response into a format the UI can use.
2.  **`handleGemini()`** in `api/ai-proxy.ts`
    -   **Purpose:** The core logic of the backend proxy for Google services. It routes requests to the correct Gemini endpoint (`generateContent`, `generateVideos`), sanitizes parameters to prevent API conflicts, and handles response cleaning.
3.  **`runVideoGeneration()`** in `src/pages/VideoPage.tsx`
    -   **Purpose:** Manages the asynchronous video generation process. It calls the `generateVideos` endpoint, then polls the `getVideosOperation` endpoint until the video is ready or an error occurs.
4.  **`addProject()` / `updateProject()`** in `src/services/dbService.ts`
    -   **Purpose:** Manages the persistence layer of the application, saving and updating complete video projects in the user's local IndexedDB.

---

## 8. State Management

-   **Component State (`useState`):** Used extensively within each page of the workflow to manage form inputs and local UI state.
-   **Prop Drilling:** The main `App.tsx` component holds the master `projectData` state object and passes it down through the workflow steps.
-   **Persistent State:**
    -   `localStorage`: Used for user settings (e.g., selected AI provider), saved brand kits, category templates, and the AI Director's Memory Log.
    -   `IndexedDB`: Used as the primary database for storing all generated video projects, including large data like video blobs.

---

## 9. Current Limitations & Known Bugs

-   **Dashboard Display:** The dashboard does not yet fetch and display the list of projects saved in IndexedDB.
-   **No Re-Edit Functionality:** The "Edit" button on the dashboard leads to a placeholder page.
-   **No Central State Management:** Heavy reliance on prop drilling can make state management complex as the application grows.

---
## 10. Deployment & Security

-   **Platform:** Vercel
-   **Deployment:** Automatic deployments triggered by pushes to the `main` GitHub branch.
-   **API Key Management:** All API keys are stored as server-side environment variables in Vercel, ensuring they are never exposed to the client.
-   **CORS:** The `/api/ai-proxy.ts` function handles CORS preflight requests and sets the appropriate headers for responses.