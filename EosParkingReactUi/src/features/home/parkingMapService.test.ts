import { describe, expect, it } from 'vitest';
import { parseParkingMapUpdate } from './parkingMapService';
import { parkingMapFixture } from './parkingMapFixtures.test-support';
import fa from '../../locales/fa';
import en from '../../locales/en';

describe('parking-map response boundary', () => {
  it('accepts server casing and preserves assignment separately from occupancy', () => {
    const page = parkingMapFixture();
    const result = parseParkingMapUpdate({ RequestId: 'r1', Page: page }, 'r1', 7);
    expect(result?.items[0]).toMatchObject({ isAssigned: true, occupancyStatus: 'Unknown' });
  });

  it('ignores messages from an old request or another parking', () => {
    expect(parseParkingMapUpdate({ requestId: 'old', page: {} }, 'new', 7)).toBeNull();
    expect(parseParkingMapUpdate({ requestId: 'new', page: parkingMapFixture() }, 'new', 8)).toBeNull();
  });

  it('rejects oversized or inconsistent pages and fabricated occupancy', () => {
    for (const overrides of [{ pageSize: 100 }, { totalPages: 5 }, { page: 9 }]) {
      expect(() => parseParkingMapUpdate({ requestId: 'r', page: parkingMapFixture(overrides) }, 'r', 7)).toThrow();
    }
    const page = parkingMapFixture();
    expect(() => parseParkingMapUpdate({ requestId: 'r', page: { ...page, items: [{ ...page.items[0], occupancyStatus: 'Free' }] } }, 'r', 7)).toThrow();
  });

  it('provides matching nonempty Persian and English resources for every map state', () => {
    const keys = (value: object, prefix = ''): string[] => Object.entries(value).flatMap(([key, item]) => {
      const path = `${prefix}${key}`;
      if (typeof item === 'object' && item !== null) return keys(item, `${path}.`);
      expect(typeof item === 'string' && item.trim().length > 0).toBe(true);
      return [path];
    });
    expect(keys(fa.parkingMap).sort()).toEqual(keys(en.parkingMap).sort());
  });
});
