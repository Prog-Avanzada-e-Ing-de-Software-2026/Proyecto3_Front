import type { Permission } from './permissions';

export function hasPermission(
  user: { permisos: readonly string[] } | null,
  permission: Permission,
): boolean {
  return user?.permisos.includes(permission) ?? false;
}
