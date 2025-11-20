// api/health.js
export default (req, res) => {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const apiKeyExists = !!(process.env.GEMINI_API_KEY || process.env.API_KEY);

  if (!apiKeyExists) {
    return res.status(500).json({
      status: 'error',
      message: 'API_KEY is not configured on the server.'
    });
  }

  return res.status(200).json({
    status: 'ok',
    message: 'API proxy is live.'
  });
};
