import { createContext, useContext, useState, useCallback } from 'react';
import * as authApi from '../api/auth';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [username, setUsername] = useState(() => localStorage.getItem('expense_username'));
  const [token, setToken] = useState(() => localStorage.getItem('expense_token'));

  const login = useCallback(async (usernameInput, password) => {
    const data = await authApi.login(usernameInput, password);
    localStorage.setItem('expense_token', data.token);
    localStorage.setItem('expense_username', data.username);
    setToken(data.token);
    setUsername(data.username);
  }, []);

  const register = useCallback(async (usernameInput, email, password) => {
    const data = await authApi.register(usernameInput, email, password);
    localStorage.setItem('expense_token', data.token);
    localStorage.setItem('expense_username', data.username);
    setToken(data.token);
    setUsername(data.username);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('expense_token');
    localStorage.removeItem('expense_username');
    setToken(null);
    setUsername(null);
  }, []);

  const value = { username, token, isAuthenticated: !!token, login, register, logout };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
}
