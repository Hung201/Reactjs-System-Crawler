import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authAPI } from '../services/api';
import mockAuthService from '../services/mockAuth';

const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,

      login: async (email, password) => {
        set({ isLoading: true });
        try {
          // Use mock service for testing without backend
          const response = await mockAuthService.login(email, password);
          const { user, token } = response.data;

          set({
            user,
            token,
            isAuthenticated: true,
            isLoading: false,
          });

          return { success: true };
        } catch (error) {
          set({ isLoading: false });
          return {
            success: false,
            error: error.message || 'Đăng nhập thất bại'
          };
        }
      },

      logout: () => {
        set({
          user: null,
          token: null,
          isAuthenticated: false,
        });
      },

      updateUser: (userData) => {
        set({ user: { ...get().user, ...userData } });
      },

      checkAuth: async () => {
        const { token } = get();
        if (!token) return false;

        try {
          // Use mock service for testing without backend
          const response = await mockAuthService.checkAuth(token);
          set({ user: response.data.user, isAuthenticated: true });
          return true;
        } catch (error) {
          set({
            user: null,
            token: null,
            isAuthenticated: false,
          });
          return false;
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated
      }),
    }
  )
);

export { useAuthStore }; 