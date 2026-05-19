import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { authService } from '@/services/auth.service';
import { useAuthStore } from '@/store/auth.store';
import { extractErrorMessage } from '@/utils';
import type { LoginForm, RegisterForm } from '@/types';

export function useLogin() {
  const { setAuth } = useAuthStore();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (data: LoginForm) => authService.login(data),
    onSuccess: ({ token, user }) => {
      setAuth(user, token);
      toast.success(`Welcome back, ${user.name.split(' ')[0]}!`);
      navigate('/dashboard');
    },
    onError: (err) => toast.error(extractErrorMessage(err)),
  });
}

export function useRegister() {
  const { setAuth } = useAuthStore();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (data: RegisterForm) => authService.register(data),
    onSuccess: ({ token, user }) => {
      setAuth(user, token);
      toast.success(`Account created! Welcome, ${user.name.split(' ')[0]}!`);
      navigate('/dashboard');
    },
    onError: (err) => toast.error(extractErrorMessage(err)),
  });
}

export function useLogout() {
  const { clearAuth } = useAuthStore();
  const navigate = useNavigate();

  return () => {
    clearAuth();
    toast.success('Signed out');
    navigate('/login');
  };
}
