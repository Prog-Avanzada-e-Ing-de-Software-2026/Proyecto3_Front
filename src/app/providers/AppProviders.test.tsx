import { useQuery } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import { AxiosError } from 'axios';
import { describe, expect, it, vi } from 'vitest';
import { toApiError } from '../../lib/apiError';
import { AppProviders } from './AppProviders';

vi.mock('../../features/auth/api/auth.service', () => ({
  authService: { me: async () => null },
}));

describe('AppProviders query retry policy', () => {
  it.each([
    ['ECONNABORTED', 1],
    ['ETIMEDOUT', 1],
    ['ERR_NETWORK', 3],
    ['ERR_CANCELED', 1],
  ])('attempts a query with %s %i time(s)', async (code, attempts) => {
    const queryFn = vi.fn<() => Promise<never>>(async () => {
      throw toApiError(new AxiosError('Request failed', code));
    });

    function QueryStatus() {
      const { isError } = useQuery({
        queryKey: ['retry-policy', code],
        queryFn,
        retryDelay: 0,
      });
      return <output>{isError ? 'Error' : 'Consultando'}</output>;
    }

    render(
      <AppProviders>
        <QueryStatus />
      </AppProviders>,
    );

    await screen.findByText('Error');
    expect(queryFn).toHaveBeenCalledTimes(attempts);
  });
});
