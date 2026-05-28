import axios from 'axios';

export const TOKEN_KEY = 'accessToken';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000',
  timeout: 30000,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error?.response?.status === 401) {
      localStorage.removeItem(TOKEN_KEY);
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  },
);

export default api;

export function getItemId<T extends { id?: string; _id?: string }>(item: T): string {
  return item.id || item._id || '';
}

export function unwrapData<T>(response: { data: any }): T {
  return response.data?.data ?? response.data;
}