import { Navigate, Route, Routes } from 'react-router';
import { RequireAuth } from './app/guards/RequireAuth';
import { RequireRole } from './app/guards/RequireRole';
import { AppLayout } from './app/layouts/AppLayout';
import { AuthLayout } from './app/layouts/AuthLayout';
import {
  getVisibleDestinations,
  navigationByRole,
} from './app/routes/navigation';
import { useAuth } from './features/auth/hooks/useAuth';
import { LoginPage } from './features/auth/pages/LoginPage';
import { MiCuentaPage } from './features/auth/pages/MiCuentaPage';
import { HomePage } from './features/inicio/pages/HomePage';

function HomeRoute() {
  const { user } = useAuth();
  const destinations = getVisibleDestinations(user).filter(
    ({ path }) => path !== '/',
  );

  return <HomePage destinations={destinations} />;
}

export default function App() {
  return (
    <Routes>
      {/* El inicio de sesión usa su propio layout y queda fuera de RequireAuth. */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<LoginPage />} />
      </Route>
      {/* RequireAuth comprueba la sesión antes de montar el layout principal. */}
      <Route element={<RequireAuth />}>
        <Route element={<AppLayout />}>
          <Route index element={<HomeRoute />} />
          <Route path="/mi-cuenta" element={<MiCuentaPage />} />
          {/* Agrupa las rutas por rol y comprueba el acceso con RequireRole. */}
          {navigationByRole.map(({ role, destinations }) => (
            <Route key={role} element={<RequireRole role={role} />}>
              {/* Crea una ruta hija por cada destino del rol. */}
              {destinations.map(({ path, label }) => (
                <Route
                  key={path}
                  path={path}
                  element={
                    <>
                      <h1 className="mb-5 text-2xl font-bold">{label}</h1>
                      <p className="text-muted">
                        Esta sección estará disponible próximamente.
                      </p>
                    </>
                  }
                />
              ))}
            </Route>
          ))}
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
