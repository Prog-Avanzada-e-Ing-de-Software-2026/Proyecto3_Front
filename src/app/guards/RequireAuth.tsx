import { Navigate, Outlet } from 'react-router';
import { useAuth } from '../../features/auth/hooks/useAuth';

export function RequireAuth() {
  const { user, isLoading, error } = useAuth();

  if (isLoading)
    return <output className="block p-6">Comprobando sesión…</output>;
  if (error)
    return (
      <p role="alert" className="p-6">
        No se pudo comprobar la sesión. Volvé a cargar la página para
        reintentar.
      </p>
    );
  return user ? <Outlet /> : <Navigate to="/login" replace />;
}
