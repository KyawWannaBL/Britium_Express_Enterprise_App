export const STORAGE_KEY = "britium_enterprise_identity_v1";

export type Role =
  | "SYS"
  | "SUPER_ADMIN"
  | "ADMIN"
  | "SUPERVISOR"
  | "WAREHOUSE_CONTROLLER"
  | "CUSTOMER_SERVICE_AGENT"
  | "CUSTOMER_SERVICE"
  | "CS"
  | "DATA_ENTRY_STAFF"
  | "DATA_ENTRY"
  | "MARKETING_LEAD"
  | "MARKETING_MANAGER"
  | "MARKETING_STAFF"
  | "MARKETING"
  | "MERCHANT_ACQUISITION"
  | "STAFF"
  | "RIDER"
  | "DRIVER"
  | "APP_OWNER"
  | "ADM"
  | "MGR"
  | "FINANCE";

export const DEFAULT_ROLES: Role[] = [
  "SYS",
  "SUPER_ADMIN",
  "ADMIN",
  "SUPERVISOR",
  "WAREHOUSE_CONTROLLER",
  "CUSTOMER_SERVICE",
  "CUSTOMER_SERVICE_AGENT",
  "CS",
  "DATA_ENTRY_STAFF",
  "DATA_ENTRY",
  "MARKETING_LEAD",
  "MARKETING_MANAGER",
  "MARKETING_STAFF",
  "MARKETING",
  "MERCHANT_ACQUISITION",
  "STAFF",
  "RIDER",
  "DRIVER",
  "FINANCE",
];

export const PERMISSIONS = [
  { code: "USER_READ", en: "View Users", mm: "အသုံးပြုသူစာရင်းကြည့်ရန်" },
  { code: "USER_CREATE", en: "Create User Request", mm: "အသုံးပြုသူအသစ်တောင်းဆိုရန်" },
  { code: "USER_APPROVE", en: "Approve Users", mm: "အသုံးပြုသူအတည်ပြုရန်" },
  { code: "USER_REJECT", en: "Reject Users", mm: "အသုံးပြုသူငြင်းပယ်ရန်" },
  { code: "USER_BLOCK", en: "Block/Suspend Users", mm: "အကောင့်ပိတ်ရန်" },
  { code: "USER_ROLE_EDIT", en: "Edit Roles", mm: "ရာထူးပြောင်းလဲရန်" },
  { code: "AUTHORITY_READ", en: "View Authorities", mm: "ခွင့်ပြုချက်များကြည့်ရန်" },
  { code: "AUTHORITY_REQUEST", en: "Request Authority Change", mm: "ခွင့်ပြုချက်ပြောင်းလဲရန်တောင်းဆိုမှု" },
  { code: "AUTHORITY_APPROVE", en: "Approve Authority Change", mm: "ခွင့်ပြုချက်အတည်ပြုရန်" },
  { code: "AUTHORITY_DIRECT_APPLY", en: "Direct Apply Authority (No Approval)", mm: "ခွင့်ပြုချက်တိုက်ရိုက်ပေးရန်" },
  { code: "AUDIT_READ", en: "View Audit Logs", mm: "လုပ်ဆောင်ချက်မှတ်တမ်းကြည့်ရန်" },
  { code: "BULK_ACTIONS", en: "Perform Bulk Actions", mm: "အုပ်စုလိုက်လုပ်ဆောင်ရန်" },
  { code: "CSV_EXPORT", en: "Export CSV Data", mm: "CSV ထုတ်ယူရန်" },
  { code: "CSV_IMPORT", en: "Import CSV Data", mm: "CSV ထည့်သွင်းရန်" },
  { code: "FINANCE_READ", en: "View Finance Data", mm: "ဘဏ္ဍာရေးစာရင်းကြည့်ရန်" },
  { code: "FINANCE_WRITE", en: "Edit Finance Data", mm: "ဘဏ္ဍာရေးစာရင်းရေးသွင်းရန်" },
  { code: "CUSTOMER_SERVICE_EXPORT", en: "Export CS Data", mm: "CS Data ထုတ်ရန်" },
  { code: "DATA_ENTRY_EDIT_SUBMITTED", en: "Edit Submitted Entries", mm: "သွင်းပြီးသားစာရင်းများပြင်ရန်" },
] as const;

export type PermissionCode = (typeof PERMISSIONS)[number]["code"];

export type AccountStatus = "PENDING" | "ACTIVE" | "SUSPENDED" | "REJECTED" | "ARCHIVED";

export type Account = {
  id: string;
  name: string;
  email: string;
  role: Role;
  department?: string;
  phone?: string;
  employeeId?: string;
  status: AccountStatus;
  createdAt: string;
  createdBy: string;
  approval?: {
    requestedAt: string;
    requestedBy: string;
    processedAt?: string;
    processedBy?: string;
    decision?: "APPROVED" | "REJECTED";
    note?: string;
  };
  security?: {
    lastLoginAt?: string;
    blockedAt?: string;
    blockedBy?: string;
    mfaEnabled?: boolean;
  };
};

export type AuthorityGrant = {
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
  requestedAt: string;
  requestedBy: string;
  requestNote?: string;
  processedAt?: string;
  processedBy?: string;
  processNote?: string;
};

export type AuditLog = {
  id: string;
  actorEmail: string;
  action: string;
  targetEmail?: string;
  detail?: string;
  at: string;
};

export type AccountStore = {
  accounts: Account[];
  grants: AuthorityGrant[];
  authorityRequests: AuthorityRequest[];
  audit: AuditLog[];
};

export function uuid() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) return crypto.randomUUID();
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

export function nowIso() {
  return new Date().toISOString();
}

export function safeLower(s?: string) {
  return (s || "").trim().toLowerCase();
}

export function isEmailValid(e: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);
}

export function roleIsPrivileged(role?: Role) {
  return role === "SUPER_ADMIN" || role === "SYS" || role === "APP_OWNER";
}

export function defaultPortalPermissionsForRole(role: Role): PermissionCode[] {
  if (roleIsPrivileged(role)) return [...PERMISSIONS.map((p) => p.code)];
  switch (role) {
    case "ADMIN":
    case "ADM":
    case "MGR":
      return ["USER_READ", "USER_CREATE", "AUTHORITY_READ", "CSV_EXPORT", "CSV_IMPORT", "BULK_ACTIONS"];
    case "SUPERVISOR":
      return ["USER_READ", "USER_CREATE", "CSV_EXPORT"];
    default:
      return ["USER_READ"];
  }
}

export function getAccountByEmail(accounts: Account[], email: string) {
  const target = safeLower(email);
  return accounts.find((a) => safeLower(a.email) === target);
}

export function ensureAtLeastOneSuperAdminActive(accounts: Account[]) {
  return accounts.some((a) => roleIsPrivileged(a.role) && a.status === "ACTIVE");
}

export function activeGrantsFor(grants: AuthorityGrant[], email: string) {
  const target = safeLower(email);
  return grants.filter((g) => safeLower(g.subjectEmail) === target && !g.revokedAt);
}

export function can(store: AccountStore, actor: Account, permission: PermissionCode) {
  if (actor.status !== "ACTIVE") return false;
  if (roleIsPrivileged(actor.role)) return true;
  return activeGrantsFor(store.grants, actor.email).some((g) => g.permission === permission);
}

export function canRequestAuthorityChange(store: AccountStore, actor: Account) {
  if (actor.status !== "ACTIVE") return false;
  if (roleIsPrivileged(actor.role)) return true;
  return can(store, actor, "AUTHORITY_REQUEST");
}

export function canApplyAuthorityDirect(store: AccountStore, actor: Account) {
  if (actor.status !== "ACTIVE") return false;
  if (roleIsPrivileged(actor.role)) return true;
  return can(store, actor, "AUTHORITY_DIRECT_APPLY");
}

export function pushAudit(store: AccountStore, log: Omit<AuditLog, "id" | "at">): AccountStore {
  return {
    ...store,
    audit: [{ id: uuid(), at: nowIso(), ...log }, ...store.audit],
  };
}

export function grantDirect(store: AccountStore, actorEmail: string, subjectEmail: string, permission: PermissionCode): AccountStore {
  const actor = getAccountByEmail(store.accounts, actorEmail);
  if (!actor || !canApplyAuthorityDirect(store, actor)) return store;

  const active = activeGrantsFor(store.grants, subjectEmail);
  if (active.some((g) => g.permission === permission)) return store;

  let next = {
    ...store,
    grants: [
      ...store.grants,
      {
        id: uuid(),
        subjectEmail,
        permission,
        grantedAt: nowIso(),
        grantedBy: actorEmail,
      },
    ],
  };
  next = pushAudit(next, {
    actorEmail,
    action: "DIRECT_GRANT",
    targetEmail: subjectEmail,
    detail: permission,
  });
  return next;
}

export function revokeDirect(store: AccountStore, actorEmail: string, subjectEmail: string, permission: PermissionCode): AccountStore {
  const actor = getAccountByEmail(store.accounts, actorEmail);
  if (!actor || !canApplyAuthorityDirect(store, actor)) return store;

  let updated = false;
  const nextGrants = store.grants.map((g) => {
    if (safeLower(g.subjectEmail) === safeLower(subjectEmail) && g.permission === permission && !g.revokedAt) {
      updated = true;
      return { ...g, revokedAt: nowIso(), revokedBy: actorEmail };
    }
    return g;
  });

  if (!updated) return store;

  let next = { ...store, grants: nextGrants };
  next = pushAudit(next, {
    actorEmail,
    action: "DIRECT_REVOKE",
    targetEmail: subjectEmail,
    detail: permission,
  });
  return next;
}

export function requestAuthorityChange(
  store: AccountStore,
  actorEmail: string,
  subjectEmail: string,
  type: "GRANT" | "REVOKE",
  permission: PermissionCode,
  note?: string
): AccountStore {
  const actor = getAccountByEmail(store.accounts, actorEmail);
  if (!actor || !canRequestAuthorityChange(store, actor)) return store;

  let next = {
    ...store,
    authorityRequests: [
      {
        id: uuid(),
        subjectEmail,
        type,
        permission,
        status: "PENDING" as const,
        requestedAt: nowIso(),
        requestedBy: actorEmail,
        requestNote: note,
      },
      ...store.authorityRequests,
    ],
  };

  next = pushAudit(next, {
    actorEmail,
    action: "AUTHORITY_REQUEST_CREATED",
    targetEmail: subjectEmail,
    detail: `${type} ${permission}`,
  });
  return next;
}

export function approveAuthorityRequest(store: AccountStore, actorEmail: string, requestId: string, note?: string): AccountStore {
  const actor = getAccountByEmail(store.accounts, actorEmail);
  if (!actor || !roleIsPrivileged(actor.role)) return store;

  const req = store.authorityRequests.find((r) => r.id === requestId);
  if (!req || req.status !== "PENDING") return store;

  const nextReqs = store.authorityRequests.map((r) =>
    r.id === requestId ? { ...r, status: "APPROVED" as const, processedAt: nowIso(), processedBy: actorEmail, processNote: note } : r
  );

  let next = { ...store, authorityRequests: nextReqs };
  if (req.type === "GRANT") {
    next = grantDirect(next, actorEmail, req.subjectEmail, req.permission);
  } else {
    next = revokeDirect(next, actorEmail, req.subjectEmail, req.permission);
  }

  next = pushAudit(next, {
    actorEmail,
    action: "AUTHORITY_REQUEST_APPROVED",
    targetEmail: req.subjectEmail,
    detail: `ReqID=${requestId}`,
  });
  return next;
}

export function rejectAuthorityRequest(store: AccountStore, actorEmail: string, requestId: string, note?: string): AccountStore {
  const actor = getAccountByEmail(store.accounts, actorEmail);
  if (!actor || !roleIsPrivileged(actor.role)) return store;

  const req = store.authorityRequests.find((r) => r.id === requestId);
  if (!req || req.status !== "PENDING") return store;

  const nextReqs = store.authorityRequests.map((r) =>
    r.id === requestId ? { ...r, status: "REJECTED" as const, processedAt: nowIso(), processedBy: actorEmail, processNote: note } : r
  );

  let next = { ...store, authorityRequests: nextReqs };
  next = pushAudit(next, {
    actorEmail,
    action: "AUTHORITY_REQUEST_REJECTED",
    targetEmail: req.subjectEmail,
    detail: `ReqID=${requestId}`,
  });
  return next;
}

const DEFAULT_STORE: AccountStore = {
  accounts: [
    {
      id: "root-sys-001",
      name: "System Root",
      email: "root@britium.local",
      role: "SYS",
      status: "ACTIVE",
      createdAt: new Date().toISOString(),
      createdBy: "SYSTEM",
    },
  ],
  grants: [],
  authorityRequests: [],
  audit: [],
};

export function loadStore(): AccountStore {
  if (typeof window === "undefined") return DEFAULT_STORE;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      saveStore(DEFAULT_STORE);
      return DEFAULT_STORE;
    }
    const parsed = JSON.parse(raw);
    if (!parsed.accounts) return DEFAULT_STORE;
    return parsed;
  } catch (e) {
    return DEFAULT_STORE;
  }
}

export function saveStore(store: AccountStore) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
  } catch (e) {}
}

export function csvParse(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    const next = text[i + 1];
    if (c === '"' && inQuotes && next === '"') {
      cell += '"';
      i++;
    } else if (c === '"') {
      inQuotes = !inQuotes;
    } else if (c === "," && !inQuotes) {
      row.push(cell);
      cell = "";
    } else if ((c === "\n" || (c === "\r" && next === "\n")) && !inQuotes) {
      row.push(cell);
      rows.push(row);
      cell = "";
      row = [];
      if (c === "\r") i++;
    } else {
      cell += c;
    }
  }
  if (cell || row.length) {
    row.push(cell);
    rows.push(row);
  }
  return rows;
}

export function csvStringify(rows: string[][]): string {
  return rows
    .map((r) =>
      r
        .map((c) => {
          const v = String(c || "");
          if (v.includes(",") || v.includes('"') || v.includes("\n")) {
            return `"${v.replace(/"/g, '""')}"`;
          }
          return v;
        })
        .join(",")
    )
    .join("\n");
}

export function bootstrapSignedInUser(store: AccountStore, email: string): AccountStore {
  const existing = getAccountByEmail(store.accounts, email);
  if (existing) return store;

  const newAccount: Account = {
    id: uuid(),
    email,
    name: email.split("@")[0] || "System Admin",
    role: "SYS",
    status: "ACTIVE",
    createdAt: nowIso(),
    createdBy: "SYSTEM",
  };

  return {
    ...store,
    accounts: [newAccount, ...store.accounts],
  };
}