import api, { unwrapData } from './api';
import type { Product, ProductPayload, ProductQuery } from '../types/product';
import type { PaginatedResponse } from '../types/pagination';
import { normalizeListResponse } from '../types/pagination';

export const productService = {
  async getProducts(params: ProductQuery): Promise<PaginatedResponse<Product>> {
    const response = await api.get('/products', { params });
    return normalizeListResponse<Product>(response);
  },

  async createProduct(data: ProductPayload): Promise<Product> {
    const response = await api.post('/products', data);
    return unwrapData<Product>(response);
  },

  async getProduct(id: string): Promise<Product> {
    const response = await api.get(`/products/${id}`);
    return unwrapData<Product>(response);
  },

  async updateProduct(id: string, data: Partial<ProductPayload>): Promise<Product> {
    const response = await api.patch(`/products/${id}`, data);
    return unwrapData<Product>(response);
  },

  async deleteProduct(id: string): Promise<void> {
    await api.delete(`/products/${id}`);
  },

  async searchProductsByImage(file: File, page = 1, limit = 12): Promise<PaginatedResponse<Product>> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('image', file);
    const response = await api.post(`/products/search-by-image?page=${page}&limit=${limit}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return normalizeListResponse<Product>(response);
  },
};