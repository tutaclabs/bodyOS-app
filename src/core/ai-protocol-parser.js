import { isBackendConfigured } from './auth-api';
import { apiFetch } from './api-client';

export async function parseProtocolFromText(text, apiKey) {
  if (isBackendConfigured()) {
    if (!text || !text.trim()) throw new Error('Text cannot be empty');
    try {
      const res = await apiFetch('/ai/protocol-parser', {
        method: 'POST',
        body: JSON.stringify({ text: text.trim() }),
      });
      return {
        compoundName: res?.compoundName || res?.name || 'Unknown Protocol',
        vialSizeMg: Number(res?.vialSizeMg) || 0,
        reconstitutionMl: Number(res?.reconstitutionMl) || 0,
        doseMcg: Number(res?.doseMcg) || 0,
        frequency: res?.frequency || 'daily',
        schedule: res?.schedule || { onDays: 5, offDays: 2 },
        estimatedVialDays: Number(res?.estimatedVialDays) || 0,
      };
    } catch (error) {
      throw new Error(error.message || 'Failed to parse protocol');
    }
  }

  if (!apiKey) {
    throw new Error('OpenAI API key is required');
  }

  if (!text || !text.trim()) {
    throw new Error('Text cannot be empty');
  }

  const systemPrompt = 'You are a Bio-OS Protocol Extractor. Parse unstructured text into structured JSON protocol.\n\n' +
    'Rules:\n' +
    '1. Default units: mg for vials, ml for water, mcg for doses unless specified.\n' +
    '2. If frequency is missing, assume "Once Daily" (daily).\n' +
    '3. If days are mentioned (e.g., "5 on 2 off"), calculate the schedule accordingly.\n' +
    '4. Calculate estimatedVialDays based on vialSizeMg, reconstitutionMl, doseMcg, and frequency.\n' +
    '5. Output ONLY valid JSON.\n\n' +
    'Target JSON Structure:\n' +
    '{\n' +
    '  "compoundName": string,\n' +
    '  "vialSizeMg": number,\n' +
    '  "reconstitutionMl": number,\n' +
    '  "doseMcg": number,\n' +
    '  "frequency": "daily" | "twice_daily" | "weekly",\n' +
    '  "schedule": { "onDays": number, "offDays": number },\n' +
    '  "estimatedVialDays": number\n' +
    '}';

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: systemPrompt
        },
        {
          role: 'user',
          content: `Parse this protocol description: "${text.trim()}"`
        }
      ],
      response_format: { type: 'json_object' },
      max_tokens: 300,
      temperature: 0.3
    })
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: { message: 'API request failed' } }));
    throw new Error(error.error?.message || `API error: ${response.status}`);
  }

  const data = await response.json();
  const parsed = JSON.parse(data.choices[0].message.content);
  
  const frequency = parsed?.frequency === 'twice_daily' || parsed?.frequency === 'weekly' 
    ? parsed.frequency 
    : 'daily';
  
  const onDays = Number(parsed?.schedule?.onDays) || Number(parsed?.onDays) || 5;
  const offDays = Number(parsed?.schedule?.offDays) || Number(parsed?.offDays) || 2;
  
  const vialSizeMg = Number(parsed?.vialSizeMg) || 0;
  const reconstitutionMl = Number(parsed?.reconstitutionMl) || 0;
  const doseMcg = Number(parsed?.doseMcg) || 0;
  
  let estimatedVialDays = Number(parsed?.estimatedVialDays) || 0;
  if (estimatedVialDays === 0 && vialSizeMg > 0 && reconstitutionMl > 0 && doseMcg > 0) {
    const totalMcg = (vialSizeMg * 1000);
    const concentrationMcgPerMl = totalMcg / reconstitutionMl;
    const dailyDoseMl = frequency === 'twice_daily' 
      ? (doseMcg * 2) / concentrationMcgPerMl
      : frequency === 'weekly'
      ? doseMcg / (concentrationMcgPerMl * 7)
      : doseMcg / concentrationMcgPerMl;
    estimatedVialDays = Math.floor(reconstitutionMl / dailyDoseMl);
  }
  
  return {
    compoundName: parsed?.compoundName || parsed?.name || 'Unknown Protocol',
    vialSizeMg,
    reconstitutionMl,
    doseMcg,
    frequency,
    schedule: { onDays, offDays },
    estimatedVialDays: estimatedVialDays || 0,
  };
}
