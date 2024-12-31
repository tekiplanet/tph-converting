import React from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { ForgotPasswordForm } from "@/components/auth/ForgotPasswordForm";
import { apiClient } from '@/lib/axios';

interface ForgotPasswordData {
  email: string;
}

export default function ForgotPassword() {
  const navigate = useNavigate();

  const handleSubmit = async (data: ForgotPasswordData) => {
    try {
      const response = await apiClient.post('/auth/forgot-password', data);
      toast.success(response.data.message || 'Recovery code sent to your email');
      navigate(`/verify-code?email=${encodeURIComponent(data.email)}`);
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to send recovery code';
      toast.error(message);
      // Don't throw error here to prevent form error state
      return;
    }
  };

  return <ForgotPasswordForm onSubmit={handleSubmit} />;
} 