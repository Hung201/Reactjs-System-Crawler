import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authAPI } from '../services/api';

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
          const response = await authAPI.login(email, password);
          console.log('Login response:', response.data);
          
          // Kiểm tra cấu trúc response
          let user, token;
          if (response.data.data) {
            // Nếu có nested data
            ({ user, token } = response.data.data);
          } else if (response.data.user && response.data.token) {
            // Nếu data trực tiếp
            ({ user, token } = response.data);
          } else {
            throw new Error('Invalid response structure');
          }

          console.log('Setting auth state:', { user, token });
          set({
            user,
            token,
            isAuthenticated: true,
            isLoading: false,
          });

          return { success: true };
        } catch (error) {
          console.error('Login error:', error);
          set({ isLoading: false });
          return {
            success: false,
            error: error.response?.data?.error || error.message || 'Đăng nhập thất bại'
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
          const response = await authAPI.getProfile();
          set({ user: response.data, isAuthenticated: true });
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