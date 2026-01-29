import { AsyncStorageAdapter } from './storage';
import { STORAGE_KEYS } from './keys';
import { API_BASE_URL } from './api-base-url';
import { tokenStore, apiFetch } from './api-client';

const storage = new AsyncStorageAdapter();

export function isBackendConfigured() {
  return Boolean(API_BASE_URL);
}

export async function registerWithBackend(email, password) {
  const res = await fetch(`${API_BASE_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json?.error ?? 'register_failed');
  await tokenStore.setTokens({
    accessToken: json?.tokens?.accessToken,
    refreshToken: json?.tokens?.refreshToken,
  });
  await storage.save(STORAGE_KEYS.CURRENT_USER, json?.user ?? null);
  return json?.user;
}

export async function loginWithBackend(email, password) {
  const res = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json?.error ?? 'login_failed');
  await tokenStore.setTokens({
    accessToken: json?.tokens?.accessToken,
    refreshToken: json?.tokens?.refreshToken,
  });
  await storage.save(STORAGE_KEYS.CURRENT_USER, json?.user ?? null);
  return json?.user;
}

export async function logoutBackend() {
  const refreshToken = await tokenStore.getRefreshToken();
  if (refreshToken) {
    await fetch(`${API_BASE_URL}/auth/logout`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    }).catch(() => {});
  }
  await tokenStore.clearTokens();
  await storage.save(STORAGE_KEYS.CURRENT_USER, null);
}

export async function getMe() {
  const res = await apiFetch('/me');
  if (!res.ok) return null;
  const json = await res.json().catch(() => ({}));
  const user = json?.user ?? null;
  await storage.save(STORAGE_KEYS.CURRENT_USER, user);
  return user;
}

