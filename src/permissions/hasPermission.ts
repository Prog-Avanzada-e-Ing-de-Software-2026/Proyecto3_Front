import type { Permission, UsuarioConPermisos } from './permissions';

export function hasPermission(
  user: UsuarioConPermisos | null,
  permission: Permission,
): boolean {
  return user?.permisos.includes(permission) ?? false;
}
