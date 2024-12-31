import React from 'react';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { KeyRound } from 'lucide-react';

interface VerifyCodeFormData {
  code: string;
}

interface VerifyCodeFormProps {
  onSubmit: (data: VerifyCodeFormData) => Promise<void>;
  email: string;
}

export const VerifyCodeForm: React.FC<VerifyCodeFormProps> = ({ onSubmit, email }) => {
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const { register, handleSubmit, formState: { errors } } = useForm<VerifyCodeFormData>();

  const handleFormSubmit = async (data: VerifyCodeFormData) => {
    setLoading(true);
    setError(null);

    try {
      await onSubmit(data);
    } catch (err: any) {
      setError(err.message || 'Invalid recovery code');
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
            Enter Recovery Code
          </CardTitle>
          <p className="text-center text-sm text-muted-foreground mt-2">
            We've sent a recovery code to {email}
          </p>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="code">Recovery Code</Label>
              <div className="relative">
                <Input
                  id="code"
                  type="text"
                  className="pl-10 text-center tracking-[0.5em] font-mono"
                  {...register('code', {
                    required: 'Recovery code is required',
                    minLength: {
                      value: 6,
                      message: 'Code must be 6 characters'
                    },
                    maxLength: {
                      value: 6,
                      message: 'Code must be 6 characters'
                    }
                  })}
                  placeholder="000000"
                />
                <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              </div>
              {errors.code && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-sm text-red-500"
                >
                  {errors.code.message}
                </motion.p>
              )}
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
              {loading ? 'Verifying...' : 'Verify Code'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}; 