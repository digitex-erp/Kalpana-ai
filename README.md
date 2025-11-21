# Kalpana AI Video Generator

## Project Overview
Kalpana is an AI-powered video generation platform designed to create marketing videos from product images. It leverages:
- **Cloudflare Pages** for hosting and serverless functions.
- **React** for the frontend UI.
- **RunwayML** (Gen-3 Alpha Turbo) for video generation.
- **Cloudinary** for asset management and video composition.

## Recent Updates
- **Fixed:** Video generation API endpoint (`generate-script-and-video`) migrated to Cloudflare Functions.
- **Added:** StickerBazaar scraping script.
- **Deployment:** Auto-deploys from `main` branch.
- **Last Update:** Triggering build at 2025-11-21T11:30:00

## Setup
1. `npm install`
2. `npm run dev`

## Environment Variables
Ensure the following are set in Cloudflare Pages:
- `CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`
- `RUNWAY_API_KEY`