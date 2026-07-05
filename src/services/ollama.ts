// Ollama local AI service — calls http://localhost:11434 by default

export type DataType = 'steps' | 'measurements' | 'prs' | 'sleep' | 'nutrition' | 'workouts' | 'unknown';

export interface ParseResult {
  dataType: DataType;
  confidence: number;
  data: Record<string, unknown>[];
  notes: string;
  rawResponse?: string;
}

export interface CoachInsights {
  insights: string[];
  alert: string;
  praise: string;
}

export interface OllamaModelInfo {
  name: string;
  modified_at: string;
  size: number;
}

// ── Connection ────────────────────────────────────────────────────────────────

export async function checkOllamaConnection(baseUrl: string): Promise<boolean> {
  try {
    const res = await fetch(`${baseUrl}/api/tags`, { signal: AbortSignal.timeout(4000) });
    return res.ok;
  } catch {
    return false;
  }
}

export async function listOllamaModels(baseUrl: string): Promise<OllamaModelInfo[]> {
  try {
    const res = await fetch(`${baseUrl}/api/tags`, { signal: AbortSignal.timeout(4000) });
    if (!res.ok) return [];
    const json = await res.json();
    return (json.models ?? []) as OllamaModelInfo[];
  } catch {
    return [];
  }
}

// ── Cloud backend (Vercel serverless → Groq) ────────────────────────────────────

export const CLOUD_ENDPOINT = '/api/ai';

export interface CloudInfo {
  ok: boolean;
  provider: string;
  model: string;
}

// Checks whether the hosted /api/ai function is available (used when deployed).
export async function checkCloudConnection(): Promise<CloudInfo | null> {
  try {
    const res = await fetch(CLOUD_ENDPOINT, { method: 'GET', signal: AbortSignal.timeout(4000) });
    if (!res.ok) return null;
    const json = await res.json();
    return json?.ok ? (json as CloudInfo) : null;
  } catch {
    return null;
  }
}

async function cloudGenerate(prompt: string, temperature = 0.1): Promise<string> {
  const res = await fetch(CLOUD_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt, temperature }),
    signal: AbortSignal.timeout(120_000),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`AI API error ${res.status}: ${err}`);
  }

  const json = await res.json();
  return json.response as string;
}

// ── File reading helpers ───────────────────────────────────────────────────────

export async function readFileAsText(file: File): Promise<string> {
  const ext = file.name.split('.').pop()?.toLowerCase() ?? '';

  if (ext === 'xlsx' || ext === 'xls') {
    const { read, utils } = await import('xlsx');
    const buffer = await file.arrayBuffer();
    const workbook = read(buffer, { type: 'array' });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    return utils.sheet_to_csv(sheet);
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = e => resolve(e.target!.result as string);
    reader.onerror = reject;
    reader.readAsText(file);
  });
}

// ── Prompts ───────────────────────────────────────────────────────────────────

const PARSE_SCHEMA_PROMPT = `You are a fitness data parser. Analyze the data below and map it to the best matching fitness schema.

Available schemas:
1. "steps"        – { "date":"YYYY-MM-DD", "steps":number, "goal":number }
2. "measurements" – { "date":"YYYY-MM-DD", "weight":number(kg), "chest":number(cm), "waist":number(cm), "hips":number(cm), "thighs":number(cm), "arms":number(cm), "bodyFat":number(%) }
3. "prs"          – { "exercise":string, "weight":number(kg,0=bodyweight), "reps":number, "date":"YYYY-MM-DD", "notes":string }
4. "sleep"        – { "date":"YYYY-MM-DD", "hoursSlept":number, "quality":"poor"|"fair"|"good"|"excellent", "bedtime":"HH:MM", "wakeTime":"HH:MM" }
5. "nutrition"    – { "date":"YYYY-MM-DD", "calories":number, "protein":number(g), "carbs":number(g), "fat":number(g), "water":number(litres) }
6. "workouts"     – { "name":string, "date":"YYYY-MM-DD", "duration":number(minutes), "notes":string }

Rules:
- Convert lbs→kg (÷2.205), inches→cm (×2.54), oz/fl oz water to litres
- Format all dates as YYYY-MM-DD (today = ${new Date().toISOString().split('T')[0]})
- Fill missing numeric fields with 0, missing strings with ""
- Return ONLY valid JSON, no markdown fences

Output format (strict):
{"dataType":"<schema name>","confidence":<0-100>,"data":[<mapped rows>],"notes":"<brief explanation of mapping>"}

Data to parse:
`;

const INSIGHTS_SYSTEM = `You are Coach Ryan, an elite personal trainer and sports nutritionist. Be direct, specific and motivating. Respond ONLY with valid JSON, no markdown.

Output format (strict):
{"insights":["tip1","tip2","tip3","tip4"],"alert":"most urgent single issue to fix","praise":"one thing they are doing really well"}`;

// ── API calls ─────────────────────────────────────────────────────────────────

async function ollamaGenerate(
  baseUrl: string,
  model: string,
  prompt: string,
  temperature = 0.1,
): Promise<string> {
  const res = await fetch(`${baseUrl}/api/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model,
      prompt,
      stream: false,
      format: 'json',
      options: { temperature, num_predict: 2048 },
    }),
    signal: AbortSignal.timeout(120_000),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Ollama API error ${res.status}: ${err}`);
  }

  const json = await res.json();
  return json.response as string;
}

// Routes a generation request to the cloud backend (deployed) or local Ollama (dev).
async function generate(
  baseUrl: string,
  model: string,
  prompt: string,
  temperature: number,
  useCloud: boolean,
): Promise<string> {
  return useCloud
    ? cloudGenerate(prompt, temperature)
    : ollamaGenerate(baseUrl, model, prompt, temperature);
}

export async function parseDataWithOllama(
  baseUrl: string,
  model: string,
  rawContent: string,
  useCloud = false,
): Promise<ParseResult> {
  // Truncate to 5000 chars to fit context window
  const truncated = rawContent.length > 5000 ? rawContent.slice(0, 5000) + '\n[...truncated]' : rawContent;
  const prompt = PARSE_SCHEMA_PROMPT + truncated;

  const raw = await generate(baseUrl, model, prompt, 0.05, useCloud);

  let parsed: Record<string, unknown>;
  try {
    parsed = JSON.parse(raw);
  } catch {
    // Try to extract JSON from the response
    const match = raw.match(/\{[\s\S]*\}/);
    if (!match) throw new Error(`Could not extract JSON from model response.\n\nRaw: ${raw.slice(0, 300)}`);
    parsed = JSON.parse(match[0]);
  }

  return {
    dataType: (parsed.dataType as DataType) ?? 'unknown',
    confidence: Number(parsed.confidence) ?? 0,
    data: Array.isArray(parsed.data) ? (parsed.data as Record<string, unknown>[]) : [],
    notes: String(parsed.notes ?? ''),
    rawResponse: raw,
  };
}

export async function getAICoachInsights(
  baseUrl: string,
  model: string,
  clientData: string,
  useCloud = false,
): Promise<CoachInsights> {
  const prompt = `${INSIGHTS_SYSTEM}\n\nClient data:\n${clientData}`;
  const raw = await generate(baseUrl, model, prompt, 0.7, useCloud);

  let parsed: Record<string, unknown>;
  try {
    parsed = JSON.parse(raw);
  } catch {
    const match = raw.match(/\{[\s\S]*\}/);
    if (!match) throw new Error('Could not parse insights from model response.');
    parsed = JSON.parse(match[0]);
  }

  return {
    insights: Array.isArray(parsed.insights) ? (parsed.insights as string[]) : [],
    alert: String(parsed.alert ?? ''),
    praise: String(parsed.praise ?? ''),
  };
}
