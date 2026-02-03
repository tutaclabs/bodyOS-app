import { isBackendConfigured } from './auth-api';
import { apiFetch } from './api-client';

export async function generateInsights(protocols, nutritionFloors) {
  if (!isBackendConfigured()) {
    throw new Error('Backend not configured. Please set API_URL in environment variables.');
  }

  const res = await apiFetch('/ai/insights', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ protocols: protocols || [], nutritionFloors: nutritionFloors || null }),
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json?.error || `API error: ${res.status}`);
  return { insights: Array.isArray(json?.insights) ? json.insights : [] };
}
