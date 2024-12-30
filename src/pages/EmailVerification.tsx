import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuthStore } from "@/store/useAuthStore";

const EmailVerification = () => {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const navigate = useNavigate();
  const authStore = useAuthStore();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const requiresVerification = useAuthStore((state) => state.requiresVerification);
  const user = useAuthStore((state) => state.user);

  useEffect(() => {
    const checkAuth = async () => {
      // Only redirect if explicitly not authenticated
      if (isAuthenticated === false && !localStorage.getItem('token')) {
        navigate('/login');
        return;
      }

      // Only redirect to dashboard if explicitly verified
      if (isAuthenticated && requiresVerification === false) {
        navigate('/dashboard');
      }
    };

    checkAuth();
  }, [isAuthenticated, requiresVerification, navigate]);

  // Countdown timer effect
  useEffect(() => {
    if (countdown > 0) {
      const timer = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [countdown]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await authStore.verifyEmail(code);
      await authStore.initialize();
      toast.success('Email verified successfully');
      navigate('/dashboard');
    } catch (error: any) {
      toast.error(error.message || 'Failed to verify email');
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (countdown > 0) return;
    
    setResendLoading(true);
    try {
      await authStore.resendVerification();
      toast.success('Verification email sent');
      // Clear the input field when resending
      setCode('');
      // Start countdown for 60 seconds
      setCountdown(60);
    } catch (error: any) {
      toast.error(error.message || 'Failed to resend verification email');
    } finally {
      setResendLoading(false);
    }
  };

  // Only show if authenticated (even without full user data)
  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        <div className="bg-card shadow-lg rounded-lg p-8">
          <h1 className="text-2xl font-bold text-center mb-2 text-foreground">
            Verify Your Email
          </h1>
          <p className="text-muted-foreground text-center mb-6">
            Please enter the verification code sent to {user?.email}
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Input
                type="text"
                placeholder="Enter code"
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                maxLength={6}
                className="text-center text-xl md:text-2xl tracking-[0.25em] md:tracking-[0.5em] font-mono px-2 md:px-4"
                disabled={loading}
              />
            </div>

            <Button 
              type="submit" 
              className="w-full"
              disabled={loading || code.length !== 6}
            >
              {loading ? 'Verifying...' : 'Verify Email'}
            </Button>

            <div className="text-center">
              <p className="text-sm text-gray-600 mb-2">
                Didn't receive the code?
              </p>
              <Button
                type="button"
                variant="ghost"
                onClick={handleResend}
                disabled={resendLoading || countdown > 0}
                className="text-primary hover:text-primary/90"
              >
                {resendLoading ? (
                  'Sending...'
                ) : countdown > 0 ? (
                  `Resend Code (${countdown}s)`
                ) : (
                  'Resend Code'
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EmailVerification; 