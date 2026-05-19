import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useEffect } from 'react';

import { ProtectedRoute, PublicRoute } from '@/components/auth/ProtectedRoute';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import AuthPage       from '@/pages/auth/AuthPage';
import DashboardPage  from '@/pages/leads/DashboardPage';
import LeadsPage      from '@/pages/leads/LeadsPage';
import AnalyticsPage  from '@/pages/leads/AnalyticsPage';
import { useAuthStore }  from '@/store/auth.store';
import { useThemeStore } from '@/store/theme.store';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 30_000,
    },
  },
});

function AppInner() {
  const { clearAuth } = useAuthStore();
  const { theme }     = useThemeStore();

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle('dark',  theme === 'dark');
    root.classList.toggle('light', theme === 'light');
  }, [theme]);

  useEffect(() => {
    const handler = () => clearAuth();
    window.addEventListener('auth:logout', handler);
    return () => window.removeEventListener('auth:logout', handler);
  }, [clearAuth]);

  return (
    <>
      <Routes>
        <Route element={<PublicRoute />}>
          <Route path="/login"    element={<AuthPage />} />
          <Route path="/register" element={<AuthPage />} />
        </Route>

        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<DashboardLayout />}>
            <Route index             element={<DashboardPage />} />
            <Route path="leads"      element={<LeadsPage />} />
            <Route path="analytics"  element={<AnalyticsPage />} />
            <Route path="settings"   element={
              <div className="p-6">
                <h1 className="text-xl font-bold text-[var(--text-primary)]">Settings</h1>
                <p className="mt-1 text-sm text-[var(--text-muted)]">Admin configuration area.</p>
              </div>
            } />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>

      <Toaster
        position="bottom-right"
        toastOptions={{
          style: {
            background: 'var(--surface-2)',
            color: 'var(--text-primary)',
            border: '1px solid var(--border-light)',
            borderRadius: '10px',
            fontSize: '13px',
            boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
          },
          success: { iconTheme: { primary: '#10B981', secondary: 'transparent' } },
          error:   { iconTheme: { primary: '#EF4444', secondary: 'transparent' } },
          duration: 3500,
        }}
      />
    </>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AppInner />
      </BrowserRouter>
    </QueryClientProvider>
  );
}
