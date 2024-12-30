import { apiClient } from '@/lib/axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

interface LoginData {
  login: string;
  password: string;
}

interface RegisterData {
  username: string;
  email: string;
  password: string;
  password_confirmation: string;
  first_name?: string;
  last_name?: string;
  type: 'student' | 'business' | 'professional';
}

interface BusinessProfile {
  status: string;
  company_name?: string;
  company_size?: string;
  industry?: string;
  website?: string;
  description?: string;
}

interface UserData {
  id: number;
  username: string;
  email: string;
  type: 'student' | 'business' | 'professional';
  first_name?: string;
  last_name?: string;
  wallet_balance?: number;
  two_factor_enabled?: boolean;
  dark_mode?: boolean;
  email_notifications?: boolean;
  push_notifications?: boolean;
  marketing_notifications?: boolean;
  profile_visibility?: 'public' | 'private';
  business_profile?: BusinessProfile;
}

interface User {
  // Add properties of the User type
}

interface UserPreferences {
  dark_mode?: boolean;
  theme?: 'light' | 'dark';
  email_notifications?: boolean;
  push_notifications?: boolean;
  marketing_notifications?: boolean;
  profile_visibility?: 'public' | 'private';
}

interface LoginResponse {
  token?: string;
  user?: UserData;
  requires_2fa?: boolean;
  message?: string;
}

export const authService = {
  async login(login: string, password: string, code?: string): Promise<LoginResponse> {
    try {
      const response = await apiClient.post('/login', {
        login,
        password,
        code
      });

      // Store token if provided
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
      }

      return response.data;
    } catch (error: any) {
      // Special handling for verification required response
      if (error.response?.status === 403 && error.response?.data?.requires_verification) {
        return error.response.data; // Return the response data instead of throwing
      }

      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      throw error;
    }
  },

  async register(data: RegisterData) {
    const response = await fetch(`${API_URL}/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      credentials: 'include',
      body: JSON.stringify({
        username: data.username,
        email: data.email,
        password: data.password,
        password_confirmation: data.password_confirmation,
        first_name: data.first_name,
        last_name: data.last_name,
        type: data.type
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Registration failed');
    }

    const responseData = await response.json();
    return responseData.user; // Return the user data directly
  },

  async logout() {
    try {
      const token = this.getToken();
      
      // If no token, consider logout successful
      if (!token) {
        return { message: 'Already logged out' };
      }

      const response = await fetch(`${API_URL}/logout`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        credentials: 'include'
      });

      // If unauthorized, it might mean the token is already invalid
      if (response.status === 401) {
        console.warn('Logout request received 401 - Token might be already invalid');
        return { message: 'Token already invalid' };
      }

      // For other non-OK responses
      if (!response.ok) {
        const errorData = await response.json();
        console.warn('Logout failed:', errorData);
        return { message: errorData.message || 'Logout failed' };
      }

      return response.json();
    } catch (error) {
      console.error('Logout error:', error);
      // Ensure we always return something, even on error
      return { message: 'Logout failed due to network error' };
    }
  },

  async getCurrentUser(): Promise<UserData> {
    try {
      const response = await apiClient.get<UserData>('/user');
      return response.data;
    } catch (error: any) {
      console.log('Response Status:', error.response?.status, error.response?.statusText);
      
      // Special handling for verification required error
      if (error.response?.status === 403 && error.response?.data?.requires_verification) {
        throw {
          ...error,
          response: {
            ...error.response,
            data: {
              ...error.response.data,
              requires_verification: true
            }
          }
        };
      }
      
      throw error;
    }
  },

  getToken() {
    let token: string | null = null;

    // 1. Check localStorage
    token = localStorage.getItem('token');
    console.log('Token from localStorage:', token);

    // 2. Check Zustand store
    if (!token) {
      const storedState = localStorage.getItem('auth-storage');
      console.log('Stored state:', storedState);

      if (storedState) {
        try {
          const parsedState = JSON.parse(storedState);
          console.log('Parsed state:', parsedState);
          
          // Try multiple paths to find the token
          token = parsedState?.token || 
                  parsedState?.state?.token || 
                  parsedState?.state?.user?.token;
          
          console.log('Token from parsed state:', token);
        } catch (parseError) {
          console.error('Error parsing stored state:', parseError);
        }
      }
    }

    // 3. Fallback check for window or global object (if applicable)
    if (!token && (window as any).token) {
      token = (window as any).token;
      console.log('Token from window object:', token);
    }

    return token;
  },

  async updateUserPreferences(preferences: UserPreferences): Promise<UserData> {
    try {
      console.log('Sending preferences update:', preferences);
      const response = await apiClient.put('/user/preferences', preferences);
      console.log('Received response:', response.data);
      if (!response.data.user) {
        throw new Error('No user data in response');
      }
      return response.data.user;
    } catch (error) {
      console.error('Failed to update preferences:', error);
      throw error;
    }
  },

  updateUserType: async (type: 'student' | 'business' | 'professional'): Promise<UserData> => {
    try {
      const response = await fetch(`${API_URL}/user/type`, {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
        },
        body: JSON.stringify({ account_type: type })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update user type');
      }

      const data = await response.json();
      return data.user;
    } catch (error) {
      console.error('Error updating user type:', error);
      throw error;
    }
  },

  async verifyEmail(code: string) {
    try {
      const response = await apiClient.post<{ user: UserData; message: string }>('email/verify', { code });
      return response.data;
    } catch (error: any) {
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      throw error;
    }
  },

  async resendVerification() {
    try {
      const response = await apiClient.post<{ message: string }>('email/resend');
      return response.data;
    } catch (error: any) {
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      throw error;
    }
  },

  verify2FA: async (email: string, code: string): Promise<any> => {
    try {
      console.log('Sending 2FA verification request:', { email, code });
      const response = await apiClient.post('/verify-2fa', {
        email,
        code
      });
      return response.data;
    } catch (error: any) {
      console.error('2FA Verification Error:', error.response?.data);
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      throw error;
    }
  },
};
