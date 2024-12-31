import React from 'react';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PasswordInput } from './PasswordInput';

interface ResetPasswordFormData {
  password: string;
  password_confirmation: string;
}

interface ResetPasswordFormProps {
  onSubmit: (data: ResetPasswordFormData) => Promise<void>;
}

export const ResetPasswordForm: React.FC<ResetPasswordFormProps> = ({ onSubmit }) => {
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const { register, handleSubmit, watch, formState: { errors } } = useForm<ResetPasswordFormData>();
  const password = watch('password');

  const handleFormSubmit = async (data: ResetPasswordFormData) => {
    setLoading(true);
    setError(null);

    try {
      await onSubmit(data);
    } catch (err: any) {
      setError(err.message || 'Failed to reset password');
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
            Set New Password
          </CardTitle>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password">New Password</Label>
                <PasswordInput
                  id="password"
                  {...register('password', {
                    required: 'Password is required',
                    minLength: {
                      value: 8,
                      message: 'Password must be at least 8 characters'
                    },
                    pattern: {
                      value: /^[A-Za-z\d@$!%*?&#]*$/,
                      message: 'Password can only contain letters, numbers and special characters'
                    }
                  })}
                  error={errors.password?.message}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password_confirmation">Confirm Password</Label>
                <PasswordInput
                  id="password_confirmation"
                  {...register('password_confirmation', {
                    required: 'Please confirm your password',
                    validate: value => value === password || 'Passwords do not match'
                  })}
                  error={errors.password_confirmation?.message}
                />
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
              {loading ? 'Resetting...' : 'Reset Password'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}; 