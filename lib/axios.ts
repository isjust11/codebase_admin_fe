import { AppApi, AppConstants, AppRoutes } from '@/constants';
import axios from 'axios';

export const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});
let retry = false;
let retryCount = 0;
const maxRetryCount = 3;

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

//handle refresh token
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401 && !error.config._retry) {
      console.log('RUN refresh token');
      error.config._retry = true;
      const originalRequest = error.config;
      const refreshToken = localStorage.getItem(AppConstants.RefreshToken);
      if (refreshToken) {
        try {
          const response = await axiosInstance.post(AppApi.Auth.RefreshToken, {
            refreshToken,
          });
          localStorage.setItem(AppConstants.AccessToken, response.data.accessToken);
          localStorage.setItem(AppConstants.RefreshToken, response.data.refreshToken);
          return axiosInstance(originalRequest);
        } catch (error) {
          localStorage.removeItem(AppConstants.AccessToken);
          localStorage.removeItem(AppConstants.RefreshToken);
          console.error('Lỗi refresh token:', error);
          window.location.href = '/login';
        }
      }
      return Promise.reject(error);
    }
    return Promise.reject(error);
  }
);


