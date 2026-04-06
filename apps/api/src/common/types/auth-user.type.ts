export type AuthUser = {
  sub: string;
  email?: string;
  name?: string;
  roles: string[];
  employeeId?: string | null;
  branchId?: string | null;
  zoneCode?: string | null;
  portalAccess?: string[];
  deviceId?: string | null;
};
