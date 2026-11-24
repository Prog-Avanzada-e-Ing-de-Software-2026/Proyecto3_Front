export interface SesionOtorgada {
  id: number;
  email: string;
  rol: string;
  permisos: string[];
}

export interface LoginCredentials {
  email: string;
  password: string;
}
