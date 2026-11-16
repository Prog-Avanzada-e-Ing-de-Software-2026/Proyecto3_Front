import { isAxiosError } from 'axios';

/**
 * Los códigos HTTP (400, 401, 500...) sólo existen si el servidor llegó a responder.
 * Si la red está caída o se agotó el timeout no hay respuesta y, por lo tanto, no hay código.
 * Usamos 0 para ese caso (es la misma convención que usan los navegadores internamente) y
 * así `status` siempre es un number, sin tener que manejar null.
 */
const NO_RESPONSE_STATUS = 0;

/** Forma de los errores por defecto de NestJS. */
interface BackendErrorBody {
  // string: error común ("Credenciales inválidas").
  // string[]: errores de validación de DTO (class-validator), uno por campo inválido.
  message?: string | string[];
}

/**
 * Error único que ve el resto de la app: sin tipos de Axios ni detalles técnicos.
 *  - message: texto para mostrar al usuario.
 *  - status:  código HTTP, o 0 si no hubo respuesta.
 *  - details: lista de errores puntuales (validaciones), vacía si no aplica.
 */
export class ApiError extends Error {
  readonly status: number;
  readonly details: string[];

  constructor(message: string, status: number, details: string[] = []) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.details = details;
  }
}

export function toApiError(error: unknown): ApiError {
  if (error instanceof ApiError) return error; // ya convertido: no se vuelve a envolver

  if (!isAxiosError<BackendErrorBody>(error)) {
    return new ApiError('Ocurrió un error inesperado', NO_RESPONSE_STATUS);
  }
  if (error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT') {
    return new ApiError('El servidor tardó demasiado en responder', NO_RESPONSE_STATUS);
  }
  if (!error.response) {
    // El request salió pero no volvió nada: sin internet, back caído, CORS bloqueado...
    return new ApiError('No se pudo conectar con el servidor', NO_RESPONSE_STATUS);
  }

  const { status, data } = error.response;
  const raw = data?.message;

  // Ejemplo: el front manda un email inválido y NestJS (class-validator) responde 400 con
  //   { message: ["email must be an email", "password should not be empty"] }
  // Armamos un mensaje general y dejamos cada error puntual en `details`, para poder
  // mostrarlos uno por uno (por ejemplo, bajo cada campo del formulario).
  if (Array.isArray(raw)) {
    return new ApiError('Los datos enviados no son válidos', status, raw);
  }

  return new ApiError(raw ?? 'Error del servidor', status);
}