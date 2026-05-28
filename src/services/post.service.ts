import api, { unwrapData } from './api';
import type { Post, PostPayload, PostQuery } from '../types/post';
import type { PaginatedResponse } from '../types/pagination';
import { normalizeListResponse } from '../types/pagination';

export const postService = {
  async getPosts(params: PostQuery): Promise<PaginatedResponse<Post>> {
    const response = await api.get('/posts', { params });
    return normalizeListResponse<Post>(response);
  },

  async createPost(data: PostPayload): Promise<Post> {
    const response = await api.post('/posts', data);
    return unwrapData<Post>(response);
  },

  async getPost(id: string): Promise<Post> {
    const response = await api.get(`/posts/${id}`);
    return unwrapData<Post>(response);
  },

  async updatePost(id: string, data: Partial<PostPayload>): Promise<Post> {
    const response = await api.patch(`/posts/${id}`, data);
    return unwrapData<Post>(response);
  },

  async deletePost(id: string): Promise<void> {
    await api.delete(`/posts/${id}`);
  },

  async searchPostsByImage(file: File, page = 1, limit = 12): Promise<PaginatedResponse<Post>> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('image', file);
    const response = await api.post(`/posts/search-by-image?page=${page}&limit=${limit}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return normalizeListResponse<Post>(response);
  },
};