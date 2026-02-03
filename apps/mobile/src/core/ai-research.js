import { isBackendConfigured } from './auth-api';
import { apiFetch } from './api-client';

export async function askResearchQuestion(question) {
  if (!isBackendConfigured()) {
    throw new Error('Backend not configured. Please set API_URL in environment variables.');
  }

  if (!question || !question.trim()) {
    throw new Error('Question cannot be empty');
  }

  const res = await apiFetch('/ai/research', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ question: question.trim() }),
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json?.error || `API error: ${res.status}`);
  return json?.answer ?? '';
}
