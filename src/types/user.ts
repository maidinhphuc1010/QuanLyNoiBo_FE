export type UserRole = 'admin' | 'user';

export interface User {
  id: string;
  _id?: string;
  email: string;
  name?: string;
  username?: string;
  role: UserRole;
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
  isActive?: boolean;
  status?: 'active' | 'inactive';
}