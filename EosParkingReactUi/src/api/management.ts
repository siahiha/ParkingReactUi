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
  getDoorsLive: (parkingId: number) => apiRequest<unknown>(`api/Parking/GetParkingDoorsLive?parkingId=${parkingId}`),
  getMonitoringTraffics: (parkingId: number, count: number, trafficType: number, doorIds: number[], startDateTime = '') => {
    const params = new URLSearchParams({ parkingId: String(parkingId), Count: String(count), trafficType: String(trafficType), startDateTime });
    doorIds.forEach((doorId) => params.append('doorIds', String(doorId)));
    return apiRequest<unknown>(`api/Traffic/GetMonitoringTraffics?${params.toString()}`);
  },
  /** Returns only parking spaces that are not currently assigned to a member. */
  listAvailableParkSpaces: (parkingId: number) => apiRequest<unknown>(`api/Parking/GetParkingParkSpacesById?parkingId=${parkingId}`),
  getEquipments: (parkingId: number) => apiRequest<unknown>(`api/Parking/GetParkingEquipments?parkingId=${parkingId}`),
  saveEquipment: (payload: ApiPayload) => apiRequest<unknown>('api/Parking/SaveParkingEquipment', { method: 'POST', body: JSON.stringify(payload) }),
  deleteEquipment: (equipmentId: number) => apiRequest<unknown>(`api/Parking/DeleteEquipmentById?id=${equipmentId}`),
};

/** ANPR operations mirrored from MonitoringAnprForm. The response DTO is still
 * owned by Backend, therefore the feature validates/normalizes it at its UI boundary. */
export const anprApi = {
  listRecent: (isEosAnpr: boolean) => apiRequest<unknown>(`api/Anpr/GetAnprRecordWithPicTop20LastHour?isEosAnpr=${isEosAnpr}`),
  getLastId: (isEosAnpr: boolean) => apiRequest<unknown>(`api/Anpr/GetLastMaxAnprId?isEosAnpr=${isEosAnpr}`),
  deleteOldPictures: (isEosAnpr: boolean) => apiRequest<unknown>(`api/Anpr/DeleteOldAnprPics?isEosAnpr=${isEosAnpr}`),
  listMemberPlates: () => apiRequest<unknown>('api/Member/GetAllMembersPlates', { method: 'POST', body: 'null' }),
};

export type CameraStatusState = 'Disconnected' | 'Connecting' | 'Connected' | 'Failed' | 'Stopping';
export type CameraStatus = { cameraId: string; state: CameraStatusState; error: string | null; viewerCount: number; streamUrl: string; webRtcUrl?: string; lastStateChangeUtc: string };
export type Camera = { cameraId: string; name: string; rtspUrl?: string; enabled?: boolean };
export type CameraRoi = { id: string; cameraId: string; viewerId: string; text: string; color: string; x: number; y: number; width: number; height: number };

export const cameraApi = {
  connect: (camera: Camera, viewerId: string, streamMode: 'Hls' | 'WebRTC') => {
    const payload: Record<string, unknown> = { cameraId: camera.cameraId, viewerId, streamMode };
    // Keep backward compatibility for trusted callers that explicitly provide
    // an endpoint, while the normal UI flow sends only the camera id.
    if (camera.rtspUrl?.trim()) payload.rtspUrl = camera.rtspUrl.trim();
    return apiRequest<unknown>('api/rtspcamera/connect', { method: 'POST', body: JSON.stringify(payload) });
  },
  disconnect: (cameraId: string, viewerId: string) => apiRequest<void>(`api/rtspcamera/disconnect?cameraId=${encodeURIComponent(cameraId)}&viewerId=${encodeURIComponent(viewerId)}`, { method: 'POST' }),
  getStatus: (cameraId: string) => apiRequest<CameraStatus>(`api/rtspcamera/status?cameraId=${encodeURIComponent(cameraId)}`),
  getAllStatuses: () => apiRequest<CameraStatus[]>('api/rtspcamera/allstatuses'),
  getRois: (cameraId: string, viewerId: string) => apiRequest<CameraRoi[]>(`api/rtspcamera/rois?cameraId=${encodeURIComponent(cameraId)}&viewerId=${encodeURIComponent(viewerId)}`),
  saveRoi: (roi: Omit<CameraRoi, 'id'> & { id?: string }) => apiRequest<unknown>('api/rtspcamera/roi', { method: 'POST', body: JSON.stringify(roi) }),
  deleteRoi: (cameraId: string, roiId: string, viewerId: string) => apiRequest<void>(`api/rtspcamera/deleteroi?cameraId=${encodeURIComponent(cameraId)}&roiId=${encodeURIComponent(roiId)}&viewerId=${encodeURIComponent(viewerId)}`, { method: 'POST' }),
};

export const userApi = {
  list: () => apiRequest<unknown>('api/user/Get'),
  getWorkShifts: (doorId: number, startDate: string, endDate: string) => apiRequest<unknown>(`api/user/GetUserWorkShifts?doorId=${doorId}&startDate=${encodeURIComponent(startDate)}&endDate=${encodeURIComponent(endDate)}`),
  saveWorkShifts: (payload: ApiPayload[]) => apiRequest<unknown>('api/user/SaveUserWorkShifts', { method: 'POST', body: JSON.stringify(payload) }),
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

export const cardApi = {
  list: (parkingId: number) => apiRequest<unknown>(`api/Card/GetByParkingId?parkingId=${parkingId}`),
  saveAll: (cards: ApiPayload[]) => apiRequest<unknown>('api/Card/SaveAll', { method: 'POST', body: JSON.stringify(cards) }),
};

/** Membership endpoints mirrored from the Windows MemberForm workflow. */
export const memberApi = {
  list: (parkingId: number) => apiRequest<unknown>(`api/Member/GetByParkingId?parkingId=${parkingId}`),
  save: (payload: ApiPayload) => apiRequest<unknown>('api/Member/Save', { method: 'POST', body: JSON.stringify(payload) }),
  remove: (memberId: number) => apiRequest<unknown>(`api/Member/Delete?id=${memberId}`),
  listRegisterKinds: (parkingId: number) => apiRequest<unknown>(`api/Member/GetMemberRegisterKindsByParkingId?parkingId=${parkingId}`),
  previewRegistration: (payload: ApiPayload) => apiRequest<unknown>('api/Member/AddMemberRegister', { method: 'POST', body: JSON.stringify({ ...payload, DoSave: false }) }),
  saveRegistration: (payload: ApiPayload) => apiRequest<unknown>('api/Member/AddMemberRegister', { method: 'POST', body: JSON.stringify({ ...payload, DoSave: true }) }),
  cancelRegistration: (payload: ApiPayload) => apiRequest<unknown>('api/Member/MembershipCreditCancellation', { method: 'POST', body: JSON.stringify(payload) }),
  checkExternalMembers: (parkingId: number, members: ApiPayload[]) => apiRequest<unknown>(`api/Member/CheckingExternalMember/${parkingId}`, { method: 'POST', body: JSON.stringify(members) }),
  importExternalMembers: (parkingId: number, members: ApiPayload[]) => apiRequest<unknown>(`api/Member/ImportMembersExternalSource/${parkingId}`, { method: 'POST', body: JSON.stringify(members) }),
};

export const trafficApi = {
  getAllTraffics: (payload: ApiPayload) => apiRequest<unknown>('api/traffic/GetAllTraffics', { method: 'POST', body: JSON.stringify(payload) }),
  saveTraffic: (payload: ApiPayload) => apiRequest<unknown>('api/traffic/Save', { method: 'POST', body: JSON.stringify(payload) }),
  createManualDump: (params: { plate: string; parkingId: number; carType: number; enterDateTime: string | null; exitDateTime: string | null; doorId: number }) => {
    const query = new URLSearchParams({ plate: params.plate, parkingId: String(params.parkingId), carType: String(params.carType), enterDateTime: params.enterDateTime ?? 'null', exitDateTime: params.exitDateTime ?? 'null', doorId: String(params.doorId) });
    return apiRequest<unknown>(`api/traffic/CreateManualDump?${query.toString()}`);
  },
  getCarTrafficInfo: (parkingId: number, plate: string, memberCard: string, memberCode: string) => apiRequest<unknown>(`api/traffic/GetCarTrafficInfo?parkingId=${parkingId}&plate=${encodeURIComponent(plate)}&memberCard=${encodeURIComponent(memberCard)}&memberCode=${encodeURIComponent(memberCode)}`),
  deleteTraffic: (dumpId: number) => apiRequest<unknown>(`api/traffic/DeleteById?id=${dumpId}`),
  getMemberCurrentCreditInfo: (memberId: number) => apiRequest<unknown>(`api/traffic/GetMemberCurrentCreditInfo?memberId=${memberId}`),
  getExitPermissions: (doorId: number, options: { status: 'pending' | 'approved' | 'all'; startDate: string; endDate: string }) => {
    const setPermission = options.status === 'all' ? '' : `&setPermission=${options.status === 'approved'}`;
    const dateFilter = `${options.startDate ? `&beginDateTime=${encodeURIComponent(`${options.startDate}T00:00:00`)}` : ''}${options.endDate ? `&endDateTime=${encodeURIComponent(`${options.endDate}T23:59:59`)}` : ''}`;
    return apiRequest<unknown>(`api/traffic/GetPermissions?doorId=${doorId}&carExited=false${setPermission}${dateFilter}`);
  },
  updateExitPermission: (dumpId: number, allowed: boolean, userId: number) => apiRequest<unknown>(`api/traffic/TrafficDumpUpdatePermission?dumpID=${dumpId}&exitPermission=${allowed}&exitPermissionPersistBy=${userId}`, { method: 'GET' }),
};
