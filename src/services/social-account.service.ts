import api, { unwrapData } from './api';
import type { PaginatedResponse } from '../types/pagination';
import { normalizeListResponse } from '../types/pagination';
import type { SocialAccount, SocialAccountPayload, SocialAccountQuery } from '../types/social-account';

export const socialAccountService = {
  async getSocialAccounts(params: SocialAccountQuery = {}): Promise<PaginatedResponse<SocialAccount>> {
    const response = await api.get('/social-accounts', { params });
    return normalizeListResponse<SocialAccount>(response);
  },

  async getSocialAccount(id: string): Promise<SocialAccount> {
    const response = await api.get(`/social-accounts/${id}`);
    return unwrapData<SocialAccount>(response);
  },

  async createSocialAccount(data: SocialAccountPayload): Promise<SocialAccount> {
    const response = await api.post('/social-accounts', data);
    return unwrapData<SocialAccount>(response);
  },

  async updateSocialAccount(id: string, data: Partial<SocialAccountPayload>): Promise<SocialAccount> {
    const response = await api.patch(`/social-accounts/${id}`, data);
    return unwrapData<SocialAccount>(response);
  },

  async deleteSocialAccount(id: string): Promise<void> {
    await api.delete(`/social-accounts/${id}`);
  },
};