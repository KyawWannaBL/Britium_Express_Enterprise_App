"use client";

export const STORAGE_KEY = "britium.account.control.store.v1";

export type AccountStatus =
  | "ACTIVE"
  | "PENDING"
  | "SUSPENDED"
  | "REJECTED"
  | "ARCHIVED";

export type Role =
  | "SYS"
  | "SUPER_ADMIN"
  | "ADMIN"
  | "ADM"
  | "APP_OWNER"
  | "SUPERVISOR"
  | "SUP"
  | "MGR"
  | "STAFF"
  | "FINANCE"
  | "CUSTOMER_SERVICE"
  | "MARKETING"
  | "WAREHOUSE_CONTROLLER"
  | "DATA_ENTRY"
  | "RID"
  | string;

export type PermissionCode =
  | "USER_READ"
  | "USER_CREATE"
  | "USER_APPROVE"
  | "USER_REJECT"
  | "USER_ROLE_EDIT"
  | "USER_BLOCK"
  | "AUDIT_READ"
  | "CSV_EXPORT"
  | "CSV_IMPORT"
  | "BULK_ACTIONS"
  | "PORTAL_DASHBOARD"
  | "PORTAL_BRANCH"
  | "PORTAL_WAREHOUSE"
  | "PORTAL_FINANCE"
  | "PORTAL_CUSTOMER_SERVICE"
  | "PORTAL_MARKETING"
  | "PORTAL_SETTINGS";

export type ApprovalState = {
  requestedAt: string;
  requestedBy: string;
  processedAt?: string;
  processedBy?: string;
  decision?: "APPROVED" | "REJECTED";
  note?: string;
};

export type Account = {
  id: string;
  name: string;
  email: string;
  role: Role;
  status: AccountStatus;
  department?: string;
  phone?: string;
  employeeId?: string;
  createdAt: string;
  createdBy: string;
  approval?: ApprovalState;
  security?: {
    blockedAt?: string;
    blockedBy?: string;
  };
};

export type PermissionDefinition = {
  code: PermissionCode;
  en: string;
  mm: string;
};

export type Grant = {
  id: string;
  subjectEmail: string;
  permission: PermissionCode;
  grantedAt: string;
  grantedBy: string;
  revokedAt?: string;
  revokedBy?: string;
};

export type AuthorityRequest = {
  id: string;
  subjectEmail: string;
  type: "GRANT" | "REVOKE";
  permission: PermissionCode;
  status: "PENDING" | "APPROVED" | "REJECTED";
  requestedBy: string;
  requestedAt: string;
  requestNote?: string;
  processedBy?: string;
  processedAt?: string;
  processedNote?: string;
};

export type AuditEvent = {
  id: string;
  actorEmail: string;
  action: string;
  targetEmail?: string;
  detail?: string;
  at: string;
};

export type AccountControlStore = {
  accounts: Account[];
  grants: Grant[];
  authorityRequests: AuthorityRequest[];
  audit: AuditEvent[];
};

export const DEFAULT_ROLES: Role[] = [
  "SYS",
  "SUPER_ADMIN",
  "ADMIN",
  "SUPERVISOR",
  "FINANCE",
  "CUSTOMER_SERVICE",
  "MARKETING",
  "WAREHOUSE_CONTROLLER",
  "DATA_ENTRY",
  "STAFF",
];

export const PERMISSIONS: PermissionDefinition[] = [
  { code: "USER_READ", en: "Read users", mm: "အသုံးပြုသူများကို ကြည့်ရှုမည်" },
  { code: "USER_CREATE", en: "Create users", mm: "အသုံးပြုသူ ဖန်တီးမည်" },
  { code: "USER_APPROVE", en: "Approve requests", mm: "တောင်းဆိုချက်များ အတည်ပြုမည်" },
  { code: "USER_REJECT", en: "Reject requests", mm: "တောင်းဆိုချက်များ ငြင်းပယ်မည်" },
  { code: "USER_ROLE_EDIT", en: "Edit roles", mm: "ရာထူးပြင်မည်" },
  { code: "USER_BLOCK", en: "Block accounts", mm: "အကောင့်ပိတ်မည်" },
  { code: "AUDIT_READ", en: "Read audit", mm: "audit ကြည့်မည်" },
  { code: "CSV_EXPORT", en: "Export CSV", mm: "CSV ထုတ်မည်" },
  { code: "CSV_IMPORT", en: "Import CSV", mm: "CSV သွင်းမည်" },
  { code: "BULK_ACTIONS", en: "Bulk actions", mm: "အုပ်စုလိုက်လုပ်ဆောင်မည်" },
  { code: "PORTAL_DASHBOARD", en: "Dashboard access", mm: "Dashboard ဝင်ခွင့်" },
  { code: "PORTAL_BRANCH", en: "Branch portal access", mm: "Branch portal ဝင်ခွင့်" },
  { code: "PORTAL_WAREHOUSE", en: "Warehouse access", mm: "Warehouse ဝင်ခွင့်" },
  { code: "PORTAL_FINANCE", en: "Finance access", mm: "Finance ဝင်ခွင့်" },
  { code: "PORTAL_CUSTOMER_SERVICE", en: "Customer service access", mm: "Customer service ဝင်ခွင့်" },
  { code: "PORTAL_MARKETING", en: "Marketing access", mm: "Marketing ဝင်ခွင့်" },
  { code: "PORTAL_SETTINGS", en: "Settings access", mm: "Settings ဝင်ခွင့်" },
];

const EMPTY_STORE: AccountControlStore = {
  accounts: [],
  grants: [],
  authorityRequests: [],
  audit: [],
};

export function uuid() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `id_${Math.random().toString(36).slice(2)}_${Date.now()}`;
}

export function nowIso() {
  return new Date().toISOString();
}

export function safeLower(value: unknown) {
  return String(value ?? "").toLowerCase().trim();
}

export function isEmailValid(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

export function csvStringify(rows: string[][]) {
  return rows
    .map((row) =>
      row
        .map((cell) => {
          const value = String(cell ?? "");
          if (/[,"\n]/.test(value)) {
            return `"${value.replace(/"/g, '""')}"`;
          }
          return value;
        })
        .join(","),
    )
    .join("\n");
}

export function csvParse(input: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let inQuotes = false;

  for (let i = 0; i < input.length; i += 1) {
    const ch = input[i];
    const next = input[i + 1];

    if (ch === '"') {
      if (inQuotes && next === '"') {
        cell += '"';
        i += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (ch === "," && !inQuotes) {
      row.push(cell);
      cell = "";
      continue;
    }

    if ((ch === "\n" || ch === "\r") && !inQuotes) {
      if (ch === "\r" && next === "\n") i += 1;
      row.push(cell);
      rows.push(row);
      row = [];
      cell = "";
      continue;
    }

    cell += ch;
  }

  row.push(cell);
  if (row.length > 1 || row[0] !== "") rows.push(row);
  return rows;
}

export function roleIsPrivileged(role?: Role) {
  const r = String(role ?? "").toUpperCase();
  return r === "SYS" || r === "SUPER_ADMIN" || r === "APP_OWNER";
}

function roleDefaults(role?: Role): PermissionCode[] {
  const r = String(role ?? "").toUpperCase();

  if (r === "SYS" || r === "SUPER_ADMIN" || r === "APP_OWNER") {
    return PERMISSIONS.map((p) => p.code);
  }

  if (r === "ADMIN" || r === "ADM") {
    return [
      "USER_READ",
      "USER_CREATE",
      "USER_APPROVE",
      "USER_REJECT",
      "USER_ROLE_EDIT",
      "USER_BLOCK",
      "AUDIT_READ",
      "CSV_EXPORT",
      "CSV_IMPORT",
      "BULK_ACTIONS",
      "PORTAL_DASHBOARD",
      "PORTAL_BRANCH",
      "PORTAL_FINANCE",
      "PORTAL_SETTINGS",
    ];
  }

  if (r === "SUPERVISOR" || r === "SUP" || r === "MGR") {
    return [
      "USER_READ",
      "AUDIT_READ",
      "CSV_EXPORT",
      "PORTAL_DASHBOARD",
      "PORTAL_BRANCH",
      "PORTAL_WAREHOUSE",
      "PORTAL_CUSTOMER_SERVICE",
      "PORTAL_MARKETING",
    ];
  }

  if (r === "FINANCE") return ["PORTAL_FINANCE", "CSV_EXPORT"];
  if (r === "CUSTOMER_SERVICE") return ["PORTAL_CUSTOMER_SERVICE", "CSV_EXPORT"];
  if (r === "MARKETING") return ["PORTAL_MARKETING", "CSV_EXPORT"];
  if (r === "WAREHOUSE_CONTROLLER") return ["PORTAL_WAREHOUSE", "CSV_EXPORT"];
  if (r === "DATA_ENTRY") return ["CSV_EXPORT"];

  return [];
}

export function defaultPortalPermissionsForRole(role?: Role): PermissionCode[] {
  return roleDefaults(role);
}

export function activeGrantsFor(grants: Grant[], email: string) {
  const target = safeLower(email);
  return grants.filter((g) => safeLower(g.subjectEmail) === target && !g.revokedAt);
}

export function getAccountByEmail(accounts: Account[], email: string) {
  const target = safeLower(email);
  return accounts.find((a) => safeLower(a.email) === target);
}

export function ensureAtLeastOneSuperAdminActive(accounts: Account[]) {
  return accounts.some(
    (a) =>
      (String(a.role).toUpperCase() === "SUPER_ADMIN" || String(a.role).toUpperCase() === "SYS") &&
      a.status === "ACTIVE",
  );
}

export function pushAudit(
  store: AccountControlStore,
  event: Omit<AuditEvent, "id" | "at"> & { id?: string; at?: string },
): AccountControlStore {
  const next: AuditEvent = {
    id: event.id ?? uuid(),
    at: event.at ?? nowIso(),
    actorEmail: event.actorEmail,
    action: event.action,
    targetEmail: event.targetEmail,
    detail: event.detail,
  };

  return {
    ...store,
    audit: [next, ...store.audit].slice(0, 1000),
  };
}

export function grantDirect(
  store: AccountControlStore,
  actorEmail: string,
  subjectEmail: string,
  permission: PermissionCode,
): AccountControlStore {
  const active = store.grants.find(
    (g) =>
      safeLower(g.subjectEmail) === safeLower(subjectEmail) &&
      g.permission === permission &&
      !g.revokedAt,
  );

  if (active) return store;

  const nextGrant: Grant = {
    id: uuid(),
    subjectEmail,
    permission,
    grantedAt: nowIso(),
    grantedBy: actorEmail,
  };

  return pushAudit(
    {
      ...store,
      grants: [nextGrant, ...store.grants],
    },
    {
      actorEmail,
      action: "GRANT_DIRECT",
      targetEmail: subjectEmail,
      detail: permission,
    },
  );
}

export function revokeDirect(
  store: AccountControlStore,
  actorEmail: string,
  subjectEmail: string,
  permission: PermissionCode,
): AccountControlStore {
  let changed = false;

  const grants = store.grants.map((g) => {
    if (
      safeLower(g.subjectEmail) === safeLower(subjectEmail) &&
      g.permission === permission &&
      !g.revokedAt
    ) {
      changed = true;
      return {
        ...g,
        revokedAt: nowIso(),
        revokedBy: actorEmail,
      };
    }
    return g;
  });

  if (!changed) return store;

  return pushAudit(
    {
      ...store,
      grants,
    },
    {
      actorEmail,
      action: "REVOKE_DIRECT",
      targetEmail: subjectEmail,
      detail: permission,
    },
  );
}

export function requestAuthorityChange(
  store: AccountControlStore,
  actorEmail: string,
  subjectEmail: string,
  type: "GRANT" | "REVOKE",
  permission: PermissionCode,
  requestNote?: string,
): AccountControlStore {
  const req: AuthorityRequest = {
    id: uuid(),
    subjectEmail,
    type,
    permission,
    status: "PENDING",
    requestedBy: actorEmail,
    requestedAt: nowIso(),
    requestNote,
  };

  return pushAudit(
    {
      ...store,
      authorityRequests: [req, ...store.authorityRequests],
    },
    {
      actorEmail,
      action: "AUTHORITY_REQUEST_CREATED",
      targetEmail: subjectEmail,
      detail: `${type}:${permission}`,
    },
  );
}

export function approveAuthorityRequest(
  store: AccountControlStore,
  actorEmail: string,
  requestId: string,
  note?: string,
): AccountControlStore {
  const req = store.authorityRequests.find((r) => r.id === requestId);
  if (!req || req.status !== "PENDING") return store;

  let next = store;

  if (req.type === "GRANT") {
    next = grantDirect(next, actorEmail, req.subjectEmail, req.permission);
  } else {
    next = revokeDirect(next, actorEmail, req.subjectEmail, req.permission);
  }

  next = {
    ...next,
    authorityRequests: next.authorityRequests.map((r) =>
      r.id === requestId
        ? {
            ...r,
            status: "APPROVED",
            processedBy: actorEmail,
            processedAt: nowIso(),
            processedNote: note,
          }
        : r,
    ),
  };

  return pushAudit(next, {
    actorEmail,
    action: "AUTHORITY_REQUEST_APPROVED",
    targetEmail: req.subjectEmail,
    detail: `${req.type}:${req.permission}`,
  });
}

export function rejectAuthorityRequest(
  store: AccountControlStore,
  actorEmail: string,
  requestId: string,
  note?: string,
): AccountControlStore {
  const req = store.authorityRequests.find((r) => r.id === requestId);
  if (!req || req.status !== "PENDING") return store;

  const next = {
    ...store,
    authorityRequests: store.authorityRequests.map((r) =>
      r.id === requestId
        ? {
            ...r,
            status: "REJECTED",
            processedBy: actorEmail,
            processedAt: nowIso(),
            processedNote: note,
          }
        : r,
    ),
  };

  return pushAudit(next, {
    actorEmail,
    action: "AUTHORITY_REQUEST_REJECTED",
    targetEmail: req.subjectEmail,
    detail: `${req.type}:${req.permission}`,
  });
}

export function can(store: AccountControlStore, actor: Account | undefined, permission: PermissionCode) {
  if (!actor || actor.status !== "ACTIVE") return false;
  if (roleIsPrivileged(actor.role)) return true;

  const defaults = new Set(roleDefaults(actor.role));
  if (defaults.has(permission)) return true;

  return activeGrantsFor(store.grants, actor.email).some((g) => g.permission === permission);
}

export function canApplyAuthorityDirect(store: AccountControlStore, actor: Account | undefined) {
  void store;
  return !!actor && actor.status === "ACTIVE" && roleIsPrivileged(actor.role);
}

export function canRequestAuthorityChange(store: AccountControlStore, actor: Account | undefined) {
  if (!actor || actor.status !== "ACTIVE") return false;
  return roleIsPrivileged(actor.role) || can(store, actor, "USER_ROLE_EDIT") || can(store, actor, "USER_CREATE");
}

export function loadStore(): AccountControlStore {
  if (typeof window === "undefined") return EMPTY_STORE;

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return EMPTY_STORE;
    const parsed = JSON.parse(raw) as Partial<AccountControlStore>;
    return {
      accounts: Array.isArray(parsed.accounts) ? parsed.accounts : [],
      grants: Array.isArray(parsed.grants) ? parsed.grants : [],
      authorityRequests: Array.isArray(parsed.authorityRequests) ? parsed.authorityRequests : [],
      audit: Array.isArray(parsed.audit) ? parsed.audit : [],
    };
  } catch {
    return EMPTY_STORE;
  }
}

export function saveStore(store: AccountControlStore) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
}