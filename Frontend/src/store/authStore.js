import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

const useAuthStore = create(
  persist(
    (set) => ({
      user:      null,
      token:     null,
      isLoggedIn: false,

      login: (user, token) => set({ user, token, isLoggedIn: true }),

      logout: () => set({ user: null, token: null, isLoggedIn: false }),

      // Merge update — only overwrite provided fields
      updateUser: (data) =>
        set((state) => ({
          user: { ...state.user, ...data }
        })),
    }),
    {
      name:    'tn_auth',
      storage: createJSONStorage(() => localStorage), // localStorage — persists across refresh
    }
  )
);

export default useAuthStore;