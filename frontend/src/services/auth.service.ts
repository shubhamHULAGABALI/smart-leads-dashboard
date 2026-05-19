import apiClient from './api';
import type { ApiResponse, AuthResponse, LoginForm, RegisterForm, User } from '@/types';

export const authService = {
  register: async (data: RegisterForm): Promise<AuthResponse> => {
    const res = await apiClient.post<ApiResponse<AuthResponse>>('/auth/register', data);
    return res.data.data!;
  },

  login: async (data: LoginForm): Promise<AuthResponse> => {
    const res = await apiClient.post<ApiResponse<AuthResponse>>('/auth/login', data);
    return res.data.data!;
  },

  getMe: async (): Promise<User> => {
    const res = await apiClient.get<ApiResponse<User>>('/auth/me');
    return res.data.data!;
  },
};
