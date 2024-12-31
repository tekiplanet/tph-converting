import React from 'react';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { apiClient } from '@/lib/axios';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';

interface ProductRequestFormData {
  product_name: string;
  description: string;
  min_price: number;
  max_price: number;
  deadline: string;
  quantity_needed: number;
  additional_details: string;
}

export default function ProductRequest() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { register, handleSubmit, formState: { errors }, reset } = useForm<ProductRequestFormData>();
  const [loading, setLoading] = React.useState(false);

  const { data: existingRequest } = useQuery({
    queryKey: ['product-request', id],
    queryFn: () => id ? apiClient.get(`/product-requests/${id}`).then(res => res.data.request) : null,
    enabled: !!id,
    onSuccess: (data) => {
      if (data) {
        reset(data);
      }
    }
  });

  const onSubmit = async (data: ProductRequestFormData) => {
    try {
      setLoading(true);
      await apiClient.post('/product-requests', data);
      toast.success('Product request submitted successfully');
      navigate('/dashboard/my-requests');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to submit request');
    } finally {
      setLoading(false);
    }
  };

  const isViewMode = !!id;

  return (
    <div className="min-h-screen bg-background p-4">
      <Card className="max-w-2xl mx-auto">
        <div className="p-6">
          <h1 className="text-2xl font-bold mb-6">
            {isViewMode ? 'View Request' : 'Request a Product'}
          </h1>
          
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="product_name">Product Name</Label>
              <Input
                id="product_name"
                disabled={isViewMode}
                {...register('product_name', { required: 'Product name is required' })}
                placeholder="Enter the product name"
              />
              {errors.product_name && (
                <p className="text-sm text-red-500">{errors.product_name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                disabled={isViewMode}
                {...register('description', { required: 'Description is required' })}
                placeholder="Describe the product you're looking for"
                rows={4}
              />
              {errors.description && (
                <p className="text-sm text-red-500">{errors.description.message}</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="min_price">Minimum Price (₦)</Label>
                <Input
                  type="number"
                  id="min_price"
                  disabled={isViewMode}
                  {...register('min_price', { 
                    required: 'Minimum price is required',
                    min: { value: 0, message: 'Price cannot be negative' }
                  })}
                  placeholder="e.g., 50000"
                />
                {errors.min_price && (
                  <p className="text-sm text-red-500">{errors.min_price.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="max_price">Maximum Price (₦)</Label>
                <Input
                  type="number"
                  id="max_price"
                  disabled={isViewMode}
                  {...register('max_price', { 
                    required: 'Maximum price is required',
                    min: { value: 0, message: 'Price cannot be negative' },
                    validate: (value, formValues) => 
                      parseInt(value) >= parseInt(formValues.min_price) || 
                      'Maximum price must be greater than minimum price'
                  })}
                  placeholder="e.g., 100000"
                />
                {errors.max_price && (
                  <p className="text-sm text-red-500">{errors.max_price.message}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="deadline">Expected Availability Date</Label>
              <Input
                type="date"
                id="deadline"
                disabled={isViewMode}
                min={new Date().toISOString().split('T')[0]}
                {...register('deadline', { 
                  required: 'Deadline is required',
                  validate: (value) => 
                    new Date(value) > new Date() || 
                    'Deadline must be a future date'
                })}
              />
              {errors.deadline && (
                <p className="text-sm text-red-500">{errors.deadline.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="quantity_needed">Quantity Needed</Label>
              <Input
                type="number"
                id="quantity_needed"
                disabled={isViewMode}
                {...register('quantity_needed', { 
                  required: 'Quantity is required',
                  min: { value: 1, message: 'Minimum quantity is 1' }
                })}
              />
              {errors.quantity_needed && (
                <p className="text-sm text-red-500">{errors.quantity_needed.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="additional_details">Additional Details</Label>
              <Textarea
                id="additional_details"
                disabled={isViewMode}
                {...register('additional_details')}
                placeholder="Any other specifications or requirements"
                rows={3}
              />
            </div>

            <div className="flex gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate(-1)}
              >
                {isViewMode ? 'Back' : 'Cancel'}
              </Button>
              {!isViewMode && (
                <Button
                  type="submit"
                  disabled={loading}
                  className="flex-1"
                >
                  {loading ? 'Submitting...' : 'Submit Request'}
                </Button>
              )}
            </div>
          </form>
        </div>
      </Card>
    </div>
  );
} 