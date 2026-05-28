export type PostStatus = 'draft' | 'posted' | 'scheduled';

export interface RelatedProductRef {
  id?: string;
  _id?: string;
  name?: string;
}

export interface Post {
  id: string;
  _id?: string;
  caption?: string;
  hashtags?: string[];
  productLinks?: string[];
  relatedProductIds?: string[];
  relatedProducts?: RelatedProductRef[];
  media?: string[];
  status: PostStatus;
  userId?: string;
  similarity?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface PostPayload {
  caption?: string;
  hashtags: string[];
  productLinks: string[];
  relatedProductIds: string[];
  media: string[];
  status: PostStatus;
}

export interface PostQuery {
  page?: number;
  limit?: number;
  search?: string;
  userId?: string;
}