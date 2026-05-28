export type ProductPostLinkStatus = 'linked' | 'unlinked';

export interface Product {
  id: string;
  _id?: string;
  name: string;
  price?: number | string;
  link?: string;
  note?: string;
  images?: string[];
  media?: string[];
  userId?: string;
  user?: unknown;
  postLinkStatus?: ProductPostLinkStatus;
  postLinkStatusLabel?: string;
  similarity?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface ProductPayload {
  name: string;
  price?: number | string;
  link?: string;
  note?: string;
  images: string[];
}

export interface ProductQuery {
  page?: number;
  limit?: number;
  search?: string;
  userId?: string;
  postLinkStatus?: ProductPostLinkStatus;
}