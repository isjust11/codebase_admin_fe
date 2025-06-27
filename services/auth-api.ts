import { AppConstants } from '@/constants';
import axiosApi from './base/api';
import { CreatePermissionDto, CreateRoleDto, Permission, UpdatePermissionDto, UpdateRoleDto } from '@/types/permission';
import { Role } from '@/types/role';
import { User } from '@/types/user';
import { Feature } from '@/types/feature';
// Type pour les données de connexion
interface LoginData {
  username: string;
  password: string;
}

interface RegisterData {
  username: string;
  password: string;
  fullName?: string;
  email?: string;
}

interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}

interface RefreshTokenResponse {
  accessToken: string;
  refreshToken: string;
}

// Hàm refresh token
export const refreshToken = async (): Promise<RefreshTokenResponse> => {
  try {
    const refreshToken = localStorage.getItem(AppConstants.RefreshToken);
    if (!refreshToken) {
      throw new Error('Không tìm thấy refresh token');
    }

    const response = await axiosApi.post('/auth/refresh-token', {
      refreshToken,
    });

    // Cập nhật token mới vào localStorage
    localStorage.setItem(AppConstants.AccessToken, response.data.accessToken);
    localStorage.setItem(AppConstants.RefreshToken, response.data.refreshToken);

    return response.data;
  } catch (_error) {
    console.error('Lỗi refresh token:', _error);
    // Nếu refresh token thất bại, đăng xuất người dùng
    logout();
    throw _error;
  }
};

// đăng nhập người dùng
export const login = async (data: LoginData): Promise<AuthResponse> => {
  try {
    const response = await axiosApi.post(`/auth/login`, data);
    // lưu trữ token vào localStorage
    localStorage.setItem(AppConstants.AccessToken, response.data.accessToken);
    localStorage.setItem(AppConstants.RefreshToken, response.data.refreshToken);
    localStorage.setItem(AppConstants.User, JSON.stringify(response.data.user));
    return response.data;
  } catch (_error) {
    console.error('Lỗi đăng nhập:', _error);
    throw _error;
  }
};

// đăng ký tài khoản
export const register = async (data: RegisterData): Promise<any> => {
  try {
    const response = await axiosApi.post(`/auth/register`, data);
    return response.data;
  } catch (_error) {
    console.error('Lỗi đăng ký:', _error);
    throw _error;
  }
};

// đăng xuất người dùng
export const logout = (): void => {
  localStorage.removeItem(AppConstants.AccessToken);
  localStorage.removeItem(AppConstants.RefreshToken);
  localStorage.removeItem(AppConstants.User);
};

export const verifyEmail = async (token: string): Promise<AuthResponse> => {
  try {
    const response = await axiosApi.get(`/auth/verify-email?token=${token}`);
    return response.data;
  } catch (_error) {
    console.error('Lỗi xác thực email:', _error);
    throw _error;
  }
};

export const forgotPassword = async (username: string): Promise<any> => {
  try {
    const response = await axiosApi.get(`/auth/forgot-password?username=${username}`);
    return response.data;
  } catch (_error) {
    console.error('Lỗi quên mật khẩu:', _error);
    throw _error;
  }
}

export const verifyResetPassword = async (token: string, password: string): Promise<any> => {
  try {
    const response = await axiosApi.post(`/auth/reset-password`, { token, password });
    return response.data;
  } catch (_error) {
    console.error('Lỗi xác thực mật khẩu:', _error);
    throw _error;
  }
};

export const resendEmail = async (email: string): Promise<AuthResponse> => {
  try {
    const response = await axiosApi.post(`/auth/resend-email`, { email });
    return response.data;
  } catch (_error) {
    console.error('Lỗi gửi email xác thực:', _error);
    throw _error;
  }
};

// kiểm tra token hợp lệ
export const validateToken = async (token: string): Promise<boolean> => {
  try {
    const response = await axiosApi.get(`/auth/validate-token?token=${token}`);
    return response.status === 200;
  } catch (error) {
    return false;
  }
};

// kiểm tra xem người dùng có đăng nhập không
export const isAuthenticated = async (): Promise<boolean> => {
  const token = localStorage.getItem(AppConstants.AccessToken);
  if (!token) {
    return false;
  }
  
  try {
    const isValid = await validateToken(token);
    if (!isValid) {
      // Nếu token không hợp lệ, thử refresh token
      try {
        console.log('run get refresh token');
        await refreshToken();
        return true;
      } catch (error) {
        // Nếu refresh token cũng thất bại, đăng xuất người dùng
        logout();
        console.log('run logout');
        return false;
      }
    }
    return true;
  } catch (error) {
    return false;
  }
};

// lấy thông tin người dùng đã đăng nhập
export const getCurrentUser = (): User | null => {
  const user = localStorage.getItem(AppConstants.User);
  return user ? JSON.parse(user) : null;
};

// lấy feature
export const getFeature = (): Feature[] | null => {
  const feature = localStorage.getItem(AppConstants.Feature);
  var data = feature ? JSON.parse(feature) : null;
  return data ? data.filter((f: Feature) => f.isActive) : null;
};

// lấy token xác thực
export const getAuthToken = (): string | null => {
  return localStorage.getItem(AppConstants.AccessToken);
};

// get profile
export const getProfile = async (): Promise<AuthResponse> => {
  const response = await axiosApi.get(`/auth/profile`);
  return response.data;
};
// permission and role

export const getRoles = async (params?: PaginationParams): Promise<PaginatedResponse<Role>> =>  {
  try{
    const response = await axiosApi.get('/roles', {params});
    return response.data;
  }catch(_error){
    console.error('Error fetching navigator:', _error);
    return { data: [], total: 0, page: 0, size: 10, totalPages: 0 };
  }
};

export const getRole = async (id: string): Promise<Role> => {
  const response = await axiosApi.get(`/roles/${id}`);
  return response.data;
};

export const createRole = async (data: CreateRoleDto): Promise<Role> => {
  const response = await axiosApi.post('/roles', data);
  return response.data;
};

export const updateRole = async (id: string, data: UpdateRoleDto): Promise<Role> => {
  const response = await axiosApi.put(`/roles/${id}`, data);
  return response.data;
};

export const deleteRole = async (id: string): Promise<void> => {
  await axiosApi.delete(`/roles/${id}`);
};  

export const getFeaturesByRole = async (id: string): Promise<Feature[]> => {
  const response = await axiosApi.get(`/roles/${id}/features`);
  return response.data;
};

export const findbyCode = async (code: string): Promise<Role> => {
  const response = await axiosApi.get(`/roles/find/${code}`);
  return response.data;
};

export const getPermissions = async (): Promise<Permission[]> => {
  const response = await axiosApi.get('/permissions');
  return response.data;
};

export const getPermission = async (id: string): Promise<Permission> => {
  const response = await axiosApi.get(`/permissions/${id}`);
  return response.data;
};

export const createPermission = async (data: CreatePermissionDto): Promise<Permission> => {
  const response = await axiosApi.post('/permissions', data);
  return response.data;
};

export const updatePermission = async (id: string, data: UpdatePermissionDto): Promise<Permission> => {
  const response = await axiosApi.patch(`/permissions/${id}`, data);
  return response.data;
};

export const deletePermission = async (id: string): Promise<void> => {
  await axiosApi.delete(`/permissions/${id}`);
};

export const getTokenInfo = async (token: string) => {
  try {
    const response = await axiosApi.get(`/auth/token-info?token=${token}`);
    return response.data;
  } catch (error) {
    console.error('Error getting token info:', error);
    throw error;
  }
}; 

export const updateProfile = async (data: any): Promise<any> => {
  const response = await axiosApi.patch(`/auth/profile`, data);
  return response.data;
};

export const updateAvatar = async (data: any): Promise<any> => {
  const response = await axiosApi.post(`/auth/update-avatar`, data);
  return response.data;
};

export const updatePassword = async (data: any): Promise<any> => {
  const response = await axiosApi.patch(`/auth/update-password`, data);
  return response.data;
};

