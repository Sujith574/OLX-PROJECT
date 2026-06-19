import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,

      setAuth: (user, token) => {
        set({ user, token, isAuthenticated: true });
      },

      updateUser: (updatedUser) => {
        set({ user: { ...get().user, ...updatedUser } });
      },

      logout: () => {
        set({ user: null, token: null, isAuthenticated: false });
      },

      isAdmin: () => get().user?.role === 'admin',
    }),
    {
      name: 'findit-auth',
      storage: createJSONStorage(() => localStorage),
    }
  )
);

export default useAuthStore;
