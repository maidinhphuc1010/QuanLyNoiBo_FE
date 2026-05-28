import api, { unwrapData } from './api';
import type { ChangePasswordPayload, UpdateMePayload, User, UserPayload } from '../types/user';
import type { PaginatedResponse, PaginationParams } from '../types/pagination';
import { normalizeListResponse } from '../types/pagination';

export const userService = {
  async getUsers(params: PaginationParams): Promise<PaginatedResponse<User>> {
    const response = await api.get('/users', { params });
    return normalizeListResponse<User>(response);
  },

  async createUser(data: UserPayload): Promise<User> {
    const response = await api.post('/users', data);
    return unwrapData<User>(response);
  },

  async getUser(id: string): Promise<User> {
    const response = await api.get(`/users/${id}`);
    return unwrapData<User>(response);
  },

  async updateUser(id: string, data: Partial<UserPayload>): Promise<User> {
    const response = await api.patch(`/users/${id}`, data);
    return unwrapData<User>(response);
  },

  async deleteUser(id: string): Promise<void> {
    await api.delete(`/users/${id}`);
  },

  async toggleActive(id: string): Promise<User> {
    const response = await api.patch(`/users/${id}/toggle-active`);
    return unwrapData<User>(response);
  },

  async getMe(): Promise<User> {
    const response = await api.get('/users/me');
    return unwrapData<User>(response);
  },

  async updateMe(data: UpdateMePayload): Promise<User> {
    const response = await api.patch('/users/me', data);
    return unwrapData<User>(response);
  },

  async updateMyAvatar(file: File): Promise<User> {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.patch('/users/me/avatar', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return unwrapData<User>(response);
  },

  async changeMyPassword(data: ChangePasswordPayload): Promise<void> {
    await api.patch('/users/me/change-password', data);
  },
};
