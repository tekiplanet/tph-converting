import { apiClient } from '@/lib/axios';

export interface TwoFactorSetupResponse {
  secret: string;
  qr_code_url: string;
  recovery_codes: string[];
}

export const twoFactorService = {
  async enable() {
    const response = await apiClient.post<TwoFactorSetupResponse>('/auth/2fa/enable');
    return response.data;
  },

  async verifySetup(code: string) {
    try {
      console.log('Sending 2FA setup verification:', { code });
      const response = await apiClient.post('/auth/2fa/verify-setup', { code });
      return response.data;
    } catch (error: any) {
      console.error('2FA Setup Verification Error:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.response?.data?.message
      });
      throw new Error(error.response?.data?.message || 'Failed to verify 2FA code');
    }
  },

  async verify(code: string) {
    const response = await apiClient.post('/auth/2fa/verify', { code });
    return response.data;
  },

  async disable(code: string) {
    const response = await apiClient.post('/auth/2fa/disable', { code });
    return response.data;
  },

  async validateCode(code: string) {
    const response = await apiClient.post('/auth/2fa/validate', { code });
    return response.data;
  },

  async validateRecoveryCode(recoveryCode: string) {
    const response = await apiClient.post('/auth/2fa/validate-recovery', { recovery_code: recoveryCode });
    return response.data;
  },

  async generateRecoveryCodes() {
    const response = await apiClient.post<{ recovery_codes: string[] }>('/auth/2fa/recovery-codes');
    return response.data;
  },

  async getRecoveryCodes() {
    const response = await apiClient.get<{ recovery_codes: string[] }>('/auth/2fa/recovery-codes');
    return response.data;
  }
};
