import { apiRequest, encryptLegacyPassword } from './client';

type ApiPayload = Record<string, unknown>;

/**
 * Endpoint ownership for the current parking-management UI.
 * UI components must call these feature-oriented operations instead of fetch/apiRequest directly.
 */
export const parkingApi = {
  list: () => apiRequest<unknown>('api/Parking/Get'),
  getById: (parkingId: number) => apiRequest<unknown>(`api/Parking/Get?id=${parkingId}`),
  save: (payload: ApiPayload) => apiRequest<unknown>('api/Parking/Save', { method: 'POST', body: JSON.stringify(payload) }),
  remove: (parkingId: number) => apiRequest<unknown>(`api/Parking/Delete?id=${parkingId}`),
  getDoors: (parkingId: number) => apiRequest<unknown>(`api/Parking/GetParkingDoors?parkingId=${parkingId}`),
};

export const userApi = {
  list: () => apiRequest<unknown>('api/user/Get'),
  getAccessLevels: () => apiRequest<unknown>('api/AccessLevel/Get'),
  save: (payload: ApiPayload) => apiRequest<unknown>('api/user/Save', { method: 'POST', body: JSON.stringify(payload) }),
  remove: (userId: number) => apiRequest<unknown>(`api/user/Delete?id=${userId}`),
  changePassword: (user: { id: number; userName: string }, currentPassword: string, nextPassword: string) => apiRequest<unknown>('api/user/Save', {
    method: 'POST',
    body: JSON.stringify({
      Id: user.id,
      UserName: user.userName,
      UserPass: encryptLegacyPassword(currentPassword),
      NewPass: encryptLegacyPassword(nextPassword),
      UserPassEncrypted: true,
    }),
  }),
};

export const accessLevelApi = {
  list: () => apiRequest<unknown>('api/AccessLevel/Get'),
  getAccessList: () => apiRequest<unknown>('api/AccessLevel/GetAccessList'),
  save: (payload: ApiPayload) => apiRequest<unknown>('api/AccessLevel/Save', { method: 'POST', body: JSON.stringify(payload) }),
  remove: (accessLevelId: number) => apiRequest<unknown>(`api/AccessLevel/Delete?id=${accessLevelId}`),
};

export const definitionApi = {
  get: (path: string) => apiRequest<unknown>(path),
  save: (path: string, payload: ApiPayload) => apiRequest<unknown>(path, { method: 'POST', body: JSON.stringify(payload) }),
  remove: (path: string) => apiRequest<unknown>(path, { method: 'GET' }),
  getParkingSpaceKinds: (parkingId: number) => apiRequest<unknown>(`api/Parking/GetParkingParkSpaceKinds?parkingId=${parkingId}`),
  getParkingFloors: (parkingId: number) => apiRequest<unknown>(`api/Parking/GetParkingFloors?parkingId=${parkingId}`),
  getParkingFloor: (floorId: number) => apiRequest<unknown>(`api/Parking/GetParkingFloorById?Id=${floorId}`),
  getUnsectionedParkingSpaces: (floorId: number) => apiRequest<unknown>(`api/Parking/GetParkingUnSectionParkSpaces?parkingFloorId=${floorId}`),
  checkUsedParkingSpaces: (spaces: ApiPayload[]) => apiRequest<unknown>('api/Parking/CheckUsedParkingSpace', { method: 'POST', body: JSON.stringify(spaces) }),
};

export const trafficApi = {
  getExitPermissions: (doorId: number, options: { status: 'pending' | 'approved' | 'all'; startDate: string; endDate: string }) => {
    const setPermission = options.status === 'all' ? '' : `&setPermission=${options.status === 'approved'}`;
    const dateFilter = `${options.startDate ? `&beginDateTime=${encodeURIComponent(`${options.startDate}T00:00:00`)}` : ''}${options.endDate ? `&endDateTime=${encodeURIComponent(`${options.endDate}T23:59:59`)}` : ''}`;
    return apiRequest<unknown>(`api/traffic/GetPermissions?doorId=${doorId}&carExited=false${setPermission}${dateFilter}`);
  },
  updateExitPermission: (dumpId: number, allowed: boolean, userId: number) => apiRequest<unknown>(`api/traffic/TrafficDumpUpdatePermission?dumpID=${dumpId}&exitPermission=${allowed}&exitPermissionPersistBy=${userId}`, { method: 'GET' }),
};
