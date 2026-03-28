import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/store/use-auth-store';
import { ShieldAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
interface AuthGuardProps {
  children: React.ReactNode;
  allowedRoles?: ('client' | 'admin')[];
}
export function AuthGuard({ children, allowedRoles }: AuthGuardProps) {
  const isAuthenticated = useAuthStore(s => s.isAuthenticated);
  const userRole = useAuthStore(s => s.user?.role);
  const location = useLocation();
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  if (allowedRoles && userRole && !allowedRoles.includes(userRole as 'client' | 'admin')) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-8 text-center space-y-6">
        <div className="bg-playful-pink p-6 rounded-3xl border-4 border-black shadow-solid">
          <ShieldAlert className="w-16 h-16 text-white" strokeWidth={3} />
        </div>
        <h1 className="text-4xl font-black italic tracking-tight">ACCESS DENIED</h1>
        <p className="text-xl font-bold text-muted-foreground max-w-md">
          Whoops! Your paws aren't authorized to enter this area. This zone is for {allowedRoles.join(' or ')} only.
        </p>
        <Button asChild className="playful-btn bg-playful-yellow text-black border-black">
          <Link to="/">Back to Safety</Link>
        </Button>
      </div>
    );
  }
  return <>{children}</>;
}