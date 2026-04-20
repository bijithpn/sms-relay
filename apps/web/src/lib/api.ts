const getApiBaseUrl = () => {
  if (typeof window !== "undefined") {
    // On the client, we use the relative /api path which is proxied by Next.js
    return "/api";
  }
  // Server-side or build-time
  return process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:3001";
};

const API_BASE_URL = getApiBaseUrl();

const parseApiError = async (res: Response) => {
  try {
    const contentType = res.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      const data = await res.json();
      const message = Array.isArray(data.message)
        ? data.message.join(", ")
        : data.message;
      return message || data.error || res.statusText;
    }
    
    // Fallback for non-JSON errors
    if (res.status === 500) {
      return "Backend API Error (500). Please check server terminal logs for the stack trace.";
    }
    return `HTTP Error ${res.status}: ${res.statusText}`;
  } catch (err) {
    if (res.status === 500) {
      return "Backend API Error (500). Please check server terminal logs for the stack trace.";
    }
    return res.statusText || "Unknown API Error";
  }
};

const requestJson = async (input: RequestInfo | URL, init?: RequestInit) => {
  try {
    const res = await fetch(input, init);
    if (!res.ok) {
      const errorText = await parseApiError(res);
      console.error(`API Error [${res.status}] at ${input}:`, errorText);
      throw new Error(errorText);
    }
    return res.json();
  } catch (error: any) {
    if (error instanceof TypeError || error.message.includes("reachable")) {
      throw new Error(
        'API server is not reachable. Please start the backend with "pnpm dev" or "node scripts/easy-dev.mjs".',
      );
    }
    throw error;
  }
};

export const apiClient = {
  get: async (endpoint: string) => {
    const url = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
    const secret =
      typeof window !== "undefined"
        ? localStorage.getItem("admin_secret")
        : null;
    return requestJson(`${API_BASE_URL}${url}`, {
      headers: {
        ...(secret ? { "x-admin-secret": secret } : {}),
      },
    });
  },
  post: async (endpoint: string, data: any) => {
    const url = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
    const secret =
      typeof window !== "undefined"
        ? localStorage.getItem("admin_secret")
        : null;
    return requestJson(`${API_BASE_URL}${url}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(secret ? { "x-admin-secret": secret } : {}),
      },
      body: JSON.stringify(data),
    });
  },
  patch: async (endpoint: string, data: any) => {
    const url = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
    const secret =
      typeof window !== "undefined"
        ? localStorage.getItem("admin_secret")
        : null;
    return requestJson(`${API_BASE_URL}${url}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        ...(secret ? { "x-admin-secret": secret } : {}),
      },
      body: JSON.stringify(data),
    });
  },
  delete: async (endpoint: string) => {
    const url = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
    const secret =
      typeof window !== "undefined"
        ? localStorage.getItem("admin_secret")
        : null;
    return requestJson(`${API_BASE_URL}${url}`, {
      method: "DELETE",
      headers: {
        ...(secret ? { "x-admin-secret": secret } : {}),
      },
    });
  },
};
