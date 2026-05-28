import api, { TOKEN_KEY, unwrapData } from './api';
import type { LoginPayload, LoginResponse } from '../types/auth';
import type { User } from '../types/user';

export const authService = {
  async login(payload: LoginPayload): Promise<LoginResponse> {
    const response = await api.post('/auth/login', payload);
    const data = unwrapData<LoginResponse>(response);
    const token = data.accessToken || data.token;
    if (token) localStorage.setItem(TOKEN_KEY, token);
    return data;
  },

  async getMe(): Promise<User> {
    const response = await api.get('/auth/me');
    return unwrapData<User>(response);
  },

  logout(): void {
    localStorage.removeItem(TOKEN_KEY);
  },
};