import { api } from '../../../lib/api';
import { ApiError } from '../../../lib/apiError';
import type { LoginCredentials, SesionOtorgada } from '../auth.types';

let onLoginSuccess: ((session: SesionOtorgada) => void) | null = null;

// AuthProvider registra esta función al montarse para recibir la sesión sin que el servicio importe React.
export function setLoginSuccessHandler(handler: typeof onLoginSuccess): void {
  onLoginSuccess = handler;
}

export const authService = {
  async login(credentials: LoginCredentials): Promise<SesionOtorgada> {
    const session = await api.post<SesionOtorgada>('/auth/login', credentials);
    // El backend ya devolvió el usuario. Avisamos al provider sin volver a pedir /auth/me.
    onLoginSuccess?.(session);
    return session;
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
