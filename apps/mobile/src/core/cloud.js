import { AsyncStorageAdapter } from './storage';
import { STORAGE_KEYS } from './keys';
import { apiFetch } from './api-client';
import { API_BASE_URL } from './api-base-url';

const storage = new AsyncStorageAdapter();

export function isCloudEnabled() {
  return Boolean(API_BASE_URL);
}

export async function pullRemoteState() {
  if (!isCloudEnabled()) return;
  const res = await apiFetch('/state');
  if (!res.ok) throw new Error('Failed to fetch state');
  const json = await res.json();
  const state = json?.state ?? {};
  await storage.save(STORAGE_KEYS.PROTOCOLS, state.protocols ?? []);
  await storage.save(STORAGE_KEYS.NUTRITION_FLOORS, state.nutritionFloors ?? {});
  await storage.save(STORAGE_KEYS.WELLNESS_METRICS, state.wellnessMetrics ?? {});
  await storage.save(STORAGE_KEYS.CHAT_HISTORY, state.chatHistory ?? []);
}

export async function pushProtocols(protocols) {
  if (!isCloudEnabled()) return;
  await apiFetch('/state/protocols', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ protocols }),
  });
}

export async function pushWellnessMetrics(wellnessMetrics) {
  if (!isCloudEnabled()) return;
  await apiFetch('/state/wellness-metrics', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ wellnessMetrics }),
  });
}

export async function pushNutritionFloors(nutritionFloors) {
  if (!isCloudEnabled()) return;
  await apiFetch('/state/nutrition-floors', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ nutritionFloors }),
  });
}

export async function pushChatHistory(chatHistory) {
  if (!isCloudEnabled()) return;
  await apiFetch('/state/chat-history', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chatHistory }),
  });
}
