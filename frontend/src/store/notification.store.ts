import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type NotificationType = 'lead_created' | 'lead_qualified' | 'lead_lost' | 'lead_updated' | 'system';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  read: boolean;
  createdAt: string;
}

interface NotificationState {
  notifications: Notification[];
  addNotification: (n: Omit<Notification, 'id' | 'read' | 'createdAt'>) => void;
  markRead: (id: string) => void;
  markAllRead: () => void;
  clearAll: () => void;
  unreadCount: () => number;
}

export const useNotificationStore = create<NotificationState>()(
  persist(
    (set, get) => ({
      notifications: [],

      addNotification: (n) =>
        set((s) => ({
          notifications: [
            {
              ...n,
              id: `notif_${Date.now()}_${Math.random().toString(36).slice(2)}`,
              read: false,
              createdAt: new Date().toISOString(),
            },
            ...s.notifications,
          ].slice(0, 50), // cap at 50
        })),

      markRead: (id) =>
        set((s) => ({
          notifications: s.notifications.map((n) =>
            n.id === id ? { ...n, read: true } : n
          ),
        })),

      markAllRead: () =>
        set((s) => ({
          notifications: s.notifications.map((n) => ({ ...n, read: true })),
        })),

      clearAll: () => set({ notifications: [] }),

      unreadCount: () => get().notifications.filter((n) => !n.read).length,
    }),
    { name: 'sl_notifications' }
  )
);
