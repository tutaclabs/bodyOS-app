import { isBackendConfigured } from './auth-api';
import { apiFetch } from './api-client';

export async function parseProtocolFromText(text, apiKey) {
  if (isBackendConfigured()) {
    if (!text || !text.trim()) throw new Error('Text cannot be empty');
    const res = await apiFetch('/ai/protocol-parser', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: text.trim() }),
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(json?.error || `API error: ${res.status}`);
    return {
      name: json?.name || 'Unknown Protocol',
      cycleOn: Number(json?.cycleOn) || 5,
      cycleOff: Number(json?.cycleOff) || 2,
    };
  }

  if (!apiKey) {
    throw new Error('OpenAI API key is required');
  }

  if (!text || !text.trim()) {
    throw new Error('Text cannot be empty');
  }

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
          content: 'You are a protocol parser for a biohacking app. Extract protocol details from natural language. Return ONLY valid JSON: {"name": "string", "cycleOn": number, "cycleOff": number}. If information is missing, use defaults: cycleOn=5, cycleOff=2. Extract the compound/protocol name and cycle days from text.'
        },
        {
          role: 'user',
          content: `Parse this protocol description: "${text.trim()}"`
        }
      ],
      response_format: { type: 'json_object' },
      max_tokens: 200,
      temperature: 0.3
    })
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: { message: 'API request failed' } }));
    throw new Error(error.error?.message || `API error: ${response.status}`);
  }

  const data = await response.json();
  const parsed = JSON.parse(data.choices[0].message.content);
  
  return {
    name: parsed.name || 'Unknown Protocol',
    cycleOn: Number(parsed.cycleOn) || 5,
    cycleOff: Number(parsed.cycleOff) || 2
  };
}
