import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react';
import { TokenManager } from '../auth/TokenManager';
import { AuthClient } from '../auth/AuthClient';
import { WsClient } from '../websocket/WsClient';

interface AuthContextValue {
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<void>;
  register: (username: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(() => !!TokenManager.getToken());

  useEffect(() => {
    const token = TokenManager.getToken();
    if (token) {
      WsClient.getInstance().connectWithToken(token);
    }

    const onExpired = () => {
      TokenManager.clearToken();
      setIsAuthenticated(false);
      WsClient.getInstance().disconnect();
    };
    window.addEventListener('auth:expired', onExpired);
    return () => window.removeEventListener('auth:expired', onExpired);
  }, []);

  const login = useCallback(async (username: string, password: string) => {
    const { token } = await AuthClient.login(username, password);
    TokenManager.setToken(token);
    setIsAuthenticated(true);
    WsClient.getInstance().connectWithToken(token);
  }, []);

  const register = useCallback(async (username: string, password: string) => {
    const { token } = await AuthClient.register(username, password);
    TokenManager.setToken(token);
    setIsAuthenticated(true);
    WsClient.getInstance().connectWithToken(token);
  }, []);

  const logout = useCallback(() => {
    TokenManager.clearToken();
    setIsAuthenticated(false);
    WsClient.getInstance().disconnect();
  }, []);

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
