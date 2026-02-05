import { isBackendConfigured } from './auth-api';
import { apiFetch } from './api-client';

export async function checkProtocolSafety(protocols, language = 'en') {
  if (!isBackendConfigured()) {
    throw new Error('Backend not configured. Please set API_URL in environment variables.');
  }

  if (!protocols || !Array.isArray(protocols) || protocols.length === 0) {
    return { safe: true, warnings: [], recommendations: [] };
  }

  const res = await apiFetch('/ai/safety', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ protocols: protocols || [], language }),
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json?.error || `API error: ${res.status}`);
  return {
    safe: json?.safe !== false,
    warnings: Array.isArray(json?.warnings) ? json.warnings : [],
    recommendations: Array.isArray(json?.recommendations) ? json.recommendations : [],
  };
}
