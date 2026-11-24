import { AxiosError } from 'axios';
import type { AxiosAdapter, AxiosResponse } from 'axios';
import { afterEach, describe, expect, it, vi } from 'vitest';

afterEach(() => {
  vi.unstubAllEnvs();
  vi.restoreAllMocks();
  vi.resetModules();
});

describe('api', () => {
  it.each([
    [undefined, '/api/auth/me'],
    ['', '/api/auth/me'],
    ['https://backend.example/api', 'https://backend.example/api/auth/me'],
  ])(
    'resolves the session URL with VITE_API_URL=%s',
    async (baseUrl, expectedUrl) => {
      vi.stubEnv('VITE_API_URL', baseUrl);
      const [{ default: axios }, { api }] = await Promise.all([
        import('axios'),
        import('./api'),
      ]);
      const adapter: AxiosAdapter = async (config) => ({
        data: { url: axios.getUri(config), timeout: config.timeout },
        status: 200,
        statusText: 'OK',
        headers: {},
        config,
      });

      await expect(api.get('/auth/me', { adapter })).resolves.toEqual({
        url: expectedUrl,
        timeout: 10_000,
      });
    },
  );

  it('preserves the validation code, request ID and field details from a 400 response', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
    const { api } = await import('./api');
    const body = {
      statusCode: 400,
      code: 'SOLICITUD_INVALIDA',
      message: 'La solicitud no es válida.',
      requestId: 'request-1',
      errores: [{ campo: 'email', mensaje: 'Ingresá un email válido.' }],
    };
    const adapter: AxiosAdapter = async (config) => {
      const response: AxiosResponse = {
        data: body,
        status: 400,
        statusText: 'Bad Request',
        headers: {},
        config,
      };
      throw new AxiosError(
        'Bad Request',
        'ERR_BAD_REQUEST',
        config,
        undefined,
        response,
      );
    };

    await expect(
      api.post('/auth/login', {}, { adapter }),
    ).rejects.toMatchObject({
      name: 'ApiError',
      status: 400,
      code: body.code,
      message: body.message,
      requestId: body.requestId,
      details: body.errores,
    });
  });
});
