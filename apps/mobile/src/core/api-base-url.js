const envUrl = (process.env.EXPO_PUBLIC_API_BASE_URL ?? '').trim();
const localUrl = 'http://localhost:3004';
const url = envUrl || localUrl;
console.log('🔍 API_BASE_URL:', url);
export const API_BASE_URL = url;

