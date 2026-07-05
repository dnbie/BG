import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export function RequireAuth() {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <Outlet />;
}

export function RequireAdmin() {
  const { isAuthenticated, isAdmin } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (!isAdmin) return <Navigate to="/" replace />;
  return <Outlet />;
}

export function RequireClient() {
  const { isAuthenticated, isAdmin } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (isAdmin) return <Navigate to="/admin" replace />;
  return <Outlet />;
}

export function RedirectIfAuth() {
  const { isAuthenticated, isAdmin } = useAuth();
  if (isAuthenticated) return <Navigate to={isAdmin ? '/admin' : '/'} replace />;
  return <Outlet />;
}

export function NotFoundRedirect() {
  const { isAuthenticated, isAdmin } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <Navigate to={isAdmin ? '/admin' : '/'} replace />;
}
