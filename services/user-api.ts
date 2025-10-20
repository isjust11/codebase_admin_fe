import { Role } from '@/types/role';
import { axiosInstance } from '@/lib/axios';
import { User } from '@/types/user';

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
    const response = await axiosInstance.get('/users');
    return response.data;
  },

  getByPage: async (params?: PaginationParams): Promise<PaginatedResponse<User>> => {
  try {
    const response = await axiosInstance.get(`/users`, {params});
    return response.data;
  } catch (_error) {
    console.error('Error fetching user:', _error);
    return { data: [], total: 0, page: 0, size: 10, totalPages: 0 };
  }
},

  getById: async (id: string): Promise<User> => {
    const response = await axiosInstance.get(`/users/${id}`);
    return response.data;
  },

  create: async (data: CreateUserDto): Promise<User> => {
    const response = await axiosInstance.post('/users', data);
    return response.data;
  },

  update: async (id: string, data: UpdateUserDto): Promise<User> => {
    const response = await axiosInstance.put(`/users/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await axiosInstance.delete(`/users/${id}`);
  },

  block: async (id: string): Promise<User> => {
    const response = await axiosInstance.put(`/users/${id}/block`);
    return response.data;
  },

  unblock: async (id: string): Promise<User> => {
    const response = await axiosInstance.put(`/users/${id}/unblock`);
    return response.data;
  },
}; 