import { useState, useEffect } from "react";
import { SidebarProvider, Sidebar, SidebarContent, SidebarHeader, SidebarMenu, SidebarMenuItem, SidebarMenuButton } from "@/components/ui/sidebar"
import { Home, BookOpen, Briefcase, ShoppingBag, Wallet, Settings, LogOut, UserCircle2, GraduationCap, Menu, ArrowLeft, Bell, ChevronDown, ShoppingCart, Package, BrainCircuit, Calendar, Building2, LayoutDashboard, CreditCard, Users } from "lucide-react"
import { useNavigate, Routes, Route, useLocation, Outlet } from "react-router-dom"
import { toast } from "sonner"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import useAuthStore from '@/store/useAuthStore';
import StudentDashboard from "@/components/dashboard/StudentDashboard"
import BusinessDashboard from "@/components/dashboard/BusinessDashboard"
import ProfessionalDashboard from "@/components/dashboard/ProfessionalDashboard"
import Academy from "./Academy"
import WalletDashboard from "@/components/wallet/WalletDashboard"
import CourseDetails from "@/components/academy/CourseDetails"
import MyCourses from "@/pages/MyCourses"
import CourseManagement from "@/pages/CourseManagement"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import Header from '../components/Header';
import SettingsPage from "./Settings"
import ServicesPage from "./Services"
import ServiceQuoteRequestPage from "./ServiceQuoteRequest"
import SoftwareEngineeringQuote from "./SoftwareEngineeringQuote"
import CyberSecurityQuote from "./CyberSecurityQuote"
import { FileText, Server } from "lucide-react"
import QuoteRequestsListPage from "./QuoteRequestsList"
import QuoteDetailsPage from "./QuoteDetails"
import ProjectsListPage from "./ProjectsList"
import ProjectDetailsPage from "./ProjectDetails"
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card"
import ThemeToggle from '@/components/ThemeToggle'
import PaymentConfirmation from "@/pages/PaymentConfirmation";
import TransactionDetails from "@/pages/TransactionDetails";
import Store from "./Store";
import Cart from "./Cart";
import ProductDetails from "./ProductDetails";
import Checkout from "./Checkout";
import Orders from "./Orders";
import OrderTracking from "./OrderTracking";
import Products from "./Products";
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { storeService } from '@/services/storeService';
import ITConsulting from "./ITConsulting";
import ConsultingBookings from "./ConsultingBookings";
import ConsultingBookingDetails from "./ConsultingBookingDetails";
import PullToRefresh from 'react-simple-pull-to-refresh';
import { Loader2 } from "lucide-react";
import { businessService } from '@/services/businessService';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { useNotifications } from '@/contexts/NotificationContext';
import { apiClient } from '@/lib/axios';
import { formatRelativeTime } from '@/utils/dateUtils';
import { ScrollArea } from "@/components/ui/scroll-area"
import { formatDistanceToNow } from 'date-fns'
import { Trash2, CheckCheck, ExternalLink } from 'lucide-react'

interface MenuItem {
  label: string;
  path: string;
  icon: React.ReactNode;
  badge?: string;
  submenu?: MenuItem[];
  show?: boolean;
}

const Dashboard = ({ children }: { children?: React.ReactNode }) => {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, updateUserType } = useAuthStore()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const queryClient = useQueryClient();
  const [isLoading, setIsLoading] = useState(true);
  const { notifications, unreadCount, markAsRead, markAllAsRead, deleteNotification } = useNotifications();
  const [isDesktopNotificationPopoverOpen, setIsDesktopNotificationPopoverOpen] = useState(false);
  const [isMobileNotificationPopoverOpen, setIsMobileNotificationPopoverOpen] = useState(false);

  useEffect(() => {
    console.log('Dashboard received notifications:', notifications);
    console.log('Dashboard unread count:', unreadCount);
  }, [notifications, unreadCount]);

  const handleLogout = () => {
    useAuthStore.getState().logout();
    
    toast.success("Logged out successfully");
    navigate("/login");
  }

  const { data: cartCount = 0 } = useQuery({
    queryKey: ['cartCount'],
    queryFn: storeService.getCartCount,
    initialData: 0
  });

  const { data: profileData, isLoading: profileLoading } = useQuery({
    queryKey: ['business-profile'],
    queryFn: businessService.checkProfile,
    retry: false,
    enabled: true,
    onSuccess: (data) => {
      console.log('Business Profile Data:', data);
    },
    onError: (error) => {
      console.log('Business Profile Error:', error);
    }
  });

  const { data: professionalData } = useQuery({
    queryKey: ['professional-profile'],
    queryFn: businessService.checkProfessional,
    retry: false,
    enabled: true
  });

  const handleProfileSwitch = async (type: 'student' | 'business' | 'professional') => {
    try {
      await updateUserType(type);
      
      // Close any open menus/sheets
      setIsSheetOpen(false);
      
      // Show success message
      toast.success(`Switched to ${type} profile`);
      
      // Refresh the page to update the dashboard
      navigate('/dashboard');
    } catch (error) {
      console.error('Failed to switch profile:', error);
      toast.error('Failed to switch profile');
    }
  };

  const renderDashboard = () => {
    if (!user) {
      return <div>Loading dashboard...</div>;
    }

    console.log('Render Dashboard:', {
      accountType: user.account_type,
      user
    });

    switch (user.account_type) {
      case "student":
        return <StudentDashboard />;
      case "business":
        return <BusinessDashboard />;
      case "professional":
        return <ProfessionalDashboard />;
      default:
        return <div>Loading dashboard...</div>;
    }
  }

  const getPageTitle = (pathname: string) => {
    const segments = pathname.split('/').filter(Boolean);
    if (segments.length <= 1) return "Dashboard";
    return segments[1].charAt(0).toUpperCase() + segments[1].slice(1);
  };

  const handleMenuItemClick = (path: string) => {
    navigate(path);
    setIsSheetOpen(false); // Close the sheet when menu item is clicked
  };

  const handleFundWallet = async () => {
    try {
      console.log('Fund Wallet Clicked', { amount: 1000, paymentMethod: 'bank-transfer' });
      console.log('Navigating to payment confirmation page...');
      
      if (!1000) {
        toast.error('Please enter an amount');
        return;
      }

      navigate('/dashboard/payment-confirmation', { 
        state: { 
          amount: 1000, 
          paymentMethod: 'bank-transfer'.toLowerCase() 
        } 
      });
      console.log('Navigation successful');
    } catch (error) {
      console.error('Fund Wallet Error:', error);
      toast.error('Failed to process wallet funding');
    }
  };

  const sendTestNotification = async () => {
    try {
        await apiClient.post('/test-notification');
        toast.success('Test notification sent');
    } catch (error) {
        console.error('Failed to send test notification:', error);
        toast.error('Failed to send test notification');
    }
  };

  const handleDeleteNotification = async (id: string) => {
    try {
        await deleteNotification(id);
        toast.success('Notification deleted');
    } catch (error: any) {
        console.error('Failed to delete notification:', error);
        toast.error(error.response?.data?.error || 'Failed to delete notification');
    }
  };

  const menuItems: MenuItem[] = [
    // MAIN NAVIGATION
    {
      label: "Home",
      path: "/dashboard",
      icon: <Home className="w-4 h-4" />
    },
    {
      label: "Wallet",
      path: "/dashboard/wallet",
      icon: <Wallet className="w-4 h-4" />
    },
    {
      label: "Services",
      path: "/dashboard/services",
      icon: <Briefcase className="w-4 h-4" />
    },
    {
      label: 'IT Consulting',
      path: '/dashboard/it-consulting',
      icon: <BrainCircuit className="h-5 w-5" />
    },
    {
      label: "Quotes",
      path: "/dashboard/quotes",
      icon: <FileText className="w-4 h-4" />
    },

    // LEARNING
    {
      label: "Academy",
      path: "/dashboard/academy",
      icon: <BookOpen className="w-4 h-4" />
    },
    {
      label: "My Courses",
      path: "/dashboard/academy/my-courses",
      icon: <GraduationCap className="w-4 h-4" />
    },

    // BUSINESS
    {
      path: '/dashboard/business/customers',
      label: 'Customers',
      icon: <Users className="h-5 w-5" />,
      show: user?.account_type === 'business'
    },
    {
      label: "Projects",
      path: "/dashboard/projects",
      icon: <Server className="w-4 h-4" />
    },

    // PROFESSIONAL
    {
      path: '/dashboard/workstation/plans',
      label: 'Workstation',
      icon: <Building2 className="h-5 w-5" />,
    },
    {
      label: "Hustles",
      path: "/dashboard/hustles",
      icon: <Briefcase className="h-4 w-4" />,
      badge: "New"
    },

    // SHOP
    {
      label: "Store",
      path: "/dashboard/store",
      icon: <ShoppingBag className="w-4 h-4" />
    },
    {
      label: "Cart",
      path: "/dashboard/cart",
      icon: <ShoppingCart className="w-4 h-4" />,
      badge: cartCount > 0 ? cartCount.toString() : undefined
    },
    {
      label: "Orders",
      path: "/dashboard/orders",
      icon: <Package className="w-4 h-4" />
    }
  ];

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await Promise.all([
        // User & Auth
        queryClient.invalidateQueries({ queryKey: ['user'] }),
        queryClient.invalidateQueries({ queryKey: ['user-profile'] }),
        queryClient.invalidateQueries({ queryKey: ['professional-profile'] }),
        
        // Wallet & Transactions
        queryClient.invalidateQueries({ queryKey: ['wallet'] }),
        queryClient.invalidateQueries({ queryKey: ['wallet-transactions'] }),
        queryClient.invalidateQueries({ queryKey: ['transactions'] }),
        
        // Store & Cart
        queryClient.invalidateQueries({ queryKey: ['cart'] }),
        queryClient.invalidateQueries({ queryKey: ['cartCount'] }),
        queryClient.invalidateQueries({ queryKey: ['orders'] }),
        queryClient.invalidateQueries({ queryKey: ['products'] }),
        
        // Courses & Academy
        queryClient.invalidateQueries({ queryKey: ['courses'] }),
        queryClient.invalidateQueries({ queryKey: ['enrolled-courses'] }),
        queryClient.invalidateQueries({ queryKey: ['course-details'] }),
        queryClient.invalidateQueries({ queryKey: ['course-modules'] }),
        queryClient.invalidateQueries({ queryKey: ['course-progress'] }),
        
        // Business
        queryClient.invalidateQueries({ queryKey: ['business-customers'] }),
        queryClient.invalidateQueries({ queryKey: ['business-invoices'] }),
        queryClient.invalidateQueries({ queryKey: ['business-transactions'] }),
        queryClient.invalidateQueries({ queryKey: ['business-profile'] }),
        
        // Hustles
        queryClient.invalidateQueries({ queryKey: ['hustles'] }),
        queryClient.invalidateQueries({ queryKey: ['my-applications'] }),
        
        // Services & Quotes
        queryClient.invalidateQueries({ queryKey: ['service-quotes'] }),
        queryClient.invalidateQueries({ queryKey: ['quote-requests'] }),
        
        // Settings
        queryClient.invalidateQueries({ queryKey: ['settings'] }),
        queryClient.invalidateQueries({ queryKey: ['notifications'] }),

        // Course Management
        queryClient.invalidateQueries({ queryKey: ['course-enrollments'] }),
        queryClient.invalidateQueries({ queryKey: ['course-notices'] }),
        queryClient.invalidateQueries({ queryKey: ['course-exams'] }),
        queryClient.invalidateQueries({ queryKey: ['user-courses'] }),
        queryClient.invalidateQueries({ queryKey: ['learning-stats'] }),

        // Business Dashboard
        queryClient.invalidateQueries({ queryKey: ['business-stats'] }),
        queryClient.invalidateQueries({ queryKey: ['business-activities'] }),
        queryClient.invalidateQueries({ queryKey: ['business-revenue'] }),
        queryClient.invalidateQueries({ queryKey: ['recent-transactions'] }),

        // Consulting
        queryClient.invalidateQueries({ queryKey: ['consulting-bookings'] }),
        queryClient.invalidateQueries({ queryKey: ['booking-slots'] }),
        queryClient.invalidateQueries({ queryKey: ['available-consultants'] }),
        queryClient.invalidateQueries({ queryKey: ['consulting-services'] }),
        queryClient.invalidateQueries({ queryKey: ['consultation-history'] }),

        // Workstation
        queryClient.invalidateQueries({ queryKey: ['workstation-plans'] }),
        queryClient.invalidateQueries({ queryKey: ['active-subscription'] }),
        queryClient.invalidateQueries({ queryKey: ['workspace-usage'] }),

        // Quote Requests
        queryClient.invalidateQueries({ queryKey: ['quote-requests-list'] }),

        // Force refresh user data
        useAuthStore.getState().refreshToken()
      ]);

      toast.success("Content refreshed");
    } catch (error) {
      toast.error("Failed to refresh");
    } finally {
      setIsRefreshing(false);
    }
  };

  console.log('Menu Rendering Check:', {
    hasProfile: !!profileData,
    status: profileData?.status,
    shouldShow: profileData && profileData.status === 'active'
  });

  return (
    <>
      <div className="flex h-screen overflow-hidden bg-background">
        {/* Desktop Sidebar */}
        <aside className="hidden md:flex md:w-64 md:flex-col border-r">
          <div className="flex flex-col h-full">
            {/* Fixed Header - User Profile Section */}
            <div className="border-b px-6 py-4 shrink-0">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <Avatar className="h-10 w-10 ring-2 ring-primary/10">
                    <AvatarImage 
                      src={user?.avatar} 
                      alt={user?.username || `${user?.first_name} ${user?.last_name}`} 
                    />
                    <AvatarFallback>
                      {user?.username 
                        ? user.username.charAt(0).toUpperCase() 
                        : (user?.first_name 
                          ? user.first_name.charAt(0).toUpperCase() 
                          : '?')
                      }
                    </AvatarFallback>
                  </Avatar>
                  <div className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full border-2 border-background bg-green-500" />
                </div>
                <div className="flex-1 overflow-hidden">
                  <h3 className="truncate text-sm font-medium">
                    {(user?.first_name && user?.last_name) 
                      ? `${user.first_name} ${user.last_name}`
                      : user?.username || 
                        user?.email || 
                        'User'
                    }
                  </h3>
                  <p className="truncate text-xs text-muted-foreground">
                    {user?.email || 'No email'}
                  </p>
                </div>

                {/* Add Notifications and Test Button here */}
                <div className="flex items-center gap-2">
                  <Popover open={isDesktopNotificationPopoverOpen} onOpenChange={setIsDesktopNotificationPopoverOpen}>
                    <PopoverTrigger asChild>
                      <Button variant="ghost" size="icon" className="relative">
                        <Bell className="h-5 w-5" />
                        {unreadCount > 0 && (
                          <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-primary" />
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent 
                      align="end" 
                      className="w-[calc(100vw-32px)] sm:w-[380px] p-0 mx-4"
                      sideOffset={8}
                    >
                      <div className="flex flex-col">
                        {/* Header */}
                        <div className="flex items-center justify-between border-b px-3 py-3">
                          <div>
                            <h4 className="font-semibold text-sm">Notifications</h4>
                            <p className="text-xs text-muted-foreground">
                              {unreadCount 
                                ? `You have ${unreadCount} unread notifications` 
                                : 'No new notifications'}
                            </p>
                          </div>
                          {unreadCount > 0 && (
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={markAllAsRead}
                              className="text-xs"
                            >
                              <CheckCheck className="mr-2 h-4 w-4" />
                              Mark all read
                            </Button>
                          )}
                        </div>

                        {/* Notifications List */}
                        <ScrollArea className="h-[300px]">
                          {notifications.length > 0 ? (
                            <div className="flex flex-col">
                              {notifications.slice(0, 5).map((notification) => (
                                <div
                                  key={notification.id}
                                  className={cn(
                                    "flex items-start gap-3 p-3",
                                    "hover:bg-muted/50 transition-colors",
                                    !notification.read && "bg-muted/30"
                                  )}
                                >
                                  <div className={cn(
                                    "mt-1 h-2 w-2 rounded-full",
                                    !notification.read ? "bg-primary" : "bg-muted-foreground/30"
                                  )} />
                                  <div className="flex-1 space-y-1">
                                    <div className="flex items-center justify-between gap-4">
                                      <p className={cn(
                                        "text-sm",
                                        !notification.read && "font-medium"
                                      )}>
                                        {notification.title}
                                      </p>
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 text-muted-foreground hover:text-destructive"
                                        onClick={() => handleDeleteNotification(notification.id)}
                                      >
                                        <Trash2 className="h-4 w-4" />
                                      </Button>
                                    </div>
                                    <p className="text-sm text-muted-foreground">
                                      {notification.message}
                                    </p>
                                    <div className="flex items-center justify-between">
                                      <p className="text-xs text-muted-foreground">
                                        {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                                      </p>
                                      {notification.action_url && (
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          className="h-6 text-xs"
                                          onClick={() => {
                                            navigate(notification.action_url);
                                            setIsDesktopNotificationPopoverOpen(false);
                                          }}
                                        >
                                          <ExternalLink className="mr-1 h-3 w-3" />
                                          View
                                        </Button>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="flex flex-col items-center justify-center py-8 text-center px-3">
                              <Bell className="h-12 w-12 text-muted-foreground/30" />
                              <h3 className="mt-4 text-sm font-medium">No notifications</h3>
                              <p className="text-xs text-muted-foreground">
                                We'll notify you when something arrives
                              </p>
                            </div>
                          )}
                        </ScrollArea>

                        {/* Footer */}
                        <div className="border-t p-2">
                          <Button
                            variant="ghost"
                            className="w-full justify-center text-sm"
                            onClick={() => {
                              navigate('/dashboard/notifications');
                              setIsDesktopNotificationPopoverOpen(false);
                            }}
                          >
                            View all notifications
                          </Button>
                        </div>
                      </div>
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
            </div>

            {/* Scrollable Menu Items */}
            <div className="flex-1 overflow-y-auto">
              <nav className="flex-1 space-y-1 px-4 py-2 overflow-y-auto">
                {/* Main Navigation */}
                {menuItems.slice(0, 5).map((item) => (
                  <Button
                    key={item.path}
                    variant={location.pathname === item.path ? "secondary" : "ghost"}
                    className={cn(
                      "w-full justify-start h-11 gap-3",
                      "transition-all duration-200",
                      location.pathname === item.path ? 
                        "bg-primary/10 hover:bg-primary/15" : 
                        "hover:bg-muted/50",
                      "rounded-lg"
                    )}
                    onClick={() => {
                      navigate(item.path);
                      setIsSheetOpen(false);
                    }}
                  >
                    <div className={cn(
                      "p-1.5 rounded-md",
                      location.pathname === item.path ? "bg-primary/10" : "bg-muted"
                    )}>
                      {item.icon}
                    </div>
                    <span className="font-medium">{item.label}</span>
                    {item.badge && (
                      <Badge variant="secondary" className="ml-auto">
                        {item.badge}
                      </Badge>
                    )}
                  </Button>
                ))}

                {/* Learning - Shows only when switched to student profile */}
                {user?.account_type === 'student' && (
                  <div className="space-y-1">
                    <h4 className="text-sm font-medium text-muted-foreground px-2 mb-2">Learning</h4>
                    {menuItems.slice(5, 7).map((item) => (
                      <Button
                        key={item.path}
                        variant={location.pathname === item.path ? "secondary" : "ghost"}
                        className={cn(
                          "w-full justify-start h-11 gap-3",
                          "transition-all duration-200",
                          location.pathname === item.path ? 
                            "bg-primary/10 hover:bg-primary/15" : 
                            "hover:bg-muted/50",
                          "rounded-lg"
                        )}
                        onClick={() => {
                          navigate(item.path);
                          setIsSheetOpen(false);
                        }}
                      >
                        <div className={cn(
                          "p-1.5 rounded-md",
                          location.pathname === item.path ? "bg-primary/10" : "bg-muted"
                        )}>
                          {item.icon}
                        </div>
                        <span className="font-medium">{item.label}</span>
                        {item.badge && (
                          <Badge variant="secondary" className="ml-auto">
                            {item.badge}
                          </Badge>
                        )}
                      </Button>
                    ))}
                  </div>
                )}

                {/* Business - Shows only when switched to business profile AND has active business profile */}
                {user?.account_type === 'business' && profileData?.has_profile && profileData?.profile?.status === 'active' && (
                  <div className="space-y-1">
                    <h4 className="text-sm font-medium text-muted-foreground px-2 mb-2">Business</h4>
                    {menuItems.slice(7, 9).map((item) => (
                      <Button
                        key={item.path}
                        variant={location.pathname === item.path ? "secondary" : "ghost"}
                        className={cn(
                          "w-full justify-start h-11 gap-3",
                          "transition-all duration-200",
                          location.pathname === item.path ? 
                            "bg-primary/10 hover:bg-primary/15" : 
                            "hover:bg-muted/50",
                          "rounded-lg"
                        )}
                        onClick={() => {
                          navigate(item.path);
                          setIsSheetOpen(false);
                        }}
                      >
                        <div className={cn(
                          "p-1.5 rounded-md",
                          location.pathname === item.path ? "bg-primary/10" : "bg-muted"
                        )}>
                          {item.icon}
                        </div>
                        <span className="font-medium">{item.label}</span>
                        {item.badge && (
                          <Badge variant="secondary" className="ml-auto">
                            {item.badge}
                          </Badge>
                        )}
                      </Button>
                    ))}
                  </div>
                )}

                {/* Professional - Shows only when switched to professional profile */}
                {user?.account_type === 'professional' && professionalData?.has_profile && professionalData?.profile?.status === 'active' && (
                  <div className="space-y-1">
                    <h4 className="text-sm font-medium text-muted-foreground px-2 mb-2">Professional</h4>
                    {menuItems.slice(9, 11).map((item) => (
                      <Button
                        key={item.path}
                        variant={location.pathname === item.path ? "secondary" : "ghost"}
                        className={cn(
                          "w-full justify-start h-11 gap-3",
                          "transition-all duration-200",
                          location.pathname === item.path ? 
                            "bg-primary/10 hover:bg-primary/15" : 
                            "hover:bg-muted/50",
                          "rounded-lg"
                        )}
                        onClick={() => {
                          navigate(item.path);
                          setIsSheetOpen(false);
                        }}
                      >
                        <div className={cn(
                          "p-1.5 rounded-md",
                          location.pathname === item.path ? "bg-primary/10" : "bg-muted"
                        )}>
                          {item.icon}
                        </div>
                        <span className="font-medium">{item.label}</span>
                        {item.badge && (
                          <Badge variant="secondary" className="ml-auto">
                            {item.badge}
                          </Badge>
                        )}
                      </Button>
                    ))}
                  </div>
                )}

                {/* Shop */}
                <div className="space-y-1">
                  <h4 className="text-sm font-medium text-muted-foreground px-2 mb-2">Shop</h4>
                  {menuItems.slice(11).map((item) => (
                    <Button
                      key={item.path}
                      variant={location.pathname === item.path ? "secondary" : "ghost"}
                      className={cn(
                        "w-full justify-start h-11 gap-3",
                        "transition-all duration-200",
                        location.pathname === item.path ? 
                          "bg-primary/10 hover:bg-primary/15" : 
                          "hover:bg-muted/50",
                        "rounded-lg"
                      )}
                      onClick={() => {
                        navigate(item.path);
                        setIsSheetOpen(false);
                      }}
                    >
                      <div className={cn(
                        "p-1.5 rounded-md",
                        location.pathname === item.path ? "bg-primary/10" : "bg-muted"
                      )}>
                        {item.icon}
                      </div>
                      <span className="font-medium">{item.label}</span>
                      {item.badge && (
                        <Badge variant="secondary" className="ml-auto">
                          {item.badge}
                        </Badge>
                      )}
                    </Button>
                  ))}
                </div>
              </nav>
            </div>

            {/* Fixed Bottom Section */}
            <div className="border-t p-3 space-y-2 shrink-0">
              {/* Profile Type Switcher */}
              <div className="px-3 py-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="w-full justify-between">
                      <span className="capitalize">{user?.account_type || 'Select Profile'}</span>
                      <ChevronDown className="h-4 w-4 opacity-50" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-full">
                    <DropdownMenuItem onClick={() => handleProfileSwitch('student')}>
                      Student Profile
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleProfileSwitch('business')}>
                      Business Profile
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleProfileSwitch('professional')}>
                      Professional Profile
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {/* Theme Toggle */}
              <div className="flex items-center justify-between px-3 py-2">
                <h4 className="text-xs font-medium text-muted-foreground">
                  Theme
                </h4>
                <ThemeToggle />
              </div>

              {/* Settings & Logout */}
              <Button
                variant="ghost"
                className="w-full justify-start gap-2"
                onClick={() => navigate('/dashboard/settings')}
              >
                <Settings className="h-4 w-4" />
                Settings
              </Button>
              <Button
                variant="ghost"
                className="w-full justify-start gap-2 text-red-500 hover:text-red-500 hover:bg-red-50"
                onClick={handleLogout}
              >
                <LogOut className="h-4 w-4" />
                Logout
              </Button>
            </div>
          </div>
        </aside>

        {/* Mobile Header and Content */}
        <div className="flex flex-1 flex-col overflow-hidden">
          {/* Mobile Header */}
          <header className={cn(
            "flex h-16 items-center gap-4 border-b border-border/30 bg-background/30 backdrop-blur-[12px] px-4 md:hidden z-40 relative",
            location.pathname === "/dashboard/settings" && "hidden"
          )}>
            <div className="flex-1 flex items-center gap-3">
              {location.pathname === "/dashboard" ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="relative h-8 w-8 rounded-full"
                    >
                      <Avatar className="h-8 w-8">
                        <AvatarImage 
                          src={user?.avatar} 
                          alt={user?.username || `${user?.first_name} ${user?.last_name}`} 
                        />
                        <AvatarFallback>
                          {user?.username 
                            ? user.username.charAt(0).toUpperCase() 
                            : (user?.first_name 
                              ? user.first_name.charAt(0).toUpperCase() 
                              : '?')
                            }
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-56">
                    <div className="flex items-center gap-2 p-2 border-b">
                      <div className="flex-1 space-y-1">
                        <p className="text-sm font-medium leading-none">{user?.username || 
                         (user?.first_name && user?.last_name 
                           ? `${user.first_name} ${user.last_name}` 
                           : user?.first_name || 
                             user?.last_name || 
                             user?.email || 
                             'User')}</p>
                        <p className="text-xs text-muted-foreground">{user?.email || 'No email'}</p>
                      </div>
                    </div>
                    <DropdownMenuItem onClick={() => navigate('/dashboard/settings')}>
                      <Settings className="mr-2 h-4 w-4" />
                      Settings
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleLogout} className="text-red-500">
                      <LogOut className="mr-2 h-4 w-4" />
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => navigate(-1)}
                >
                  <ArrowLeft className="h-5 w-5" />
                </Button>
              )}
            </div>

            <div className="flex items-center gap-2">
              {/* Mobile Notifications */}
              <Popover open={isMobileNotificationPopoverOpen} onOpenChange={setIsMobileNotificationPopoverOpen}>
                <PopoverTrigger asChild>
                  <Button variant="ghost" size="icon" className="relative">
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 && (
                      <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-primary" />
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent 
                  align="end" 
                  className="w-[calc(100vw-32px)] sm:w-[380px] p-0 mx-4"
                  sideOffset={8}
                >
                  <div className="flex flex-col">
                    {/* Header */}
                    <div className="flex items-center justify-between border-b px-3 py-3">
                      <div>
                        <h4 className="font-semibold text-sm">Notifications</h4>
                        <p className="text-xs text-muted-foreground">
                          {unreadCount 
                            ? `You have ${unreadCount} unread notifications` 
                            : 'No new notifications'}
                        </p>
                      </div>
                      {unreadCount > 0 && (
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={markAllAsRead}
                          className="text-xs"
                        >
                          <CheckCheck className="mr-2 h-4 w-4" />
                          Mark all read
                        </Button>
                      )}
                    </div>

                    {/* Notifications List */}
                    <ScrollArea className="h-[300px]">
                      {notifications.length > 0 ? (
                        <div className="flex flex-col">
                          {notifications.slice(0, 5).map((notification) => (
                            <div
                              key={notification.id}
                              className={cn(
                                "flex items-start gap-3 p-3",
                                "hover:bg-muted/50 transition-colors",
                                !notification.read && "bg-muted/30"
                              )}
                            >
                              <div className={cn(
                                "mt-1 h-2 w-2 rounded-full",
                                !notification.read ? "bg-primary" : "bg-muted-foreground/30"
                              )} />
                              <div className="flex-1 space-y-1">
                                <div className="flex items-center justify-between gap-4">
                                  <p className={cn(
                                    "text-sm",
                                    !notification.read && "font-medium"
                                  )}>
                                    {notification.title}
                                  </p>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-muted-foreground hover:text-destructive"
                                    onClick={() => handleDeleteNotification(notification.id)}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                                <p className="text-sm text-muted-foreground">
                                  {notification.message}
                                </p>
                                <div className="flex items-center justify-between">
                                  <p className="text-xs text-muted-foreground">
                                    {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                                  </p>
                                  {notification.action_url && (
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="h-6 text-xs"
                                      onClick={() => {
                                        navigate(notification.action_url);
                                        setIsMobileNotificationPopoverOpen(false);
                                      }}
                                    >
                                      <ExternalLink className="mr-1 h-3 w-3" />
                                      View
                                    </Button>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center py-8 text-center px-3">
                          <Bell className="h-12 w-12 text-muted-foreground/30" />
                          <h3 className="mt-4 text-sm font-medium">No notifications</h3>
                          <p className="text-xs text-muted-foreground">
                            We'll notify you when something arrives
                          </p>
                        </div>
                      )}
                    </ScrollArea>

                    {/* Footer */}
                    <div className="border-t p-2">
                      <Button
                        variant="ghost"
                        className="w-full justify-center text-sm"
                        onClick={() => {
                          navigate('/dashboard/notifications');
                          setIsMobileNotificationPopoverOpen(false);
                        }}
                      >
                        View all notifications
                      </Button>
                    </div>
                  </div>
                </PopoverContent>
              </Popover>

              {/* Cart Icon */}
              <Button 
                variant="ghost" 
                size="icon" 
                className="relative"
                onClick={() => navigate('/dashboard/cart')}
              >
                <ShoppingCart className="h-5 w-5" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-primary text-[10px] font-medium text-primary-foreground flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </Button>

              {/* Profile Menu - Last for non-dashboard pages */}
              {location.pathname !== "/dashboard" && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="relative h-8 w-8 rounded-full"
                    >
                      <Avatar className="h-8 w-8">
                        <AvatarImage 
                          src={user?.avatar} 
                          alt={user?.username || `${user?.first_name} ${user?.last_name}`} 
                        />
                        <AvatarFallback>
                          {user?.username 
                            ? user.username.charAt(0).toUpperCase() 
                            : (user?.first_name 
                              ? user.first_name.charAt(0).toUpperCase() 
                              : '?')
                            }
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <div className="flex items-center gap-2 p-2 border-b">
                      <div className="flex-1 space-y-1">
                        <p className="text-sm font-medium leading-none">{user?.username || 
                         (user?.first_name && user?.last_name 
                           ? `${user.first_name} ${user.last_name}` 
                           : user?.first_name || 
                             user?.last_name || 
                             user?.email || 
                             'User')}</p>
                        <p className="text-xs text-muted-foreground">{user?.email || 'No email'}</p>
                      </div>
                    </div>
                    <DropdownMenuItem onClick={() => navigate('/dashboard/settings')}>
                      <Settings className="mr-2 h-4 w-4" />
                      Settings
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleLogout} className="text-red-500">
                      <LogOut className="mr-2 h-4 w-4" />
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          </header>

          {/* Main Content */}
          <div className="flex-1 overflow-y-auto bg-background">
            <main className="min-h-[calc(100vh-5rem)] mb-24 md:mb-0">
              <div className="container mx-auto px-3 py-0.5 md:px-4 md:py-1 max-w-7xl">
                <Outlet />
              </div>
            </main>
          </div>

          {/* Mobile Bottom Navigation */}
          <div className="fixed bottom-0 left-0 right-0 border-t border-border/5 bg-background/80 backdrop-blur-xl md:hidden">
            <div className="container mx-auto">
              <div className="flex items-center justify-around h-16 px-2 mb-1">
                {/* Menu Button with Sheet */}
                <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
                  <SheetTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      className={cn(
                        "w-12 h-12 rounded-2xl",
                        "transition-all duration-300 ease-out",
                        "hover:bg-primary/5",
                        "active:scale-95",
                        isSheetOpen ? 
                          "bg-primary/10 text-primary shadow-lg shadow-primary/25" : 
                          "bg-muted/50 text-muted-foreground"
                      )}
                    >
                      <Menu className="h-[1.3rem] w-[1.3rem] rotate-0 scale-100 transition-all" />
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="left" className="w-[85%] p-0 border-r shadow-2xl">
                    <div className="flex flex-col h-full bg-gradient-to-b from-background to-background/95">
                      {/* Profile Header Section */}
                      <div className="relative px-4 pt-12 pb-6">
                        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent" />
                        <div className="relative flex items-center gap-4">
                          <div className="relative">
                            <Avatar className="h-14 w-14 ring-4 ring-background">
                              <AvatarImage 
                                src={user?.avatar} 
                                alt={user?.username || `${user?.first_name} ${user?.last_name}`} 
                              />
                              <AvatarFallback>
                                {user?.username 
                                  ? user.username.charAt(0).toUpperCase() 
                                  : (user?.first_name 
                                    ? user.first_name.charAt(0).toUpperCase() 
                                    : '?')
                                  }
                              </AvatarFallback>
                            </Avatar>
                            <div className="absolute -bottom-0.5 -right-0.5 h-4 w-4 rounded-full border-2 border-background bg-green-500" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="text-lg font-semibold truncate">
                              {(user?.first_name && user?.last_name) 
                                ? `${user.first_name} ${user.last_name}`
                                : user?.username || 
                                  user?.email || 
                                  'User'
                              }
                            </h3>
                            <p className="text-sm text-muted-foreground truncate">
                              {user?.email || 'No email'}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Profile Type Switcher */}
                      <div className="px-4 pb-4">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button 
                              variant="outline" 
                              className="w-full justify-between gap-2 h-12 rounded-xl bg-primary/5 border-primary/10 hover:bg-primary/10"
                            >
                              <div className="flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-primary/10">
                                  {user?.account_type === "student" ? (
                                    <GraduationCap className="h-4 w-4 text-primary" />
                                  ) : user?.account_type === "business" ? (
                                    <Building2 className="h-4 w-4 text-primary" />
                                  ) : (
                                    <Briefcase className="h-4 w-4 text-primary" />
                                  )}
                                </div>
                                <span className="font-medium">
                                  {user?.account_type === "student" ? "Student Account" : 
                                   user?.account_type === "business" ? "Business Account" : 
                                   "Professional Account"}
                                </span>
                              </div>
                              <ChevronDown className="h-4 w-4 text-primary opacity-50" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-[calc(85vw-2rem)]">
                            <DropdownMenuItem 
                              disabled={user?.account_type === "student"}
                              onClick={() => handleProfileSwitch("student")}
                              className="h-11"
                            >
                              <div className="flex items-center gap-3 flex-1">
                                <div className="p-2 rounded-lg bg-primary/10">
                                  <GraduationCap className="h-4 w-4 text-primary" />
                                </div>
                                Switch to Student Account
                              </div>
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              disabled={user?.account_type === "business"}
                              onClick={() => handleProfileSwitch("business")}
                              className="h-11"
                            >
                              <div className="flex items-center gap-3 flex-1">
                                <div className="p-2 rounded-lg bg-primary/10">
                                  <Building2 className="h-4 w-4 text-primary" />
                                </div>
                                Switch to Business Account
                              </div>
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              disabled={user?.account_type === "professional"}
                              onClick={() => handleProfileSwitch("professional")}
                              className="h-11"
                            >
                              <div className="flex items-center gap-3 flex-1">
                                <div className="p-2 rounded-lg bg-primary/10">
                                  <Briefcase className="h-4 w-4 text-primary" />
                                </div>
                                Switch to Professional Account
                              </div>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>

                      {/* Menu Categories */}
                      <div className="flex-1 overflow-y-auto">
                        <div className="p-4 space-y-6">
                          {/* Main Navigation */}
                          <div className="space-y-1">
                            <h4 className="text-sm font-medium text-muted-foreground px-2 mb-2">Main Navigation</h4>
                            {menuItems.slice(0, 5).map((item) => (
                              <Button
                                key={item.path}
                                variant={location.pathname === item.path ? "secondary" : "ghost"}
                                className={cn(
                                  "w-full justify-start h-11 gap-3",
                                  "transition-all duration-200",
                                  location.pathname === item.path ? 
                                    "bg-primary/10 hover:bg-primary/15" : 
                                    "hover:bg-muted/50",
                                  "rounded-lg"
                                )}
                                onClick={() => {
                                  navigate(item.path);
                                  setIsSheetOpen(false);
                                }}
                              >
                                <div className={cn(
                                  "p-1.5 rounded-md",
                                  location.pathname === item.path ? "bg-primary/10" : "bg-muted"
                                )}>
                                  {item.icon}
                                </div>
                                <span className="font-medium">{item.label}</span>
                                {item.badge && (
                                  <Badge variant="secondary" className="ml-auto">
                                    {item.badge}
                                  </Badge>
                                )}
                              </Button>
                            ))}
                          </div>

                          {/* Learning - Shows only when switched to student profile */}
                          {user?.account_type === 'student' && (
                            <div className="space-y-1">
                              <h4 className="text-sm font-medium text-muted-foreground px-2 mb-2">Learning</h4>
                              {menuItems.slice(5, 7).map((item) => (
                                <Button
                                  key={item.path}
                                  variant={location.pathname === item.path ? "secondary" : "ghost"}
                                  className={cn(
                                    "w-full justify-start h-11 gap-3",
                                    "transition-all duration-200",
                                    location.pathname === item.path ? 
                                      "bg-primary/10 hover:bg-primary/15" : 
                                      "hover:bg-muted/50",
                                    "rounded-lg"
                                  )}
                                  onClick={() => {
                                    navigate(item.path);
                                    setIsSheetOpen(false);
                                  }}
                                >
                                  <div className={cn(
                                    "p-1.5 rounded-md",
                                    location.pathname === item.path ? "bg-primary/10" : "bg-muted"
                                  )}>
                                    {item.icon}
                                  </div>
                                  <span className="font-medium">{item.label}</span>
                                  {item.badge && (
                                    <Badge variant="secondary" className="ml-auto">
                                      {item.badge}
                                    </Badge>
                                  )}
                                </Button>
                              ))}
                            </div>
                          )}

                          {/* Business - Shows only when switched to business profile */}
                          {user?.account_type === 'business' && profileData?.has_profile && profileData?.profile?.status === 'active' && (
                            <div className="space-y-1">
                              <h4 className="text-sm font-medium text-muted-foreground px-2 mb-2">Business</h4>
                              {menuItems.slice(7, 9).map((item) => (
                                <Button
                                  key={item.path}
                                  variant={location.pathname === item.path ? "secondary" : "ghost"}
                                  className={cn(
                                    "w-full justify-start h-11 gap-3",
                                    "transition-all duration-200",
                                    location.pathname === item.path ? 
                                      "bg-primary/10 hover:bg-primary/15" : 
                                      "hover:bg-muted/50",
                                    "rounded-lg"
                                  )}
                                  onClick={() => {
                                    navigate(item.path);
                                    setIsSheetOpen(false);
                                  }}
                                >
                                  <div className={cn(
                                    "p-1.5 rounded-md",
                                    location.pathname === item.path ? "bg-primary/10" : "bg-muted"
                                  )}>
                                    {item.icon}
                                  </div>
                                  <span className="font-medium">{item.label}</span>
                                  {item.badge && (
                                    <Badge variant="secondary" className="ml-auto">
                                      {item.badge}
                                    </Badge>
                                  )}
                                </Button>
                              ))}
                            </div>
                          )}

                          {/* Professional - Shows only when switched to professional profile */}
                          {user?.account_type === 'professional' && professionalData?.has_profile && professionalData?.profile?.status === 'active' && (
                            <div className="space-y-1">
                              <h4 className="text-sm font-medium text-muted-foreground px-2 mb-2">Professional</h4>
                              {menuItems.slice(9, 11).map((item) => (
                                <Button
                                  key={item.path}
                                  variant={location.pathname === item.path ? "secondary" : "ghost"}
                                  className={cn(
                                    "w-full justify-start h-11 gap-3",
                                    "transition-all duration-200",
                                    location.pathname === item.path ? 
                                      "bg-primary/10 hover:bg-primary/15" : 
                                      "hover:bg-muted/50",
                                    "rounded-lg"
                                  )}
                                  onClick={() => {
                                    navigate(item.path);
                                    setIsSheetOpen(false);
                                  }}
                                >
                                  <div className={cn(
                                    "p-1.5 rounded-md",
                                    location.pathname === item.path ? "bg-primary/10" : "bg-muted"
                                  )}>
                                    {item.icon}
                                  </div>
                                  <span className="font-medium">{item.label}</span>
                                  {item.badge && (
                                    <Badge variant="secondary" className="ml-auto">
                                      {item.badge}
                                    </Badge>
                                  )}
                                </Button>
                              ))}
                            </div>
                          )}

                          {/* Shop */}
                          <div className="space-y-1">
                            <h4 className="text-sm font-medium text-muted-foreground px-2 mb-2">Shop</h4>
                            {menuItems.slice(11).map((item) => (
                              <Button
                                key={item.path}
                                variant={location.pathname === item.path ? "secondary" : "ghost"}
                                className={cn(
                                  "w-full justify-start h-11 gap-3",
                                  "transition-all duration-200",
                                  location.pathname === item.path ? 
                                    "bg-primary/10 hover:bg-primary/15" : 
                                    "hover:bg-muted/50",
                                  "rounded-lg"
                                )}
                                onClick={() => {
                                  navigate(item.path);
                                  setIsSheetOpen(false);
                                }}
                              >
                                <div className={cn(
                                  "p-1.5 rounded-md",
                                  location.pathname === item.path ? "bg-primary/10" : "bg-muted"
                                )}>
                                  {item.icon}
                                </div>
                                <span className="font-medium">{item.label}</span>
                                {item.badge && (
                                  <Badge variant="secondary" className="ml-auto">
                                    {item.badge}
                                  </Badge>
                                )}
                              </Button>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Bottom Actions */}
                      <div className="border-t bg-muted/5 p-4 space-y-4">
                        {/* Theme Toggle */}
                        <div className="flex items-center justify-between px-4 py-2 rounded-xl bg-muted/50">
                          <div className="flex items-center gap-3">
                            <h4 className="font-medium">Theme</h4>
                          </div>
                          <ThemeToggle />
                        </div>

                        {/* Settings & Logout */}
                        <div className="grid grid-cols-2 gap-2">
                          <Button
                            variant="outline"
                            className="h-11 gap-2 rounded-xl bg-background hover:bg-muted/50"
                            onClick={() => {
                              navigate('/dashboard/settings');
                              setIsSheetOpen(false);
                            }}
                          >
                            <Settings className="h-4 w-4" />
                            Settings
                          </Button>
                          <Button
                            variant="outline"
                            className="h-11 gap-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-500 border-red-500/20"
                            onClick={handleLogout}
                          >
                            <LogOut className="h-4 w-4" />
                            Logout
                          </Button>
                        </div>
                      </div>
                    </div>
                  </SheetContent>
                </Sheet>

                {/* Home Button */}
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={() => navigate('/dashboard')}
                  className={cn(
                    "relative w-16 h-16 rounded-2xl -mt-6",
                    "transition-all duration-300 ease-out",
                    location.pathname === '/dashboard' ? 
                      "bg-primary text-primary-foreground shadow-lg shadow-primary/25" : 
                      "bg-muted/50 text-muted-foreground hover:bg-primary/10",
                    "before:absolute before:inset-0 before:rounded-2xl before:transition-all",
                    location.pathname === '/dashboard' && "before:bg-primary/10 before:blur-xl before:-z-10"
                  )}
                >
                  <LayoutDashboard className="h-6 w-6 transition-transform duration-300" />
                </Button>

                {/* Wallet Button */}
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={() => navigate('/dashboard/wallet')}
                  className={cn(
                    "w-12 h-12 rounded-2xl",
                    "transition-all duration-300 ease-out",
                    location.pathname.includes('/wallet') ? 
                      "bg-primary/10 text-primary shadow-lg shadow-primary/25" : 
                      "bg-muted/50 text-muted-foreground hover:bg-primary/10"
                  )}
                >
                  <CreditCard className="h-[1.3rem] w-[1.3rem] transition-transform duration-300" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Dashboard;