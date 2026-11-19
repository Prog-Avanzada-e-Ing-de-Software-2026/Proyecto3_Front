import { useCallback, useEffect, type ReactNode } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { setSessionExpiredHandler } from '../../../lib/api';
import { authService, setLoginSuccessHandler } from '../api/auth.service';
import type { SesionOtorgada } from '../auth.types';
import { AuthContext } from './AuthContext';

// Identifica la respuesta de /auth/me dentro de la caché.
const sessionKey = ['auth', 'session'] as const;

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  // main.tsx monta este provider al abrir o recargar la app. Aquí se comprueba la sesión con /auth/me.
  // isPending indica que todavía no tenemos un resultado inicial. error viene de esa consulta.
  const { data, error, isPending } = useQuery({
    queryKey: sessionKey,
    queryFn: ({ signal }) => authService.me(signal),
    // La sesión se consulta al arrancar. Axios ya gestiona la renovación ante un 401.
    staleTime: Infinity,
    retry: false,
  });

  const updateSession = useCallback(
    (session: SesionOtorgada | null) => {
      // Una respuesta pendiente, incluida la de /auth/me, podría traer datos de la cuenta anterior.
      void queryClient.cancelQueries();
      queryClient.setQueryData(sessionKey, session);
      const sessionQuery = queryClient
        .getQueryCache()
        .find({ queryKey: sessionKey, exact: true });
      queryClient.removeQueries({
        // Las otras consultas pueden contener datos privados, como los planes de la cuenta anterior.
        // Conservamos la consulta de sesión porque useQuery lee de ahí el usuario actualizado.
        predicate: (query) => query !== sessionQuery,
      });
    },
    [queryClient],
  );

  useEffect(() => {
    // Registramos dos avisos: el login guarda el usuario y la expiración deja la sesión en null.
    setLoginSuccessHandler(updateSession);
    setSessionExpiredHandler(() => updateSession(null));
    // El return entrega la función sin ejecutarla. React la llama al desmontar
    // o antes de volver a ejecutar el efecto, por ejemplo al verificarlo en StrictMode.
    return () => {
      setLoginSuccessHandler(null);
      setSessionExpiredHandler(null);
    };
  }, [updateSession]);

  return (
    <AuthContext
      value={{
        user: error ? null : (data ?? null),
        isLoading: isPending,
        error,
      }}
    >
      {children}
    </AuthContext>
  );
}
