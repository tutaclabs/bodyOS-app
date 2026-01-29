import { isBackendConfigured } from './auth-api';
import { apiFetch } from './api-client';

export async function generateInsights(protocols, nutritionFloors, apiKey) {
  if (isBackendConfigured()) {
    const res = await apiFetch('/ai/insights', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ protocols: protocols || [], nutritionFloors: nutritionFloors || null }),
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(json?.error || `API error: ${res.status}`);
    return { insights: Array.isArray(json?.insights) ? json.insights : [] };
  }

  if (!apiKey) {
    throw new Error('OpenAI API key is required');
  }

  const data = {
    protocolCount: protocols?.length || 0,
    protocols: (protocols || []).map(p => ({
      name: p.name || 'Unknown',
      cycleOn: p.cycleOn || 0,
      cycleOff: p.cycleOff || 0
    })),
    nutrition: nutritionFloors ? {
      protein: {
        current: nutritionFloors.protein?.current || 0,
        target: nutritionFloors.protein?.target || 0
      },
      fiber: {
        current: nutritionFloors.fiber?.current || 0,
        target: nutritionFloors.fiber?.target || 0
      },
      hydration: {
        current: nutritionFloors.hydration?.current || 0,
        target: nutritionFloors.hydration?.target || 0
      }
    } : null
  };

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
          content: 'You are a biohacking insights assistant. Analyze user data (protocols and nutrition) and provide 2-3 concise, actionable insights. Return ONLY valid JSON: {"insights": ["insight1", "insight2", "insight3"]}. Be specific, helpful, and focus on patterns, gaps, or optimization opportunities.'
        },
        {
          role: 'user',
          content: `Analyze this biohacking data and provide insights: ${JSON.stringify(data)}`
        }
      ],
      response_format: { type: 'json_object' },
      max_tokens: 300,
      temperature: 0.7
    })
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: { message: 'API request failed' } }));
    throw new Error(error.error?.message || `API error: ${response.status}`);
  }

  const result = await response.json();
  const parsed = JSON.parse(result.choices[0].message.content);
  
  return {
    insights: Array.isArray(parsed.insights) ? parsed.insights : []
  };
}
