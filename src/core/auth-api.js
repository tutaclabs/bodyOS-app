const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

export function isBackendConfigured() {
  return Boolean(API_BASE_URL && API_BASE_URL.trim());
}
