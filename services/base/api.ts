import { API_URL, API_TIMEOUT } from "@/config/const";
import { AppConstants } from "@/constants";
import axios from "axios";

export const getAuthToken = (): string | null => {
  // Kiểm tra xem có đang ở môi trường browser không
  if (typeof window !== 'undefined') {
    return localStorage.getItem(AppConstants.AccessToken);
  }
  return null;
};


// 
export const logout = (): void => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(AppConstants.AccessToken);
    localStorage.removeItem(AppConstants.User);
  }
};


const axiosApi = axios.create({
  baseURL: API_URL,
  timeout: API_TIMEOUT,
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
    // 'X-API-Version': API_VERSION
  }
});

axiosApi.interceptors.request.use(
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

//handle refresh token
// axiosApi.interceptors.response.use(
//   (response) => response,
//   async (error) => {
//     if (error.response?.status === 401 && !error.config._retry) {
//       console.log('RUN refresh token');
//       error.config._retry = true;
//       const originalRequest = error.config;
//       const refreshToken = localStorage.getItem(AppConstants.RefreshToken);
//       if (refreshToken) {
//         try {
//           const response = await axiosApi.post('/auth/refresh-token', {
//             refreshToken,
//           });
//           localStorage.setItem(AppConstants.AccessToken, response.data.accessToken);
//           localStorage.setItem(AppConstants.RefreshToken, response.data.refreshToken);
//           return axiosApi(originalRequest);
//         } catch (error) {
//           localStorage.removeItem(AppConstants.AccessToken);
//           localStorage.removeItem(AppConstants.RefreshToken);
//           console.error('Lỗi refresh token:', error);
//           window.location.href = '/login';
//         }
//       }
//       return Promise.reject(error);
//     }
//     return Promise.reject(error);
//   }
// );
export default axiosApi;

