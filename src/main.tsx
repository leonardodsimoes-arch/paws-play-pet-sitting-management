import '@/lib/errorReporter';
import { enableMapSet } from "immer";
enableMapSet();
import React, { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { RouteErrorBoundary } from '@/components/RouteErrorBoundary';
import '@/index.css'
import { HomePage } from '@/pages/HomePage';
import { ClientDashboard } from '@/pages/ClientDashboard';
import { DogRegistration } from '@/pages/DogRegistration';
import { DogDetail } from '@/pages/DogDetail';
import { BookingFlow } from '@/pages/BookingFlow';
import { AdminDashboard } from '@/pages/AdminDashboard';
import { AdminBilling } from '@/pages/AdminBilling';
import { AdminUsers } from '@/pages/AdminUsers';
import { AdminUserDetail } from '@/pages/AdminUserDetail';
import { LoginPage } from '@/pages/LoginPage';
import { RegisterPage } from '@/pages/RegisterPage';
import { AuthGuard } from '@/components/auth/AuthGuard';
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});
const router = createBrowserRouter([
  {
    path: "/",
    element: <HomePage />,
    errorElement: <RouteErrorBoundary />
  },
  {
    path: "/login",
    element: <LoginPage />,
    errorElement: <RouteErrorBoundary />
  },
  {
    path: "/register",
    element: <RegisterPage />,
    errorElement: <RouteErrorBoundary />
  },
  {
    path: "/dashboard",
    element: <AuthGuard allowedRoles={["client", "admin"]}><ClientDashboard /></AuthGuard>,
    errorElement: <RouteErrorBoundary />
  },
  {
    path: "/dogs/new",
    element: <AuthGuard allowedRoles={["client", "admin"]}><DogRegistration /></AuthGuard>,
    errorElement: <RouteErrorBoundary />
  },
  {
    path: "/dogs/:id",
    element: <AuthGuard allowedRoles={["client", "admin"]}><DogDetail /></AuthGuard>,
    errorElement: <RouteErrorBoundary />
  },
  {
    path: "/book",
    element: <AuthGuard allowedRoles={["client", "admin"]}><BookingFlow /></AuthGuard>,
    errorElement: <RouteErrorBoundary />
  },
  {
    path: "/admin",
    element: <AuthGuard allowedRoles={["admin"]}><AdminDashboard /></AuthGuard>,
    errorElement: <RouteErrorBoundary />
  },
  {
    path: "/admin/billing",
    element: <AuthGuard allowedRoles={["admin"]}><AdminBilling /></AuthGuard>,
    errorElement: <RouteErrorBoundary />
  },
  {
    path: "/admin/clients",
    element: <AuthGuard allowedRoles={["admin"]}><AdminUsers /></AuthGuard>,
    errorElement: <RouteErrorBoundary />
  },
  {
    path: "/admin/clients/:id",
    element: <AuthGuard allowedRoles={["admin"]}><AdminUserDetail /></AuthGuard>,
    errorElement: <RouteErrorBoundary />
  },
]);
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <ErrorBoundary>
        <RouterProvider router={router} />
      </ErrorBoundary>
    </QueryClientProvider>
  </StrictMode>,
)