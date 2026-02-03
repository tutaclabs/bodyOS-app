import { API_URL } from '@env';

console.log('DEBUG: API_URL from @env:', API_URL);
console.log('DEBUG: API_URL type:', typeof API_URL);

const envUrl = (API_URL ?? '').trim();
console.log('DEBUG: API_BASE_URL after trim:', envUrl);
console.log('DEBUG: isBackendConfigured will return:', Boolean(envUrl));

export const API_BASE_URL = envUrl;

