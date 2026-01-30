import { API_URL } from '@env';

export const getApiUrl = () => {
  return API_URL || 'https://your-backend.onrender.com';
};

export const apiRequest = async (endpoint, options = {}) => {
  const baseUrl = getApiUrl();
  const url = `${baseUrl}${endpoint}`;
  
  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  };

  const body = options.body && typeof options.body === 'object' 
    ? JSON.stringify(options.body) 
    : options.body;

  const response = await fetch(url, {
    ...defaultOptions,
    ...options,
    body,
    headers: {
      ...defaultOptions.headers,
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ 
      error: { message: 'API request failed' } 
    }));
    throw new Error(error.error?.message || error.message || `API error: ${response.status}`);
  }

  return response.json();
};

export const apiRequestWithAuth = async (endpoint, token, options = {}) => {
  return apiRequest(endpoint, {
    ...options,
    headers: {
      'Authorization': `Bearer ${token}`,
      ...options.headers,
    },
  });
};
