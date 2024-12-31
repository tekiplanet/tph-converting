import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authService } from '@/services/authService';
import { apiClient } from '@/lib/axios';

type UserData = {
  id: number;
  name?: string;
  email: string;
  username?: string;
  first_name?: string;
  last_name?: string;
  avatar?: string;
  wallet_balance?: number;
  account_type?: 'student' | 'business' | 'professional';
  two_factor_enabled?: boolean;
  preferences?: {
    dark_mode?: boolean;
    theme?: 'light' | 'dark';
  };
  dark_mode?: boolean;
  theme?: 'light' | 'dark';
  email_notifications?: boolean;
  push_notifications?: boolean;
  marketing_notifications?: boolean;
  profile_visibility?: 'public' | 'private';
};

type UserPreferences = {
  dark_mode?: boolean;
  theme?: 'light' | 'dark';
  email_notifications?: boolean;
  push_notifications?: boolean;
  marketing_notifications?: boolean;
};

type AuthState = {
  user: UserData | null;
  token: string | null;
  theme: 'light' | 'dark';
  isAuthenticated: boolean;
  requiresVerification: boolean;
  requires_2fa?: boolean;
  setTheme: (theme: 'light' | 'dark') => Promise<void>;
  login: (login: string, password: string, code?: string) => Promise<any>;
  logout: () => void;
  updateUser: (userData: Partial<UserData>) => Promise<boolean>;
  updateUserPreferences: (preferences: UserPreferences) => Promise<UserData>;
  updateUserType: (type: 'student' | 'business' | 'professional') => Promise<void>;
  refreshToken: () => Promise<UserData | null>;
  initialize: () => Promise<UserData | null>;
  updatePreferences: (preferences: {
    email_notifications?: boolean;
    push_notifications?: boolean;
    marketing_notifications?: boolean;
    profile_visibility?: 'public' | 'private';
  }) => Promise<any>;
  verifyEmail: (code: string) => Promise<any>;
  resendVerification: () => Promise<any>;
};

const useAuthStore = create<AuthState>(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      theme: localStorage.getItem('theme') as 'light' | 'dark' || 'light',
      isAuthenticated: false,
      requiresVerification: false,

      initialize: async () => {
        try {
          // Check for token first
          const token = localStorage.getItem('token');
          if (!token) {
            console.log('No token found during initialization');
            set({
              user: null,
              token: null,
              isAuthenticated: false,
              requiresVerification: false
            });
            return null;
          }

          // Set token in store before getting user data
          set({ token });

          try {
            const userData = await authService.getCurrentUser();
            set({
              user: userData,
              isAuthenticated: true,
              requiresVerification: false,
              theme: userData.dark_mode ? 'dark' : 'light'
            });
            return userData;
          } catch (error: any) {
            // If we get a 403, it might be because email isn't verified
            if (error.response?.status === 403) {
              // Keep the current state if we're in verification process
              const currentState = get();
              if (currentState.requiresVerification) {
                return null;
              }
            }
            
            // For other errors, clear auth state
            console.error('Initialization error:', error);
            localStorage.removeItem('token');
            set({
              user: null,
              token: null,
              isAuthenticated: false,
              requiresVerification: false
            });
            throw error;
          }
        } catch (error: any) {
          console.error('Initialization error:', error);
          throw error;
        }
      },

      setTheme: async (theme: 'light' | 'dark') => {
        try {
          // Update document classes first for immediate visual feedback
          const htmlElement = document.documentElement;
          htmlElement.classList.remove('light', 'dark');
          htmlElement.classList.add(theme);

          // Update local state
          set({ theme });
          localStorage.setItem('theme', theme);

          // Update user preferences in backend - only send dark_mode
          const response = await apiClient.put('/settings/preferences', {
            dark_mode: theme === 'dark'
          });

          // Update user data in store if the API call was successful
          if (response.data.user) {
            set(state => ({
              ...state,
              user: {
                ...state.user,
                ...response.data.user,
                preferences: {
                  ...state.user?.preferences,
                  dark_mode: theme === 'dark'
                }
              }
            }));
          }

        } catch (error) {
          console.error('Failed to update theme:', error);
          
          // Revert changes on failure
          const oldTheme = theme === 'light' ? 'dark' : 'light';
          
          // Revert document classes
          htmlElement.classList.remove('light', 'dark');
          htmlElement.classList.add(oldTheme);
          
          // Revert local state
          set({ theme: oldTheme });
          localStorage.setItem('theme', oldTheme);
          
          throw new Error('Failed to update theme preferences');
        }
      },

      login: async (login: string, password: string, code?: string) => {
        try {
          const response = await authService.login(login, password, code);
          
          // Check if 2FA is required
          if (response.requires_2fa) {
            // Store the user's email instead of the login credential
            localStorage.setItem('pending_2fa_email', response.user?.email || '');
            
            set({
              user: response.user,
              token: response.token,
              isAuthenticated: false,
              requiresVerification: false,
              requires_2fa: true
            });

            window.location.hash = '#/two-factor-auth';
            return response;
          }

          // If we get here, user is fully authenticated
          if (response.token) {
            localStorage.setItem('token', response.token);
            set({
              user: response.user,
              token: response.token,
              isAuthenticated: true,
              requiresVerification: false
            });
          }

          return response;
        } catch (error) {
          console.error('Login error:', error);
          localStorage.removeItem('token');
          set({
            user: null,
            token: null,
            isAuthenticated: false,
            requiresVerification: false
          });
          throw error;
        }
      },

      logout: () => {
        // Clear local storage
        localStorage.removeItem('token');
        
        // Reset authentication state
        set({
          user: null,
          token: null,
          isAuthenticated: false
        });

        // Optional: Call backend logout service
        try {
          authService.logout().catch(error => {
            // Silently handle any remaining logout errors
            console.warn('Logout service encountered an issue:', error);
          });
        } catch (error) {
          console.error('Logout attempt failed:', error);
        }
      },

      updateUser: async (userData: Partial<UserData>) => {
        try {
          set(state => ({
            user: state.user ? { ...state.user, ...userData } : null
          }));
          
          // Optionally refresh user data from server
          await get().refreshToken();
          
          return true;
        } catch (error) {
          console.error('Error updating user:', error);
          throw error;
        }
      },

      updateUserPreferences: async (preferences: UserPreferences) => {
        try {
          const updatedUser = await authService.updateUserPreferences(preferences);
          
          // Merge with existing user data
          set(state => ({
            user: state.user ? { 
              ...state.user, 
              preferences: {
                ...state.user.preferences,
                ...updatedUser.preferences
              }
            } : null,
            theme: updatedUser.preferences?.dark_mode ? 'dark' : 'light'
          }));

          return updatedUser;
        } catch (error) {
          console.error('Store: Error updating user preferences', error);
          throw error;
        }
      },

      updateUserType: async (type: 'student' | 'business' | 'professional') => {
        try {
          const updatedUser = await authService.updateUserType(type);
          
          set(state => ({
            user: state.user ? {
              ...state.user,
              ...updatedUser,
              account_type: type
            } : null
          }));
        } catch (error) {
          console.error('Failed to update user type:', error);
          throw error;
        }
      },

      refreshToken: async () => {
        try {
          const token = localStorage.getItem('token');
          if (!token) {
            return null;
          }

          const response = await fetch(`${import.meta.env.VITE_API_URL}/user?_=${Date.now()}`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json',
              'Authorization': `Bearer ${token}`,
              'Cache-Control': 'no-cache',
              'Pragma': 'no-cache'
            }
          });

          if (!response.ok) {
            get().logout();
            return null;
          }

          const userData = await response.json();

          // Update state with user data directly
          set((state) => ({
            ...state,
            user: userData,  // Store user data directly, not nested
            isAuthenticated: true
          }), true);

          return userData;
        } catch (error) {
          console.error('Failed to refresh user data:', error);
          get().logout();
          return null;
        }
      },

      updatePreferences: async (preferences: {
        email_notifications?: boolean;
        push_notifications?: boolean;
        marketing_notifications?: boolean;
        profile_visibility?: 'public' | 'private';
      }) => {
        try {
          const response = await apiClient.put('/user/preferences', preferences);
          const updatedUser = {
            ...get().user,
            ...response.data.user,
            email_notifications: response.data.user.email_notifications === true,
            push_notifications: response.data.user.push_notifications === true,
            marketing_notifications: response.data.user.marketing_notifications === true,
            profile_visibility: response.data.user.profile_visibility || 'private'
          };
          set({ user: updatedUser });
          return response.data;
        } catch (error) {
          console.error('Failed to update preferences:', error);
          throw error;
        }
      },

      verifyEmail: async (code: string) => {
        try {
          const response = await authService.verifyEmail(code);
          
          // If user has 2FA enabled
          if (response.user.two_factor_enabled) {
            // Store email for 2FA
            localStorage.setItem('pending_2fa_email', response.user.email);
            
            set({
              user: response.user,
              token: response.token,
              isAuthenticated: false,
              requiresVerification: false,
              requires_2fa: true
            });

            // Change this line to use hash routing
            window.location.hash = '#/two-factor-auth';
          } else {
            // If no 2FA, proceed as normal
            set({
              user: response.user,
              token: response.token,
              isAuthenticated: true,
              requiresVerification: false
            });
          }
          
          return response;
        } catch (error) {
          throw error;
        }
      },

      resendVerification: async () => {
        try {
          const response = await authService.resendVerification();
          return response;
        } catch (error) {
          throw error;
        }
      }
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        theme: state.theme,
        isAuthenticated: state.isAuthenticated,
        requiresVerification: state.requiresVerification
      })
    }
  )
);

export { useAuthStore };
export default useAuthStore;