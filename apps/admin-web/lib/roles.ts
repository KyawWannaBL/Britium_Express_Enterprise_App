export type AppRole =
  | "SYS"
  | "APP_OWNER"
  | "SUPER_ADMIN"
  | "OPERATIONS_ADMIN"
  | "FINANCE_USER"
  | "FINANCE_STAFF"
  | "MARKETING_ADMIN"
  | "HR_ADMIN"
  | "CUSTOMER_SERVICE"
  | "SUPERVISOR"
  | "WAREHOUSE_MANAGER"
  | "SUBSTATION_MANAGER"
  | "STAFF"
  | "DATA_ENTRY"
  | "RIDER"
  | "DRIVER"
  | "HELPER"
  | "MERCHANT"
  | "CUSTOMER"
  | "ADM"
  | "MGR"
  | "MER"
  | "CUR";

type RoleMatrix = Record<string, { level: "L0" | "L1" | "L2" | "L3" | "L4" | "L5"; scope: "S1" | "S2" | "S3" | "S4" | "S5"; permissions: string[] }>;

export const ROLE_MATRIX: RoleMatrix = {
  SYS: { level: "L5", scope: "S5", permissions: ["*"] },
  APP_OWNER: { level: "L5", scope: "S5", permissions: ["*"] },
  SUPER_ADMIN: { level: "L5", scope: "S5", permissions: ["*"] },

  OPERATIONS_ADMIN: { level: "L4", scope: "S4", permissions: ["OPS-*"] },
  FINANCE_USER: { level: "L3", scope: "S3", permissions: ["FIN-*"] },
  FINANCE_STAFF: { level: "L2", scope: "S3", permissions: ["FIN-*"] },
  MARKETING_ADMIN: { level: "L2", scope: "S2", permissions: ["MKT-*"] },
  HR_ADMIN: { level: "L2", scope: "S2", permissions: ["HR-*"] },
  CUSTOMER_SERVICE: { level: "L2", scope: "S2", permissions: ["SUP-*"] },

  SUPERVISOR: { level: "L2", scope: "S2", permissions: ["SUPV-*"] },
  WAREHOUSE_MANAGER: { level: "L2", scope: "S2", permissions: ["WH-*"] },
  SUBSTATION_MANAGER: { level: "L2", scope: "S2", permissions: ["BR-*"] },

  STAFF: { level: "L1", scope: "S1", permissions: ["STAFF-*"] },
  DATA_ENTRY: { level: "L1", scope: "S1", permissions: ["DE-*"] },

  RIDER: { level: "L1", scope: "S1", permissions: ["EXEC-*"] },
  DRIVER: { level: "L1", scope: "S1", permissions: ["EXEC-*"] },
  HELPER: { level: "L1", scope: "S1", permissions: ["EXEC-*"] },

  MERCHANT: { level: "L1", scope: "S1", permissions: ["MER-*"] },
  CUSTOMER: { level: "L0", scope: "S1", permissions: ["CUS-*"] },

  ADM: { level: "L4", scope: "S4", permissions: ["OPS-*"] },
  MGR: { level: "L4", scope: "S4", permissions: ["OPS-*"] },
  MER: { level: "L1", scope: "S1", permissions: ["MER-*"] },
  CUR: { level: "L0", scope: "S1", permissions: ["CUS-*"] },
};

const ROLE_ALIASES: Record<string, AppRole | "SYS" | "ADM" | "MGR" | "MER" | "CUR"> = {
  SUPER_A: "SUPER_ADMIN",
  SUPERADMIN: "SUPER_ADMIN",
  "SUPER-ADMIN": "SUPER_ADMIN",
  "SUPER ADMIN": "SUPER_ADMIN",
  SUPER_ADMIN: "SUPER_ADMIN",

  OWNER: "APP_OWNER",
  "APP OWNER": "APP_OWNER",

  ADMIN: "OPERATIONS_ADMIN",
  MANAGER: "OPERATIONS_ADMIN",
  OPERATIONS: "OPERATIONS_ADMIN",

  ACCOUNTANT: "FINANCE_STAFF",
  FINANCE: "FINANCE_USER",

  MARKETER: "MARKETING_ADMIN",
  "CUSTOMER SERVICE": "CUSTOMER_SERVICE",
  CUSTOMER_SUPPORT: "CUSTOMER_SERVICE",

  "WAREHOUSE STAFF": "WAREHOUSE_MANAGER",
  WAREHOUSE_STAFF: "WAREHOUSE_MANAGER",
  SUBSTATION: "SUBSTATION_MANAGER",

  OPS: "OPERATIONS_ADMIN",
  DISPATCHER: "SUPERVISOR",
  BRANCH_MANAGER: "SUBSTATION_MANAGER",
};

export const normalizeRole = (role: string | null | undefined) => {
  if (!role) return null;
  const clean = role
    .trim()
    .replace(/\s+/g, "_")
    .replace(/-+/g, "_")
    .toUpperCase();

  const lowered = role.trim().toLowerCase();
  const adminUsersMap: Record<string, AppRole> = {
    super_admin: "SUPER_ADMIN",
    admin: "OPERATIONS_ADMIN",
    manager: "OPERATIONS_ADMIN",
    supervisor: "SUPERVISOR",
    warehouse_staff: "WAREHOUSE_MANAGER",
    rider: "RIDER",
    accountant: "FINANCE_STAFF",
    marketer: "MARKETING_ADMIN",
    customer_service: "CUSTOMER_SERVICE",
    merchant: "MERCHANT",
    customer: "CUSTOMER",
    app_owner: "APP_OWNER",
    ops: "OPERATIONS_ADMIN",
    dispatcher: "SUPERVISOR",
    finance: "FINANCE_USER",
    branch_manager: "SUBSTATION_MANAGER",
  };
  if (adminUsersMap[lowered]) return adminUsersMap[lowered];

  if (ROLE_ALIASES[clean]) return ROLE_ALIASES[clean];

  return clean;
};

export const getEffectivePermissions = (role: string | null | undefined) => {
  const cleanRole = normalizeRole(role);
  if (!cleanRole) return [];

  if (cleanRole.startsWith("SYS") || cleanRole.startsWith("APP_OWNER") || cleanRole.startsWith("SUPER_ADMIN")) {
    return ["*"];
  }

  return ROLE_MATRIX[cleanRole]?.permissions || [];
};

export const checkPermission = (role: string | null | undefined, perm: string) => {
  const cleanRole = normalizeRole(role);
  if (!cleanRole) return false;

  if (cleanRole.startsWith("SYS") || cleanRole.startsWith("APP_OWNER") || cleanRole.startsWith("SUPER_ADMIN")) {
    return true;
  }

  const roleData = ROLE_MATRIX[cleanRole] ?? ROLE_MATRIX[cleanRole.split("_")[0]];
  return Boolean(roleData?.permissions?.includes(perm) || roleData?.permissions?.includes("*"));
};

export const isPrivilegedRole = (role: string | null | undefined) => {
  const cleanRole = normalizeRole(role);
  if (!cleanRole) return false;
  return ["SYS", "APP_OWNER", "SUPER_ADMIN", "OPERATIONS_ADMIN"].includes(cleanRole);
};


export function getRoleMeta(role: string | null | undefined) {
  const cleanRole = normalizeRole(role);
  if (!cleanRole) return null;
  return ROLE_MATRIX[cleanRole] ?? null;
}

export function canManageUsers(role: string | null | undefined) {
  const cleanRole = normalizeRole(role);
  return ["SYS", "APP_OWNER", "SUPER_ADMIN", "OPERATIONS_ADMIN", "HR_ADMIN"].includes(cleanRole ?? "");
}

export function getAssignableAppRoles(actorRole: string | null | undefined) {
  const cleanRole = normalizeRole(actorRole);
  const allRoles = [
    "SUPER_ADMIN",
    "OPERATIONS_ADMIN",
    "FINANCE_USER",
    "FINANCE_STAFF",
    "MARKETING_ADMIN",
    "HR_ADMIN",
    "CUSTOMER_SERVICE",
    "SUPERVISOR",
    "WAREHOUSE_MANAGER",
    "SUBSTATION_MANAGER",
    "STAFF",
    "DATA_ENTRY",
    "RIDER",
    "DRIVER",
    "HELPER",
    "MERCHANT",
    "CUSTOMER"
  ];

  if (cleanRole === "SYS" || cleanRole === "APP_OWNER" || cleanRole === "SUPER_ADMIN") {
    return allRoles;
  }

  if (cleanRole === "OPERATIONS_ADMIN" || cleanRole === "HR_ADMIN") {
    return allRoles.filter((role) => role !== "SUPER_ADMIN" && role !== "APP_OWNER" && role !== "SYS");
  }

  return [];
}

export function mapAppRoleToBranchRole(role: string | null | undefined) {
  const cleanRole = normalizeRole(role);
  switch (cleanRole) {
    case "SUPER_ADMIN":
    case "APP_OWNER":
    case "OPERATIONS_ADMIN":
    case "HR_ADMIN":
      return "admin";
    case "FINANCE_USER":
    case "FINANCE_STAFF":
      return "finance";
    case "SUPERVISOR":
      return "dispatcher";
    case "SUBSTATION_MANAGER":
    case "WAREHOUSE_MANAGER":
      return "branch_manager";
    default:
      return "ops";
  }
}
