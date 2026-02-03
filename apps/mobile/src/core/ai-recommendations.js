import { isBackendConfigured } from './auth-api';
import { apiFetch } from './api-client';
import { AsyncStorageAdapter } from './storage';
import { STORAGE_KEYS } from './keys';

const storage = new AsyncStorageAdapter();

export async function getPersonalizedRecommendations(language = 'en') {
  if (!isBackendConfigured()) {
    throw new Error('Backend not configured. Please set API_URL in environment variables.');
  }

  const settings = await storage.load(STORAGE_KEYS.USER_SETTINGS, {});
  const protocols = await storage.load(STORAGE_KEYS.PROTOCOLS, []);

  const body = {
    goals: settings.goals || [],
    experienceLevel: settings.experienceLevel || 'beginner',
    lifestyle: settings.lifestyle || {},
    currentProtocols: protocols,
    language,
  };

  try {
    const res = await apiFetch('/ai/recommendations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(json?.error || `API error: ${res.status}`);
    return {
      recommendations: Array.isArray(json?.recommendations) ? json.recommendations : [],
      warnings: Array.isArray(json?.warnings) ? json.warnings : [],
      considerations: Array.isArray(json?.considerations) ? json.considerations : [],
    };
  } catch (error) {
    throw new Error(error.message || 'Failed to get recommendations');
  }
}
