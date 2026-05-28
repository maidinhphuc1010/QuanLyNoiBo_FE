export type UserRole = 'admin' | 'user';

export type AppPageKey = 'products' | 'posts' | 'statistics' | 'users';

export interface User {
  id: string;
  _id?: string;
  email: string;
  name?: string;
  username?: string;
  role: UserRole;
  citizenId?: string;
  phone?: string;
  address?: string;
  avatarUrl?: string;
  avatarPublicId?: string;
  viewablePages?: string[];
  editablePages?: string[];
  isActive?: boolean;
  status?: 'active' | 'inactive';
  createdAt?: string;
  updatedAt?: string;
}

export interface UserPayload {
  email: string;
  password?: string;
  name?: string;
  username?: string;
  role: UserRole;
  citizenId?: string;
  phone?: string;
  address?: string;
  avatarUrl?: string;
  avatarPublicId?: string;
  viewablePages?: string[];
  editablePages?: string[];
  isActive?: boolean;
  status?: 'active' | 'inactive';
}

export interface UpdateMePayload {
  name?: string;
  username?: string;
  phone?: string;
  address?: string;
}

export interface ChangePasswordPayload {
  currentPassword: string;
  newPassword: string;
}