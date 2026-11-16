import axios, { type AxiosRequestConfig } from 'axios';
import { ApiError, toApiError } from './apiError';
import { setupRefreshInterceptor } from './refreshInterceptor';

const REQUEST_TIMEOUT_MS = 20_000;


const instance = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? '/api',
  timeout: REQUEST_TIMEOUT_MS,
  withCredentials: true, // el navegador guarda y envía la cookie de sesión
});

// Cuando el refresh falla, esta capa no decide qué hacer,guarda una función "callback" que otro
// módulo le registra con setSessionExpiredHandler(). Mientras nadie la registre vale null y avisar no hace nada.
let sessionExpiredHandler: (() => void) | null = null;
export function setSessionExpiredHandler(handler: (() => void) | null): void {
  sessionExpiredHandler = handler;
}

// ---------------------------------------------------------------------------------------
// Interceptor 1: renovar la sesión ante un 401-> El orden importa: este interceptor va primero porque necesita el error crudo de Axios. 
setupRefreshInterceptor(instance, {
  refreshUrl: '/auth/refresh',
  skipUrls: ['/auth/login', '/auth/refresh', '/auth/logout'],
  onRefreshFailed: () => sessionExpiredHandler?.(),
});

// Interceptor 2:`interceptors.response.use` recibe: manejo de respuestas exitosas  (undefined = dejarlas pasar tal cual), manejo de error (convertir a ApiError).
instance.interceptors.response.use(undefined, (error: unknown) => {
  const apiError = toApiError(error);
  if (import.meta.env.DEV && !(error instanceof ApiError)) console.error(apiError);
  return Promise.reject(apiError); //vuelve a lanzar el error ya convertido, para que quien llamó (el service, TanStack Query) reciba un ApiError y no un AxiosError.
});


// `config` es opcional y lo pasa quien llama sólo cuando lo necesita; la mayoría de las llamadas no lo usa.
/** Única puerta de salida HTTP. Devuelve directamente `data`, ya tipado. */
export const api = {
  get: <T>(url: string, config?: AxiosRequestConfig) =>
    instance.get<T>(url, config).then((res) => res.data),

  post: <T>(url: string, body?: unknown, config?: AxiosRequestConfig) =>
    instance.post<T>(url, body, config).then((res) => res.data),

  put: <T>(url: string, body?: unknown, config?: AxiosRequestConfig) =>
    instance.put<T>(url, body, config).then((res) => res.data),

  patch: <T>(url: string, body?: unknown, config?: AxiosRequestConfig) =>
    instance.patch<T>(url, body, config).then((res) => res.data),

  delete: <T = void>(url: string, config?: AxiosRequestConfig) =>
    instance.delete<T>(url, config).then((res) => res.data),
};