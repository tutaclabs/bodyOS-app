import { apiFetch } from './api-client';

export async function chatWithBodyOSBackend(message, language, history) {
  try {
    const res = await apiFetch('/ai/bodyos-chat', {
      method: 'POST',
      body: JSON.stringify({ message, language, history }),
    });
    return {
      assistantMessage: res?.assistantMessage ?? '',
      updatedHistory: res?.updatedHistory ?? null,
    };
  } catch (error) {
    throw new Error(error.message ?? 'ai_failed');
  }
}
