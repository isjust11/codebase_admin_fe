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
    const token = localStorage.getItem(AppConstants.AccessToken);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (_error) => {
    return Promise.reject(_error);
  }
);

//handle refresh token
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401 && !retry && retryCount < maxRetryCount) {
      retryCount++;
      retry = true;
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
          localStorage.removeItem(AppConstants.RefreshToken);
          localStorage.removeItem(AppConstants.AccessToken);
          window.location.href = AppRoutes.Auth.Login;
        }
      }
      return Promise.reject(error);
    }
    return Promise.reject(error);
  }
);


