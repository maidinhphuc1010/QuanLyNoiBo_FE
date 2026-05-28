export interface PaginationParams {
  page?: number;
  limit?: number;
  search?: string;
  userId?: string;
  role?: string;
  status?: string;
  isActive?: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  items?: T[];
  results?: T[];
  total: number;
  page?: number;
  limit?: number;
  totalPages?: number;
}

export function normalizeListResponse<T>(response: unknown): PaginatedResponse<T> {
  const raw = response as any;
  const data = raw?.data?.data ?? raw?.data?.items ?? raw?.data?.results ?? raw?.data ?? raw?.items ?? raw?.results ?? [];
  const total = raw?.data?.total ?? raw?.total ?? (Array.isArray(data) ? data.length : 0);
  return {
    data: Array.isArray(data) ? data : [],
    total,
    page: raw?.data?.page ?? raw?.page,
    limit: raw?.data?.limit ?? raw?.limit,
    totalPages: raw?.data?.totalPages ?? raw?.totalPages,
  };
}