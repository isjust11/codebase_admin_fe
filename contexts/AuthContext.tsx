'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { login, register, logout, isAuthenticated, getCurrentUser, getFeature } from '@/services/auth-api';
import { useRouter } from 'next/navigation';
import { User } from '@/types/user';
import { Feature } from '@/types/feature';
  // interface User {
  //   id: number;
  //   username: string;
  //   fullName?: string;
  //   isAdmin: boolean;
  //   picture?: string;
  //   isGoogleUser?: boolean;
  //   googleId?: string;
  //   email?: string;
  //   roleId?: string;
  // }

interface AuthContextType {
  user: User | null;
  feature: Feature[];
  loading: boolean;
  error: string | null;
  isLoggedIn: boolean;
  login: (username: string, password: string) => Promise<void>;
  register: (username: string, password: string, fullName?: string, email?: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth phải được sử dụng trong AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [feature, setFeature] = useState<Feature[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);

  const checkAuthAndRedirect = async () => {
    try {
      const isAuth = await isAuthenticated();
      if (isAuth) {
        const currentUser = getCurrentUser();
        const feature = getFeature();
        setUser(currentUser);
        setFeature(feature || []);
        console.log(currentUser);
        router.push('/');
        setIsLoggedIn(true);
      } else {
        setUser(null);
        setIsLoggedIn(false);
        router.push('/login');
      }
    } catch (_error) {
      console.error('có lỗi trong quá trình thực hiện: ', error);
      setUser(null);
      setIsLoggedIn(false);
      router.push('/login');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAuthAndRedirect();
  }, []);

  // Connexion utilisateur
  const handleLogin = async (username: string, password: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await login({ username, password });
      setUser(response.user);
      setIsLoggedIn(true);
      // Gọi lại setupAxiosInterceptors sau khi đăng nhập để đảm bảo token được cập nhật
      // setupAxiosInterceptors();
    } catch (error: any) {
      setError(error.response?.data?.message || 'Đăng nhập không thành công');
      throw error;
    } finally {
      setLoading(false);
    }
  };


  const handleRegister = async (username: string, password: string, fullName?: string, email?: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await register({ username, password, fullName, email });
      setUser(response);
      setIsLoggedIn(true);
      // Gọi lại setupAxiosInterceptors sau khi đăng ký để đảm bảo token được cập nhật
      // setupAxiosInterceptors();
    } catch (error: any) {
      setError(error.response?.data?.message || 'Lỗi đăng ký');
      throw error;
    } finally {
      setLoading(false);
    }
  };


  const handleLogout = () => {
    logout();
    setUser(null);
    setFeature([]);
    setIsLoggedIn(false);
    router.push('/login');
  };

  const value = {
    user,
    feature,
    loading,
    error,
    isLoggedIn,
    login: handleLogin,
    register: handleRegister,
    logout: handleLogout,
  };

  return (
    isLoggedIn && (
      <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
    )
  );
}; 