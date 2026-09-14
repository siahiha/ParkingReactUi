export type HomeUser = {
  id: number;
  userName: string;
  currentParking: number;
  userType?: number;
  permissions: string[];
  permissionPart1?: string;
  permissionPart2?: string;
  legacyAccessLevelId?: number;
  canManageDashboard: boolean;
};

export type ThemeMode = 'light' | 'dark';
