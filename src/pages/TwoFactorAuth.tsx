import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuthStore } from "@/store/useAuthStore";
import { authService } from "@/services/authService";

const TwoFactorAuth = () => {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const user = useAuthStore((state) => state.user);

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const pendingEmail = localStorage.getItem('pending_2fa_email');
      const email = pendingEmail || user?.email || '';
      console.log('Using email for 2FA verification:', email);
      
      const response = await authService.verify2FA(email, code);
      if (response.token) {
        localStorage.removeItem('pending_2fa_email');
        localStorage.setItem('token', response.token);
        
        useAuthStore.setState({
          user: response.user,
          token: response.token,
          isAuthenticated: true,
          requiresVerification: false,
          requires_2fa: false
        });
        
        toast.success('Authentication successful');
        navigate('/dashboard');
      }
    } catch (error: any) {
      toast.error(error.message || 'Invalid authentication code');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        <div className="bg-card shadow-lg rounded-lg p-8">
          <h1 className="text-2xl font-bold text-center mb-2 text-foreground">
            Two-Factor Authentication
          </h1>
          <p className="text-muted-foreground text-center mb-6">
            Please enter the authentication code from your authenticator app
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
              {loading ? 'Verifying...' : 'Verify Code'}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default TwoFactorAuth; 