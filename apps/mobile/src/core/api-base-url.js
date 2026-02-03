import { API_URL } from '@env';

const envUrl = (API_URL ?? '').trim();
export const API_BASE_URL = envUrl;

