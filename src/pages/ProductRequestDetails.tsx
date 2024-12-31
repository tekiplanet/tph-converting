import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useParams, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { apiClient } from '@/lib/axios';
import { ArrowLeft, Calendar, Package, CircleDollarSign, MessageSquare } from 'lucide-react';
import PagePreloader from '@/components/ui/PagePreloader';
import { formatPrice } from '@/lib/utils';

export default function ProductRequestDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data: request, isLoading } = useQuery({
    queryKey: ['product-request', id],
    queryFn: () => apiClient.get(`/product-requests/${id}`).then(res => res.data.request)
  });

  if (isLoading) return <PagePreloader />;
  
  if (!request) {
    return (
      <div className="container mx-auto p-4 text-center">
        <h2 className="text-2xl font-bold">Request not found</h2>
        <Button 
          variant="ghost" 
          className="mt-4"
          onClick={() => navigate('/dashboard/my-requests')}
        >
          Back to Requests
        </Button>
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    const variants = {
      pending: 'default',
      processing: 'warning',
      completed: 'success',
      rejected: 'destructive'
    };
    return <Badge variant={variants[status]}>{status}</Badge>;
  };

  return (
    <div className="container mx-auto p-4 max-w-3xl">

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold">{request.product_name}</h1>
            <p className="text-muted-foreground">
              Request ID: {id?.slice(0, 8)}
            </p>
          </div>
          {getStatusBadge(request.status)}
        </div>

        {/* Main Content */}
        <Card className="p-6">
          <div className="space-y-6">
            {/* Description */}
            <div>
              <h3 className="font-semibold mb-2">Description</h3>
              <p className="text-muted-foreground">{request.description}</p>
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Package className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium">Quantity Needed</p>
                  <p className="text-muted-foreground">{request.quantity_needed} units</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <CircleDollarSign className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium">Price Range</p>
                  <p className="text-muted-foreground">
                    {request.min_price != null && request.max_price != null 
                      ? `${formatPrice(request.min_price)} - ${formatPrice(request.max_price)}`
                      : 'Not specified'
                    }
                  </p>
                </div>
              </div>

              {request.deadline && (
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Calendar className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">Expected By</p>
                    <p className="text-muted-foreground">
                      {format(new Date(request.deadline), 'MMM d, yyyy')}
                    </p>
                  </div>
                </div>
              )}

              {request.admin_response && (
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <MessageSquare className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">Admin Response</p>
                    <p className="text-muted-foreground">{request.admin_response}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Additional Details */}
            {request.additional_details && (
              <div>
                <h3 className="font-semibold mb-2">Additional Details</h3>
                <p className="text-muted-foreground">{request.additional_details}</p>
              </div>
            )}
          </div>
        </Card>
      </motion.div>
    </div>
  );
} 