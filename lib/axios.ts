import { AppApi, AppConstants, AppRoutes } from '@/constants';
import axios from 'axios';

export const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: any) => void;
  reject: (reason?: any) => void;
}> = [];

// Add a request interceptor
axiosInstance.interceptors.request.use(
  (config) => {
    const token = getAuthToken();
    if (token) {
      // Đảm bảo headers đã được khởi tạo
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (_error) => {
    return Promise.reject(_error);
  }
);

export const getAuthToken = (): string | null => {
  // Kiểm tra xem có đang ở môi trường browser không
  if (typeof window !== 'undefined') {
    return localStorage.getItem(AppConstants.AccessToken);
  }
  return null;
};

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error);
    } else {
      resolve(token);
    }
  });
  
  failedQueue = [];
};

//handle refresh token
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401) {
      if(error.response?.data?.code === 'refresh_token_expired' 
        || error.response?.data?.code === 'refresh_token_invalid') {
        localStorage.removeItem(AppConstants.AccessToken);
        localStorage.removeItem(AppConstants.RefreshToken);
        window.location.href = '/login';
        return Promise.reject(error);
      }
      if (isRefreshing) {
        // Nếu đang refresh token, thêm request vào queue
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(token => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return axiosInstance(originalRequest);
        }).catch(err => {
          return Promise.reject(err);
        });
      }
      

      isRefreshing = true;

      const refreshToken = localStorage.getItem(AppConstants.RefreshToken);
      
      if (refreshToken) {
        try {
          const response = await axiosInstance.post(AppApi.Auth.RefreshToken, {
            refreshToken,
          });
          
          const { accessToken, refreshToken: newRefreshToken } = response.data;
          localStorage.setItem(AppConstants.AccessToken, accessToken);
          localStorage.setItem(AppConstants.RefreshToken, newRefreshToken);
          
          // Process queue với token mới
          processQueue(null, accessToken);
          
          // Retry original request
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          return axiosInstance(originalRequest);
        } catch (refreshError) {
          // Refresh token failed, clear storage và redirect
          localStorage.removeItem(AppConstants.AccessToken);
          localStorage.removeItem(AppConstants.RefreshToken);
          console.error('Lỗi refresh token:', refreshError);
          
          // Process queue với error
          processQueue(refreshError, null);
          
          window.location.href = '/login';
          return Promise.reject(refreshError);
        } finally {
          isRefreshing = false;
        }
      } else {
        // Không có refresh token
        isRefreshing = false;
        processQueue(error, null);
        window.location.href = '/login';
        return Promise.reject(error);
      }
    }
    
    return Promise.reject(error);
  }
);


