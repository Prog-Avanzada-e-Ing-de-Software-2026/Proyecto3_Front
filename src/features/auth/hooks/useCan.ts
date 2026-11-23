import { hasPermission } from '../../../permissions/hasPermission';
import type { Permission } from '../../../permissions/permissions';
import { useAuth } from './useAuth';

export function useCan(permission: Permission): boolean {
  const { user, isLoading } = useAuth();
  // Hasta que se confirme la sesión, la acción no está disponible.
  return !isLoading && hasPermission(user, permission);
}
