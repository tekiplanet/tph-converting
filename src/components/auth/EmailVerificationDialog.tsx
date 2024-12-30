import React, { useState } from 'react';
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useAuthStore } from "@/store/useAuthStore";

interface EmailVerificationDialogProps {
  open: boolean;
  onClose?: () => void;
}

export const EmailVerificationDialog: React.FC<EmailVerificationDialogProps> = ({ 
  open, 
  onClose 
}) => {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const authStore = useAuthStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await authStore.verifyEmail(code);
      toast.success('Email verified successfully');
      onClose?.();
    } catch (error: any) {
      toast.error(error.message || 'Failed to verify email');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    try {
      await authStore.resendVerification();
      toast.success('Verification email sent');
    } catch (error: any) {
      toast.error(error.message || 'Failed to resend verification email');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <div className="p-6">
        <h2 className="text-2xl font-semibold mb-4">Verify Your Email</h2>
        <p className="text-gray-600 mb-6">
          Please enter the verification code sent to your email address.
        </p>

        <form onSubmit={handleSubmit}>
          <Input
            type="text"
            placeholder="Enter 6-digit code"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            maxLength={6}
            className="mb-4"
          />

          <div className="flex flex-col gap-3">
            <Button type="submit" disabled={loading || code.length !== 6}>
              {loading ? 'Verifying...' : 'Verify Email'}
            </Button>
            <Button 
              type="button" 
              variant="outline"
              onClick={handleResend}
              disabled={loading}
            >
              Resend Code
            </Button>
          </div>
        </form>
      </div>
    </Dialog>
  );
}; 