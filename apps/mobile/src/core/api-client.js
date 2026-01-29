import { AsyncStorageAdapter } from './storage';
import { STORAGE_KEYS } from './keys';
import { API_BASE_URL } from './api-base-url';

const storage = new AsyncStorageAdapter();

async function getAccessToken() {
  return storage.load(STORAGE_KEYS.ACCESS_TOKEN, null);
}

async function getRefreshToken() {
  return storage.load(STORAGE_KEYS.REFRESH_TOKEN, null);
}

async function setTokens({ accessToken, refreshToken }) {
  await storage.save(STORAGE_KEYS.ACCESS_TOKEN, accessToken ?? null);
  await storage.save(STORAGE_KEYS.REFRESH_TOKEN, refreshToken ?? null);
}

async function clearTokens() {
  await storage.save(STORAGE_KEYS.ACCESS_TOKEN, null);
  await storage.save(STORAGE_KEYS.REFRESH_TOKEN, null);
}

async function refreshAccessToken() {
  const refreshToken = await getRefreshToken();
  if (!refreshToken) return null;

  const res = await fetch(`${API_BASE_URL}/auth/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken }),
  });
  if (!res.ok) return null;
  const json = await res.json();
  const accessToken = json?.tokens?.accessToken;
  const newRefreshToken = json?.tokens?.refreshToken;
  if (!accessToken || !newRefreshToken) return null;
  await setTokens({ accessToken, refreshToken: newRefreshToken });
  return accessToken;
}

export async function apiFetch(path, options = {}) {
  if (!API_BASE_URL) {
    throw new Error('Missing API base URL (set EXPO_PUBLIC_API_BASE_URL)');
  }

  const url = `${API_BASE_URL}${path.startsWith('/') ? path : `/${path}`}`;
  const headers = { ...(options.headers ?? {}) };

  const accessToken = await getAccessToken();
  if (accessToken) headers.Authorization = `Bearer ${accessToken}`;

  const res = await fetch(url, { ...options, headers });
  if (res.status !== 401) return res;

  const newAccessToken = await refreshAccessToken();
  if (!newAccessToken) return res;

  const retryHeaders = { ...(options.headers ?? {}), Authorization: `Bearer ${newAccessToken}` };
  return fetch(url, { ...options, headers: retryHeaders });
}

export const tokenStore = {
  getAccessToken,
  getRefreshToken,
  setTokens,
  clearTokens,
};

