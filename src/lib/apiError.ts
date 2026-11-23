import { AxiosError, isAxiosError } from 'axios';

const NO_RESPONSE_STATUS = 0;

interface DetalleValidacion {
  campo: string;
  mensaje: string;
}

interface BackendErrorBody {
  statusCode: number;
  code: string;
  message: string;
  requestId: string;
  errores?: DetalleValidacion[];
}

interface ApiErrorOptions {
  kind?: 'http' | 'network' | 'timeout' | 'unexpected';
  code?: string;
  requestId?: string;
  details?: DetalleValidacion[];
}

export class ApiError extends Error {
  readonly status: number;
  readonly kind: NonNullable<ApiErrorOptions['kind']>;
  readonly code?: string;
  readonly requestId?: string;
  readonly details: DetalleValidacion[];

  constructor(
    message: string,
    status: number,
    {
      kind = 'unexpected',
      code,
      requestId,
      details = [],
    }: ApiErrorOptions = {},
  ) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.kind = kind;
    this.code = code;
    this.requestId = requestId;
    this.details = details;
  }
}

export function toApiError(error: unknown): ApiError {
  if (error instanceof ApiError) return error;

  if (!isAxiosError<BackendErrorBody>(error)) {
    return new ApiError('Ocurrió un error inesperado', NO_RESPONSE_STATUS);
  }

  if (error.response) {
    const { status, data } = error.response;
    return new ApiError(
      typeof data?.message === 'string' ? data.message : 'Error del servidor',
      status,
      {
        kind: 'http',
        code: data?.code,
        requestId: data?.requestId,
        details: Array.isArray(data?.errores) ? data.errores : undefined,
      },
    );
  }

  // Tanto el timeout como el fallo de conexión carecen de estado HTTP. Solo se reintenta el segundo.
  if (
    error.code === AxiosError.ECONNABORTED ||
    error.code === AxiosError.ETIMEDOUT
  ) {
    return new ApiError(
      'El servidor tardó demasiado en responder',
      NO_RESPONSE_STATUS,
      {
        kind: 'timeout',
      },
    );
  }

  if (error.code === AxiosError.ERR_NETWORK) {
    return new ApiError(
      'No se pudo conectar con el servidor',
      NO_RESPONSE_STATUS,
      {
        kind: 'network',
      },
    );
  }

  return new ApiError('Ocurrió un error inesperado', NO_RESPONSE_STATUS);
}
