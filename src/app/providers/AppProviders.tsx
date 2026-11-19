import type { ReactNode } from 'react';
import { BrowserRouter } from 'react-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '../../features/auth/context/AuthProvider';
import { ApiError } from '../../lib/apiError';

// Una sola caché compartida durante la vida de la app.
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60,
      // El estado 0 indica que no llegó una respuesta HTTP.
      retry: (failureCount, error) =>
        failureCount < 2 && error instanceof ApiError && error.status === 0,
      refetchOnWindowFocus: false,
    },
  },
});

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>{children}</AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
