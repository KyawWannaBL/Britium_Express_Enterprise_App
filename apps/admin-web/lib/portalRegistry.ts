import {
  BarChart3,
  Building2,
  ClipboardList,
  FileSearch,
  Headphones,
  LayoutDashboard,
  Megaphone,
  PackageSearch,
  PenTool,
  Printer,
  Route,
  Search,
  Settings2,
  Store,
  Truck,
  UserCog,
  Warehouse,
  type LucideIcon,
} from "lucide-react";

export type PortalSection =
  | "LEADERSHIP"
  | "LOGISTICS"
  | "OPERATIONS"
  | "SUPPORT"
  | "ADMINISTRATION"
  | "SYSTEM";

export type PortalPermission =
  | "dashboard.read"
  | "supervisor_hub.read"
  | "branch.read"
  | "intake.read"
  | "ways.read"
  | "warehouse.read"
  | "rider.read"
  | "data_entry.read"
  | "waybill.read"
  | "financial_reports.read"
  | "customer_service.read"
  | "marketing.read"
  | "settings.read"
  | "authorization.read"
  | "audit.read"
  | "reports_export.read"
  | "customer_tracking.read"
  | "merchant_portal.read";

export type PortalRoute = {
  key: string;
  href: string;
  label: string;
  mm: string;
  description: string;
  mmDescription: string;
  section: PortalSection;
  icon: LucideIcon;
  allowedRoles?: string[];
  requiredPermissions?: PortalPermission[];
  showInSidebar: boolean;
  showInCommandCenter: boolean;
  enabled?: boolean;
};

export const roleFallbackPermissions: Record<string, PortalPermission[]> = {
  SYS: [
    "dashboard.read",
    "supervisor_hub.read",
    "branch.read",
    "intake.read",
    "ways.read",
    "warehouse.read",
    "rider.read",
    "data_entry.read",
    "waybill.read",
    "financial_reports.read",
    "customer_service.read",
    "marketing.read",
    "settings.read",
    "authorization.read",
    "audit.read",
    "reports_export.read",
    "customer_tracking.read",
    "merchant_portal.read",
  ],
  SUPER_ADMIN: [
    "dashboard.read",
    "supervisor_hub.read",
    "branch.read",
    "intake.read",
    "ways.read",
    "warehouse.read",
    "rider.read",
    "data_entry.read",
    "waybill.read",
    "financial_reports.read",
    "customer_service.read",
    "marketing.read",
    "settings.read",
    "authorization.read",
    "audit.read",
    "reports_export.read",
    "customer_tracking.read",
    "merchant_portal.read",
  ],
  ADMIN: [
    "dashboard.read",
    "branch.read",
    "intake.read",
    "ways.read",
    "warehouse.read",
    "data_entry.read",
    "waybill.read",
    "financial_reports.read",
    "customer_service.read",
    "marketing.read",
    "settings.read",
    "authorization.read",
    "audit.read",
    "reports_export.read",
    "customer_tracking.read",
  ],
  SUPERVISOR: [
    "dashboard.read",
    "supervisor_hub.read",
    "branch.read",
    "intake.read",
    "ways.read",
    "warehouse.read",
    "rider.read",
    "data_entry.read",
    "waybill.read",
    "customer_service.read",
    "marketing.read",
    "reports_export.read",
    "customer_tracking.read",
  ],
  BRANCH_MANAGER: ["dashboard.read", "branch.read", "ways.read", "warehouse.read", "reports_export.read"],
  WAREHOUSE_CONTROLLER: ["warehouse.read", "ways.read", "data_entry.read", "customer_service.read", "reports_export.read"],
  CUSTOMER_SERVICE: ["customer_service.read", "reports_export.read", "customer_tracking.read"],
  MARKETING: ["marketing.read", "customer_tracking.read"],
  MARKETING_MANAGER: ["marketing.read", "reports_export.read", "dashboard.read"],
  DATA_ENTRY: ["data_entry.read", "intake.read", "ways.read"],
  RIDER: ["rider.read", "ways.read"],
  FINANCE: ["financial_reports.read", "reports_export.read", "dashboard.read"],
};

export const portalRegistry: PortalRoute[] = [
  {
    key: "command-center",
    href: "/dashboard",
    label: "Command Center",
    mm: "ဗဟိုထိန်းချုပ်မှု",
    description: "Cross-module operational dashboard",
    mmDescription: "လုပ်ငန်းခွဲအားလုံးကို ကြည့်ရှုနိုင်သော dashboard",
    section: "LEADERSHIP",
    icon: LayoutDashboard,
    requiredPermissions: ["dashboard.read"],
    showInSidebar: true,
    showInCommandCenter: false,
    enabled: true,
  },
  {
    key: "supervisor-control-hub",
    href: "/supervisor-control-hub",
    label: "Supervisor Control Hub",
    mm: "ကြီးကြပ်ရေးထိန်းချုပ်မှု",
    description: "Oversight, queue balancing, and issue control",
    mmDescription: "ကြီးကြပ်မှု၊ queue ချိန်ညှိမှုနှင့် issue ထိန်းချုပ်မှု",
    section: "LEADERSHIP",
    icon: UserCog,
    requiredPermissions: ["supervisor_hub.read"],
    showInSidebar: true,
    showInCommandCenter: true,
    enabled: true,
  },
  {
    key: "branch-office-portal",
    href: "/branch-office-portal",
    label: "Branch Office Portal",
    mm: "ဌာနခွဲရုံးပေါ်တယ်",
    description: "Branch queue, COD, and branch operations",
    mmDescription: "ဌာနခွဲ queue၊ COD နှင့် branch လုပ်ငန်းများ",
    section: "LEADERSHIP",
    icon: Building2,
    requiredPermissions: ["branch.read"],
    showInSidebar: true,
    showInCommandCenter: true,
    enabled: true,
  },
  {
    key: "create-delivery",
    href: "/create-delivery",
    label: "Intake Console",
    mm: "ကုန်စည်လက်ခံရန်",
    description: "Create intake and shipment booking",
    mmDescription: "Shipment intake နှင့် booking ဖန်တီးရန်",
    section: "LOGISTICS",
    icon: PenTool,
    requiredPermissions: ["intake.read"],
    showInSidebar: true,
    showInCommandCenter: true,
    enabled: true,
  },
  {
    key: "way-management",
    href: "/way-management",
    label: "Way Management",
    mm: "ကုန်စည်စီမံခန့်ခွဲမှု",
    description: "Status flow, route control, and dispatch",
    mmDescription: "Status flow၊ route control နှင့် dispatch",
    section: "LOGISTICS",
    icon: Route,
    requiredPermissions: ["ways.read"],
    showInSidebar: true,
    showInCommandCenter: true,
    enabled: true,
  },
  {
    key: "warehouse-hub",
    href: "/warehouse/portal",
    label: "Warehouse Hub",
    mm: "ဂိုဒေါင်စီမံခန့်ခွဲမှု",
    description: "Receiving, staging, storage, and shipping",
    mmDescription: "Receiving၊ staging၊ storage နှင့် shipping",
    section: "LOGISTICS",
    icon: Warehouse,
    requiredPermissions: ["warehouse.read"],
    showInSidebar: true,
    showInCommandCenter: true,
    enabled: true,
  },
  {
    key: "rider-portal",
    href: "/rider/portal",
    label: "Rider Portal",
    mm: "ပို့ဆောင်ရေး (Rider)",
    description: "Delivery execution and POD workflow",
    mmDescription: "Delivery execution နှင့် POD workflow",
    section: "LOGISTICS",
    icon: Truck,
    requiredPermissions: ["rider.read"],
    showInSidebar: true,
    showInCommandCenter: true,
    enabled: true,
  },
  {
    key: "data-entry-turbo",
    href: "/data-entry-turbo",
    label: "Data Entry Turbo",
    mm: "ဒေတာထည့်သွင်းမှုမြန်နှုန်း",
    description: "Pre/post pickup entry and image review",
    mmDescription: "Pickup မတိုင်မီ/ပြီးနောက် data entry နှင့် image review",
    section: "OPERATIONS",
    icon: ClipboardList,
    requiredPermissions: ["data_entry.read"],
    showInSidebar: true,
    showInCommandCenter: true,
    enabled: true,
  },
  {
    key: "waybill-print-studio",
    href: "/waybill-print-studio",
    label: "Waybill Print Studio",
    mm: "ဝေးဘေလ်ပရင့်ထုတ်ခန်း",
    description: "Batch and single waybill printing",
    mmDescription: "Batch နှင့် single waybill printing",
    section: "OPERATIONS",
    icon: Printer,
    requiredPermissions: ["waybill.read"],
    showInSidebar: true,
    showInCommandCenter: true,
    enabled: true,
  },
  {
    key: "financial-reports",
    href: "/financial-reports",
    label: "Financial Reports",
    mm: "ငွေကြေးအစီရင်ခံစာများ",
    description: "Billing, settlements, refunds, and COD",
    mmDescription: "Billing၊ settlements၊ refunds နှင့် COD",
    section: "ADMINISTRATION",
    icon: BarChart3,
    requiredPermissions: ["financial_reports.read"],
    showInSidebar: true,
    showInCommandCenter: true,
    enabled: true,
  },
  {
    key: "customer-service-portal",
    href: "/cs/portal",
    label: "Customer Service",
    mm: "ဖောက်သည်ဝန်ဆောင်မှု",
    description: "Cases, alerts, parcel messages, and support",
    mmDescription: "Cases၊ alerts၊ parcel messages နှင့် support",
    section: "SUPPORT",
    icon: Headphones,
    requiredPermissions: ["customer_service.read"],
    showInSidebar: true,
    showInCommandCenter: true,
    enabled: true,
  },
  {
    key: "marketing-portal",
    href: "/marketing/portal",
    label: "Marketing Portal",
    mm: "စျေးကွက်ဖွံ့ဖြိုးရေး ပေါ်တယ်",
    description: "Merchant growth, KPIs, plans, and reports",
    mmDescription: "Merchant growth၊ KPI၊ plan နှင့် report များ",
    section: "SUPPORT",
    icon: Megaphone,
    requiredPermissions: ["marketing.read"],
    showInSidebar: true,
    showInCommandCenter: true,
    enabled: true,
  },
  {
    key: "settings-portal",
    href: "/settings/portal",
    label: "Settings & Authorization",
    mm: "စနစ်ချိန်ညှိမှုနှင့် ခွင့်ပြုချက်",
    description: "Master data, settings, and authorization",
    mmDescription: "Master data၊ settings နှင့် authorization",
    section: "SYSTEM",
    icon: Settings2,
    requiredPermissions: ["settings.read", "authorization.read"],
    showInSidebar: true,
    showInCommandCenter: true,
    enabled: true,
  },
  {
    key: "audit-log",
    href: "/audit-log",
    label: "Audit Log",
    mm: "စစ်ဆေးမှတ်တမ်း",
    description: "Security and operational audit trail",
    mmDescription: "Security နှင့် operational audit trail",
    section: "SYSTEM",
    icon: FileSearch,
    requiredPermissions: ["audit.read"],
    showInSidebar: true,
    showInCommandCenter: true,
    enabled: true,
  },
  {
    key: "reports-export-center",
    href: "/reports-export",
    label: "Reports Export Center",
    mm: "အစီရင်ခံစာထုတ်ယူရန်",
    description: "Operational exports and scheduled files",
    mmDescription: "Operational exports နှင့် scheduled files",
    section: "SYSTEM",
    icon: PackageSearch,
    requiredPermissions: ["reports_export.read"],
    showInSidebar: true,
    showInCommandCenter: true,
    enabled: true,
  },
  {
    key: "merchant-portal",
    href: "/merchant/portal",
    label: "Merchant VIP Portal",
    mm: "ကုန်သည်အထူးပေါ်တယ်",
    description: "Merchant-facing visibility and controls",
    mmDescription: "Merchant မျက်နှာချင်းဆိုင်မြင်ကွင်းနှင့် controls",
    section: "SUPPORT",
    icon: Store,
    requiredPermissions: ["merchant_portal.read"],
    showInSidebar: true,
    showInCommandCenter: false,
    enabled: true,
  },
  {
    key: "customer-tracking",
    href: "/customer-tracking",
    label: "Customer Tracking",
    mm: "ဖောက်သည်ခြေရာခံစနစ်",
    description: "Public or assisted parcel tracking",
    mmDescription: "Public သို့မဟုတ် assisted parcel tracking",
    section: "SUPPORT",
    icon: Search,
    requiredPermissions: ["customer_tracking.read"],
    showInSidebar: true,
    showInCommandCenter: false,
    enabled: true,
  },
];

export const portalSectionMeta: Record<PortalSection, { en: string; my: string }> = {
  LEADERSHIP: { en: "Leadership", my: "ခေါင်းဆောင်မှု" },
  LOGISTICS: { en: "Logistics", my: "ပို့ဆောင်ရေးလုပ်ငန်းစဉ်" },
  OPERATIONS: { en: "Operations", my: "လုပ်ငန်းဆောင်ရွက်မှု" },
  SUPPORT: { en: "Growth & Support", my: "ဖွံ့ဖြိုးတိုးတက်မှုနှင့်ပံ့ပိုးမှု" },
  ADMINISTRATION: { en: "Administration", my: "စီမံခန့်ခွဲရေး" },
  SYSTEM: { en: "System", my: "စနစ်တစ်လျှောက်" },
};

export function normalizeRole(role?: string | null) {
  return String(role || "GUEST").trim().toUpperCase();
}

export function isGrantActive(expiresAt?: string | null) {
  if (!expiresAt) return true;
  return new Date(expiresAt).getTime() > Date.now();
}

export function buildEffectivePermissionSet(
  role: string,
  roleDefaults: Array<{ role: string; permission_code: PortalPermission }>,
  userGrants: Array<{ permission_code: PortalPermission; effect: PermissionEffect; expires_at?: string | null }>,
) {
  const allowSet = new Set<PortalPermission>();
  const denySet = new Set<PortalPermission>();

  const fromTable = roleDefaults
    .filter((item) => normalizeRole(item.role) === role)
    .map((item) => item.permission_code);

  const base = fromTable.length > 0 ? fromTable : roleFallbackPermissions[role] || [];
  for (const permission of base) allowSet.add(permission);

  for (const grant of userGrants.filter((item) => isGrantActive(item.expires_at))) {
    if (grant.effect === "DENY") {
      denySet.add(grant.permission_code);
      allowSet.delete(grant.permission_code);
    } else if (!denySet.has(grant.permission_code)) {
      allowSet.add(grant.permission_code);
    }
  }

  return { allowSet, denySet };
}

export function canSeePortalRoute(route: PortalRoute, role: string, permissions: Set<PortalPermission>) {
  if (route.enabled === false) return false;
  if (route.allowedRoles && route.allowedRoles.length > 0 && !route.allowedRoles.includes(role)) return false;
  if (!route.requiredPermissions || route.requiredPermissions.length === 0) return true;
  return route.requiredPermissions.every((permission) => permissions.has(permission));
}

export function groupPortalRoutes(routes: PortalRoute[]) {
  return Object.entries(
    routes.reduce<Record<PortalSection, PortalRoute[]>>((acc, route) => {
      if (!acc[route.section]) acc[route.section] = [];
      acc[route.section].push(route);
      return acc;
    }, {} as Record<PortalSection, PortalRoute[]>),
  ) as Array<[PortalSection, PortalRoute[]]>;
}
