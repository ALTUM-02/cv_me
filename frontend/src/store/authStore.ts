import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { apolloClient, TOKEN_AUTH, REGISTER_USER, GET_CURRENT_USER, SEND_OTP, VERIFY_OTP, REGISTER_WITH_OTP } from '../api/graphql';
import type { AuthState, User, RegisterData } from '../types/auth';

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      token: null,

      // ==================== PASSWORD-BASED AUTH ====================

      login: async (email: string, password: string) => {
        try {
          const { data } = await apolloClient.mutate({
            mutation: TOKEN_AUTH,
            variables: { email, password },
          });

          if (data?.tokenAuth?.token) {
            const token = data.tokenAuth.token;
            localStorage.setItem('auth_token', token);

            const { data: userData } = await apolloClient.query({
              query: GET_CURRENT_USER,
              fetchPolicy: 'network-only',
            });

            if (userData?.viewer) {
              const user: User = {
                id: userData.viewer.id,
                email: userData.viewer.email,
                firstName: userData.viewer.firstName,
                lastName: userData.viewer.lastName,
                role: userData.viewer.role as 'user' | 'admin',
                avatar: userData.viewer.avatar,
                createdAt: userData.viewer.dateJoined,
                lastLogin: userData.viewer.lastLogin,
              };
              set({ user, isAuthenticated: true, token });
              return { success: true, message: 'Login successful!' };
            }
          }

          return { success: false, message: 'Invalid email or password' };
        } catch (error: unknown) {
          console.error('Login error:', error);
          const err = error as { message?: string; networkError?: unknown };
          if (err.networkError || (err.message && (err.message.includes('Network') || err.message.includes('fetch')))) {
            return { success: false, message: 'Unable to connect to server. Please check if the backend is running.' };
          }
          return { success: false, message: err.message || 'Invalid email or password' };
        }
      },

      register: async (data: RegisterData) => {
        try {
          const { data: result } = await apolloClient.mutate({
            mutation: REGISTER_USER,
            variables: {
              email: data.email,
              password: data.password,
              firstName: data.firstName,
              lastName: data.lastName,
            },
          });

          if (result?.registerUser?.success) {
            // Auto-login after registration
            const loginResult = await get().login(data.email, data.password);
            return loginResult;
          }

          return { success: false, message: result?.registerUser?.message || 'Registration failed' };
        } catch (error: unknown) {
          console.error('Registration error:', error);
          const err = error as { message?: string; networkError?: unknown };
          if (err.networkError || (err.message && (err.message.includes('Network') || err.message.includes('fetch')))) {
            return { success: false, message: 'Unable to connect to server. Please check if the backend is running.' };
          }
          return { success: false, message: err.message || 'Registration failed' };
        }
      },

      // ==================== OTP-BASED AUTH ====================

      sendOtp: async (email: string, code: string) => {
        try {
          const { data } = await apolloClient.mutate({
            mutation: SEND_OTP,
            variables: { email, code },
          });

          if (data?.sendOtp?.success) {
            return { success: true, message: data.sendOtp.message };
          }

          return { success: false, message: data?.sendOtp?.message || 'Failed to send OTP' };
        } catch (error: unknown) {
          console.error('Send OTP error:', error);
          const err = error as { message?: string; networkError?: unknown };
          if (err.networkError || (err.message && (err.message.includes('Network') || err.message.includes('fetch')))) {
            return { success: false, message: 'Unable to connect to server. Please check if the backend is running.' };
          }
          return { success: false, message: err.message || 'Failed to send OTP' };
        }
      },

      verifyOtp: async (email: string, code: string) => {
        try {
          const { data } = await apolloClient.mutate({
            mutation: VERIFY_OTP,
            variables: { email, code },
          });

          if (data?.verifyOtp?.success && data?.verifyOtp?.token) {
            const token = data.verifyOtp.token;
            localStorage.setItem('auth_token', token);

            const userData = data.verifyOtp.user;
            if (userData) {
              const user: User = {
                id: userData.id,
                email: userData.email,
                firstName: userData.firstName,
                lastName: userData.lastName,
                role: userData.role as 'user' | 'admin',
                avatar: userData.avatar,
                createdAt: userData.dateJoined,
                lastLogin: userData.lastLogin,
              };
              set({ user, isAuthenticated: true, token });
              return { success: true, message: data.verifyOtp.message };
            }
          }

          return { success: false, message: data?.verifyOtp?.message || 'OTP verification failed' };
        } catch (error: unknown) {
          console.error('Verify OTP error:', error);
          const err = error as { message?: string; networkError?: unknown };
          if (err.networkError || (err.message && (err.message.includes('Network') || err.message.includes('fetch')))) {
            return { success: false, message: 'Unable to connect to server. Please check if the backend is running.' };
          }
          return { success: false, message: err.message || 'OTP verification failed' };
        }
      },

      registerWithOtp: async (data: { email: string; code: string; firstName: string; lastName: string; password: string }) => {
        try {
          const { data: result } = await apolloClient.mutate({
            mutation: REGISTER_WITH_OTP,
            variables: {
              email: data.email,
              code: data.code,
              firstName: data.firstName,
              lastName: data.lastName,
              password: data.password,
            },
          });

          if (result?.registerWithOtp?.success && result?.registerWithOtp?.token) {
            const token = result.registerWithOtp.token;
            localStorage.setItem('auth_token', token);

            const userData = result.registerWithOtp.user;
            if (userData) {
              const user: User = {
                id: userData.id,
                email: userData.email,
                firstName: userData.firstName,
                lastName: userData.lastName,
                role: userData.role as 'user' | 'admin',
                avatar: userData.avatar,
                createdAt: userData.dateJoined,
                lastLogin: userData.lastLogin,
              };
              set({ user, isAuthenticated: true, token });
              return { success: true, message: result.registerWithOtp.message };
            }
          }

          return { success: false, message: result?.registerWithOtp?.message || 'Registration failed' };
        } catch (error: unknown) {
          console.error('Register with OTP error:', error);
          const err = error as { message?: string; networkError?: unknown };
          if (err.networkError || (err.message && (err.message.includes('Network') || err.message.includes('fetch')))) {
            return { success: false, message: 'Unable to connect to server. Please check if the backend is running.' };
          }
          return { success: false, message: err.message || 'Registration failed' };
        }
      },

      // ==================== COMMON ====================

      logout: () => {
        localStorage.removeItem('auth_token');
        apolloClient.resetStore();
        set({ user: null, isAuthenticated: false, token: null });
      },

      loadUser: async () => {
        const token = localStorage.getItem('auth_token');
        if (!token) {
          set({ user: null, isAuthenticated: false, token: null });
          return;
        }

        try {
          const { data } = await apolloClient.query({
            query: GET_CURRENT_USER,
            fetchPolicy: 'network-only',
          });

          if (data?.viewer) {
            const user: User = {
              id: data.viewer.id,
              email: data.viewer.email,
              firstName: data.viewer.firstName,
              lastName: data.viewer.lastName,
              role: data.viewer.role as 'user' | 'admin',
              avatar: data.viewer.avatar,
              createdAt: data.viewer.dateJoined,
              lastLogin: data.viewer.lastLogin,
            };
            set({ user, isAuthenticated: true, token });
          } else {
            localStorage.removeItem('auth_token');
            set({ user: null, isAuthenticated: false, token: null });
          }
        } catch {
          localStorage.removeItem('auth_token');
          set({ user: null, isAuthenticated: false, token: null });
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        token: state.token,
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
