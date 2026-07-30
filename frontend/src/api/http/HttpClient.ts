import { TokenManager } from '../auth/TokenManager';

const BASE_URL = import.meta.env.VITE_BACKEND_URL_WS
  .replace(/\/+$/, '')
  .replace(/:3000\/api$/, ':3000')
  .replace(/:8080\/api$/, ':8080');

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const token = TokenManager.getToken();
  const res = await fetch(`${BASE_URL}${path}`, {
    ...init,
    headers: {
      ...init?.headers,
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  if (res.status === 401) {
    window.dispatchEvent(new CustomEvent('auth:expired'));
    throw new Error('Unauthorized');
  }

  if (!res.ok) {
    const body = await res.text().catch(() => null);
    let message: string;
    try {
      message = body ? (JSON.parse(body)?.message ?? res.statusText) : res.statusText;
    } catch {
      message = body ?? res.statusText;
    }
    throw new Error(message);
  }

  const text = await res.text();
  if (!text) return undefined as T;
  return JSON.parse(text);
}

export const Api = {
  get<T>(path: string): Promise<T> {
    return request<T>(path, { method: 'GET' });
  },
  del<T = void>(path: string): Promise<T> {
    return request<T>(path, { method: 'DELETE' });
  },
};
