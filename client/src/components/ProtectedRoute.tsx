import type { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../store/auth';
import { Loading } from './ui';

/** Preusmjerava neprijavljene korisnike na prijavu i pamti odredište. */
export default function ProtectedRoute({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <Loading />;
  if (!user) return <Navigate to="/prijava" state={{ from: location.pathname }} replace />;

  return <>{children}</>;
}
