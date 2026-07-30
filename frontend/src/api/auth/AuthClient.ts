const BASE_URL = import.meta.env.VITE_BACKEND_URL_WS
  .replace(/\/+$/, '')
  .replace(/:3000\/api$/, ':3000')
  .replace(/:8080\/api$/, ':8080');

async function request(
  endpoint: string,
  body: Record<string, string>,
): Promise<{ token: string }> {
  const res = await fetch(`${BASE_URL}${endpoint}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const message = (await res.json().catch(() => null))?.message ?? res.statusText;
    throw new Error(message);
  }

  return res.json();
}

export const AuthClient = {
  login(username: string, password: string) {
    return request('/auth/login', { username, password });
  },

  register(username: string, password: string) {
    return request('/auth/register', { username, password });
  },
};
