// Vercel serverless function — proxies AI requests to Groq (OpenAI-compatible).
// The GROQ_API_KEY is read from environment variables and never exposed to the browser.
//
// GET  /api/ai  -> health check: { ok, provider, model }
// POST /api/ai  -> { prompt: string, temperature?: number } => { response: string }

const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions';
const DEFAULT_MODEL = process.env.GROQ_MODEL || 'llama-3.3-70b-versatile';

export default async function handler(req: any, res: any) {
  const apiKey = process.env.GROQ_API_KEY;

  if (req.method === 'GET') {
    res.status(apiKey ? 200 : 503).json({
      ok: Boolean(apiKey),
      provider: 'groq',
      model: DEFAULT_MODEL,
    });
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  if (!apiKey) {
    res.status(503).json({ error: 'AI service not configured (missing GROQ_API_KEY).' });
    return;
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
    const prompt: string = body.prompt ?? '';
    const temperature: number = typeof body.temperature === 'number' ? body.temperature : 0.1;

    if (!prompt.trim()) {
      res.status(400).json({ error: 'Missing "prompt".' });
      return;
    }

    const groqRes = await fetch(GROQ_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: DEFAULT_MODEL,
        messages: [{ role: 'user', content: prompt }],
        temperature,
        response_format: { type: 'json_object' },
      }),
    });

    if (!groqRes.ok) {
      const errText = await groqRes.text();
      res.status(groqRes.status).json({ error: `Groq API error: ${errText}` });
      return;
    }

    const json = await groqRes.json();
    const content: string = json?.choices?.[0]?.message?.content ?? '';
    res.status(200).json({ response: content });
  } catch (err) {
    res.status(500).json({ error: err instanceof Error ? err.message : 'AI request failed.' });
  }
}
