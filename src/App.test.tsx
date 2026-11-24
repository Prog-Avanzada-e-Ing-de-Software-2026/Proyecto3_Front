import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router';
import { describe, expect, it, vi } from 'vitest';
import App from './App';
import { RequirePermissions } from './app/guards/RequirePermissions';
import { AuthContext } from './features/auth/context/AuthContext';
import { AuthProvider } from './features/auth/context/AuthProvider';
import { api } from './lib/api';
import { ApiError } from './lib/apiError';

const user = {
  id: 1,
  email: 'alumno@example.test',
  rol: 'alumno',
  permisos: [],
};

function renderApp(
  path: string,
  session: Partial<React.ContextType<typeof AuthContext>> = {},
) {
  return render(
    <AuthContext
      value={{
        user,
        isLoading: false,
        error: null,
        updateSession: vi.fn<() => void>(),
        ...session,
      }}
    >
      <MemoryRouter initialEntries={[path]}>
        <App />
      </MemoryRouter>
    </AuthContext>,
  );
}

describe('application navigation', () => {
  it('redirects an anonymous account visit to login', async () => {
    const get = vi
      .spyOn(api, 'get')
      .mockRejectedValue(new ApiError('Sesión ausente', 401, { kind: 'http' }));
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });

    try {
      render(
        <QueryClientProvider client={queryClient}>
          <MemoryRouter initialEntries={['/mi-cuenta']}>
            <AuthProvider>
              <App />
            </AuthProvider>
          </MemoryRouter>
        </QueryClientProvider>,
      );

      expect(get).toHaveBeenCalledWith('/auth/me', expect.anything());
      expect(
        await screen.findByRole('heading', { name: 'Iniciar sesión' }),
      ).toBeVisible();
      expect(screen.queryByRole('alert')).toBeNull();
    } finally {
      get.mockRestore();
    }
  });

  it('keeps private navigation unavailable during session verification', () => {
    renderApp('/', { user: null, isLoading: true });
    expect(screen.getByRole('status')).toHaveTextContent('Comprobando sesión');
    expect(screen.queryByRole('navigation')).toBeNull();
  });

  it('reports a session error without showing login', () => {
    renderApp('/', { user: null, error: new Error('offline') });
    expect(screen.getByRole('alert')).toHaveTextContent(
      'No se pudo comprobar la sesión',
    );
    expect(
      screen.queryByRole('heading', { name: 'Iniciar sesión' }),
    ).toBeNull();
  });

  it('shows Inicio as the current link and leaves pending destinations unavailable', () => {
    renderApp('/');
    expect(screen.getByRole('heading', { name: 'Inicio' })).toBeVisible();
    expect(screen.getByRole('link', { name: 'Inicio' })).toHaveAttribute(
      'aria-current',
      'page',
    );
    expect(screen.queryByRole('link', { name: 'Entrenar' })).toBeNull();
    expect(screen.getByText('No hay secciones disponibles.')).toBeVisible();
  });

  it('lets an authenticated user open Mi cuenta with the keyboard and keeps navigation mounted', async () => {
    renderApp('/');
    const navigation = screen.getByRole('navigation');
    const keyboard = userEvent.setup();
    await keyboard.tab();
    expect(screen.getByRole('link', { name: 'Mi cuenta' })).toHaveFocus();
    await keyboard.keyboard('{Enter}');
    expect(
      await screen.findByRole('heading', { name: 'Mi cuenta' }),
    ).toBeVisible();
    expect(screen.getByText(user.email)).toBeVisible();
    expect(screen.getByText(user.rol)).toBeVisible();
    expect(screen.getByRole('navigation')).toBe(navigation);
    expect(screen.getByRole('link', { name: 'Inicio' })).not.toHaveAttribute(
      'aria-current',
    );
  });

  it('returns to Inicio when a private destination is pending its access contract', async () => {
    renderApp('/entrenar');
    expect(
      await screen.findByRole('heading', { name: 'Inicio' }),
    ).toBeVisible();
  });

  it.each([
    [undefined, [], 'Destino'],
    [[], [], 'Destino'],
    [['test:one', 'test:two'], ['test:one', 'test:two'], 'Destino'],
    [['test:one', 'test:two'], ['test:one'], 'Inicio'],
  ])(
    'checks declared permissions %j against %j',
    async (requiredPermissions, permisos, expected) => {
      render(
        <AuthContext
          value={{
            user: { ...user, permisos },
            isLoading: false,
            error: null,
            updateSession: vi.fn<() => void>(),
          }}
        >
          <MemoryRouter initialEntries={['/destino']}>
            <Routes>
              <Route path="/" element={<h1>Inicio</h1>} />
              <Route
                element={
                  <RequirePermissions
                    requiredPermissions={requiredPermissions}
                  />
                }
              >
                <Route path="/destino" element={<h1>Destino</h1>} />
              </Route>
            </Routes>
          </MemoryRouter>
        </AuthContext>,
      );
      expect(
        await screen.findByRole('heading', { name: expected }),
      ).toBeVisible();
    },
  );
});
