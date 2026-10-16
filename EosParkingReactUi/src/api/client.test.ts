import { afterEach, describe, expect, it, vi } from 'vitest';
import { ApiError, apiRequest, registerSessionInvalidationHandler } from './client';

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

  it('notifies the application when the backend returns HTTP 401', async () => {
    const handler = vi.fn();
    const unregister = registerSessionInvalidationHandler(handler);
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(null, { status: 401 }));

    await expect(apiRequest('api/parking/get')).rejects.toMatchObject({ status: 401 });

    expect(handler).toHaveBeenCalledWith('http-401');
    unregister();
  });

  it('treats ResponseResultType=11 in an HTTP 200 body as an expired session', async () => {
    const handler = vi.fn();
    const unregister = registerSessionInvalidationHandler(handler);
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(JSON.stringify({ ResponseResultType: 11, Message: 'Token expired' }), {
      status: 200,
      headers: { 'content-type': 'application/json' },
    }));

    await expect(apiRequest('api/parking/get')).rejects.toMatchObject({ status: 401, message: 'Token expired' });

    expect(handler).toHaveBeenCalledWith('response-result-type-11');
    unregister();
  });

  it('does not invalidate the session for a successful response', async () => {
    const handler = vi.fn();
    const unregister = registerSessionInvalidationHandler(handler);
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(JSON.stringify({ ResponseResultType: 1, Values: [] }), {
      status: 200,
      headers: { 'content-type': 'application/json' },
    }));

    await expect(apiRequest('api/parking/get')).resolves.toEqual({ ResponseResultType: 1, Values: [] });

    expect(handler).not.toHaveBeenCalled();
    unregister();
  });
});
