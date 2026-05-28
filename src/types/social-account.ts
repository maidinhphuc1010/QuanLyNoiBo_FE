export interface SocialAccount {
  id: string;
  _id?: string;
  platform: string;
  name: string;
  username?: string;
  url?: string;
  isActive?: boolean;
  note?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface SocialAccountPayload {
  platform: string;
  name: string;
  username?: string;
  url?: string;
  isActive?: boolean;
  note?: string;
}

export interface SocialAccountQuery {
  page?: number;
  limit?: number;
  search?: string;
  platform?: string;
  isActive?: boolean;
}