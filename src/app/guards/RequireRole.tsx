import { Navigate, Outlet } from 'react-router';
import { useAuth } from '../../features/auth/hooks/useAuth';
import type { NavigationRole } from '../routes/navigation';

export function RequireRole({ role }: { role: NavigationRole }) {
  const { user } = useAuth();
  return user?.rol === role ? <Outlet /> : <Navigate to="/" replace />;
}
