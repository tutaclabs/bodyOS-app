import { isBackendConfigured } from './auth-api';
import { apiFetch } from './api-client';

export async function parseProtocolFromText(text) {
  if (!isBackendConfigured()) {
    throw new Error('Backend not configured. Please set API_URL in environment variables.');
  }

  if (!text || !text.trim()) {
    throw new Error('Text cannot be empty');
  }

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
