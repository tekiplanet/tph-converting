import React from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { LoginForm } from "@/components/auth/LoginForm";
import { useAuthStore } from "@/store/useAuthStore";

interface LoginFormData {
  login: string;
  password: string;
}

const Login = () => {
  const navigate = useNavigate();
  const authStore = useAuthStore();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  // Redirect to dashboard if already authenticated
  React.useEffect(() => {
    if (isAuthenticated && !authStore.requiresVerification) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, authStore.requiresVerification, navigate]);

  const handleLogin = async (data: LoginFormData) => {
    try {
      const { login, password } = data;
      const response = await authStore.login(login, password);

      if (response.requires_verification) {
        toast.info('Please verify your email address');
        navigate('/verify-email');
        return;
      }

      if (response.requires_2fa) {
        // Just navigate to 2FA page, no dialog needed
        navigate('/two-factor-auth');
        return;
      }

      toast.success('Login successful!');
      navigate('/dashboard');
    } catch (error: any) {
      console.error('Login error:', error);
      toast.error(error.message || 'Login failed');
    }
  };

  // Only render login form if not authenticated
  if (isAuthenticated && !authStore.requiresVerification) {
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <LoginForm onSubmit={handleLogin} />
    </div>
  );
};

export default Login;