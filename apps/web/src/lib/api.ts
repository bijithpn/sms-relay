const getApiBaseUrl = () => {
  if (typeof window !== 'undefined') {
    // On the client, we use the relative /api path which is proxied by Next.js
    return '/api';
  }
  // Server-side or build-time
  return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
};

const API_BASE_URL = getApiBaseUrl();

const parseApiError = async (res: Response) => {
  try {
    const data = await res.json();
    const message = Array.isArray(data.message) ? data.message.join(', ') : data.message;
    return message || data.error || res.statusText;
  } catch {
    if (res.status === 500) {
      return 'API server is not reachable. Start PostgreSQL/Redis, then start the API with: pnpm --filter @sms-relay/api dev';
    }
    return res.statusText;
  }
};

const requestJson = async (input: RequestInfo | URL, init?: RequestInit) => {
  try {
    const res = await fetch(input, init);
    if (!res.ok) throw new Error(await parseApiError(res));
    return res.json();
  } catch (error: any) {
    if (error instanceof TypeError) {
      throw new Error('API server is not reachable. Start it with: pnpm --filter @sms-relay/api dev');
    }
    throw error;
  }
};

export const apiClient = {
  get: async (endpoint: string) => {
    const url = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    return requestJson(`${API_BASE_URL}${url}`);
  },
  post: async (endpoint: string, data: any) => {
    const url = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    return requestJson(`${API_BASE_URL}${url}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
  },
  patch: async (endpoint: string, data: any) => {
    const url = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    return requestJson(`${API_BASE_URL}${url}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
  },
  delete: async (endpoint: string) => {
    const url = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    return requestJson(`${API_BASE_URL}${url}`, {
      method: 'DELETE',
    });
  },
};
