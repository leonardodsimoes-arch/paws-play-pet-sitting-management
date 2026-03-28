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
    path: "/dashboard",
    element: <ClientDashboard />,
    errorElement: <RouteErrorBoundary />
  },
  {
    path: "/dogs/new",
    element: <DogRegistration />,
    errorElement: <RouteErrorBoundary />
  },
  {
    path: "/dogs/:id",
    element: <DogDetail />,
    errorElement: <RouteErrorBoundary />
  },
  {
    path: "/book",
    element: <BookingFlow />,
    errorElement: <RouteErrorBoundary />
  },
  {
    path: "/admin",
    element: <AdminDashboard />,
    errorElement: <RouteErrorBoundary />
  },
  {
    path: "/admin/billing",
    element: <AdminBilling />,
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