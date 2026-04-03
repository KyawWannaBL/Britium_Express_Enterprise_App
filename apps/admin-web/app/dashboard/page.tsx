"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowRight,
  BarChart3,
  BellRing,
  Boxes,
  Building2,
  CheckCircle2,
  ClipboardList,
  FileSearch,
  Globe2,
  Headphones,
  LayoutDashboard,
  Loader2,
  Megaphone,
  Printer,
  Route,
  Settings2,
  ShieldCheck,
  Truck,
  Warehouse,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";
import { portalRegistry } from "@/components/layout/AppSidebarRbacSupabase";

type Language = "en" | "my" | "both";
type PermissionEffect = "ALLOW" | "DENY";
type PortalPermission =
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

type ProfileRow = {
  id: string;
  email?: string | null;
  role?: string | null;
  status?: string | null;
  display_name?: string | null;
};

type RoleDefaultPermissionRow = {
  role: string;
  permission_code: PortalPermission;
};

type UserPermissionGrantRow = {
  permission_code: PortalPermission;
  effect: PermissionEffect;
  expires_at?: string | null;
};

type SummaryResponse = {
  intakeQueue: number;
  wayActive: number;
  warehousePending: number;
  warehouseExceptions: number;
  dataEntryPending: number;
  dataEntrySubmittedToday: number;
  customerServiceOpenCases: number;
  customerServiceAlerts: number;
  marketingActiveMerchants: number;
  marketingReportsToday: number;
  financePendingSettlement: number;
  authPendingRequests: number;
  auditEventsToday: number;
  printPending: number;
};

const defaultSummary: SummaryResponse = {
  intakeQueue: 18,
  wayActive: 243,
  warehousePending: 61,
  warehouseExceptions: 7,
  dataEntryPending: 22,
  dataEntrySubmittedToday: 39,
  customerServiceOpenCases: 14,
  customerServiceAlerts: 5,
  marketingActiveMerchants: 42,
  marketingReportsToday: 6,
  financePendingSettlement: 9,
  authPendingRequests: 4,
  auditEventsToday: 31,
  printPending: 13,
};

const ROLE_FALLBACK_PERMISSIONS: Record<string, PortalPermission[]> = {
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

function bi(language: Language, en: string, my: string) {
  if (language === "en") return en;
  if (language === "my") return my;
  return `${en} / ${my}`;
}

function normalizeRole(role?: string | null) {
  return String(role || "GUEST").trim().toUpperCase();
}

function isGrantActive(expiresAt?: string | null) {
  if (!expiresAt) return true;
  return new Date(expiresAt).getTime() > Date.now();
}

function buildEffectivePermissionSet(
  role: string,
  roleDefaults: RoleDefaultPermissionRow[],
  userGrants: UserPermissionGrantRow[],
) {
  const allowSet = new Set<PortalPermission>();
  const denySet = new Set<PortalPermission>();

  const fromTable = roleDefaults
    .filter((item) => normalizeRole(item.role) === role)
    .map((item) => item.permission_code);

  const base = fromTable.length > 0 ? fromTable : ROLE_FALLBACK_PERMISSIONS[role] || [];
  for (const permission of base) allowSet.add(permission);

  for (const grant of userGrants.filter((item) => isGrantActive(item.expires_at))) {
    if (grant.effect === "DENY") {
      denySet.add(grant.permission_code);
      allowSet.delete(grant.permission_code);
    } else if (!denySet.has(grant.permission_code)) {
      allowSet.add(grant.permission_code);
    }
  }

  return allowSet;
}

function canSeeRoute(requiredPermissions: PortalPermission[] | undefined, permissionSet: Set<PortalPermission>) {
  if (!requiredPermissions || requiredPermissions.length === 0) return true;
  return requiredPermissions.every((permission) => permissionSet.has(permission));
}

async function fetchJson<T>(url: string): Promise<T> {
  const response = await fetch(url, { headers: { "Content-Type": "application/json" } });
  const raw = await response.text();
  const parsed = raw ? JSON.parse(raw) : {};
  if (!response.ok) throw new Error(parsed?.message || parsed?.error || `Request failed: ${response.status}`);
  return (parsed?.data ?? parsed) as T;
}

function metricTone(value: number) {
  if (value >= 50) return "text-rose-600";
  if (value >= 15) return "text-amber-600";
  return "text-emerald-600";
}

export default function CommandCenterRbacSupabase() {
  const supabase = createClient();
  const contextLanguage = (() => {
    try {
      return useLanguage()?.lang as "en" | "mm" | undefined;
    } catch {
      return undefined;
    }
  })();

  const language: Language = contextLanguage === "en" ? "en" : contextLanguage === "mm" ? "my" : "both";
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState<SummaryResponse>(defaultSummary);
  const [error, setError] = useState<string>("");
  const [profile, setProfile] = useState<ProfileRow | null>(null);
  const [permissions, setPermissions] = useState<Set<PortalPermission>>(new Set());

  useEffect(() => {
    let cancelled = false;

    async function bootstrap() {
      setLoading(true);
      setError("");
      try {
        const { data: authData, error: authError } = await supabase.auth.getUser();
        if (authError) throw authError;
        const authUser = authData.user;
        if (!authUser) {
          if (!cancelled) {
            setProfile(null);
            setPermissions(new Set());
            setLoading(false);
          }
          return;
        }

        const [{ data: me }, { data: roleDefaults }, { data: userGrants }] = await Promise.all([
          supabase
            .from("profiles")
            .select("id,email,role,status,display_name")
            .eq("id", authUser.id)
            .single<ProfileRow>(),
          supabase
            .from("role_default_permissions")
            .select("role,permission_code")
            .returns<RoleDefaultPermissionRow[]>(),
          supabase
            .from("user_permission_grants")
            .select("permission_code,effect,expires_at")
            .eq("user_id", authUser.id)
            .returns<UserPermissionGrantRow[]>(),
        ]);

        const role = normalizeRole(me?.role);
        const effective = buildEffectivePermissionSet(role, roleDefaults || [], userGrants || []);

        let nextSummary = defaultSummary;
        try {
          nextSummary = await fetchJson<SummaryResponse>("/api/v1/command-center/summary");
        } catch {
          // fallback to demo numbers when API is not ready yet
        }

        if (!cancelled) {
          setProfile(me || null);
          setPermissions(effective);
          setSummary(nextSummary);
          setLoading(false);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Unable to load command center.");
          setLoading(false);
        }
      }
    }

    bootstrap();
    return () => {
      cancelled = true;
    };
  }, [supabase]);

  const allowedCards = useMemo(() => {
    return portalRegistry.filter((item) => item.showInCommandCenter && canSeeRoute(item.requiredPermissions, permissions));
  }, [permissions]);

  const cardStats = useMemo(() => {
    return {
      "supervisor-control-hub": {
        count: summary.authPendingRequests,
        noteEn: "Pending authorizations and escalations",
        noteMy: "စောင့်ဆိုင်းနေသော authorization နှင့် escalation များ",
        icon: ShieldCheck,
      },
      "branch-office-portal": {
        count: summary.financePendingSettlement,
        noteEn: "Branch settlement and branch-side monitoring",
        noteMy: "Branch settlement နှင့် branch-side စောင့်ကြည့်မှု",
        icon: Building2,
      },
      "create-delivery": {
        count: summary.intakeQueue,
        noteEn: "New intake queue waiting for processing",
        noteMy: "လုပ်ဆောင်ရန် စောင့်ဆိုင်းနေသော intake queue",
        icon: Boxes,
      },
      "way-management": {
        count: summary.wayActive,
        noteEn: "Active way records across pickup, transit, and delivery",
        noteMy: "pickup, transit နှင့် delivery တွင် active ဖြစ်နေသော way records",
        icon: Route,
      },
      "warehouse-hub": {
        count: summary.warehousePending,
        noteEn: `Pending ${summary.warehousePending} • Exceptions ${summary.warehouseExceptions}`,
        noteMy: `စောင့်ဆိုင်း ${summary.warehousePending} • Exception ${summary.warehouseExceptions}`,
        icon: Warehouse,
      },
      "rider-portal": {
        count: summary.wayActive,
        noteEn: "Delivery execution load and rider activity",
        noteMy: "Delivery execution load နှင့် rider activity",
        icon: Truck,
      },
      "data-entry-turbo": {
        count: summary.dataEntryPending,
        noteEn: `Pending ${summary.dataEntryPending} • Submitted today ${summary.dataEntrySubmittedToday}`,
        noteMy: `စောင့်ဆိုင်း ${summary.dataEntryPending} • ယနေ့တင်ပြီး ${summary.dataEntrySubmittedToday}`,
        icon: ClipboardList,
      },
      "waybill-print-studio": {
        count: summary.printPending,
        noteEn: "Waybill print queue and reprint requests",
        noteMy: "Waybill print queue နှင့် reprint requests",
        icon: Printer,
      },
      "financial-reports": {
        count: summary.financePendingSettlement,
        noteEn: "Finance settlement and pending reconciliation",
        noteMy: "Finance settlement နှင့် pending reconciliation",
        icon: BarChart3,
      },
      "customer-service-portal": {
        count: summary.customerServiceOpenCases,
        noteEn: `Open cases ${summary.customerServiceOpenCases} • Alerts ${summary.customerServiceAlerts}`,
        noteMy: `Open case ${summary.customerServiceOpenCases} • Alert ${summary.customerServiceAlerts}`,
        icon: Headphones,
      },
      "marketing-portal": {
        count: summary.marketingActiveMerchants,
        noteEn: `Active merchants ${summary.marketingActiveMerchants} • Reports today ${summary.marketingReportsToday}`,
        noteMy: `လက်ရှိ merchant ${summary.marketingActiveMerchants} • ယနေ့ report ${summary.marketingReportsToday}`,
        icon: Megaphone,
      },
      "settings-portal": {
        count: summary.authPendingRequests,
        noteEn: "System configuration and authorization changes",
        noteMy: "System configuration နှင့် authorization changes",
        icon: Settings2,
      },
      "audit-log": {
        count: summary.auditEventsToday,
        noteEn: "Audit and security events logged today",
        noteMy: "ယနေ့ audit နှင့် security event များ",
        icon: FileSearch,
      },
      "reports-export-center": {
        count: summary.printPending,
        noteEn: "Queued export jobs and downloadable reports",
        noteMy: "Queued export jobs နှင့် download report များ",
        icon: BellRing,
      },
    };
  }, [summary]);

  const topMetrics = [
    {
      labelEn: "Warehouse Pending",
      labelMy: "Warehouse စောင့်ဆိုင်းမှု",
      value: summary.warehousePending,
      icon: Warehouse,
    },
    {
      labelEn: "Data Entry Pending",
      labelMy: "Data Entry စောင့်ဆိုင်းမှု",
      value: summary.dataEntryPending,
      icon: ClipboardList,
    },
    {
      labelEn: "Open Service Cases",
      labelMy: "ဖွင့်ထားသော service case များ",
      value: summary.customerServiceOpenCases,
      icon: Headphones,
    },
    {
      labelEn: "Active Merchants",
      labelMy: "လက်ရှိ merchant များ",
      value: summary.marketingActiveMerchants,
      icon: Megaphone,
    },
  ];

  const role = normalizeRole(profile?.role);
  const status = String(profile?.status || "GUEST").toUpperCase();

  if (!loading && (!profile || status !== "ACTIVE" || !permissions.has("dashboard.read"))) {
    return (
      <div className="min-h-screen bg-[#f7f9fc] p-8">
        <div className="rounded-[32px] border border-amber-200 bg-white p-8 shadow-sm">
          <div className="flex items-start gap-4">
            <div className="rounded-2xl bg-amber-50 p-3 text-amber-600">
              <AlertTriangle size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-black text-[#0d2c54]">{bi(language, "Command Center Access Restricted", "Command Center ဝင်ရောက်ခွင့်ကန့်သတ်ထားသည်")}</h1>
              <p className="mt-2 text-sm text-slate-500">
                {bi(
                  language,
                  "You need an ACTIVE account with dashboard.read permission to open the command center.",
                  "Command Center ကိုဖွင့်ရန် ACTIVE account နှင့် dashboard.read permission လိုအပ်သည်။",
                )}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f7f9fc] p-8">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-slate-400">Operations Overview</p>
          <h1 className="text-4xl font-black uppercase tracking-tight text-[#0d2c54]">
            {bi(language, "Command Center", "ဗဟိုထိန်းချုပ်မှု")}
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            {bi(
              language,
              "Unified control surface for intake, way flow, warehouse, support, finance, marketing, authorization, and audit.",
              "Intake, way flow, warehouse, support, finance, marketing, authorization နှင့် audit ကို တစ်နေရာတည်းမှ ထိန်းချုပ်နိုင်သော screen ဖြစ်သည်။",
            )}
          </p>
        </div>

        <div className="inline-flex flex-wrap items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
          <div className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600">
            <Globe2 size={16} />
            <span>{bi(language, `Role ${role}`, `ရာထူး ${role}`)}</span>
          </div>
          <div className={`rounded-full px-3 py-1 text-[10px] font-black uppercase ${status === "ACTIVE" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>
            {status}
          </div>
        </div>
      </div>

      {error ? (
        <div className="mt-6 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-bold text-rose-700">
          {error}
        </div>
      ) : null}

      <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {topMetrics.map((metric) => {
          const Icon = metric.icon;
          return (
            <div key={metric.labelEn} className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
              <Icon size={24} className="text-[#0d2c54]" />
              <p className="mt-5 text-xs font-black uppercase tracking-[0.2em] text-slate-400">{bi(language, metric.labelEn, metric.labelMy)}</p>
              <p className={`mt-4 text-3xl font-black ${metricTone(metric.value)}`}>{metric.value}</p>
            </div>
          );
        })}
      </div>

      {loading ? (
        <div className="mt-10 flex min-h-[260px] items-center justify-center rounded-[32px] border border-slate-200 bg-white shadow-sm">
          <div className="inline-flex items-center gap-3 rounded-2xl bg-slate-50 px-5 py-4 text-slate-600">
            <Loader2 size={20} className="animate-spin" />
            {bi(language, "Loading command center...", "Command Center ကို ရယူနေသည်...")}
          </div>
        </div>
      ) : (
        <div className="mt-8 grid gap-4 md:grid-cols-2 2xl:grid-cols-3">
          {allowedCards.map((item) => {
            const meta = cardStats[item.key as keyof typeof cardStats];
            const CardIcon = meta?.icon || LayoutDashboard;
            const count = meta?.count ?? 0;
            return (
              <Link
                key={item.key}
                href={item.href}
                className="group rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="rounded-2xl bg-slate-50 p-3 text-[#0d2c54]">
                      <CardIcon size={22} />
                    </div>
                    <h2 className="mt-4 text-lg font-black text-[#0d2c54]">{bi(language, item.label, item.mm)}</h2>
                    <p className="mt-2 text-sm text-slate-500">{bi(language, meta?.noteEn || item.description, meta?.noteMy || item.mmDescription)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-400">{bi(language, "Queue", "အရေအတွက်")}</p>
                    <p className={`mt-2 text-4xl font-black ${metricTone(count)}`}>{count}</p>
                  </div>
                </div>

                <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4 text-sm font-bold text-[#0d2c54]">
                  <span>{bi(language, "Open Portal", "Portal ဖွင့်မည်")}</span>
                  <ArrowRight size={16} className="transition group-hover:translate-x-1" />
                </div>
              </Link>
            );
          })}
        </div>
      )}

      <div className="mt-8 rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-black text-[#0d2c54]">{bi(language, "Critical Watch List", "အရေးကြီး စောင့်ကြည့်ရန်စာရင်း")}</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <WatchCard
            title={bi(language, "Warehouse Exceptions", "Warehouse Exception များ")}
            value={summary.warehouseExceptions}
            icon={<Warehouse size={18} className="text-rose-500" />}
          />
          <WatchCard
            title={bi(language, "Customer Alerts", "Customer Alert များ")}
            value={summary.customerServiceAlerts}
            icon={<BellRing size={18} className="text-amber-500" />}
          />
          <WatchCard
            title={bi(language, "Pending Auth Requests", "စောင့်ဆိုင်းနေသော Authorization များ")}
            value={summary.authPendingRequests}
            icon={<ShieldCheck size={18} className="text-sky-500" />}
          />
          <WatchCard
            title={bi(language, "Audit Events Today", "ယနေ့ Audit Event များ")}
            value={summary.auditEventsToday}
            icon={<FileSearch size={18} className="text-[#0d2c54]" />}
          />
        </div>
      </div>
    </div>
  );
}

function WatchCard({ title, value, icon }: { title: string; value: number; icon: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <div className="flex items-center justify-between gap-3">
        <div className="text-[11px] font-black uppercase tracking-[0.18em] text-slate-400">{title}</div>
        {icon}
      </div>
      <div className={`mt-4 text-3xl font-black ${metricTone(value)}`}>{value}</div>
    </div>
  );
}
