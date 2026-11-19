import { createContext } from 'react';
import type { SesionOtorgada } from '../auth.types';

interface AuthContextValue {
  user: SesionOtorgada | null;
  isLoading: boolean;
  error: Error | null;
}

// El primer null (en <...>) le dice a TypeScript que el contexto admite null.
// El segundo null (entre paréntesis) es lo que React entrega si no encuentra AuthProvider.
// Con el provider presente, React entrega { user, isLoading, error }.
// En ese objeto, user: null significa que todavía no hay un usuario disponible.
export const AuthContext = createContext<AuthContextValue | null>(null);
