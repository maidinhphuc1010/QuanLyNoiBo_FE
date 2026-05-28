export type PostStatus = 'draft' | 'posted' | 'scheduled';

export interface RelatedProductRef {
  id?: string;
  _id?: string;
  name?: string;
}

export interface PostMedia {
  url: string;
  type?: 'image' | 'video' | string;
  publicId?: string;
  downloadUrl?: string;
  resourceType?: 'image' | 'video' | string;
}

export interface Post {
  id: string;
  _id?: string;
  caption?: string;
  hashtags?: string[];
  productLinks?: string[];
  productIds?: string[];
  relatedProductIds?: string[];
  relatedProducts?: RelatedProductRef[];
  media?: Array<string | PostMedia>;
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
  productIds: string[];
  media: PostMedia[];
  status: PostStatus;
}

export interface PostQuery {
  page?: number;
  limit?: number;
  search?: string;
  userId?: string;
}