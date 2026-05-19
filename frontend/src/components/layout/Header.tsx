import { useRef, useState, useEffect } from 'react';
import { Sun, Moon, Menu, Bell, LogOut, ChevronDown, User, Check, Trash2, CheckCheck } from 'lucide-react';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { motion, AnimatePresence } from 'framer-motion';
import { useThemeStore } from '@/store/theme.store';
import { useAuthStore } from '@/store/auth.store';
import { useNotificationStore, type Notification } from '@/store/notification.store';
import { useLogout } from '@/hooks/useAuth';
import { cn, formatRelative } from '@/utils';
import { Badge } from '@/components/ui/Badge';

// ─── Notification type meta ────────────────────────────────────────────────
const N_META: Record<Notification['type'], { dot: string }> = {
  lead_created:  { dot: 'bg-violet-500' },
  lead_qualified:{ dot: 'bg-emerald-500' },
  lead_lost:     { dot: 'bg-red-500' },
  lead_updated:  { dot: 'bg-amber-500' },
  system:        { dot: 'bg-blue-500' },
};

// ─── Notification Panel ────────────────────────────────────────────────────
function NotificationPanel({ onClose }: { onClose: () => void }) {
  const { notifications, markRead, markAllRead, clearAll, unreadCount } = useNotificationStore();
  const count = unreadCount();

  return (
    <motion.div
      initial={{ opacity: 0, y: -6, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -6, scale: 0.97 }}
      transition={{ duration: 0.15 }}
      className="absolute right-0 top-full mt-2 z-50 w-80 rounded-xl border border-[var(--border-light)] bg-[var(--surface-1)] shadow-2xl overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[var(--border)] px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-[var(--text-primary)]">Notifications</span>
          {count > 0 && (
            <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-violet-600 px-1 text-[10px] font-bold text-white">
              {count}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1">
          {count > 0 && (
            <button
              onClick={markAllRead}
              className="flex items-center gap-1 rounded-md px-2 py-1 text-xs text-[var(--text-muted)] hover:bg-[var(--surface-3)] hover:text-[var(--text-secondary)] transition-colors"
              title="Mark all as read"
            >
              <CheckCheck className="h-3 w-3" />
              All read
            </button>
          )}
          {notifications.length > 0 && (
            <button
              onClick={clearAll}
              className="flex items-center gap-1 rounded-md px-2 py-1 text-xs text-[var(--text-muted)] hover:bg-red-500/10 hover:text-red-400 transition-colors"
              title="Clear all"
            >
              <Trash2 className="h-3 w-3" />
            </button>
          )}
        </div>
      </div>

      {/* List */}
      <div className="max-h-[360px] overflow-y-auto">
        {notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <div className="mb-2 flex h-9 w-9 items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--surface-2)]">
              <Bell className="h-4 w-4 text-[var(--text-muted)]" />
            </div>
            <p className="text-sm font-medium text-[var(--text-primary)]">No notifications</p>
            <p className="mt-0.5 text-xs text-[var(--text-muted)]">Activity will appear here</p>
          </div>
        ) : (
          <ul className="divide-y divide-[var(--border)]">
            {notifications.map((n) => (
              <li
                key={n.id}
                onClick={() => markRead(n.id)}
                className={cn(
                  'flex cursor-pointer items-start gap-3 px-4 py-3 transition-colors',
                  n.read
                    ? 'hover:bg-[var(--surface-2)]'
                    : 'bg-violet-600/5 hover:bg-violet-600/10'
                )}
              >
                <span
                  className={cn(
                    'mt-1.5 h-2 w-2 shrink-0 rounded-full',
                    n.read ? 'bg-[var(--border-light)]' : N_META[n.type].dot
                  )}
                />
                <div className="flex-1 min-w-0">
                  <p className={cn(
                    'text-sm leading-snug',
                    n.read ? 'text-[var(--text-secondary)]' : 'font-medium text-[var(--text-primary)]'
                  )}>
                    {n.title}
                  </p>
                  <p className="mt-0.5 text-xs text-[var(--text-muted)] leading-relaxed">{n.body}</p>
                  <p className="mt-1 text-[10px] text-[var(--text-muted)]">{formatRelative(n.createdAt)}</p>
                </div>
                {!n.read && (
                  <button
                    onClick={(e) => { e.stopPropagation(); markRead(n.id); }}
                    className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full hover:bg-[var(--surface-3)] text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-colors"
                  >
                    <Check className="h-3 w-3" />
                  </button>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </motion.div>
  );
}

// ─── Header ────────────────────────────────────────────────────────────────
interface HeaderProps {
  onMenuClick?: () => void;
  pageTitle?: string;
}

export function Header({ onMenuClick, pageTitle }: HeaderProps) {
  const { theme, toggleTheme }          = useThemeStore();
  const { user }                         = useAuthStore();
  const logout                           = useLogout();
  const { unreadCount }                  = useNotificationStore();
  const [notifOpen, setNotifOpen]        = useState(false);
  const notifRef                         = useRef<HTMLDivElement>(null);
  const count                            = unreadCount();

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
      }
    };
    if (notifOpen) document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [notifOpen]);

  const initials = user?.name
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase() ?? '?';

  return (
    <header className="flex h-14 shrink-0 items-center gap-4 border-b border-[var(--border)] bg-[var(--surface-1)] px-4 relative z-30">
      {/* Mobile menu */}
      <button
        onClick={onMenuClick}
        className="flex h-8 w-8 items-center justify-center rounded-lg text-[var(--text-muted)] hover:bg-[var(--surface-3)] hover:text-[var(--text-primary)] transition-colors lg:hidden"
        aria-label="Toggle menu"
      >
        <Menu className="h-4 w-4" />
      </button>

      {/* Page title */}
      {pageTitle && (
        <span className="hidden sm:block text-sm font-semibold text-[var(--text-primary)]">
          {pageTitle}
        </span>
      )}

      <div className="flex-1" />

      {/* Actions */}
      <div className="flex items-center gap-1">

        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-[var(--text-muted)] hover:bg-[var(--surface-3)] hover:text-[var(--text-primary)] transition-colors"
          aria-label="Toggle theme"
        >
          <motion.div key={theme} initial={{ rotate: -20, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} transition={{ duration: 0.18 }}>
            {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </motion.div>
        </button>

        {/* Notifications */}
        <div ref={notifRef} className="relative">
          <button
            onClick={() => setNotifOpen((o) => !o)}
            className={cn(
              'relative flex h-8 w-8 items-center justify-center rounded-lg transition-colors',
              notifOpen
                ? 'bg-[var(--surface-3)] text-[var(--text-primary)]'
                : 'text-[var(--text-muted)] hover:bg-[var(--surface-3)] hover:text-[var(--text-primary)]'
            )}
            aria-label="Notifications"
          >
            <Bell className="h-4 w-4" />
            <AnimatePresence>
              {count > 0 && (
                <motion.span
                  key="badge"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                  className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-violet-600 px-0.5 text-[9px] font-bold text-white"
                >
                  {count > 9 ? '9+' : count}
                </motion.span>
              )}
            </AnimatePresence>
          </button>

          <AnimatePresence>
            {notifOpen && <NotificationPanel onClose={() => setNotifOpen(false)} />}
          </AnimatePresence>
        </div>

        <div className="mx-1.5 h-5 w-px bg-[var(--border)]" />

        {/* User dropdown */}
        <DropdownMenu.Root>
          <DropdownMenu.Trigger asChild>
            <button className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm text-[var(--text-secondary)] hover:bg-[var(--surface-3)] hover:text-[var(--text-primary)] transition-colors focus:outline-none">
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-violet-600/20 text-violet-400 text-[10px] font-bold shrink-0">
                {initials}
              </div>
              <span className="hidden sm:block font-medium max-w-[120px] truncate">{user?.name}</span>
              <ChevronDown className="hidden sm:block h-3 w-3 text-[var(--text-muted)]" />
            </button>
          </DropdownMenu.Trigger>

          <DropdownMenu.Portal>
            <DropdownMenu.Content
              align="end"
              sideOffset={6}
              className="z-50 min-w-[200px] rounded-xl border border-[var(--border-light)] bg-[var(--surface-2)] p-1 shadow-xl data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95"
            >
              <div className="px-3 py-2.5 border-b border-[var(--border)] mb-1">
                <p className="text-sm font-semibold text-[var(--text-primary)]">{user?.name}</p>
                <p className="text-xs text-[var(--text-muted)] truncate mt-0.5">{user?.email}</p>
                <Badge variant="secondary" className="mt-1.5 text-[10px] capitalize">
                  {user?.role === 'admin' ? 'Admin' : 'Sales User'}
                </Badge>
              </div>

              <DropdownMenu.Item className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm cursor-pointer text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-3)] transition-colors focus:outline-none focus:bg-[var(--surface-3)]">
                <User className="h-3.5 w-3.5" />
                Profile
              </DropdownMenu.Item>

              <DropdownMenu.Separator className="my-1 h-px bg-[var(--border)]" />

              <DropdownMenu.Item
                onSelect={logout}
                className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm cursor-pointer text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors focus:outline-none focus:bg-red-500/10"
              >
                <LogOut className="h-3.5 w-3.5" />
                Sign out
              </DropdownMenu.Item>
            </DropdownMenu.Content>
          </DropdownMenu.Portal>
        </DropdownMenu.Root>
      </div>
    </header>
  );
}
