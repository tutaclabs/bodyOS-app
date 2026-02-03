const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

export async function apiFetch(path, options = {}) {
  const url = `${API_BASE_URL}${path.startsWith('/') ? path : `/${path}`}`;
  const headers = { ...(options.headers ?? {}) };

  const token = localStorage.getItem('bodyos_access_token');
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const fetchOptions = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
  };

  if (options.body && typeof options.body === 'string') {
    fetchOptions.body = options.body;
  } else if (options.body) {
    fetchOptions.body = JSON.stringify(options.body);
  }

  const res = await fetch(url, fetchOptions);

  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(error.error || `API error: ${res.status}`);
  }

  return res.json();
}
