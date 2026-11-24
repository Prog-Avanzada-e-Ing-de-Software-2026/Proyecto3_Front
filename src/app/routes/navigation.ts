interface Destination {
  path: string;
  label: string;
}

const home: Destination = { path: '/', label: 'Inicio' };

export const navigationByRole = [
  {
    role: 'Alumno',
    destinations: [
      { path: '/entrenar', label: 'Entrenar' },
      { path: '/mi-plan', label: 'Mi plan' },
      { path: '/historial', label: 'Historial' },
      { path: '/seguimiento', label: 'Seguimiento' },
    ],
  },
  {
    role: 'Profesor',
    destinations: [
      { path: '/mis-alumnos', label: 'Mis alumnos' },
      {
        path: '/alumnos-sin-plan-o-por-vencer',
        label: 'Alumnos sin plan o por vencer',
      },
    ],
  },
  {
    role: 'Administrador',
    destinations: [
      { path: '/alumnos', label: 'Alumnos' },
      { path: '/profesores', label: 'Profesores' },
      { path: '/catalogo', label: 'Catálogo' },
    ],
  },
] as const;

// [number] toma cualquier entrada de la lista y ['role'] extrae su rol.
export type NavigationRole = (typeof navigationByRole)[number]['role'];

export function getVisibleDestinations(
  user: { rol: string } | null,
): Destination[] {
  if (!user) return [];

  const navigation = navigationByRole.find(({ role }) => role === user.rol);
  return [home, ...(navigation?.destinations ?? [])];
}
