import axiosApi from './base/api';

export interface Media {
  id: number;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  path: string;
  url: string;
  isDeleted: boolean;
  userId: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface UploadMediaDto {
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  path: string;
  url?: string;
  userId: number;
}

export interface UpdateMediaDto {
  filename?: string;
  originalName?: string;
  mimeType?: string;
  size?: number;
  path?: string;
  url?: string;
  isDeleted?: boolean;
  userId?: number;
}

export interface MediaQueryParams {
  search?: string;
  page?: number;
  limit?: number;
  mimeType?: string;
}

export interface MediaResponse {
  items: Media[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export const mediaApi = {
  getAll: async (params?: MediaQueryParams): Promise<Media[]> => {
    try {
      const response = await axiosApi.get('/media', { params });
      return response.data;
    } catch (_error) {
      console.error('Error fetching media:', _error);
      throw _error;
    }
  },

  getById: async (id: number): Promise<Media> => {
    try {
      const response = await axiosApi.get(`/media/${id}`);
      return response.data;
    } catch (_error) {
      console.error('Error fetching media by id:', _error);
      throw _error;
    }
  },

  upload: async (file: File): Promise<Media> => {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await axiosApi.post('/media/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (_error) {
      console.error('Error uploading media:', _error);
      throw _error;
    }
  },

  update: async (id: number, data: UpdateMediaDto): Promise<Media> => {
    try {
      const response = await axiosApi.put(`/media/${id}`, data);
      return response.data;
    } catch (_error) {
      console.error('Error updating media:', _error);
      throw _error;
    }
  },

  delete: async (id: number): Promise<void> => {
    try {
      await axiosApi.delete(`/media/${id}`);
    } catch (_error) {
      console.error('Error deleting media:', _error);
      throw _error;
    }
  },
};

export const uploadFile = async (file: File): Promise<Media> => {
  const formData = new FormData();
  formData.append('file', file);

  try {
    const response = await axiosApi.post('/media/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error uploading file:', error);
    throw error;
  }
}; 