import { afterEach, beforeEach, expect, it, vi } from 'vitest';

beforeEach(() => {
  vi.resetModules();
  vi.stubEnv('VITE_PARKING_SERVICE_URL', '');
});
afterEach(() => { vi.restoreAllMocks(); vi.unstubAllEnvs(); });
const json = (value: unknown) => new Response(JSON.stringify(value), { headers: { 'Content-Type': 'application/json' } });

it('keeps the default media override empty when the final runtime API differs from the compiled API', async () => {
  vi.stubEnv('VITE_API_BASE_URL', 'http://localhost:3001');
  const config = await import('./config');
  expect(config.appConfig.parkingServiceUrl).toBe('');
  vi.spyOn(globalThis, 'fetch')
    .mockResolvedValueOnce(json({ apiBaseUrl: '/backend' }))
    .mockResolvedValueOnce(json({ Values: { apiBaseUrl: 'http://localhost:8050' } }));
  await config.loadRuntimeConfig();
  expect(config.appConfig.apiBaseUrl).toBe('http://localhost:8050');
  expect(config.appConfig.parkingServiceUrl).toBe('');
});

it.each(['', '   '])('lets an explicitly blank runtime value override an old media environment value: %j', async parkingServiceUrl => {
  vi.stubEnv('VITE_PARKING_SERVICE_URL', 'http://localhost:3001');
  const config = await import('./config');
  vi.spyOn(globalThis, 'fetch')
    .mockResolvedValueOnce(json({ apiBaseUrl: '/backend', parkingServiceUrl }))
    .mockResolvedValueOnce(json({ Values: { Sso: {} } }));
  await config.loadRuntimeConfig();
  expect(config.appConfig.parkingServiceUrl).toBe('');
});

it('retains an explicitly configured separate media server with the existing runtime priority', async () => {
  const config = await import('./config');
  vi.spyOn(globalThis, 'fetch')
    .mockResolvedValueOnce(json({ apiBaseUrl: '/backend', parkingServiceUrl: 'http://localhost:8051' }))
    .mockResolvedValueOnce(json({ Values: { ParkingServiceUrl: ' http://localhost:8052/ ' } }));
  await config.loadRuntimeConfig();
  expect(config.appConfig.parkingServiceUrl).toBe('http://localhost:8052/');
});
