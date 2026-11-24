import { Navigate, Outlet } from 'react-router';
import { useAuth } from '../../features/auth/hooks/useAuth';
import { hasRequiredPermissions } from '../../permissions/hasRequiredPermissions';
import type { Permission } from '../../permissions/permissions';

export function RequirePermissions({
  requiredPermissions,
}: {
  requiredPermissions?: readonly Permission[];
}) {
  const { user } = useAuth();
  return hasRequiredPermissions(user, requiredPermissions) ? (
    <Outlet />
  ) : (
    <Navigate to="/" replace />
  );
}
