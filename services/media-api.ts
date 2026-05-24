import { axiosInstance } from '@/lib/axios';

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
  width: number;
  height: number;
  createdAt: Date;
  updatedAt: Date;
  publicRelativePath: string;
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
  size?: number;
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
  getAll: async (params?: MediaQueryParams): Promise<PaginatedResponse<Media>> =>{
    try {
      const response = await axiosInstance.get('/media', { params });
      return response.data;

    } catch (_error) {
      console.error('Error fetching media:', _error);
      return { data: [], total: 0, page: 0, size: 100, totalPages: 0 };
    }
  },

  getById: async (id: number): Promise<Media> => {
    try {
      const response = await axiosInstance.get(`/media/${id}`);
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

      const response = await axiosInstance.post('/media/upload', formData, {
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

  update: async (filename: string, data: UpdateMediaDto): Promise<Media> => {
    try {
      const response = await axiosInstance.put(`/media/${filename}`, data);
      return response.data;
    } catch (_error) {
      console.error('Error updating media:', _error);
      throw _error;
    }
  },

  delete: async (filename: string): Promise<void> => {
    try {
      await axiosInstance.delete(`/media/${filename}`);
    } catch (_error) {
      console.error('Error deleting media:', _error);
      throw _error;
    }
  },

  deleteMultiple: async (filenames: string[]): Promise<void> => {
    try {
      await axiosInstance.delete('/media', { data: filenames });
    } catch (_error) {
      console.error('Error deleting multiple media:', _error);
      throw _error;
    }
  },
};

export const uploadFile = async (file: File): Promise<Media> => {
  const formData = new FormData();
  formData.append('file', file);

  try {
    const response = await axiosInstance.post('/media/upload', formData, {
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

/** Subfolders cho phép upload tài nguyên hệ thống (sync với BE whitelist). */
export type SystemAssetSubfolder =
  | 'categories'
  | 'icons'
  | 'banners'
  | 'placeholders'
  | 'general';

/**
 * Upload tài nguyên dùng chung của hệ thống (svg category, banner, icon...).
 * File được lưu dưới `system/<subfolder>/<filename>` ở storage; BE yêu cầu
 * quyền CREATE 'media' (mặc định chỉ admin có).
 */
export const uploadSystemAsset = async (
  file: File,
  subfolder: SystemAssetSubfolder = 'general',
): Promise<Media> => {
  const formData = new FormData();
  formData.append('file', file);

  try {
    const response = await axiosInstance.post(
      '/media/upload-system',
      formData,
      {
        params: { subfolder },
        headers: { 'Content-Type': 'multipart/form-data' },
      },
    );
    return response.data;
  } catch (error) {
    console.error('Error uploading system asset:', error);
    throw error;
  }
};
