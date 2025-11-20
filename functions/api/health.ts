// functions/api/health.ts
// Simple health check endpoint for Cloudflare Pages

export async function onRequest() {
    return new Response(JSON.stringify({
        success: true,
        status: 'healthy',
        timestamp: new Date().toISOString(),
        platform: 'Cloudflare Pages',
        message: 'Kalpana AI Video Studio API is running'
    }), {
        status: 200,
        headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
        },
    });
}
