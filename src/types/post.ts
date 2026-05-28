export type PostStatus = 'draft' | 'posted';

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

export interface PostedAccount {
  socialAccountId: string;
  platform?: string;
  accountName?: string;
  accountUsername?: string;
  username?: string;
  postedAt?: string;
  url?: string;
  note?: string;
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
  postedAccounts?: PostedAccount[];
  status: PostStatus;
  isPosted?: boolean;
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
  postedAccounts?: PostedAccount[];
  postedSocialAccountIds?: string[];
  status?: PostStatus;
  isPosted: boolean;
}

export interface PostQuery {
  page?: number;
  limit?: number;
  search?: string;
  userId?: string;
  status?: PostStatus;
  isPosted?: boolean;
  platform?: string;
  socialAccountId?: string;
}
