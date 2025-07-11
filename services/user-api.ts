import { Role } from '@/types/role';
import axiosApi from './base/api';

export interface User {
  id: string;
  username: string;
  fullName?: string;
  email?: string;
  isAdmin: boolean;
  isBlocked: boolean;
  roles?: Role[];
}

export interface CreateUserDto {
  username: string;
  password: string;
  fullName?: string;
  email?: string;
  isAdmin?: boolean;
  roleIds?: string[];
}

export interface UpdateUserDto {
  fullName?: string;
  email?: string;
  isAdmin?: boolean;
  roleIds?: string[];
}

export const userApi = {
  getAll: async (): Promise<User[]> => {
    const response = await axiosApi.get('/users');
    return response.data;
  },

  getByPage: async (params?: PaginationParams): Promise<PaginatedResponse<User>> => {
  try {
    const response = await axiosApi.get(`/users`, {params});
    return response.data;
  } catch (_error) {
    console.error('Error fetching user:', _error);
    return { data: [], total: 0, page: 0, size: 10, totalPages: 0 };
  }
},

  getById: async (id: string): Promise<User> => {
    const response = await axiosApi.get(`/users/${id}`);
    return response.data;
  },

  create: async (data: CreateUserDto): Promise<User> => {
    const response = await axiosApi.post('/users', data);
    return response.data;
  },

  update: async (id: string, data: UpdateUserDto): Promise<User> => {
    const response = await axiosApi.put(`/users/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await axiosApi.delete(`/users/${id}`);
  },

  block: async (id: string): Promise<User> => {
    const response = await axiosApi.put(`/users/${id}/block`);
    return response.data;
  },

  unblock: async (id: string): Promise<User> => {
    const response = await axiosApi.put(`/users/${id}/unblock`);
    return response.data;
  },
}; 