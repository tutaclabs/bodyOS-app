import { apiFetch } from './api-client';

export async function chatWithBodyOSBackend(message, language, history) {
  const res = await apiFetch('/ai/bodyos-chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message, language, history }),
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json?.error ?? 'ai_failed');
  return {
    assistantMessage: json?.assistantMessage ?? '',
    updatedHistory: json?.updatedHistory ?? null,
  };
}

