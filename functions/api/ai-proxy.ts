// functions/api/ai-proxy.ts
// Cloudflare Pages compatible version
// Converted from Vercel serverless function format

import { GoogleGenAI } from '@google/genai';

// Cloudflare Pages environment interface
interface Env {
  ANTHROPIC_API_KEY: string;
  GOOGLE_API_KEY: string;
  API_KEY: string;
  DEEPSEEK_API_KEY: string;
  OPENAI_API_KEY: string;
  XAI_API_KEY: string;
  MOONSHOT_API_KEY: string;
  HUGGING_FACE_API_KEY: string;
}

// Cloudflare Pages request context
interface CloudflareContext {
  request: Request;
  env: Env;
  params: any;
  waitUntil: (promise: Promise<any>) => void;
  passThroughOnException: () => void;
}

// Helper to send JSON response
const jsonResponse = (data: any, status: number = 200) => {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
};

// Claude (Anthropic) Handler - BEST QUALITY
async function handleClaude(prompt: string, images?: string[], systemPrompt?: string, test: boolean = false, env?: Env): Promise<string> {
  const ANTHROPIC_API_KEY = env?.ANTHROPIC_API_KEY;
  if (!ANTHROPIC_API_KEY) throw new Error('Anthropic API key not configured');
  if (test) return 'OK';

  console.log('[Claude] Generating with Claude 3.5 Sonnet');
  const content: any[] = [];
  if (images?.length) {
    for (const imageUrl of images) {
      if (imageUrl.startsWith('data:image/')) {
        const match = imageUrl.match(/^data:image\/(\w+);base64,(.+)$/);
        if (match) content.push({ type: 'image', source: { type: 'base64', media_type: `image/${match[1]}`, data: match[2] } });
      }
    }
  }
  content.push({ type: 'text', text: prompt });

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-api-key': ANTHROPIC_API_KEY, 'anthropic-version': '2023-06-01' },
    body: JSON.stringify({
      model: 'claude-3-5-sonnet-20240620',
      max_tokens: 4096,
      system: systemPrompt || 'You are a helpful assistant.',
      messages: [{ role: 'user', content }]
    })
  });
  if (!response.ok) { const error = await response.text(); throw new Error(`Claude API failed: ${error}`); }
  const data = await response.json();
  return data.content[0]?.text || '';
}

// DeepSeek Handler - BEST VALUE & NOW WITH VISION
async function handleDeepSeek(prompt: string, images?: string[], systemPrompt?: string, test: boolean = false, env?: Env): Promise<string> {
    const DEEPSEEK_API_KEY = env?.DEEPSEEK_API_KEY;
    if (!DEEPSEEK_API_KEY) throw new Error('DeepSeek API key not configured');
    if (test) return 'OK';

    const hasImages = images && images.length > 0;
    const model = hasImages ? 'deepseek-vision' : 'deepseek-chat';
    console.log(`[DeepSeek] Generating with ${model}`);
    
    const messages: any[] = [];
    if (systemPrompt) {
        messages.push({ role: 'system', content: systemPrompt });
    }

    let userContent: any;
    if (hasImages) {
        const contentParts: any[] = [{ type: 'text', text: prompt }];
        for (const imageUrl of images) {
          contentParts.push({ type: 'image_url', image_url: { url: imageUrl } });
        }
        userContent = contentParts;
    } else {
        userContent = prompt;
    }
    
    messages.push({ role: 'user', content: userContent });

    const response = await fetch('https://api.deepseek.com/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${DEEPSEEK_API_KEY}` },
        body: JSON.stringify({ model, messages, max_tokens: 4096, temperature: 0.7 })
    });
    if (!response.ok) { 
        const errorText = await response.text(); 
        console.error("DeepSeek API Raw Error:", errorText);
        throw new Error(`DeepSeek API failed: ${errorText}`); 
    }
    const data = await response.json();
    return data.choices[0]?.message?.content || '';
}

// Perplexity Handler - DISABLED
async function handlePerplexity(): Promise<string> {
  throw new Error('Perplexity provider has been temporarily disabled due to API instability.');
}

// Moonshot Handler
async function handleMoonshot(prompt: string, images?: string[], systemPrompt?: string, test: boolean = false, env?: Env): Promise<string> {
  const MOONSHOT_API_KEY = env?.MOONSHOT_API_KEY;
  if (!MOONSHOT_API_KEY) throw new Error('Moonshot API key not configured');
  if (test) return 'OK';

  if (images && images.length > 0) {
    console.log('[Moonshot] Warning: Images provided but Moonshot is text-only');
  }
  console.log('[Moonshot] Generating with moonshot-v1-8k');
  const messages = [{ role: 'user', content: prompt }];
  if (systemPrompt) {
    messages.unshift({ role: 'system', content: systemPrompt } as any);
  }
   const response = await fetch('https://api.moonshot.cn/v1/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${MOONSHOT_API_KEY}` },
        body: JSON.stringify({ model: 'moonshot-v1-8k', messages, max_tokens: 4096, temperature: 0.7 })
    });
    if (!response.ok) { const error = await response.text(); throw new Error(`Moonshot API failed: ${error}`); }
    const data = await response.json();
    return data.choices[0]?.message?.content || '';
}

// OpenAI Handler - Fully functional vision/text provider
async function handleOpenAI(prompt: string, images?: string[], systemPrompt?: string, test: boolean = false, env?: Env): Promise<string> {
  const OPENAI_API_KEY = env?.OPENAI_API_KEY;
  if (!OPENAI_API_KEY) throw new Error('OpenAI API key not configured');
  if (test) return 'OK';

  const hasImages = images && images.length > 0;
  const model = 'gpt-4o';
  console.log(`[OpenAI] Generating with ${model}`);

  const messages: any[] = [];
  if (systemPrompt) {
    messages.push({ role: 'system', content: systemPrompt });
  }

  const userContent: any[] = [{ type: 'text', text: prompt }];
  if (hasImages) {
    for (const imageUrl of images) {
      userContent.push({ type: 'image_url', image_url: { url: imageUrl } });
    }
  }

  messages.push({ role: 'user', content: userContent });

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${OPENAI_API_KEY}`
    },
    body: JSON.stringify({
      model: model,
      messages: messages,
      max_tokens: 4096,
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("OpenAI API Raw Error:", errorText);
    throw new Error(`OpenAI API failed: ${errorText}`);
  }

  const data = await response.json();
  return data.choices[0]?.message?.content || '';
}

// xAI (Grok) Handler
async function handleXAI(prompt: string, images?: string[], systemPrompt?: string, test: boolean = false, env?: Env): Promise<string> {
  const XAI_API_KEY = env?.XAI_API_KEY;
  if (!XAI_API_KEY) throw new Error('xAI API key not configured');
  if (test) return 'OK';

  if (images && images.length > 0) {
    throw new Error('xAI/Grok provider does not support images.');
  }

  const model = 'grok-4-latest';
  console.log(`[xAI] Generating with ${model}`);

  const messages: any[] = [];
  if (systemPrompt) {
    messages.push({ role: 'system', content: systemPrompt });
  }
  messages.push({ role: 'user', content: prompt });

  const response = await fetch('https://api.x.ai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${XAI_API_KEY}`
    },
    body: JSON.stringify({
      model: model,
      messages: messages,
      temperature: 0.7,
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("xAI API Raw Error:", errorText);
    throw new Error(`xAI API failed: ${errorText}`);
  }

  const data = await response.json();
  return data.choices[0]?.message?.content || '';
}

// Gemini Handler - VISION CAPABLE FALLBACK
async function handleGemini(prompt: string, images?: string[], systemPrompt?: string, test: boolean = false, env?: Env): Promise<string> {
    const GOOGLE_API_KEY = env?.GOOGLE_API_KEY || env?.API_KEY;
    if (!GOOGLE_API_KEY) throw new Error('Google API key not configured');
    if (test) return 'OK';

    const hasImages = images && images.length > 0;
    const modelName = hasImages ? 'gemini-2.5-pro' : 'gemini-2.5-flash';
    console.log(`[Gemini] Generating with ${modelName}`);

    const ai = new GoogleGenAI({ apiKey: GOOGLE_API_KEY });
    
    const parts: any[] = [{ text: prompt }];
    if (hasImages) {
        for (const imageUrl of images) {
            if (imageUrl.startsWith('data:image/')) {
                const match = imageUrl.match(/^data:image\/(\w+);base64,(.+)$/);
                if (match) {
                    parts.unshift({ inlineData: { mimeType: `image/${match[1]}`, data: match[2] } });
                }
            }
        }
    }
    
    const response = await ai.models.generateContent({
        model: modelName,
        contents: { parts: parts },
        config: systemPrompt ? { systemInstruction: systemPrompt } : {}
    });
    
    return response.text;
}

// Main Cloudflare Pages handler
export async function onRequest(context: CloudflareContext) {
  const { request, env } = context;

  // Handle CORS preflight
  if (request.method === 'OPTIONS') {
    return jsonResponse(null, 200);
  }

  // Only allow POST
  if (request.method !== 'POST') {
    return jsonResponse({ success: false, error: 'Only POST method is allowed' }, 405);
  }

  try {
    const { provider, prompt, images, systemPrompt, test } = await request.json();
    
    let result: any;
    
    switch (provider) {
      case 'claude':
        result = await handleClaude(prompt, images, systemPrompt, test, env);
        break;
      case 'deepseek':
        result = await handleDeepSeek(prompt, images, systemPrompt, test, env);
        break;
      case 'perplexity':
        result = await handlePerplexity();
        break;
      case 'gemini':
        result = await handleGemini(prompt, images, systemPrompt, test, env);
        break;
      case 'moonshot':
        result = await handleMoonshot(prompt, images, systemPrompt, test, env);
        break;
      case 'openai':
         result = await handleOpenAI(prompt, images, systemPrompt, test, env);
         break;
      case 'xai':
         result = await handleXAI(prompt, images, systemPrompt, test, env);
         break;
      default:
        return jsonResponse({ success: false, error: `Unsupported AI provider: ${provider}` }, 400);
    }
    
    return jsonResponse({ success: true, data: result });
  } catch (error: any) {
    console.error(`[AI Proxy Error]`, error);
    const message = error.details || error.message || 'An unexpected error occurred.';
    return jsonResponse({ success: false, error: message }, 500);
  }
}
