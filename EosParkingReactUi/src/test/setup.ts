import '@testing-library/jest-dom/vitest';
import { beforeEach, vi } from 'vitest';

vi.stubEnv('VITE_LEGACY_ENCRYPTION_PASSWORD', 'test-only-key');
vi.stubEnv('VITE_LEGACY_ENCRYPTION_IV', '410D0D345025252F020278783B766161');

beforeEach(() => {
  window.localStorage.clear();
  window.sessionStorage.clear();
});
