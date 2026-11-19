import { useAuth } from '../features/auth/hooks/useAuth';
import type { Permission } from './permissions';

export function hasPermission(
  user: { permisos: readonly string[] } | null,
  permission: Permission,
): boolean {
  return user?.permisos.includes(permission) ?? false;
}

export function useCan(permission: Permission): boolean {
  const { user, isLoading } = useAuth();
  // Hasta que se confirme la sesión, la acción no está disponible.
  return !isLoading && hasPermission(user, permission);
}
