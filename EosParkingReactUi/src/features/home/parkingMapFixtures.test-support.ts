import type { ParkingMapPage } from './parkingMapService';

export function parkingMapFixture(overrides: Partial<ParkingMapPage> = {}): ParkingMapPage {
  return {
    parkingId: 7, sectionId: null, page: 1, pageSize: 20, totalCount: 21, totalPages: 2,
    unsectionedCount: 1, generatedAtUtc: '2026-11-03T10:00:00Z',
    sections: [{ id: 10, title: 'زون الف', spaceCount: 20 }],
    items: [{ id: 101, title: 'B4', floorId: 2, floorTitle: 'همکف', sectionId: 10, sectionTitle: 'زون الف', kindTitle: 'عمومی', isActive: true, isAssigned: true, occupancyStatus: 'Unknown' }],
    ...overrides,
  };
}
