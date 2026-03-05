import { lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { SettingsProvider } from "@/contexts/SettingsContext";
import { OrganizationProvider } from "@/contexts/OrganizationContext";
import { PermissionProvider } from "@/contexts/PermissionContext";
import SkeletonLoader from "@/components/SkeletonLoader";

/* ── Lazy-loaded route components for code splitting ── */
const Landing = lazy(() => import("@/pages/Landing"));
const Login = lazy(() => import("@/pages/Login"));
const ForgotPassword = lazy(() => import("@/pages/ForgotPassword"));
const ResetPassword = lazy(() => import("@/pages/ResetPassword"));
const DashboardLayout = lazy(() => import("@/layouts/DashboardLayout"));
const Dashboard = lazy(() => import("@/pages/Dashboard"));
const UserDashboard = lazy(() => import("@/pages/UserDashboard"));
const Requests = lazy(() => import("@/pages/Requests"));
const RequestDetail = lazy(() => import("@/pages/RequestDetail"));
const CreateRequest = lazy(() => import("@/pages/CreateRequest"));
const Notifications = lazy(() => import("@/pages/Notifications"));
const Analytics = lazy(() => import("@/pages/Analytics"));
const UsersPage = lazy(() => import("@/pages/Users"));
const UserDetail = lazy(() => import("@/pages/UserDetail"));
const Organizations = lazy(() => import("@/pages/Organizations"));
const Payments = lazy(() => import("@/pages/Payments"));
const SettingsPage = lazy(() => import("@/pages/Settings"));
const Departments = lazy(() => import("@/pages/Departments"));
const Workflows = lazy(() => import("@/pages/Workflows"));
const Approvers = lazy(() => import("@/pages/Approvers"));
const Budgets = lazy(() => import("@/pages/Budgets"));
const Currencies = lazy(() => import("@/pages/Currencies"));
const AuditLogs = lazy(() => import("@/pages/AuditLogs"));
const Roles = lazy(() => import("@/pages/Roles"));
const Directors = lazy(() => import("@/pages/Directors"));
const Reports = lazy(() => import("@/pages/Reports"));
const Activity = lazy(() => import("@/pages/Activity"));
const NotFound = lazy(() => import("@/pages/NotFound"));

const queryClient = new QueryClient();

/** Suspense fallback for lazy routes */
const PageLoader = () => (
  <div className="flex min-h-screen items-center justify-center bg-background p-8">
    <div className="w-full max-w-md">
      <SkeletonLoader rows={4} />
    </div>
  </div>
);

/** Redirect to login if not authenticated */
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <>{children}</>;
};

const AppRoutes = () => (
  <Suspense fallback={<PageLoader />}>
    <Routes>
      {/* Public */}
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />

      {/* Protected dashboard */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="user" element={<UserDashboard />} />
        <Route path="requests" element={<Requests />} />
        <Route path="requests/new" element={<CreateRequest />} />
        <Route path="requests/:id" element={<RequestDetail />} />
        <Route path="notifications" element={<Notifications />} />
        <Route path="analytics" element={<Analytics />} />
        <Route path="users" element={<UsersPage />} />
        <Route path="users/:id" element={<UserDetail />} />
        <Route path="organizations" element={<Organizations />} />
        <Route path="payments" element={<Payments />} />
        <Route path="settings" element={<SettingsPage />} />
        <Route path="departments" element={<Departments />} />
        <Route path="workflows" element={<Workflows />} />
        <Route path="approvers" element={<Approvers />} />
        <Route path="budgets" element={<Budgets />} />
        <Route path="currencies" element={<Currencies />} />
        <Route path="audit-logs" element={<AuditLogs />} />
        <Route path="roles" element={<Roles />} />
        <Route path="directors" element={<Directors />} />
        <Route path="reports" element={<Reports />} />
        <Route path="activity" element={<Activity />} />
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  </Suspense>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <SettingsProvider>
      <AuthProvider>
        <OrganizationProvider>
          <PermissionProvider>
            <TooltipProvider>
              <Toaster />
              <Sonner />
              <BrowserRouter>
                <AppRoutes />
              </BrowserRouter>
            </TooltipProvider>
          </PermissionProvider>
        </OrganizationProvider>
      </AuthProvider>
    </SettingsProvider>
  </QueryClientProvider>
);

export default App;
