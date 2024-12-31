import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PasswordInput } from './PasswordInput';
import { motion } from 'framer-motion';
import { User } from 'lucide-react';

interface LoginFormData {
  login: string;
  password: string;
}

interface LoginFormProps {
  onSubmit: (data: LoginFormData) => Promise<void>;
}

export const LoginForm: React.FC<LoginFormProps> = ({ onSubmit }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormData>();

  const handleFormSubmit = async (data: LoginFormData) => {
    setLoading(true);
    setError(null);

    try {
      await onSubmit(data);
    } catch (err: any) {
      // Specific handling for rate limiting error
      if (err.message.includes('Too many login attempts')) {
        setError('Too many login attempts. Please wait a moment and try again.');
      } else {
        // Default error handling
        setError(err.message || 'Login failed. Please check your credentials.');
      }
      console.error('Login error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background relative flex items-center justify-center p-4">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-background" />

      <Card className="w-full max-w-md relative">
        <div className="absolute -top-12 left-1/2 -translate-x-1/2">
          <div className="w-24 h-24 rounded-full bg-card shadow-2xl ring-4 ring-background flex items-center justify-center">
            <motion.div
              animate={{ scale: [0.9, 1, 0.9] }}
              transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
            >
              <img src="/logo-round.png" alt="Logo" className="w-16 h-16" />
            </motion.div>
          </div>
        </div>

        <CardHeader className="pt-16 pb-4">
          <CardTitle className="text-2xl text-center font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
            Welcome Back
          </CardTitle>
        </CardHeader>

        <CardContent>
          <form 
            onSubmit={handleSubmit(handleFormSubmit)} 
            className="space-y-6"
            noValidate
          >
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="login" className="text-sm font-medium">
                  Username or Email
                </Label>
                <div className="relative">
                  <Input
                    id="login"
                    type="text"
                    className="pl-10"
                    {...register('login', { 
                      required: 'Username or email is required',
                      validate: (value) => {
                        const isEmail = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(value);
                        const isUsername = /^[a-zA-Z0-9_]{3,20}$/.test(value);
                        return isEmail || isUsername || 'Invalid username or email';
                      }
                    })}
                    placeholder="Enter your username or email"
                  />
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                </div>
                {errors.login && (
                  <motion.p 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-sm text-red-500"
                  >
                    {errors.login.message}
                  </motion.p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium">
                  Password
                </Label>
                <PasswordInput
                  id="password"
                  {...register('password', { 
                    required: 'Password is required',
                    minLength: {
                      value: 8,
                      message: 'Password must be at least 8 characters'
                    }
                  })}
                  error={errors.password?.message}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="text-sm">
                  <Button 
                    variant="link" 
                    className="text-primary p-0 h-auto font-normal"
                    onClick={() => navigate('/forgot-password')}
                  >
                    Forgot your password?
                  </Button>
                </div>
              </div>
            </div>

            {error && (
              <motion.p 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-sm text-red-500 text-center"
              >
                {error}
              </motion.p>
            )}

            <Button 
              type="submit" 
              className="w-full" 
              disabled={loading}
              size="lg"
            >
              {loading ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="mr-2 h-4 w-4 border-2 border-current border-t-transparent rounded-full"
                />
              ) : null}
              {loading ? 'Signing in...' : 'Sign In'}
            </Button>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-muted" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  New to Tekiplanet?
                </span>
              </div>
            </div>

            <Button 
              type="button"
              variant="outline" 
              className="w-full"
              onClick={() => navigate('/register')}
            >
              Create an Account
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};