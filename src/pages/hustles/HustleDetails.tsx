import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Calendar, 
  Clock, 
  Users, 
  CheckCircle2,
  Briefcase,
  ArrowLeft,
  Send,
  Loader2,
  DollarSign,
  Timer,
  UserCheck
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import { hustleService, type Hustle } from '@/services/hustleService';
import { cn, formatCurrency } from '@/lib/utils';
import ApplyHustleDialog from '@/components/hustles/ApplyHustleDialog';
import { ChatNotificationBadge } from '@/components/hustles/ChatNotificationBadge';
import HustleChat from '@/components/hustles/HustleChat';
import PaymentTab from '@/components/hustles/PaymentTab';
import { settingsService } from '@/services/settingsService';

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};

const HustleDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [isApplyDialogOpen, setIsApplyDialogOpen] = React.useState(false);

  const { data, isLoading, error } = useQuery({
    queryKey: ['hustle', id],
    queryFn: () => hustleService.getHustleDetails(id!),
    enabled: !!id
  });

  const { data: settings } = useQuery({
    queryKey: ['settings'],
    queryFn: settingsService.fetchSettings
  });

  const hustle = data?.hustle;

  console.log('Hustle Data:', {
    data,
    hustle,
    can_apply: hustle?.can_apply,
    status: hustle?.status,
    deadline: hustle?.deadline,
    assigned_professional_id: hustle?.assigned_professional_id,
    application_status: hustle?.application_status,
    cannot_apply_reason: hustle?.cannot_apply_reason
  });

  const applyMutation = useMutation({
    mutationFn: hustleService.applyForHustle,
    onSuccess: () => {
      toast.success('Application submitted successfully');
      queryClient.invalidateQueries({ queryKey: ['hustle', id] });
    },
    onError: () => {
      toast.error('Failed to submit application');
    }
  });

  const { data: profileData } = useQuery({
    queryKey: ['professional-profile'],
    queryFn: hustleService.checkProfessionalProfile
  });

  console.log('Application Status Check:', {
    hasProfile: profileData?.has_profile,
    profileStatus: profileData?.profile?.status,
    profileCategory: profileData?.profile?.category_id,
    hustleCategory: hustle?.category?.id,
    canApply: hustle?.can_apply,
    hustleStatus: hustle?.status,
    deadline: hustle?.deadline,
    applicationStatus: hustle?.application_status
  });

  const getApplicationStatus = (hustle: Hustle) => {
    // First check if user has a professional profile
    if (!profileData?.has_profile) {
      return {
        can_apply: false,
        reason: 'You need to create a professional profile to apply for hustles'
      };
    }

    // Check if professional profile exists and is active
    if (!profileData?.profile || profileData.profile.status !== 'active') {
      return {
        can_apply: false,
        reason: profileData?.profile?.status === 'inactive' 
          ? 'Your professional profile is inactive. Please activate it to apply for hustles.'
          : profileData?.profile?.status === 'suspended'
          ? 'Your professional profile is suspended. Please contact support.'
          : 'Your professional profile must be active to apply for hustles'
      };
    }

    // Check if professional's category matches the hustle category
    if (profileData.profile.category_id !== hustle.category.id) {
      return {
        can_apply: false,
        reason: 'This hustle is for a different professional category'
      };
    }

    // Check if this hustle is assigned to the current professional
    if (hustle.assigned_professional_id === profileData.profile.id) {
      return {
        can_apply: false,
        reason: 'Hustle assigned to you. Please complete within the time frame'
      };
    }

    // Check application status
    if (hustle.application_status) {
      return {
        can_apply: false,
        reason: hustle.application_status === 'pending' ? 'Your application is under review' :
               hustle.application_status === 'approved' ? 'Your application has been approved' :
               hustle.application_status === 'rejected' ? 'Your application was not successful' :
               'You have withdrawn your application'
      };
    }

    // Check deadline
    const currentDate = new Date();
    const deadlineDate = new Date(hustle.deadline);
    if (deadlineDate < currentDate) {
      return {
        can_apply: false,
        reason: 'The application deadline has passed'
      };
    }

    // Check if hustle is open and not assigned
    if (hustle.status !== 'open' || hustle.assigned_professional_id) {
      return {
        can_apply: false,
        reason: hustle.assigned_professional_id 
          ? 'A professional has already been assigned to this hustle'
          : 'This hustle is no longer accepting applications'
      };
    }

    // If all checks pass, user can apply
    return {
      can_apply: true,
      reason: null
    };
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !hustle) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold">Hustle not found</h2>
        <Button 
          variant="link" 
          onClick={() => navigate('/dashboard/hustles')}
          className="mt-4"
        >
          Back to Hustles
        </Button>
      </div>
    );
  }

  // Calculate days remaining
  const daysRemaining = Math.max(0, Math.ceil(
    (new Date(hustle.deadline).getTime() - new Date().getTime()) / (1000 * 3600 * 24)
  ));

  const applicationStatus = getApplicationStatus(hustle);

  return (
    <ScrollArea className="h-[calc(100vh-4rem)]">
      <motion.div 
        variants={container}
        initial="hidden"
        animate="show"
        className="container mx-auto px-4 py-4 md:py-6 space-y-4 max-w-5xl"
      >
        {/* Header Section */}
        <motion.div variants={item} className="relative">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent rounded-xl" />
          <div className="relative p-4 md:p-6">
            {/* Back Button and Category */}
            <div className="flex items-center gap-3 mb-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate(-1)}
                className="h-8 w-8 rounded-full hover:bg-background/80"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <Badge variant="secondary" className="bg-background/50 backdrop-blur-sm">
                <Briefcase className="h-3 w-3 mr-1" />
                {hustle.category.name}
              </Badge>
            </div>

            {/* Title */}
            <h1 className="text-xl md:text-2xl lg:text-3xl font-bold mb-4">
              {hustle.title}
            </h1>

            {/* Application Status Section */}
            <div className="bg-background/50 backdrop-blur-sm rounded-xl p-4 space-y-3">
              {/* Status Badge and Reason */}
              <div className="flex flex-col gap-2">
                {hustle.application_status && (
                  <div className="flex items-center gap-2">
                    <Badge 
                      variant={
                        hustle.application_status === 'approved' ? 'success' :
                        hustle.application_status === 'rejected' ? 'destructive' :
                        'secondary'
                      }
                      className="px-2.5 py-0.5 text-xs font-medium"
                    >
                      {hustle.application_status.toUpperCase()}
                    </Badge>
                  </div>
                )}
                {!applicationStatus.can_apply && (
                  <span className="text-sm text-primary font-medium">
                    {applicationStatus.reason}
                  </span>
                )}
              </div>

              {/* Action Button */}
              <Button 
                size="lg"
                onClick={() => setIsApplyDialogOpen(true)}
                disabled={!applicationStatus.can_apply || applyMutation.isPending}
                className={cn(
                  "w-full h-12 rounded-xl text-sm font-medium transition-all",
                  applicationStatus.can_apply 
                    ? "bg-primary text-primary-foreground hover:bg-primary/90" 
                    : hustle.application_status === 'approved'
                      ? "bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100 hover:bg-green-200 dark:hover:bg-green-700"
                      : "bg-muted text-muted-foreground"
                )}
              >
                {applyMutation.isPending ? (
                  <>
                    <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                    Submitting Application...
                  </>
                ) : (
                  <>

                    <UserCheck className="h-5 w-5 mr-2" />
                    {applicationStatus.can_apply ? 'Apply for Hustle' : (
                      hustle.application_status === 'pending' ? 'Application Pending' :
                      hustle.application_status === 'approved' ? 'Application Approved' :
                      hustle.application_status === 'rejected' ? 'Application Rejected' :
                      'Cannot Apply'
                    )}
                  </>

                )}
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <motion.div variants={item} className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <Card className="relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent group-hover:from-primary/10 transition-colors" />
            <CardContent className="p-3 h-full">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg group-hover:scale-110 transition-transform shrink-0">
                  <Timer className="h-4 w-4 text-primary" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-muted-foreground">Time Left</p>
                  <p className="font-semibold text-sm truncate">{daysRemaining} days</p>
                </div>
              </div>
              <Progress 
                value={Math.max(0, Math.min(100, (daysRemaining / 30) * 100))} 
                className="mt-2 h-1"
              />
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent group-hover:from-blue-500/10 transition-colors" />
            <CardContent className="p-3 h-full">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-500/10 rounded-lg group-hover:scale-110 transition-transform shrink-0">
                  <Calendar className="h-4 w-4 text-blue-500" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-muted-foreground">Deadline</p>
                  <p className="font-semibold text-sm truncate">
                    {new Date(hustle.deadline).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-transparent group-hover:from-green-500/10 transition-colors" />
            <CardContent className="p-3 h-full">
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-500/10 rounded-lg group-hover:scale-110 transition-transform shrink-0">
                    <DollarSign className="h-4 w-4 text-green-500" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Budget</p>
                  </div>
                </div>
                <p className="font-semibold text-sm px-2">
                  {formatCurrency(hustle.budget, settings?.default_currency)}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent group-hover:from-purple-500/10 transition-colors" />
            <CardContent className="p-3 h-full">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-500/10 rounded-lg group-hover:scale-110 transition-transform shrink-0">
                  <Users className="h-4 w-4 text-purple-500" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-muted-foreground">Applications</p>
                  <p className="font-semibold text-sm truncate">
                    {hustle.applications_count}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Main Content */}
        <motion.div variants={item}>
          <Tabs defaultValue="details" className="space-y-4">
            <TabsList className="w-full justify-start h-11 p-1 bg-muted/50 backdrop-blur-sm">
              <TabsTrigger value="details" className="flex items-center gap-2 rounded-lg">
                <Briefcase className="h-4 w-4" />
                Details
              </TabsTrigger>
              {hustle.application_status === 'approved' && (
                <>
                  <TabsTrigger value="chat" className="flex items-center gap-2 relative rounded-lg">
                    <Send className="h-4 w-4" />
                    Chat
                    <ChatNotificationBadge 
                      count={hustle.unread_messages_count || 0}
                    />
                  </TabsTrigger>
                  <TabsTrigger value="payments" className="flex items-center gap-2 rounded-lg">
                    <DollarSign className="h-4 w-4" />
                    Payments
                  </TabsTrigger>
                </>
              )}
            </TabsList>

            <TabsContent value="details" className="space-y-4">
              <Card>
                <CardContent className="p-4 md:p-6 prose dark:prose-invert max-w-none">
                  <div dangerouslySetInnerHTML={{ __html: hustle.description }} />
                </CardContent>
              </Card>
            </TabsContent>

            {hustle.application_status === 'approved' && (
              <>
                <TabsContent value="chat">
                  <HustleChat hustleId={hustle.id} />
                </TabsContent>
                <TabsContent value="payments">
                  <PaymentTab 
                    payments={hustle.payments || []} 
                    currency={settings?.default_currency || 'USD'} 
                  />
                </TabsContent>
              </>
            )}
          </Tabs>
        </motion.div>
      </motion.div>

      <ApplyHustleDialog
        isOpen={isApplyDialogOpen}
        onClose={() => setIsApplyDialogOpen(false)}
        onConfirm={() => {
          applyMutation.mutate(id!);
          setIsApplyDialogOpen(false);
        }}
        isLoading={applyMutation.isPending}
        hustleTitle={hustle.title}
      />
    </ScrollArea>
  );
};

export default HustleDetails; 