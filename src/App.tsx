import React, { Suspense, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import useAuthStore from '@/store/useAuthStore';
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from 'sonner';
import { TooltipProvider } from "@/components/ui/tooltip";
import PagePreloader from '@/components/ui/PagePreloader';
import { LoadingProvider, useLoading } from '@/context/LoadingContext';
import { ThemeProvider as ThemeStoreProvider } from '@/theme/ThemeProvider';
import { ThemeProvider as ThemeContextProvider } from '@/context/ThemeContext';
import AdminLogin from "@/pages/admin/Login";
import AdminDashboard from "@/pages/admin/Dashboard";
import AdminGuard from "@/components/admin/AdminGuard";
import AdminLayout from "@/components/admin/AdminLayout";
import AdminUsers from "@/pages/admin/Users";
import AdminCourses from "@/pages/admin/Courses";
import AdminTransactions from "@/pages/admin/Transactions";
import AdminSettings from "@/pages/admin/Settings";
import { queryClient } from '@/lib/queryClient';
import ITConsulting from '@/pages/ITConsulting';
import ConsultingBookings from "@/pages/ConsultingBookings";
import ConsultingBookingDetails from "@/pages/ConsultingBookingDetails";
import CreateProfileForm from '@/components/professional/CreateProfileForm';
import CreateBusinessProfile from "@/pages/business/CreateBusinessProfile";
import Customers from "@/pages/business/Customers";
import CustomerDetails from "@/pages/business/CustomerDetails";
import InvoiceDetails from "@/pages/business/InvoiceDetails";
import BusinessDashboard from "@/components/dashboard/BusinessDashboard";
import BusinessActivities from "@/pages/business/BusinessActivities";
import { lazy } from "react";
import { NotificationProvider } from '@/contexts/NotificationContext';
import { platformService } from './services/platformService';
import { App as CapacitorApp } from '@capacitor/app';
import { StatusBar } from '@capacitor/status-bar';
import { Keyboard } from '@capacitor/keyboard';
import { Browser } from '@capacitor/browser';
import DebugLogger from '@/components/DebugLogger';
import Onboarding from '@/pages/Onboarding';
import { ErrorBoundary } from '@/components/errors/ErrorBoundary';
import ProductRequest from '@/pages/ProductRequest';
import MyRequests from '@/pages/MyRequests';
import ProductRequestDetails from '@/pages/ProductRequestDetails';
import { pushNotificationService } from '@/services/pushNotificationService';
import { notificationService } from '@/services/notificationService';

// Lazy load pages
const Dashboard = React.lazy(() => import('@/pages/Dashboard'));
const TransactionDetails = React.lazy(() => import('@/pages/TransactionDetails'));
const Login = React.lazy(() => import('@/pages/Login'));
const Register = React.lazy(() => import('@/pages/Register'));
const CourseDetails = React.lazy(() => import('@/components/academy/CourseDetails'));
const Academy = React.lazy(() => import('@/pages/Academy'));
const OrderTracking = React.lazy(() => import('@/pages/OrderTracking'));
const Orders = React.lazy(() => import('@/pages/Orders'));
const MyCourses = React.lazy(() => import('@/pages/MyCourses'));
const Notifications = React.lazy(() => import('@/pages/Notifications'));

// Add these new imports
const Store = React.lazy(() => import('@/pages/Store'));
const Products = React.lazy(() => import('@/pages/Products'));
const ProductDetails = React.lazy(() => import('@/pages/ProductDetails'));
const Cart = React.lazy(() => import('@/pages/Cart'));
const Checkout = React.lazy(() => import('@/pages/Checkout'));
const WalletDashboard = React.lazy(() => import('@/components/wallet/WalletDashboard'));
const SettingsPage = React.lazy(() => import('@/pages/Settings'));
const ServicesPage = React.lazy(() => import('@/pages/Services'));
const SoftwareEngineeringQuote = React.lazy(() => import('@/pages/SoftwareEngineeringQuote'));
const CyberSecurityQuote = React.lazy(() => import('@/pages/CyberSecurityQuote'));
const ServiceQuoteRequestPage = React.lazy(() => import('@/pages/ServiceQuoteRequest'));
const QuoteRequestsListPage = React.lazy(() => import('@/pages/QuoteRequestsList'));
const QuoteDetailsPage = React.lazy(() => import('@/pages/QuoteDetails'));
const ProjectsListPage = React.lazy(() => import('@/pages/ProjectsList'));
const ProjectDetailsPage = React.lazy(() => import('@/pages/ProjectDetails'));
const WorkstationPlans = React.lazy(() => import('@/pages/workstation/Plans'));
const WorkstationSubscription = React.lazy(() => import('@/pages/workstation/Subscription'));
const DashboardHome = React.lazy(() => import('@/pages/DashboardHome'));
const Hustles = React.lazy(() => import('@/pages/hustles/Hustles'));
const HustleDetails = React.lazy(() => import('@/pages/hustles/HustleDetails'));
const MyHustleApplications = React.lazy(() => import('@/pages/hustles/MyApplications'));
const CourseManagement = React.lazy(() => import('@/pages/CourseManagement'));
const Services = React.lazy(() => import('@/pages/Services'));
const ServiceQuoteRequest = React.lazy(() => import('@/pages/ServiceQuoteRequest'));
const Settings = React.lazy(() => import('@/pages/Settings'));
const PaymentConfirmation = React.lazy(() => import('@/pages/PaymentConfirmation'));
const PaystackCallback = React.lazy(() => import('@/pages/PaystackCallback'));
const ActivitiesPage = React.lazy(() => import('@/pages/dashboard/ActivitiesPage'));
const CertificatesPage = lazy(() => import("@/pages/dashboard/CertificatesPage"));
const EmailVerification = React.lazy(() => import('@/pages/EmailVerification'));
const TwoFactorAuth = React.lazy(() => import('@/pages/TwoFactorAuth'));
const ForgotPassword = React.lazy(() => import('@/pages/ForgotPassword'));
const VerifyCode = React.lazy(() => import('@/pages/VerifyCode'));
const ResetPassword = React.lazy(() => import('@/pages/ResetPassword'));

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const requiresVerification = useAuthStore((state) => state.requiresVerification);
  const location = useLocation();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  if (requiresVerification && location.pathname !== '/verify-email') {
    return <Navigate to="/verify-email" state={{ from: location }} />;
  }

  if (!requiresVerification && location.pathname === '/verify-email') {
    return <Navigate to="/dashboard" />;
  }

  return children;
};

const AppContent = () => {
  const { isLoading } = useLoading();
  const hasSeenOnboarding = localStorage.getItem('hasSeenOnboarding');

  useEffect(() => {
    if (platformService.isNative()) {
      // Handle back button
      CapacitorApp.addListener('backButton', ({ canGoBack }) => {
        if (!canGoBack) {
          CapacitorApp.exitApp();
        } else {
          window.history.back();
        }
      });

      // Handle hardware back button
      document.addEventListener('ionBackButton', (ev: any) => {
        ev.detail.register(10, () => {
          if (!window.history.length) {
            CapacitorApp.exitApp();
          } else {
            window.history.back();
          }
        });
      });
    }
  }, []);

  return (
    <Router>
      {isLoading && <PagePreloader />}
      <Suspense fallback={<PagePreloader />}>
        <Routes>
          <Route 
            path="/onboarding" 
            element={
              !hasSeenOnboarding ? <Onboarding /> : <Navigate to="/login" replace />
            } 
          />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/verify-code" element={<VerifyCode />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route 
            path="/verify-email" 
            element={
              <ProtectedRoute>
                <EmailVerification />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/two-factor-auth" 
            element={<TwoFactorAuth />} 
          />
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>}>
            <Route index element={<DashboardHome />} />
            <Route path="store" element={<Store />} />
            <Route path="products" element={<Products />} />
            <Route path="store/product/:id" element={<ProductDetails />} />
            <Route path="cart" element={<Cart />} />
            <Route path="checkout" element={<Checkout />} />
            <Route path="academy" element={<Academy />} />
            <Route path="academy/my-courses" element={<MyCourses />} />
            <Route 
              path="academy/:courseId" 
              element={<CourseDetails />}
            />
            <Route path="academy/course/:courseId/manage" element={<CourseManagement />} />
            <Route path="wallet" element={<WalletDashboard />} />
            <Route path="wallet/transactions/:transactionId" element={<TransactionDetails />} />
            <Route path="settings" element={<SettingsPage />} />
            <Route path="services" element={<ServicesPage />} />
            <Route path="services/quote/software-engineering/:serviceId" element={<SoftwareEngineeringQuote />} />
            <Route path="services/quote/cyber-security/:serviceId" element={<CyberSecurityQuote />} />
            <Route path="services/quote/:categoryId/:serviceId" element={<ServiceQuoteRequestPage />} />
            <Route path="quotes" element={<QuoteRequestsListPage />} />
            <Route path="quotes/:quoteId" element={<QuoteDetailsPage />} />
            <Route path="projects" element={<ProjectsListPage />} />
            <Route path="projects/:projectId" element={<ProjectDetailsPage />} />
            <Route 
              path="it-consulting" 
              element={<ITConsulting />}
            />
            <Route path="orders" element={<Orders />} />
            <Route path="orders/:orderId/tracking" element={<OrderTracking />} />
            <Route path="payment-confirmation" element={<PaymentConfirmation />} />
            <Route path="consulting/bookings" element={<ConsultingBookings />} />
            <Route path="consulting/bookings/:id" element={<ConsultingBookingDetails />} />
            <Route path="workstation">
              <Route path="plans" element={<WorkstationPlans />} />
              <Route path="subscription" element={<WorkstationSubscription />} />
            </Route>
            <Route path="professional/profile/create" element={<CreateProfileForm />} />
            <Route path="hustles" element={<Hustles />} />
            <Route path="hustles/:id" element={<HustleDetails />} />
            <Route path="hustles/applications" element={<MyHustleApplications />} />
            <Route path="business/profile/create" element={<CreateBusinessProfile />} />
            <Route 
              path="business/customers" 
              element={
                <ProtectedRoute>
                  <Customers />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="business/customers/:customerId" 
              element={
                <ProtectedRoute>
                  <CustomerDetails />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="business/invoices/:invoiceId" 
              element={<InvoiceDetails />}
            />
            <Route path="business/dashboard" element={<BusinessDashboard />} />
            <Route path="business/activities" element={<BusinessActivities />} />
            <Route path="activities" element={<ActivitiesPage />} />
            <Route path="academy/certificates" element={<CertificatesPage />} />
            <Route path="notifications" element={<Notifications />} />
            <Route path="product-request" element={<ProductRequest />} />
            <Route path="my-requests" element={<MyRequests />} />
            <Route path="product-request/:id" element={<ProductRequestDetails />} />
          </Route>

          <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
          <Route path="/courses/:courseId/manage" element={<CourseManagement />} />
          <Route path="/services" element={<Services />} />
          <Route 
            path="/" 
            element={
              !hasSeenOnboarding ? (
                <Navigate to="/onboarding" replace />
              ) : (
                <Navigate to="/dashboard" replace />
              )
            } 
          />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin/*" element={
            <AdminGuard>
              <AdminLayout>
                <Routes>
                  <Route path="dashboard" element={<AdminDashboard />} />
                  <Route path="users" element={<AdminUsers />} />
                  <Route path="courses" element={<AdminCourses />} />
                  <Route path="transactions" element={<AdminTransactions />} />
                  <Route path="settings" element={<AdminSettings />} />
                </Routes>
              </AdminLayout>
            </AdminGuard>
          } />
          <Route 
            path="/paystack-callback" 
            element={
              <ProtectedRoute>
                <PaystackCallback />
              </ProtectedRoute>
            } 
          />
        </Routes>
      </Suspense>
      <Toaster />
      {import.meta.env.DEV && <DebugLogger />}
    </Router>
  );
};

const App = () => {
  const { isAuthenticated, initialize, theme } = useAuthStore();
  const hasSeenOnboarding = localStorage.getItem('hasSeenOnboarding');

  // Apply theme on component mount and when theme changes
  React.useEffect(() => {
    console.log('🎨 Theme Changed:', theme);
    document.documentElement.classList.remove('light', 'dark');
    document.documentElement.classList.add(theme);
  }, [theme]);

  React.useEffect(() => {
    // Call initialize when the app loads
    const initializeApp = async () => {
      console.group('🚀 App Initialization');
      console.log('Authentication State:', {
        isAuthenticated,
        token: localStorage.getItem('token'),
        storedTheme: localStorage.getItem('theme')
      });

      if (isAuthenticated) {
        try {
          const result = await initialize();
          console.log('🔑 Initialization Result:', result);
        } catch (error) {
          console.error('❌ App Initialization Failed:', error);
        }
      } else {
        console.log('❌ Not Authenticated. Skipping initialization.');
      }

      console.groupEnd();
    };

    initializeApp();
  }, [isAuthenticated, initialize]);

  useEffect(() => {
    platformService.initializeApp();
  }, []);

  useEffect(() => {
    const initApp = async () => {
      if (platformService.isNative()) {
        try {
          await StatusBar.setBackgroundColor({ color: '#ffffff' });
          await StatusBar.setStyle({ style: Style.Dark });
          await Keyboard.setAccessoryBarVisible({ isVisible: false });
        } catch (error) {
          console.error('Error initializing native features:', error);
        }
      }
    };

    initApp();
  }, []);

  useEffect(() => {
    // Handle deep links
    CapacitorApp.addListener('appUrlOpen', async (data: { url: string }) => {
      console.log('App opened with URL:', data.url);
      
      if (data.url.includes('paystack-callback')) {
        // Extract query parameters
        const url = new URL(data.url);
        const reference = url.searchParams.get('reference');
        const trxref = url.searchParams.get('trxref');
        const status = url.searchParams.get('status');

        console.log('Payment callback received:', { reference, trxref, status });

        // Navigate to PaystackCallback component with query parameters
        window.location.hash = `/paystack-callback?reference=${reference}&trxref=${trxref}&status=${status}`;
      }
    });

    // Handle external links
    const handleExternalLinks = () => {
      document.addEventListener('click', async (e) => {
        const target = e.target as HTMLAnchorElement;
        if (target.tagName === 'A' && target.href) {
          e.preventDefault();

          // Check if it's an internal or external link
          const isInternal = target.href.includes('192.168.96.190:8000') || 
                           target.href.startsWith('/') ||
                           target.href.startsWith('#');

          if (isInternal) {
            // Handle internal navigation
            window.location.href = target.href;
          } else {
            // Open external links in the in-app browser
            await Browser.open({
              url: target.href,
              presentationStyle: 'popover',
              toolbarColor: '#ffffff',
              windowName: '_self'
            });
          }
        }
      });
    };

    if (platformService.isNative()) {
      handleExternalLinks();
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated && platformService.isNative()) {
      notificationService.initializePushNotifications();
    }
  }, [isAuthenticated]);

  return (
    <ErrorBoundary>
      <ThemeStoreProvider>
        <ThemeContextProvider>
          <QueryClientProvider client={queryClient}>
            <LoadingProvider>
              <TooltipProvider>
                <NotificationProvider>
                  <div className="min-h-screen transition-colors duration-300">
                    <AppContent />
                  </div>
                </NotificationProvider>
              </TooltipProvider>
            </LoadingProvider>
          </QueryClientProvider>
        </ThemeContextProvider>
      </ThemeStoreProvider>
    </ErrorBoundary>
  );
};

// Update your payment integration to use the in-app browser
const handlePaystackPayment = async (authorizationUrl: string) => {
  if (platformService.isNative()) {
    await Browser.open({
      url: authorizationUrl,
      presentationStyle: 'popover',
      toolbarColor: '#ffffff',
      windowName: '_self'
    });
  } else {
    window.location.href = authorizationUrl;
  }
};

export default App;