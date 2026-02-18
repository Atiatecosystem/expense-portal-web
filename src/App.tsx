import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { SettingsProvider } from "@/contexts/SettingsContext";
import { OrganizationProvider } from "@/contexts/OrganizationContext";

import Landing from "@/pages/Landing";
import Login from "@/pages/Login";
import ForgotPassword from "@/pages/ForgotPassword";
import ResetPassword from "@/pages/ResetPassword";
import DashboardLayout from "@/layouts/DashboardLayout";
import Dashboard from "@/pages/Dashboard";
import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient();

/** Redirect to login if not authenticated */
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <>{children}</>;
};

const AppRoutes = () => (
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
      {/* Placeholder routes — pages will be implemented in subsequent phases */}
      <Route path="requests" element={<Dashboard />} />
      <Route path="notifications" element={<Dashboard />} />
      <Route path="analytics" element={<Dashboard />} />
      <Route path="users" element={<Dashboard />} />
      <Route path="organizations" element={<Dashboard />} />
      <Route path="payments" element={<Dashboard />} />
      <Route path="settings" element={<Dashboard />} />
    </Route>

    <Route path="*" element={<NotFound />} />
  </Routes>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <SettingsProvider>
      <AuthProvider>
        <OrganizationProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <AppRoutes />
            </BrowserRouter>
          </TooltipProvider>
        </OrganizationProvider>
      </AuthProvider>
    </SettingsProvider>
  </QueryClientProvider>
);

export default App;
