import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { businessService } from '@/services/businessService';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  ArrowLeft,
  Download,
  Mail,
  FileText,
  Clock,
  DollarSign,
  Send,
  AlertCircle,
  Loader2,
  Plus,
  Calendar,
  Edit,
  Trash,
  Phone,
  MapPin,
  CircleDollarSign,
  Wallet,
  MoreVertical,
  Users,
  Eye
} from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";
import { getStatusBadgeProps } from "@/lib/format";
import { toast } from 'sonner';
import { format } from "date-fns";
import InvoiceFormDialog from '@/components/business/InvoiceFormDialog';
import CustomerFormDialog from '@/components/business/CustomerFormDialog';
import { DeleteConfirmDialog } from '@/components/business/DeleteConfirmDialog';
import { motion } from 'framer-motion';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

const CustomerDetailsSkeleton = () => (
  <div className="container mx-auto p-4 md:p-8 max-w-7xl space-y-8">
    {/* Header Skeleton */}
    <div className="flex items-center gap-4">
      <div className="w-8 h-8 bg-muted rounded-lg animate-pulse" />
      <div className="flex-1">
        <div className="h-8 w-48 bg-muted rounded animate-pulse mb-2" />
        <div className="h-4 w-64 bg-muted rounded animate-pulse" />
      </div>
      <div className="flex gap-2">
        <div className="w-20 h-8 bg-muted rounded animate-pulse" />
        <div className="w-20 h-8 bg-muted rounded animate-pulse" />
      </div>
    </div>

    {/* Content Skeleton */}
    <div className="grid md:grid-cols-3 gap-6">
      {/* Main Info Card Skeleton */}
      <Card className="md:col-span-2">
        <CardHeader>
          <div className="h-6 w-32 bg-muted rounded animate-pulse" />
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="h-6 w-3/4 bg-muted rounded animate-pulse" />
            <div className="h-4 w-1/2 bg-muted rounded animate-pulse" />
            <div className="h-4 w-1/3 bg-muted rounded animate-pulse" />
          </div>
        </CardContent>
      </Card>

      {/* Stats Card Skeleton */}
      <Card>
        <CardHeader>
          <div className="h-6 w-24 bg-muted rounded animate-pulse" />
        </CardHeader>
        <CardContent className="space-y-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="space-y-2">
              <div className="h-4 w-20 bg-muted rounded animate-pulse" />
              <div className="h-6 w-32 bg-muted rounded animate-pulse" />
            </div>
          ))}
        </CardContent>
        <CardFooter>
          <div className="w-full h-9 bg-muted rounded animate-pulse" />
        </CardFooter>
      </Card>
    </div>

    {/* Tabs Skeleton */}
    <div className="space-y-6">
      <div className="flex gap-2">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-9 w-24 bg-muted rounded animate-pulse" />
        ))}
      </div>
      <Card>
        <CardContent className="p-8">
          <div className="h-32 flex items-center justify-center">
            <div className="h-4 w-32 bg-muted rounded animate-pulse" />
          </div>
        </CardContent>
      </Card>
    </div>
  </div>
);

function TransactionsTab({ customerId }: { customerId: string }) {
  const { data: transactions, isLoading } = useQuery({
    queryKey: ["customer-transactions", customerId],
    queryFn: () => businessService.getCustomerTransactions(customerId),
  });

  const formatTransactionDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "PPP");
    } catch (error) {
      console.error('Invalid date:', dateString);
      return 'Invalid date';
    }
  };

  if (isLoading) {
    return <div className="space-y-4">
      <Skeleton className="h-12 w-full" />
      <Skeleton className="h-12 w-full" />
      <Skeleton className="h-12 w-full" />
    </div>;
  }

  if (!transactions?.length) {
    return (
      <Card>
        <CardContent className="p-8 text-center text-muted-foreground">
          No transactions found for this customer.
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-0">
        {/* Desktop View */}
        <div className="hidden md:block">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Notes</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.map((transaction) => (
                <TableRow key={transaction.id}>
                  <TableCell>{formatTransactionDate(transaction.payment_date)}</TableCell>
                  <TableCell>Payment</TableCell>
                  <TableCell>{formatCurrency(transaction.amount, transaction.currency)}</TableCell>
                  <TableCell>
                    <Badge variant="success">Completed</Badge>
                  </TableCell>
                  <TableCell>{transaction.notes || '-'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Mobile View */}
        <div className="block md:hidden divide-y divide-border">
          {transactions.map((transaction) => (
            <div key={transaction.id} className="p-4 space-y-3">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-medium">
                    Invoice #{transaction.invoice_number}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {formatTransactionDate(transaction.payment_date)}
                  </p>
                </div>
                <Badge variant={getStatusVariant(transaction.status)}>
                  {transaction.status}
                </Badge>
              </div>
              <div className="flex justify-between items-center text-sm">
                <div>
                  <p className="text-muted-foreground">Type</p>
                  <p className="capitalize">{transaction.type}</p>
                </div>
                <div className="text-right">
                  <p className="text-muted-foreground">Amount</p>
                  <p className="font-medium">{formatCurrency(transaction.amount, transaction.currency)}</p>
                </div>
              </div>
              {transaction.notes && (
                <div className="text-sm">
                  <p className="text-muted-foreground">Notes</p>
                  <p>{transaction.notes}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function getStatusVariant(status: string): "default" | "secondary" | "destructive" | "success" {
  switch (status.toLowerCase()) {
    case "completed":
    case "paid":
      return "success";
    case "pending":
      return "secondary";
    case "failed":
      return "destructive";
    default:
      return "secondary";
  }
}

function InvoicesTabSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <div className="h-5 w-24 bg-muted rounded animate-pulse" />
          <div className="h-4 w-40 bg-muted rounded animate-pulse mt-1" />
        </div>
        <div className="h-9 w-32 bg-muted rounded animate-pulse" />
      </div>
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="p-4 rounded-lg border">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="h-5 w-48 bg-muted rounded animate-pulse" />
                <div className="h-4 w-32 bg-muted rounded animate-pulse mt-2" />
              </div>
              <div>
                <div className="h-4 w-20 bg-muted rounded animate-pulse" />
                <div className="h-5 w-24 bg-muted rounded animate-pulse mt-1" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function InvoicesTab({ customerId }: { customerId: string }) {
  const [isCreateInvoiceOpen, setIsCreateInvoiceOpen] = useState(false);
  const { data: invoices, isLoading } = useQuery({
    queryKey: ['customer-invoices', customerId],
    queryFn: () => businessService.getCustomerInvoices(customerId)
  });

  if (isLoading) {
    return <InvoicesTabSkeleton />;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-medium">Invoices</h3>
          <p className="text-sm text-muted-foreground">
            Manage customer invoices
          </p>
        </div>
        <Button onClick={() => setIsCreateInvoiceOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Create Invoice
        </Button>
      </div>

      {invoices?.length > 0 ? (
        <div className="space-y-4">
          {invoices.map((invoice) => (
            <Link
              key={invoice.id}
              to={`/dashboard/business/customers/${customerId}/invoices/${invoice.id}`}
              className="block"
            >
              <div className="p-4 rounded-lg border bg-card hover:bg-muted/50 transition-colors">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium truncate">
                        Invoice #{invoice.invoice_number}
                      </p>
                      <Badge {...getStatusBadgeProps(invoice.status_details)}>
                        {invoice.status_details?.label ?? invoice.status}
                      </Badge>
                    </div>
                    <div className="mt-1 flex flex-wrap gap-x-6 gap-y-1 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        <span>Due {formatDate(invoice.due_date)}</span>
                      </div>
                      {invoice.status_details?.is_overdue && invoice.status_details.status !== 'paid' && (
                        <div className="flex items-center gap-2 text-destructive">
                          <AlertCircle className="h-4 w-4" />
                          <span>Overdue by {invoice.status_details.days_overdue} days</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">Amount</p>
                    <div className="font-medium">
                      {invoice.status_details?.paid_amount > 0 ? (
                        <div className="space-y-1">
                          <p className="text-success">
                            {formatCurrency(invoice.status_details.paid_amount, invoice.currency)} paid
                          </p>
                          {invoice.status_details.remaining_amount > 0 && (
                            <p>
                              {formatCurrency(invoice.status_details.remaining_amount, invoice.currency)} due
                            </p>
                          )}
                        </div>
                      ) : (
                        formatCurrency(invoice.amount, invoice.currency)
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="p-6">
            <div className="text-center py-8 text-muted-foreground">
              <FileText className="h-8 w-8 mx-auto mb-4 opacity-50" />
              <p>No invoices created yet</p>
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => setIsCreateInvoiceOpen(true)}
              >
                Create First Invoice
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <InvoiceFormDialog
        open={isCreateInvoiceOpen}
        onOpenChange={setIsCreateInvoiceOpen}
        customerId={customerId}
      />
    </div>
  );
}

export default function CustomerDetails() {
  const { customerId } = useParams();
  const navigate = useNavigate();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isInvoiceFormOpen, setIsInvoiceFormOpen] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isSending, setIsSending] = useState(false);

  const { data: customer, isLoading } = useQuery({
    queryKey: ['customer', customerId],
    queryFn: () => businessService.getCustomer(customerId!),
    enabled: !!customerId
  });

  const { data: invoices, isLoading: isLoadingInvoices } = useQuery({
    queryKey: ['customer-invoices', customerId],
    queryFn: () => businessService.getCustomerInvoices(customerId!),
    enabled: !!customerId
  });

  const handleDelete = async () => {
    if (!customer) return;

    try {
      setIsDeleting(true);
      await businessService.deleteCustomer(customer.id);
      toast.success('Customer deleted successfully');
      navigate('/dashboard/business/customers');
    } catch (error: any) {
      const errorMessage = error.response?.data?.type === 'has_invoices' 
        ? 'Cannot delete customer with existing invoices. Please delete all invoices first.'
        : 'Failed to delete customer';
      toast.error(errorMessage);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDownloadInvoice = async (invoiceId: string) => {
    try {
      setIsDownloading(true);
      await businessService.downloadInvoice(invoiceId);
      toast.success('Invoice downloaded successfully');
    } catch (error) {
      toast.error('Failed to download invoice');
    } finally {
      setIsDownloading(false);
    }
  };

  const handleSendInvoice = async (invoiceId: string) => {
    try {
      setIsSending(true);
      await businessService.sendInvoice(invoiceId);
      toast.success('Invoice sent successfully');
    } catch (error) {
      toast.error('Failed to send invoice');
    } finally {
      setIsSending(false);
    }
  };

  if (isLoading) {
    return <CustomerDetailsSkeleton />;
  }

  if (!customer) {
    return <div>Customer not found</div>;
  }

  return (
    <div className="container mx-auto p-0 sm:p-4 max-w-7xl">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex flex-col min-h-[calc(100vh-4rem)] bg-background"
      >
        {/* Header */}
        <header className="sticky top-0 z-20 bg-gradient-to-r from-background to-background/80 backdrop-blur-lg border-b">
          <div className="p-4 flex flex-col space-y-2">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2 min-w-0">

                <div className="min-w-0">
                  <h1 className="text-2xl font-bold tracking-tight truncate">{customer.name}</h1>
                  <p className="text-sm text-muted-foreground">
                    Customer since {formatDate(customer.created_at)}
                  </p>
                </div>
              </div>
              <div className="flex gap-2 shrink-0">
                <Button 
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditDialogOpen(true)}
                  className="hidden sm:flex items-center gap-2"
                >
                  <Edit className="h-4 w-4" />
                  Edit
                </Button>
                <Button 
                  variant="destructive"
                  size="sm"
                  onClick={() => setIsDeleteDialogOpen(true)}
                  className="hidden sm:flex items-center gap-2"
                >
                  <Trash className="h-4 w-4" />
                  Delete
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="icon" className="sm:hidden">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => setIsEditDialogOpen(true)}>
                      <Edit className="h-4 w-4 mr-2" />
                      Edit Customer
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => setIsDeleteDialogOpen(true)}
                      className="text-destructive"
                    >
                      <Trash className="h-4 w-4 mr-2" />
                      Delete Customer
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <div className="p-4 space-y-6 w-full overflow-hidden">
          {/* Customer Overview Card */}
          <Card className="border-none bg-card w-full overflow-hidden">
            <CardContent className="p-4 space-y-6">
              {/* Header with Status */}
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      <Users className="h-4 w-4 text-primary" />
                    </div>
                    <h3 className="text-lg font-semibold">Customer Overview</h3>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Customer since {formatDate(customer.created_at)}
                  </p>
                </div>
                <Badge 
                  variant={customer.status === 'active' ? 'success' : 'secondary'}
                  className="capitalize px-3 py-1"
                >
                  {customer.status}
                </Badge>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-muted/50 rounded-lg p-4 w-full">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg shrink-0">
                      <Wallet className="h-4 w-4 text-primary" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm text-muted-foreground">Total Spent</p>
                      <p className="text-lg font-semibold truncate">
                        {formatCurrency(customer.total_spent || 0, customer.currency)}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="bg-muted/50 rounded-lg p-4 w-full">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg shrink-0">
                      <Calendar className="h-4 w-4 text-primary" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm text-muted-foreground">Last Order</p>
                      <p className="text-lg font-semibold truncate">
                        {customer.last_order_date 
                          ? formatDate(customer.last_order_date)
                          : 'No orders yet'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Tags */}
              {customer.tags?.length > 0 && (
                <div className="pt-4 border-t">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm text-muted-foreground">Tags:</span>
                    {customer.tags.map((tag) => (
                      <Badge 
                        key={tag} 
                        variant="secondary" 
                        className="bg-primary/5 text-primary border-0"
                      >
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card className="border-none bg-card w-full overflow-hidden">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Mail className="h-4 w-4 text-primary" />
                </div>
                <CardTitle className="text-lg font-semibold">Contact Information</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="bg-muted/50 rounded-lg p-4 w-full">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg shrink-0">
                      <Mail className="h-4 w-4 text-primary" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm text-muted-foreground">Email</p>
                      <p className="font-medium truncate">{customer.email || 'Not provided'}</p>
                    </div>
                  </div>
                </div>
                <div className="bg-muted/50 rounded-lg p-4 w-full">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg shrink-0">
                      <Phone className="h-4 w-4 text-primary" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm text-muted-foreground">Phone</p>
                      <p className="font-medium truncate">{customer.phone || 'Not provided'}</p>
                    </div>
                  </div>
                </div>
                <div className="bg-muted/50 rounded-lg p-4 w-full">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg shrink-0">
                      <MapPin className="h-4 w-4 text-primary" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm text-muted-foreground">Address</p>
                      <p className="font-medium truncate">
                        {[customer.address, customer.city, customer.state, customer.country]
                          .filter(Boolean)
                          .join(', ') || 'Not provided'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Notes Section */}
          {customer.notes && (
            <Card className="border-none bg-card w-full overflow-hidden">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                    <FileText className="h-4 w-4 text-primary" />
                  </div>
                  <CardTitle className="text-lg font-semibold">Notes</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground whitespace-pre-wrap">{customer.notes}</p>
              </CardContent>
            </Card>
          )}

          {/* Tabs Section */}
          <Tabs defaultValue="invoices" className="w-full">
            <div className="relative -mx-4 md:mx-0">
              <div className="border-b overflow-x-auto scrollbar-none">
                <div className="px-4 md:px-0">
                  <TabsList className="w-auto bg-transparent p-0">
                    <TabsTrigger 
                      value="invoices" 
                      className="flex items-center gap-1 px-3 py-2 data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none whitespace-nowrap text-sm"
                    >
                      <FileText className="h-4 w-4" />
                      Invoices
                    </TabsTrigger>
                    <TabsTrigger 
                      value="transactions" 
                      className="flex items-center gap-1 px-3 py-2 data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none whitespace-nowrap text-sm"
                    >
                      <CircleDollarSign className="h-4 w-4" />
                      Transactions
                    </TabsTrigger>
                    <TabsTrigger 
                      value="activity" 
                      className="flex items-center gap-1 px-3 py-2 data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none whitespace-nowrap text-sm"
                    >
                      <Clock className="h-4 w-4" />
                      Activity
                    </TabsTrigger>
                  </TabsList>
                </div>
              </div>
            </div>

            <TabsContent value="invoices" className="space-y-4 mt-4">
              <Card>
                <CardContent className="p-4">
                  {!invoices?.length ? (
                    <div className="p-8 text-center">
                      <FileText className="h-8 w-8 mx-auto mb-4 text-muted-foreground" />
                      <p className="text-muted-foreground">No invoices found</p>
                      <Button
                        variant="outline"
                        className="mt-4"
                        onClick={() => setIsInvoiceFormOpen(true)}
                      >
                        Create First Invoice
                      </Button>
                    </div>
                  ) : (
                    <>
                      {/* Desktop View */}
                      <div className="hidden md:block">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Invoice #</TableHead>
                              <TableHead>Date</TableHead>
                              <TableHead>Due Date</TableHead>
                              <TableHead>Amount</TableHead>
                              <TableHead>Status</TableHead>
                              <TableHead>Actions</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {invoices.map((invoice) => (
                              <TableRow 
                                key={invoice.id}
                                className="cursor-pointer"
                                onClick={() => navigate(`/dashboard/business/invoices/${invoice.id}`)}
                              >
                                <TableCell>{invoice.invoice_number}</TableCell>
                                <TableCell>{formatDate(invoice.created_at)}</TableCell>
                                <TableCell>{formatDate(invoice.due_date)}</TableCell>
                                <TableCell>{formatCurrency(invoice.amount, invoice.currency)}</TableCell>
                                <TableCell>
                                  {invoice.status_details ? (
                                    <Badge {...getStatusBadgeProps(invoice.status_details)}>
                                      {invoice.status_details.label}
                                    </Badge>
                                  ) : (
                                    <Badge variant="secondary">
                                      {invoice.status.replace('_', ' ')}
                                    </Badge>
                                  )}
                                </TableCell>
                                <TableCell>
                                  <div className="flex items-center gap-2">
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      disabled={isDownloading}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleDownloadInvoice(invoice.id);
                                      }}
                                    >
                                      {isDownloading ? (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                      ) : (
                                        <Download className="h-4 w-4" />
                                      )}
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      disabled={isSending}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleSendInvoice(invoice.id);
                                      }}
                                    >
                                      {isSending ? (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                      ) : (
                                        <Send className="h-4 w-4" />
                                      )}
                                    </Button>
                                  </div>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>

                      {/* Mobile View */}
                      <div className="block md:hidden divide-y divide-border">
                        {invoices.map((invoice) => (
                          <div 
                            key={invoice.id} 
                            className="p-4 space-y-3 hover:bg-muted/50 transition-colors cursor-pointer"
                            onClick={() => navigate(`/dashboard/business/invoices/${invoice.id}`)}
                          >
                            <div className="flex justify-between items-start">
                              <div>
                                <p className="font-medium">#{invoice.invoice_number}</p>
                                <p className="text-sm text-muted-foreground">
                                  {formatDate(invoice.created_at)}
                                </p>
                              </div>
                              <Badge {...getStatusBadgeProps(invoice.status_details)}>
                                {invoice.status_details?.label ?? invoice.status}
                              </Badge>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                              <div>
                                <p className="text-muted-foreground">Due Date</p>
                                <p>{formatDate(invoice.due_date)}</p>
                              </div>
                              <div className="text-right">
                                <p className="text-muted-foreground">Amount</p>
                                <p className="font-medium">{formatCurrency(invoice.amount, invoice.currency)}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="transactions" className="space-y-4 mt-4">
              <TransactionsTab customerId={customerId!} />
            </TabsContent>

            <TabsContent value="activity" className="space-y-4 mt-4">
              <Card className="border-none bg-card w-full overflow-hidden">
                <CardContent className="p-0">
                  <ScrollArea className="h-[400px]">
                    <div className="p-4 space-y-4">
                      <div className="flex items-start gap-4">
                        <div className="p-2 bg-primary/10 rounded-lg shrink-0">
                          <Clock className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium">Customer Created</p>
                          <p className="text-sm text-muted-foreground">
                            {formatDate(customer.created_at)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </motion.div>

      {/* Dialogs */}
      <CustomerFormDialog
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        customer={customer}
        mode="edit"
      />

      <DeleteConfirmDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirm={handleDelete}
        isDeleting={isDeleting}
        title={`Delete ${customer.name}?`}
        description="Are you sure you want to delete this customer? This action cannot be undone."
      />

      <InvoiceFormDialog 
        open={isInvoiceFormOpen}
        onOpenChange={setIsInvoiceFormOpen}
        customerId={customerId!}
      />
    </div>
  );
} 