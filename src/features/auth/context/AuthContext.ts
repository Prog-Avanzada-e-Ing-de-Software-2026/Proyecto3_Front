import { createContext } from 'react';
import type { SesionOtorgada } from '../auth.types';

interface AuthContextValue {
  user: SesionOtorgada | null;
  isLoading: boolean;
  error: Error | null;
  updateSession: (session: SesionOtorgada | null) => void;
}

// Sin AuthProvider, el contexto es null. Con el provider, user: null indica que no hay un usuario disponible.
export const AuthContext = createContext<AuthContextValue | null>(null);
