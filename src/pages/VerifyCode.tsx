import React from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import { VerifyCodeForm } from "@/components/auth/VerifyCodeForm";
import { apiClient } from '@/lib/axios';

interface VerifyCodeData {
  code: string;
}

export default function VerifyCode() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const email = searchParams.get('email');

  React.useEffect(() => {
    if (!email) {
      toast.error('Email address is required');
      navigate('/forgot-password');
    }
  }, [email, navigate]);

  const handleSubmit = async (data: VerifyCodeData) => {
    try {
      await apiClient.post('/auth/verify-recovery-code', {
        email,
        code: data.code
      });
      toast.success('Code verified successfully');
      navigate(`/reset-password?email=${encodeURIComponent(email!)}&code=${data.code}`);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Invalid recovery code');
      throw error;
    }
  };

  if (!email) return null;

  return <VerifyCodeForm onSubmit={handleSubmit} email={email} />;
} 