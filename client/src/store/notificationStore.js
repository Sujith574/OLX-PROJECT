import { create } from 'zustand';

const useNotificationStore = create((set, get) => ({
  notifications: [],
  unreadCount: 0,

  setNotifications: (notifications, unreadCount) => {
    set({ notifications, unreadCount });
  },

  addNotification: (notification) => {
    set((state) => ({
      notifications: [notification, ...state.notifications].slice(0, 20),
      unreadCount: state.unreadCount + 1,
    }));
  },

  markAllRead: () => {
    set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, isRead: true })),
      unreadCount: 0,
    }));
  },

  markOneRead: (id) => {
    set((state) => ({
      notifications: state.notifications.map((n) => n._id === id ? { ...n, isRead: true } : n),
      unreadCount: Math.max(0, state.unreadCount - 1),
    }));
  },

  removeNotification: (id) => {
    const notification = get().notifications.find((n) => n._id === id);
    set((state) => ({
      notifications: state.notifications.filter((n) => n._id !== id),
      unreadCount: notification && !notification.isRead
        ? Math.max(0, state.unreadCount - 1)
        : state.unreadCount,
    }));
  },
}));

export default useNotificationStore;
