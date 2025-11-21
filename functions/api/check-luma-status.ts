// functions/api/check-luma-status.ts

interface Env {
    LUMA_API_KEY: string;
}

export async function onRequest(context: {
    request: Request;
    env: Env;
}) {
    const { request, env } = context;
    const url = new URL(request.url);
    const generationId = url.searchParams.get('id');

    // CORS headers
    const corsHeaders = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
    };

    if (request.method === 'OPTIONS') {
        return new Response(null, { headers: corsHeaders });
    }

    if (!generationId) {
        return new Response(JSON.stringify({
            success: false,
            error: 'missing_id',
            message: 'Generation ID is required'
        }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }

    if (!env.LUMA_API_KEY) {
        return new Response(JSON.stringify({
            success: false,
            error: 'missing_config',
            message: 'Luma API key not configured'
        }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }

    try {
        const response = await fetch(
            `https://api.lumalabs.ai/dream-machine/v1/generations/${generationId}`,
            {
                headers: {
                    'Authorization': `Bearer ${env.LUMA_API_KEY}`
                }
            }
        );

        if (!response.ok) {
            throw new Error(`Luma API error: ${response.status}`);
        }

        const data = await response.json();

        return new Response(JSON.stringify({
            success: true,
            data: data
        }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });

    } catch (error: any) {
        return new Response(JSON.stringify({
            success: false,
            error: 'check_failed',
            message: error.message
        }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }
}
