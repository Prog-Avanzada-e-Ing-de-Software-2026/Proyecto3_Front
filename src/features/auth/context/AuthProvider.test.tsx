import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { api } from '../../../lib/api';
import { authService } from '../api/auth.service';
import { useAuth } from '../hooks/useAuth';
import { AuthProvider } from './AuthProvider';

afterEach(() => {
  vi.restoreAllMocks();
});

describe('AuthProvider', () => {
  it('uses the login response only after the caller updates the session', async () => {
    const credentials = {
      email: 'student@example.com',
      password: 'test-password',
    };
    const session = {
      id: 1,
      email: credentials.email,
      rol: 'alumno',
      permisos: [],
    };
    const get = vi.spyOn(api, 'get').mockResolvedValue(null);
    const post = vi.spyOn(api, 'post').mockResolvedValue(session);
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    queryClient.setQueryData(['plans'], [{ id: 42 }]);

    const { result } = renderHook(useAuth, {
      wrapper: ({ children }: { children: ReactNode }) => (
        <QueryClientProvider client={queryClient}>
          <AuthProvider>{children}</AuthProvider>
        </QueryClientProvider>
      ),
    });
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    const grantedSession = await authService.login(credentials);
    expect(post).toHaveBeenCalledWith('/auth/login', credentials);
    expect(result.current.user).toBeNull();

    act(() => result.current.updateSession(grantedSession));
    await waitFor(() => expect(result.current.user).toEqual(session));
    expect(queryClient.getQueryData(['plans'])).toBeUndefined();
    expect(get).toHaveBeenCalledTimes(1);
  });
});
