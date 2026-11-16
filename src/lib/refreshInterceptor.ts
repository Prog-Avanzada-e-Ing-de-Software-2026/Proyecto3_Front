import type { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from 'axios';

// InternalAxiosRequestConfig es el tipo que usa Axios para la configuración de un request
// (url, método, headers, body...). Axios no tiene un campo para "ya reintenté este request",
// así que lo agregamos nosotros: `_retry` (el guion bajo indica que es de uso interno).
// Sirve para reintentar cada request UNA sola vez: sin esa marca, si el reintento también
// devolviera 401 se pediría otro refresh y otro reintento, en bucle infinito.
type RetriableConfig = InternalAxiosRequestConfig & { _retry?: boolean };

interface RefreshOptions {
  refreshUrl: string;
  skipUrls: readonly string[]; // URLs cuyo 401 NO debe disparar un refresh (login, el propio refresh, logout).
  onRefreshFailed: () => void;
}

export function setupRefreshInterceptor(
  instance: AxiosInstance,
  { refreshUrl, skipUrls, onRefreshFailed }: RefreshOptions,
): void {
  // Guarda el refresh que está "en vuelo". Es null cuando no hay ninguno en curso.
  let refreshing: Promise<void> | null = null;

  // Por qué se comparte: si el token vence y la pantalla dispara 3 requests a la vez, los 3
  // reciben 401. Sin esto se harían 3 refresh en paralelo; y si el back rota los refresh
  // tokens (cada uno sirve una sola vez), el 2do y el 3ro fallarían y echarían al usuario.
  const refresh = (): Promise<void> => {
    // El primer 401 crea la promesa; los demás encuentran que ya existe y esperan a la misma.
    refreshing ??= instance
      .post(refreshUrl)
      .then(
        () => undefined, // refresh OK: no hace falta devolver nada, la cookie ya quedó guardada
        (error: unknown) => {
          onRefreshFailed(); // se avisa acá, así ocurre una sola vez y no por cada request
          throw error; // y se relanza para que los que esperan sepan que falló
        },
      )
      .finally(() => {
        refreshing = null; // libera el "candado": el próximo vencimiento hará un refresh nuevo
      });
    return refreshing; // Devuelve la promesa para que quien llamó pueda esperarla con `await refresh()`.
  };

  // `use(undefined, fn)`: no tocamos las respuestas exitosas; `fn` se ejecuta sólo con errores.
  instance.interceptors.response.use(undefined, async (error: AxiosError) => {
    // `error.config` es el request que falló; lo necesitamos para poder repetirlo.
    const original = error.config as RetriableConfig | undefined;

    // Sólo nos interesa el 401. Cualquier otro error pasa de largo.
    if (error.response?.status !== 401 || !original) return Promise.reject(error);

    // No se refresca si ya se reintentó este request o si es una URL excluida.
    if (original._retry || skipUrls.includes(original.url ?? '')) return Promise.reject(error);

    original._retry = true; // marca: este request ya tuvo su única oportunidad de reintento

    try {
      await refresh(); // espera a que la sesión se renueve (o se una al refresh en curso)
    } catch {
      return Promise.reject(error); // no se pudo renovar: se devuelve el 401 original
    }

    return instance(original); // repite el request original con la sesión renovada
  });
}