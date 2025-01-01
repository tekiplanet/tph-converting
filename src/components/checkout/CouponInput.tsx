import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { apiClient } from '@/lib/axios';
import { toast } from 'sonner';
import { Loader2, X } from 'lucide-react';

interface CouponInputProps {
  onApply: (couponData: {
    code: string;
    discount: number;
    type: 'fixed' | 'percentage';
    value: number;
  } | null) => void;
  disabled?: boolean;
  appliedCoupon?: {
    code: string;
    discount: number;
    type: 'fixed' | 'percentage';
    value: number;
  } | null;
}

export function CouponInput({ onApply, disabled, appliedCoupon }: CouponInputProps) {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);

  const handleApply = async () => {
    if (!code) return;

    setLoading(true);
    try {
      const response = await apiClient.post('/coupons/validate', { code });
      onApply(response.data.coupon);
      toast.success(response.data.message);
      setCode(''); // Clear input after successful application
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to apply coupon');
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = () => {
    onApply(null);
    toast.success('Coupon removed');
  };

  if (appliedCoupon) {
    return (
      <div className="flex items-center gap-2 text-sm">
        <span className="flex-1">
          Applied coupon: <span className="font-medium">{appliedCoupon.code}</span>
        </span>
        <Button
          size="sm"
          variant="ghost"
          onClick={handleRemove}
          disabled={disabled}
          className="h-8 px-2"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  return (
    <div className="flex gap-2">
      <Input
        placeholder="Enter coupon code"
        value={code}
        onChange={(e) => setCode(e.target.value.toUpperCase())}
        disabled={disabled || loading}
        className="uppercase"
      />
      <Button 
        onClick={handleApply} 
        disabled={!code || disabled || loading}
        variant="secondary"
      >
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          'Apply'
        )}
      </Button>
    </div>
  );
} 