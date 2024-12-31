import React from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import { ResetPasswordForm } from "@/components/auth/ResetPasswordForm";
import { apiClient } from '@/lib/axios';

interface ResetPasswordData {
  password: string;
  password_confirmation: string;
}

export default function ResetPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const email = searchParams.get('email');
  const code = searchParams.get('code');

  React.useEffect(() => {
    if (!email || !code) {
      toast.error('Invalid reset password request');
      navigate('/forgot-password');
    }
  }, [email, code, navigate]);

  const handleSubmit = async (data: ResetPasswordData) => {
    try {
      await apiClient.post('/auth/reset-password', {
        email,
        code,
        ...data
      });
      toast.success('Password reset successfully');
      navigate('/login');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to reset password');
      throw error;
    }
  };

  if (!email || !code) return null;

  return <ResetPasswordForm onSubmit={handleSubmit} />;
} 