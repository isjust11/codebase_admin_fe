// Cấu hình API URL cho các môi trường khác nhau
const ENV = process.env.NODE_ENV || 'development';

// Cấu hình URL cho API dựa trên môi trường
export const API_URL = 
  ENV === 'production' 
    ? 'https://api.yourproduction.com' // URL cho môi trường production
    : ENV === 'development' 
      ? 'http://localhost:4000' // URL cho môi trường staging
      : 'https://api.yourproduction.com'; // URL cho môi trường development

// Các cấu hình API khác có thể được thêm vào đây
export const API_TIMEOUT = 30000; // Timeout cho API calls (30 giây)
// export const API_VERSION = 'v1'; 