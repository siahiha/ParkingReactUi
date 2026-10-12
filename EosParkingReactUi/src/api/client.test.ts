import { afterEach, describe, expect, it, vi } from 'vitest';
import { ApiError, apiRequest } from './client';

describe('apiRequest', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('uses credentialed requests without exposing the authentication token to JavaScript', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { 'content-type': 'application/json' },
    }));

    await apiRequest<{ ok: boolean }>('api/example', { method: 'POST', body: '{}' });

    const request = fetchMock.mock.calls[0]?.[1];
    expect(new Headers(request?.headers).get('Accept')).toBe('application/json');
    expect(new Headers(request?.headers).get('Content-Type')).toBe('application/json');
    expect(new Headers(request?.headers).get('UserToken')).toBeNull();
    expect(request?.credentials).toBe('include');
  });

  it('returns text for non-JSON successful responses', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response('accepted', { status: 200 }));
    await expect(apiRequest<string>('health')).resolves.toBe('accepted');
  });

  it('normalizes non-2xx responses into ApiError', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(JSON.stringify({ code: 'NO_ACCESS' }), {
      status: 403,
      headers: { 'content-type': 'application/json' },
    }));
    await expect(apiRequest('secure')).rejects.toMatchObject({
      constructor: ApiError,
      status: 403,
      body: { code: 'NO_ACCESS' },
    });
  });
});
