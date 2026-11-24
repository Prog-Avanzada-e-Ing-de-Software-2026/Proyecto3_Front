import { api } from '../../../lib/api';
import { ApiError } from '../../../lib/apiError';
import type { LoginCredentials, SesionOtorgada } from '../auth.types';

export const authService = {
  /** Pasar la respuesta a `updateSession` de `useAuth` para actualizar la sesión de la app. */
  login(credentials: LoginCredentials): Promise<SesionOtorgada> {
    return api.post<SesionOtorgada>('/auth/login', credentials);
  },

  // La señal viene de TanStack Query. api.get ya reenvía { signal } a Axios, que cancela la petición si recibe el aviso.
  async me(signal?: AbortSignal): Promise<SesionOtorgada | null> {
    try {
      return await api.get<SesionOtorgada>('/auth/me', { signal });
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) return null;
      throw error;
    }
  },
};
