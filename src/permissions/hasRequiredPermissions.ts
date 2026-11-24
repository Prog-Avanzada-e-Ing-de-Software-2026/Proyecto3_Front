import { hasPermission } from './hasPermission';
import type { Permission, UsuarioConPermisos } from './permissions';

export function hasRequiredPermissions(
  user: UsuarioConPermisos | null,
  requiredPermissions: readonly Permission[] = [],
): boolean {
  return requiredPermissions.every((permission) =>
    hasPermission(user, permission),
  );
}
