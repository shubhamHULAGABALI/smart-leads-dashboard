import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  Users,
  BarChart3,
  Settings,
  ChevronLeft,
  ChevronRight,
  Zap,
} from 'lucide-react';
import { cn } from '@/utils';
import { useAuthStore } from '@/store/auth.store';
import { Badge } from '@/components/ui/Badge';

interface NavItem {
  label: string;
  to: string;
  icon: React.ReactNode;
  badge?: string;
  adminOnly?: boolean;
}

const NAV_ITEMS: NavItem[] = [
  { label: 'Dashboard',  to: '/dashboard',       icon: <LayoutDashboard className="h-4 w-4" /> },
  { label: 'Leads',      to: '/dashboard/leads', icon: <Users className="h-4 w-4" /> },
  { label: 'Analytics',  to: '/dashboard/analytics', icon: <BarChart3 className="h-4 w-4" /> },
  { label: 'Settings',   to: '/dashboard/settings',  icon: <Settings className="h-4 w-4" />, adminOnly: true },
];

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const location = useLocation();
  const { user } = useAuthStore();

  const visibleItems = NAV_ITEMS.filter(
    (item) => !item.adminOnly || user?.role === 'admin'
  );

  return (
    <motion.aside
      initial={false}
      animate={{ width: collapsed ? 60 : 220 }}
      transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
      className="relative flex h-full flex-col border-r border-[var(--border)] bg-[var(--surface-1)] overflow-hidden shrink-0"
    >
      {/* Logo */}
      <div className={cn(
        'flex h-14 items-center border-b border-[var(--border)] px-4 shrink-0',
        collapsed ? 'justify-center' : 'gap-2.5'
      )}>
        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-violet-600">
          <Zap className="h-3.5 w-3.5 text-white" />
        </div>
        <AnimatePresence>
          {!collapsed && (
            <motion.span
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -8 }}
              transition={{ duration: 0.15 }}
              className="text-sm font-semibold text-[var(--text-primary)] whitespace-nowrap"
            >
              Smart Leads
            </motion.span>
          )}
        </AnimatePresence>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-0.5">
        {visibleItems.map((item) => {
          const isActive =
            item.to === '/dashboard'
              ? location.pathname === '/dashboard'
              : location.pathname.startsWith(item.to);

          return (
            <NavLink
              key={item.to}
              to={item.to}
              title={collapsed ? item.label : undefined}
              className={cn(
                'group flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm transition-colors duration-100',
                isActive
                  ? 'bg-violet-600/15 text-violet-400'
                  : 'text-[var(--text-secondary)] hover:bg-[var(--surface-3)] hover:text-[var(--text-primary)]',
                collapsed && 'justify-center px-2'
              )}
            >
              <span className={cn('shrink-0', isActive ? 'text-violet-400' : '')}>
                {item.icon}
              </span>
              <AnimatePresence>
                {!collapsed && (
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.1 }}
                    className="flex-1 truncate whitespace-nowrap"
                  >
                    {item.label}
                  </motion.span>
                )}
              </AnimatePresence>
              {!collapsed && item.badge && (
                <Badge variant="outline" className="text-[10px] py-0 px-1.5">
                  {item.badge}
                </Badge>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Collapse toggle */}
      <div className="border-t border-[var(--border)] p-2">
        <button
          onClick={onToggle}
          className={cn(
            'flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-xs text-[var(--text-muted)]',
            'hover:bg-[var(--surface-3)] hover:text-[var(--text-secondary)] transition-colors duration-100',
            collapsed && 'justify-center'
          )}
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4 shrink-0" />
          ) : (
            <>
              <ChevronLeft className="h-4 w-4 shrink-0" />
              <span>Collapse</span>
            </>
          )}
        </button>
      </div>
    </motion.aside>
  );
}

// ─── Mobile drawer ────────────────────────────────────────────────────────

interface MobileNavProps {
  open: boolean;
  onClose: () => void;
}

export function MobileNav({ open, onClose }: MobileNavProps) {
  const location = useLocation();
  const { user } = useAuthStore();

  const visibleItems = NAV_ITEMS.filter(
    (item) => !item.adminOnly || user?.role === 'admin'
  );

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.aside
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
            className="fixed inset-y-0 left-0 z-50 w-64 border-r border-[var(--border)] bg-[var(--surface-1)] flex flex-col"
          >
            <div className="flex h-14 items-center gap-2.5 border-b border-[var(--border)] px-4">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-violet-600">
                <Zap className="h-3.5 w-3.5 text-white" />
              </div>
              <span className="text-sm font-semibold text-[var(--text-primary)]">Smart Leads</span>
            </div>
            <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-0.5">
              {visibleItems.map((item) => {
                const isActive =
                  item.to === '/dashboard'
                    ? location.pathname === '/dashboard'
                    : location.pathname.startsWith(item.to);
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    onClick={onClose}
                    className={cn(
                      'flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm transition-colors',
                      isActive
                        ? 'bg-violet-600/15 text-violet-400'
                        : 'text-[var(--text-secondary)] hover:bg-[var(--surface-3)] hover:text-[var(--text-primary)]'
                    )}
                  >
                    {item.icon}
                    {item.label}
                    {item.badge && (
                      <Badge variant="outline" className="ml-auto text-[10px] py-0 px-1.5">
                        {item.badge}
                      </Badge>
                    )}
                  </NavLink>
                );
              })}
            </nav>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
