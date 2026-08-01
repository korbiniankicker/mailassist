const BASE_URL = import.meta.env.VITE_BACKEND_URL_WS.replace(/\/+$/, '');

type EmailCredentials = {
  host: string;
  port: number;
  username: string;
  password: string;
};

async function request(
  endpoint: string,
  body: Record<string, string | number>,
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

function withCredentials(
  base: Record<string, string>,
  creds?: EmailCredentials,
): Record<string, string | number> {
  if (!creds) return base;
  return {
    ...base,
    imapHost: creds.host,
    imapPort: creds.port,
    imapUser: creds.username,
    imapPass: creds.password,
  };
}

export const AuthClient = {
  login(username: string, password: string, emailCredentials?: EmailCredentials) {
    return request('/auth/login', withCredentials({ username, password }, emailCredentials));
  },

  register(username: string, password: string, emailCredentials?: EmailCredentials) {
    return request('/auth/register', withCredentials({ username, password }, emailCredentials));
  },
};
