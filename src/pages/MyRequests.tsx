import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { apiClient } from '@/lib/axios';
import { Plus, ChevronRight, Package2, ArrowLeft, SlidersHorizontal } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useMediaQuery } from '@/hooks/use-media-query';
import PagePreloader from '@/components/ui/PagePreloader';
import { Card } from '@/components/ui/card';
import { motion } from 'framer-motion';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatPrice } from '@/lib/utils';

interface ProductRequest {
  id: string;
  product_name: string;
  status: 'pending' | 'processing' | 'completed' | 'rejected';
  created_at: string;
  expected_price_range: string;
  admin_response?: string;
  description: string;
  min_price: number;
  max_price: number;
  deadline: string;
}

type SortOption = 'newest' | 'oldest' | 'deadline';
type FilterStatus = 'all' | 'pending' | 'processing' | 'completed' | 'rejected';

export default function MyRequests() {
  const navigate = useNavigate();
  const isMobile = useMediaQuery('(max-width: 768px)');
  
  const { data, isLoading } = useQuery({
    queryKey: ['product-requests'],
    queryFn: () => apiClient.get('/product-requests').then(res => res.data)
  });

  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [statusFilter, setStatusFilter] = useState<FilterStatus>('all');

  const filteredAndSortedRequests = React.useMemo(() => {
    if (!data?.requests) return [];
    
    let filtered = [...data.requests];
    
    if (statusFilter !== 'all') {
      filtered = filtered.filter(request => request.status === statusFilter);
    }
    
    return filtered.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        case 'oldest':
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        case 'deadline':
          if (!a.deadline) return 1;
          if (!b.deadline) return -1;
          return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
        default:
          return 0;
      }
    });
  }, [data?.requests, sortBy, statusFilter]);

  const getStatusBadge = (status: string) => {
    const variants = {
      pending: 'default',
      processing: 'warning',
      completed: 'success',
      rejected: 'destructive'
    };
    return <Badge variant={variants[status]}>{status}</Badge>;
  };

  if (isLoading) return <PagePreloader />;

  if (data?.requests.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        {/* Modern Mobile Header */}
        <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-xl border-b">
          <div className="container flex items-center h-16">
            <h1 className="text-xl font-semibold ml-2">My Requests</h1>
          </div>
        </div>

        <motion.div 
          className="flex flex-col items-center justify-center min-h-[80vh] p-4 text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mb-6">
            <Package2 className="w-12 h-12 text-primary" />
          </div>
          <h2 className="text-2xl font-bold mb-2">No Requests Yet</h2>
          <p className="text-muted-foreground mb-8 max-w-sm">
            Can't find what you're looking for? Make a request and we'll help you get it.
          </p>
          <Button 
            size="lg"
            className="gap-2"
            onClick={() => navigate('/dashboard/product-request')}
          >
            <Plus className="w-5 h-5" />
            Make Your First Request
          </Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Modern Mobile Header */}
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-xl border-b">
        <div className="container flex items-center justify-between h-16">
          <div className="flex items-center">
            <h1 className="text-xl font-semibold ml-2">My Requests</h1>
          </div>
          <Button 
            onClick={() => navigate('/dashboard/product-request')}
            size="sm"
            className="gap-2"
          >
            <Plus className="w-4 h-4" />
            New
          </Button>
        </div>
      </div>

      <div className="container py-6">
        <div className="mb-6 flex flex-col sm:flex-row gap-4 items-start sm:items-center">
          <div className="flex items-center gap-2 text-muted-foreground">
            <SlidersHorizontal className="w-4 h-4" />
            <span className="text-sm font-medium">Filters:</span>
          </div>
          <div className="flex flex-1 gap-4 flex-col sm:flex-row w-full sm:w-auto">
            <Select
              value={statusFilter}
              onValueChange={(value: FilterStatus) => setStatusFilter(value)}
            >
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="processing">Processing</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={sortBy}
              onValueChange={(value: SortOption) => setSortBy(value)}
            >
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest First</SelectItem>
                <SelectItem value="oldest">Oldest First</SelectItem>
                <SelectItem value="deadline">Deadline</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {isMobile ? (
          <motion.div 
            className="space-y-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {filteredAndSortedRequests.map((request: ProductRequest, index: number) => (
              <motion.div
                key={request.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="mx-[-1rem]"
              >
                <Card 
                  className="p-4 hover:shadow-lg transition-shadow cursor-pointer active:scale-[0.99] rounded-none sm:rounded-lg"
                  onClick={() => navigate(`/dashboard/product-request/${request.id}`)}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold text-lg">{request.product_name}</h3>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {request.description}
                      </p>
                    </div>
                    <ChevronRight className="h-5 w-5 text-muted-foreground" />
                  </div>
                  
                  <div className="flex items-center justify-between pt-2">
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(request.created_at), 'MMM d, yyyy')}
                      </p>
                      {request.min_price != null && request.max_price != null && (
                        <p className="text-sm font-medium">
                          {formatPrice(request.min_price)} - {formatPrice(request.max_price)}
                        </p>
                      )}
                    </div>
                    {getStatusBadge(request.status)}
                  </div>

                  {request.admin_response && (
                    <div className="pt-2 border-t">
                      <p className="text-sm text-muted-foreground">
                        Response: {request.admin_response}
                      </p>
                    </div>
                  )}

                  {request.deadline && (
                    <p className="text-xs text-muted-foreground">
                      Expected by: {format(new Date(request.deadline), 'MMM d, yyyy')}
                    </p>
                  )}
                </Card>
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-card rounded-lg shadow-sm"
          >
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product Name</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date Requested</TableHead>
                  <TableHead>Price Range</TableHead>
                  <TableHead>Response</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAndSortedRequests.map((request: ProductRequest) => (
                  <TableRow 
                    key={request.id}
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => navigate(`/dashboard/product-request/${request.id}`)}
                  >
                    <TableCell>{request.product_name}</TableCell>
                    <TableCell>{getStatusBadge(request.status)}</TableCell>
                    <TableCell>
                      {format(new Date(request.created_at), 'MMM d, yyyy')}
                    </TableCell>
                    <TableCell>
                      {request.min_price != null && request.max_price != null 
                        ? `${formatPrice(request.min_price)} - ${formatPrice(request.max_price)}`
                        : '-'
                      }
                    </TableCell>
                    <TableCell>
                      {request.admin_response || '-'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </motion.div>
        )}
      </div>
    </div>
  );
} 