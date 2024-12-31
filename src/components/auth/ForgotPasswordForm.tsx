import React from 'react';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Mail } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface ForgotPasswordFormData {
  email: string;
}

interface ForgotPasswordFormProps {
  onSubmit: (data: ForgotPasswordFormData) => Promise<void>;
}

export const ForgotPasswordForm: React.FC<ForgotPasswordFormProps> = ({ onSubmit }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = React.useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<ForgotPasswordFormData>();

  const handleFormSubmit = async (data: ForgotPasswordFormData) => {
    setLoading(true);
    try {
      await onSubmit(data);
    } catch (err) {
      // Don't set local error, toast will handle it
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background relative flex items-center justify-center p-4">
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
            Reset Password
          </CardTitle>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <div className="relative">
                <Input
                  id="email"
                  type="email"
                  className="pl-10"
                  {...register('email', {
                    required: 'Email is required',
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: 'Invalid email address'
                    }
                  })}
                  placeholder="Enter your email address"
                />
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              </div>
            </div>

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
              {loading ? 'Sending...' : 'Send Recovery Email'}
            </Button>

            <div className="text-center text-sm">
              <Button 
                variant="link" 
                className="text-primary p-0 h-auto font-normal"
                onClick={() => navigate('/login')}
              >
                Back to Login
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}; 