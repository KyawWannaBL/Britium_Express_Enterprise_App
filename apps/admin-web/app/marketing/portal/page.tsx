"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  BarChart3,
  CheckCircle2,
  Globe2,
  Megaphone,
  RefreshCw,
  Search,
  Store,
  Target,
  TrendingUp,
  UserPlus,
  Users,
  MapPinned,
  FileText,
  Send,
  AlertTriangle,
  Download,
  Phone,
  Building2,
  CalendarRange,
} from "lucide-react";
import {
  Bar,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  BarChart,
} from "recharts";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";

type UiLanguage = "en" | "my" | "both";
type PortalView =
  | "OVERVIEW"
  | "REGISTRY"
  | "KPI"
  | "PLAN"
  | "REPORT"
  | "PROGRESS";
type ToastTone = "ok" | "warn" | "err";
type LeadSource = "FIELD_VISIT" | "FACEBOOK" | "REFERRAL" | "CALL_CENTER" | "WALK_IN" | "OTHER";
type MerchantTier = "NEW" | "STANDARD" | "PRIORITY" | "ENTERPRISE";
type ReportStatus = "DRAFT" | "SUBMITTED" | "REVIEWED";

type AuthUser = {
  email?: string;
  role?: string;
  permissions?: string[];
  displayName?: string;
};

type CustomerRecord = {
  id: string;
  name: string;
  phone: string;
  township: string;
  address: string;
  source: LeadSource;
  interestedService: string;
  createdAt: string;
};

type MerchantRecord = {
  id: string;
  name: string;
  phone: string;
  township: string;
  address: string;
  category: string;
  tier: MerchantTier;
  activeParcels: number;
  monthlyTarget: number;
  monthlyActual: number;
  assignedMarketingStaff: string;
  joinedAt: string;
};

type MerchantKpi = {
  id: string;
  merchantId: string;
  merchantName: string;
  targetParcels: number;
  actualParcels: number;
  targetRevenueMmk: number;
  actualRevenueMmk: number;
  monthLabel: string;
  setBy: string;
};

type MarketingPlan = {
  id: string;
  title: string;
  marketingWay: string;
  destination: string;
  objective: string;
  plannedDate: string;
  estimatedLeads: number;
  owner: string;
  note: string;
};

type DailyReport = {
  id: string;
  reportDate: string;
  staffName: string;
  visitedMerchants: number;
  newLeads: number;
  convertedMerchants: number;
  issues: string;
  actions: string;
  status: ReportStatus;
};

type RegistryForm = {
  type: "CUSTOMER" | "MERCHANT";
  name: string;
  phone: string;
  township: string;
  address: string;
  source: LeadSource;
  interestedService: string;
  category: string;
  tier: MerchantTier;
  assignedMarketingStaff: string;
};

type KpiForm = {
  merchantId: string;
  targetParcels: string;
  targetRevenueMmk: string;
  monthLabel: string;
};

type PlanForm = {
  title: string;
  marketingWay: string;
  destination: string;
  objective: string;
  plannedDate: string;
  estimatedLeads: string;
  note: string;
};

type ReportForm = {
  reportDate: string;
  visitedMerchants: string;
  newLeads: string;
  convertedMerchants: string;
  issues: string;
  actions: string;
};

const ACCESS_ROLES = [
  "SYS",
  "SUPER_ADMIN",
  "ADMIN",
  "SUPERVISOR",
  "MARKETING",
  "MARKETING_MANAGER",
  "MARKETING_STAFF",
  "MARKETING_LEAD",
] as const;

const CUSTOMER_DATA: CustomerRecord[] = [
  {
    id: "cust-1",
    name: "Daw Su Myat",
    phone: "0978001001",
    township: "Kamayut",
    address: "Kamayut Township, Yangon",
    source: "FACEBOOK",
    interestedService: "Same Day Delivery",
    createdAt: "2026-01-24T08:30:00Z",
  },
  {
    id: "cust-2",
    name: "Ko Aung Pyae",
    phone: "0978001002",
    township: "Mayangone",
    address: "Mayangone Township, Yangon",
    source: "FIELD_VISIT",
    interestedService: "COD Delivery",
    createdAt: "2026-01-24T09:00:00Z",
  },
];

const MERCHANT_DATA: MerchantRecord[] = [
  {
    id: "m-1",
    name: "Beauty City",
    phone: "09767146464",
    township: "Kamayut",
    address: "Kamayut Township, Yangon",
    category: "Cosmetics",
    tier: "PRIORITY",
    activeParcels: 380,
    monthlyTarget: 500,
    monthlyActual: 420,
    assignedMarketingStaff: "Ma Pwint",
    joinedAt: "2025-11-03T00:00:00Z",
  },
  {
    id: "m-2",
    name: "Baby Htal War",
    phone: "09420664620",
    township: "Sanchaung",
    address: "8th Block, Sanchaung, Yangon",
    category: "Kids Fashion",
    tier: "STANDARD",
    activeParcels: 170,
    monthlyTarget: 250,
    monthlyActual: 180,
    assignedMarketingStaff: "Ma Pwint",
    joinedAt: "2025-12-15T00:00:00Z",
  },
  {
    id: "m-3",
    name: "Aqua Pet Aquarium Store",
    phone: "09792475880",
    township: "Thingangyun",
    address: "No.41, Bayint Naung Road, Yangon",
    category: "Pets",
    tier: "NEW",
    activeParcels: 95,
    monthlyTarget: 150,
    monthlyActual: 102,
    assignedMarketingStaff: "Ko Min Khant",
    joinedAt: "2026-01-02T00:00:00Z",
  },
  {
    id: "m-4",
    name: "Britium Fashion House",
    phone: "09409948999",
    township: "Lanmadaw",
    address: "Lanmadaw, Yangon",
    category: "Fashion",
    tier: "ENTERPRISE",
    activeParcels: 610,
    monthlyTarget: 800,
    monthlyActual: 650,
    assignedMarketingStaff: "Ko Min Khant",
    joinedAt: "2025-08-22T00:00:00Z",
  },
];

const KPI_DATA: MerchantKpi[] = [
  {
    id: "kpi-1",
    merchantId: "m-1",
    merchantName: "Beauty City",
    targetParcels: 500,
    actualParcels: 420,
    targetRevenueMmk: 2500000,
    actualRevenueMmk: 2140000,
    monthLabel: "2026-01",
    setBy: "admin@britium.com",
  },
  {
    id: "kpi-2",
    merchantId: "m-2",
    merchantName: "Baby Htal War",
    targetParcels: 250,
    actualParcels: 180,
    targetRevenueMmk: 1350000,
    actualRevenueMmk: 1020000,
    monthLabel: "2026-01",
    setBy: "super.admin@britium.com",
  },
  {
    id: "kpi-3",
    merchantId: "m-3",
    merchantName: "Aqua Pet Aquarium Store",
    targetParcels: 150,
    actualParcels: 102,
    targetRevenueMmk: 700000,
    actualRevenueMmk: 520000,
    monthLabel: "2026-01",
    setBy: "admin@britium.com",
  },
  {
    id: "kpi-4",
    merchantId: "m-4",
    merchantName: "Britium Fashion House",
    targetParcels: 800,
    actualParcels: 650,
    targetRevenueMmk: 4900000,
    actualRevenueMmk: 4100000,
    monthLabel: "2026-01",
    setBy: "super.admin@britium.com",
  },
];

const PLAN_DATA: MarketingPlan[] = [
  {
    id: "plan-1",
    title: "Yangon CBD Merchant Growth",
    marketingWay: "Field Visit + Printed Flyer",
    destination: "Lanmadaw, Latha, Pabedan",
    objective: "Sign 10 new fashion merchants",
    plannedDate: "2026-01-26",
    estimatedLeads: 24,
    owner: "Ma Pwint",
    note: "Target fashion and cosmetics clusters.",
  },
  {
    id: "plan-2",
    title: "Shops Near Highway Gate",
    marketingWay: "Phone Call + Messenger Outreach",
    destination: "Bayintnaung Highway Gate Zone",
    objective: "Reactivate paused merchants",
    plannedDate: "2026-01-27",
    estimatedLeads: 12,
    owner: "Ko Min Khant",
    note: "Focus on merchants with low parcel count last 30 days.",
  },
];

const REPORT_DATA: DailyReport[] = [
  {
    id: "report-1",
    reportDate: "2026-01-24",
    staffName: "Ma Pwint",
    visitedMerchants: 8,
    newLeads: 11,
    convertedMerchants: 2,
    issues: "Two merchants asked for COD settlement clarification.",
    actions: "Shared pricing sheet and scheduled follow-up visit.",
    status: "SUBMITTED",
  },
  {
    id: "report-2",
    reportDate: "2026-01-24",
    staffName: "Ko Min Khant",
    visitedMerchants: 5,
    newLeads: 7,
    convertedMerchants: 1,
    issues: "Need exclusive pricing proposal for one cosmetics merchant.",
    actions: "Prepared handoff note for Admin pricing team.",
    status: "REVIEWED",
  },
];

function bi(language: UiLanguage, en: string, my: string) {
  if (language === "en") return en;
  if (language === "my") return my;
  return `${en} / ${my}`;
}

function formatDate(input?: string) {
  if (!input) return "-";
  try {
    return new Date(input).toLocaleDateString();
  } catch {
    return input;
  }
}

function formatMMK(value: number) {
  return `${value.toLocaleString()} MMK`;
}

function tierClass(tier: MerchantTier) {
  if (tier === "ENTERPRISE") return "bg-violet-100 text-violet-700";
  if (tier === "PRIORITY") return "bg-amber-100 text-amber-700";
  if (tier === "STANDARD") return "bg-sky-100 text-sky-700";
  return "bg-emerald-100 text-emerald-700";
}

function reportStatusClass(status: ReportStatus) {
  if (status === "REVIEWED") return "bg-emerald-100 text-emerald-700";
  if (status === "SUBMITTED") return "bg-sky-100 text-sky-700";
  return "bg-slate-100 text-slate-700";
}

function getUser(auth: unknown): AuthUser {
  const value = auth as { user?: AuthUser } | undefined;
  return value?.user ?? {};
}

function hasAccess(user: AuthUser) {
  const role = (user.role ?? "").toUpperCase();
  return ACCESS_ROLES.includes(role as (typeof ACCESS_ROLES)[number]);
}

function canSetTargets(user: AuthUser) {
  const role = (user.role ?? "").toUpperCase();
  return role === "SYS" || role === "SUPER_ADMIN" || role === "ADMIN";
}

function canExport(user: AuthUser) {
  const role = (user.role ?? "").toUpperCase();
  return ["SYS", "SUPER_ADMIN", "ADMIN", "SUPERVISOR", "MARKETING_MANAGER"].includes(role);
}

async function fetchJson<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });
  const raw = await response.text();
  const parsed = raw ? JSON.parse(raw) : {};
  if (!response.ok) {
    throw new Error(parsed?.message || parsed?.error || `Request failed: ${response.status}`);
  }
  return (parsed?.data ?? parsed) as T;
}

function toCsv(rows: string[][]) {
  return rows
    .map((row) => row.map((cell) => `"${String(cell ?? "").replaceAll('"', '""')}"`).join(","))
    .join("\n");
}

function downloadCsv(filename: string, rows: string[][]) {
  const blob = new Blob([toCsv(rows)], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function emptyRegistryForm(): RegistryForm {
  return {
    type: "CUSTOMER",
    name: "",
    phone: "",
    township: "",
    address: "",
    source: "FIELD_VISIT",
    interestedService: "",
    category: "",
    tier: "NEW",
    assignedMarketingStaff: "",
  };
}

function emptyKpiForm(): KpiForm {
  return {
    merchantId: "",
    targetParcels: "",
    targetRevenueMmk: "",
    monthLabel: new Date().toISOString().slice(0, 7),
  };
}

function emptyPlanForm(): PlanForm {
  return {
    title: "",
    marketingWay: "",
    destination: "",
    objective: "",
    plannedDate: new Date().toISOString().slice(0, 10),
    estimatedLeads: "",
    note: "",
  };
}

function emptyReportForm(): ReportForm {
  return {
    reportDate: new Date().toISOString().slice(0, 10),
    visitedMerchants: "",
    newLeads: "",
    convertedMerchants: "",
    issues: "",
    actions: "",
  };
}

export default function MarketingPortalPage() {
  const contextLanguage = (() => {
    try {
      return useLanguage()?.lang as "en" | "mm" | undefined;
    } catch {
      return undefined;
    }
  })();
  const auth = (() => {
    try {
      return useAuth();
    } catch {
      return undefined;
    }
  })();

  const user = getUser(auth);
  const accessAllowed = hasAccess(user);
  const targetAllowed = canSetTargets(user);
  const exportAllowed = canExport(user);
  const actorName = user.displayName || user.email || "Marketing Staff";

  const [language, setLanguage] = useState<UiLanguage>(
    contextLanguage === "en" ? "en" : contextLanguage === "mm" ? "my" : "both",
  );
  const [view, setView] = useState<PortalView>("OVERVIEW");
  const [customers, setCustomers] = useState<CustomerRecord[]>(CUSTOMER_DATA);
  const [merchants, setMerchants] = useState<MerchantRecord[]>(MERCHANT_DATA);
  const [kpis, setKpis] = useState<MerchantKpi[]>(KPI_DATA);
  const [plans, setPlans] = useState<MarketingPlan[]>(PLAN_DATA);
  const [reports, setReports] = useState<DailyReport[]>(REPORT_DATA);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ tone: ToastTone; message: string } | null>(null);
  const [registryForm, setRegistryForm] = useState<RegistryForm>(emptyRegistryForm());
  const [kpiForm, setKpiForm] = useState<KpiForm>(emptyKpiForm());
  const [planForm, setPlanForm] = useState<PlanForm>(emptyPlanForm());
  const [reportForm, setReportForm] = useState<ReportForm>(emptyReportForm());
  const searchRef = useRef<HTMLInputElement | null>(null);

  const t = useCallback((en: string, my: string) => bi(language, en, my), [language]);

  useEffect(() => {
    searchRef.current?.focus();
  }, [view]);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(null), 2600);
    return () => window.clearTimeout(timer);
  }, [toast]);

  useEffect(() => {
    let ignore = false;
    async function bootstrap() {
      if (!accessAllowed) return;
      setLoading(true);
      try {
        const [remoteCustomers, remoteMerchants, remoteKpis, remotePlans, remoteReports] = await Promise.allSettled([
          fetchJson<CustomerRecord[]>("/api/v1/marketing/customers"),
          fetchJson<MerchantRecord[]>("/api/v1/marketing/merchants"),
          fetchJson<MerchantKpi[]>("/api/v1/marketing/kpis"),
          fetchJson<MarketingPlan[]>("/api/v1/marketing/plans"),
          fetchJson<DailyReport[]>("/api/v1/marketing/reports"),
        ]);
        if (ignore) return;
        if (remoteCustomers.status === "fulfilled" && remoteCustomers.value.length) setCustomers(remoteCustomers.value);
        if (remoteMerchants.status === "fulfilled" && remoteMerchants.value.length) setMerchants(remoteMerchants.value);
        if (remoteKpis.status === "fulfilled" && remoteKpis.value.length) setKpis(remoteKpis.value);
        if (remotePlans.status === "fulfilled" && remotePlans.value.length) setPlans(remotePlans.value);
        if (remoteReports.status === "fulfilled" && remoteReports.value.length) setReports(remoteReports.value);
      } catch {
        // fallback remains
      } finally {
        if (!ignore) setLoading(false);
      }
    }
    bootstrap();
    return () => {
      ignore = true;
    };
  }, [accessAllowed]);

  const filteredMerchants = useMemo(() => {
    const q = query.trim().toLowerCase();
    return merchants.filter((item) => {
      if (!q) return true;
      return [item.name, item.phone, item.township, item.category, item.assignedMarketingStaff]
        .join(" ")
        .toLowerCase()
        .includes(q);
    });
  }, [merchants, query]);

  const filteredCustomers = useMemo(() => {
    const q = query.trim().toLowerCase();
    return customers.filter((item) => {
      if (!q) return true;
      return [item.name, item.phone, item.township, item.interestedService, item.source]
        .join(" ")
        .toLowerCase()
        .includes(q);
    });
  }, [customers, query]);

  const filteredPlans = useMemo(() => {
    const q = query.trim().toLowerCase();
    return plans.filter((item) => {
      if (!q) return true;
      return [item.title, item.marketingWay, item.destination, item.objective, item.owner]
        .join(" ")
        .toLowerCase()
        .includes(q);
    });
  }, [plans, query]);

  const filteredReports = useMemo(() => {
    const q = query.trim().toLowerCase();
    return reports.filter((item) => {
      if (!q) return true;
      return [item.staffName, item.issues, item.actions, item.reportDate]
        .join(" ")
        .toLowerCase()
        .includes(q);
    });
  }, [reports, query]);

  const chartData = useMemo(
    () =>
      kpis.map((item) => ({
        merchant: item.merchantName,
        target: item.targetParcels,
        actual: item.actualParcels,
      })),
    [kpis],
  );

  const overview = useMemo(() => {
    return {
      totalMerchants: merchants.length,
      totalCustomers: customers.length,
      totalTarget: kpis.reduce((sum, item) => sum + item.targetParcels, 0),
      totalActual: kpis.reduce((sum, item) => sum + item.actualParcels, 0),
      totalRevenueTarget: kpis.reduce((sum, item) => sum + item.targetRevenueMmk, 0),
      totalRevenueActual: kpis.reduce((sum, item) => sum + item.actualRevenueMmk, 0),
      submittedReports: reports.filter((item) => item.status !== "DRAFT").length,
    };
  }, [customers.length, kpis, merchants.length, reports]);

  const handleExport = useCallback(
    (kind: "MERCHANTS" | "CUSTOMERS" | "KPIS" | "PLANS" | "REPORTS") => {
      if (!exportAllowed) {
        setToast({ tone: "err", message: t("You do not have export access.", "Export လုပ်ရန် ခွင့်ပြုချက်မရှိပါ။") });
        return;
      }

      if (kind === "MERCHANTS") {
        downloadCsv("marketing-merchants.csv", [
          ["name", "phone", "township", "category", "tier", "monthlyTarget", "monthlyActual", "assignedMarketingStaff"],
          ...filteredMerchants.map((item) => [
            item.name,
            item.phone,
            item.township,
            item.category,
            item.tier,
            String(item.monthlyTarget),
            String(item.monthlyActual),
            item.assignedMarketingStaff,
          ]),
        ]);
      }
      if (kind === "CUSTOMERS") {
        downloadCsv("marketing-customers.csv", [
          ["name", "phone", "township", "source", "interestedService", "createdAt"],
          ...filteredCustomers.map((item) => [
            item.name,
            item.phone,
            item.township,
            item.source,
            item.interestedService,
            item.createdAt,
          ]),
        ]);
      }
      if (kind === "KPIS") {
        downloadCsv("marketing-kpis.csv", [
          ["merchantName", "monthLabel", "targetParcels", "actualParcels", "targetRevenueMmk", "actualRevenueMmk", "setBy"],
          ...kpis.map((item) => [
            item.merchantName,
            item.monthLabel,
            String(item.targetParcels),
            String(item.actualParcels),
            String(item.targetRevenueMmk),
            String(item.actualRevenueMmk),
            item.setBy,
          ]),
        ]);
      }
      if (kind === "PLANS") {
        downloadCsv("marketing-plans.csv", [
          ["title", "marketingWay", "destination", "objective", "plannedDate", "estimatedLeads", "owner", "note"],
          ...filteredPlans.map((item) => [
            item.title,
            item.marketingWay,
            item.destination,
            item.objective,
            item.plannedDate,
            String(item.estimatedLeads),
            item.owner,
            item.note,
          ]),
        ]);
      }
      if (kind === "REPORTS") {
        downloadCsv("marketing-reports.csv", [
          ["reportDate", "staffName", "visitedMerchants", "newLeads", "convertedMerchants", "issues", "actions", "status"],
          ...filteredReports.map((item) => [
            item.reportDate,
            item.staffName,
            String(item.visitedMerchants),
            String(item.newLeads),
            String(item.convertedMerchants),
            item.issues,
            item.actions,
            item.status,
          ]),
        ]);
      }

      setToast({ tone: "ok", message: t("Export generated.", "Export ဖိုင်ထုတ်ပြီးပါပြီ။") });
    },
    [exportAllowed, filteredCustomers, filteredMerchants, filteredPlans, filteredReports, kpis, t],
  );

  const handleRegister = useCallback(async () => {
    if (!registryForm.name.trim() || !registryForm.phone.trim() || !registryForm.township.trim()) {
      setToast({ tone: "err", message: t("Please complete required registry fields.", "လိုအပ်သော registry အကွက်များကို ဖြည့်ပါ။") });
      return;
    }

    try {
      if (registryForm.type === "CUSTOMER") {
        const payload: CustomerRecord = {
          id: crypto.randomUUID(),
          name: registryForm.name.trim(),
          phone: registryForm.phone.trim(),
          township: registryForm.township.trim(),
          address: registryForm.address.trim(),
          source: registryForm.source,
          interestedService: registryForm.interestedService.trim() || "General Delivery",
          createdAt: new Date().toISOString(),
        };
        try {
          await fetchJson<CustomerRecord>("/api/v1/marketing/customers", {
            method: "POST",
            body: JSON.stringify(payload),
          });
        } catch {
          // local fallback
        }
        setCustomers((prev) => [payload, ...prev]);
      } else {
        const payload: MerchantRecord = {
          id: crypto.randomUUID(),
          name: registryForm.name.trim(),
          phone: registryForm.phone.trim(),
          township: registryForm.township.trim(),
          address: registryForm.address.trim(),
          category: registryForm.category.trim() || "General",
          tier: registryForm.tier,
          activeParcels: 0,
          monthlyTarget: 0,
          monthlyActual: 0,
          assignedMarketingStaff: registryForm.assignedMarketingStaff.trim() || actorName,
          joinedAt: new Date().toISOString(),
        };
        try {
          await fetchJson<MerchantRecord>("/api/v1/marketing/merchants", {
            method: "POST",
            body: JSON.stringify(payload),
          });
        } catch {
          // local fallback
        }
        setMerchants((prev) => [payload, ...prev]);
      }
      setRegistryForm(emptyRegistryForm());
      setToast({ tone: "ok", message: t("Registry entry saved.", "Registry entry ကို သိမ်းပြီးပါပြီ။") });
    } catch (error) {
      setToast({ tone: "err", message: error instanceof Error ? error.message : t("Unable to save registry entry.", "Registry entry ကို မသိမ်းနိုင်ပါ။") });
    }
  }, [actorName, registryForm, t]);

  const handleSaveKpi = useCallback(async () => {
    if (!targetAllowed) {
      setToast({ tone: "err", message: t("Only Super Admin and Admin can set merchant targets.", "Merchant target များကို Super Admin နှင့် Admin သာ သတ်မှတ်နိုင်သည်။") });
      return;
    }
    const merchant = merchants.find((item) => item.id === kpiForm.merchantId);
    if (!merchant || !kpiForm.targetParcels || !kpiForm.targetRevenueMmk || !kpiForm.monthLabel) {
      setToast({ tone: "err", message: t("Please select merchant and target fields.", "Merchant နှင့် target အချက်အလက်များကို ရွေးပါ။") });
      return;
    }

    const payload: MerchantKpi = {
      id: crypto.randomUUID(),
      merchantId: merchant.id,
      merchantName: merchant.name,
      targetParcels: Number(kpiForm.targetParcels),
      actualParcels: merchant.monthlyActual,
      targetRevenueMmk: Number(kpiForm.targetRevenueMmk),
      actualRevenueMmk: 0,
      monthLabel: kpiForm.monthLabel,
      setBy: actorName,
    };

    try {
      try {
        await fetchJson<MerchantKpi>("/api/v1/marketing/kpis", {
          method: "POST",
          body: JSON.stringify(payload),
        });
      } catch {
        // local fallback
      }
      setKpis((prev) => [payload, ...prev.filter((item) => !(item.merchantId === payload.merchantId && item.monthLabel === payload.monthLabel))]);
      setMerchants((prev) =>
        prev.map((item) =>
          item.id === merchant.id
            ? {
                ...item,
                monthlyTarget: payload.targetParcels,
              }
            : item,
        ),
      );
      setKpiForm(emptyKpiForm());
      setToast({ tone: "ok", message: t("Merchant KPI target saved.", "Merchant KPI target ကို သိမ်းပြီးပါပြီ။") });
    } catch (error) {
      setToast({ tone: "err", message: error instanceof Error ? error.message : t("Unable to save KPI.", "KPI ကို မသိမ်းနိုင်ပါ။") });
    }
  }, [actorName, kpiForm, merchants, t, targetAllowed]);

  const handleSavePlan = useCallback(async () => {
    if (!planForm.title.trim() || !planForm.marketingWay.trim() || !planForm.destination.trim() || !planForm.objective.trim()) {
      setToast({ tone: "err", message: t("Please complete marketing plan fields.", "Marketing plan အကွက်များကို ဖြည့်ပါ။") });
      return;
    }

    const payload: MarketingPlan = {
      id: crypto.randomUUID(),
      title: planForm.title.trim(),
      marketingWay: planForm.marketingWay.trim(),
      destination: planForm.destination.trim(),
      objective: planForm.objective.trim(),
      plannedDate: planForm.plannedDate,
      estimatedLeads: Number(planForm.estimatedLeads || 0),
      owner: actorName,
      note: planForm.note.trim(),
    };

    try {
      try {
        await fetchJson<MarketingPlan>("/api/v1/marketing/plans", {
          method: "POST",
          body: JSON.stringify(payload),
        });
      } catch {
        // local fallback
      }
      setPlans((prev) => [payload, ...prev]);
      setPlanForm(emptyPlanForm());
      setToast({ tone: "ok", message: t("Marketing plan saved.", "Marketing plan ကို သိမ်းပြီးပါပြီ။") });
    } catch (error) {
      setToast({ tone: "err", message: error instanceof Error ? error.message : t("Unable to save plan.", "Marketing plan ကို မသိမ်းနိုင်ပါ။") });
    }
  }, [actorName, planForm, t]);

  const handleSubmitReport = useCallback(async () => {
    if (!reportForm.reportDate || !reportForm.visitedMerchants || !reportForm.newLeads || !reportForm.convertedMerchants) {
      setToast({ tone: "err", message: t("Please complete daily report numbers.", "နေ့စဉ် report ဂဏန်းအချက်အလက်များကို ဖြည့်ပါ။") });
      return;
    }

    const payload: DailyReport = {
      id: crypto.randomUUID(),
      reportDate: reportForm.reportDate,
      staffName: actorName,
      visitedMerchants: Number(reportForm.visitedMerchants),
      newLeads: Number(reportForm.newLeads),
      convertedMerchants: Number(reportForm.convertedMerchants),
      issues: reportForm.issues.trim(),
      actions: reportForm.actions.trim(),
      status: "SUBMITTED",
    };

    try {
      try {
        await fetchJson<DailyReport>("/api/v1/marketing/reports", {
          method: "POST",
          body: JSON.stringify(payload),
        });
      } catch {
        // local fallback
      }
      setReports((prev) => [payload, ...prev]);
      setReportForm(emptyReportForm());
      setToast({ tone: "ok", message: t("Daily report submitted.", "နေ့စဉ် report ကို တင်သွင်းပြီးပါပြီ။") });
    } catch (error) {
      setToast({ tone: "err", message: error instanceof Error ? error.message : t("Unable to submit report.", "နေ့စဉ် report ကို မတင်နိုင်ပါ။") });
    }
  }, [actorName, reportForm, t]);

  if (!accessAllowed) {
    return (
      <div className="min-h-screen bg-[#f7f9fc] p-8">
        <div className="rounded-[32px] border border-rose-200 bg-white p-8 shadow-sm">
          <div className="flex items-start gap-4">
            <div className="rounded-2xl bg-rose-50 p-3 text-rose-600">
              <AlertTriangle size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-black text-[#0d2c54]">Marketing Portal Access Restricted</h1>
              <p className="mt-2 text-sm text-slate-500">
                This portal is only for Super Admin, Admin, Supervisor, and Marketing team members. /
                ဤ portal ကို Super Admin, Admin, Supervisor နှင့် Marketing team ဝန်ထမ်းများသာ အသုံးပြုနိုင်သည်။
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
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-slate-400">Growth & Acquisition</p>
          <h1 className="text-4xl font-black uppercase tracking-tight text-[#0d2c54]">
            Marketing Portal <span className="font-normal text-blue-500">/ စျေးကွက်ဖွံ့ဖြိုးရေး ပေါ်တယ်</span>
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            {t(
              "Customer and merchant registration, merchant KPI tracking, marketing plans, daily reports, and progress charts in one bilingual workspace.",
              "Customer နှင့် merchant registration, merchant KPI စောင့်ကြည့်မှု, marketing plan, နေ့စဉ် report နှင့် progress chart များကို bilingual workspace တစ်ခုတည်းတွင် စုစည်းထားသည်။",
            )}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <LanguageToggle value={language} onChange={setLanguage} />
          <button
            type="button"
            onClick={() => setToast({ tone: "ok", message: t("Portal refreshed.", "Portal ကို refresh လုပ်ပြီးပါပြီ။") })}
            className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-xs font-black uppercase tracking-wider text-slate-600 hover:bg-slate-50"
          >
            <RefreshCw size={14} /> Refresh
          </button>
        </div>
      </div>

      {toast ? (
        <div
          className={`mt-6 rounded-2xl border px-4 py-3 text-sm font-semibold ${
            toast.tone === "ok"
              ? "border-emerald-200 bg-emerald-50 text-emerald-700"
              : toast.tone === "warn"
                ? "border-amber-200 bg-amber-50 text-amber-700"
                : "border-rose-200 bg-rose-50 text-rose-700"
          }`}
        >
          {toast.message}
        </div>
      ) : null}

      <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={Store} title={t("Current Merchants", "လက်ရှိ Merchant များ")} value={String(overview.totalMerchants)} />
        <StatCard icon={Users} title={t("Registered Customers", "မှတ်ပုံတင်ထားသော Customer များ")} value={String(overview.totalCustomers)} accent="sky" />
        <StatCard icon={Target} title={t("Parcel Target", "Parcel Target")} value={overview.totalTarget.toLocaleString()} accent="amber" />
        <StatCard icon={TrendingUp} title={t("Actual Parcels", "အမှန်တကယ် Parcels")} value={overview.totalActual.toLocaleString()} accent="emerald" />
      </div>

      <div className="mt-8 flex flex-wrap gap-3">
        <ViewButton active={view === "OVERVIEW"} onClick={() => setView("OVERVIEW")} label={t("Overview", "အနှစ်ချုပ်")} />
        <ViewButton active={view === "REGISTRY"} onClick={() => setView("REGISTRY")} label={t("Customer & Merchant Registry", "Customer နှင့် Merchant Registry")} />
        <ViewButton active={view === "KPI"} onClick={() => setView("KPI")} label={t("Merchant KPI", "Merchant KPI")} />
        <ViewButton active={view === "PLAN"} onClick={() => setView("PLAN")} label={t("Marketing Plans", "Marketing Plan များ")} />
        <ViewButton active={view === "REPORT"} onClick={() => setView("REPORT")} label={t("Daily Reports", "နေ့စဉ် Report များ")} />
        <ViewButton active={view === "PROGRESS"} onClick={() => setView("PROGRESS")} label={t("Progress Board", "Progress Board")} />
      </div>

      <div className="mt-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="relative w-full md:max-w-xl">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            ref={searchRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t("Search merchant, customer, township, plan, or report...", "merchant, customer, township, plan သို့မဟုတ် report ဖြင့်ရှာရန်...")}
            className="w-full rounded-2xl border border-slate-200 bg-white py-3 pl-11 pr-4 text-sm outline-none focus:border-[#0d2c54]"
          />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {exportAllowed ? (
            <button
              type="button"
              onClick={() => handleExport(view === "REGISTRY" ? "MERCHANTS" : view === "REPORT" ? "REPORTS" : view === "PLAN" ? "PLANS" : "KPIS")}
              className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-xs font-black uppercase tracking-wider text-slate-600 hover:bg-slate-50"
            >
              <Download size={14} /> {t("Export Current View", "လက်ရှိ View ကို Export ထုတ်မည်")}
            </button>
          ) : null}
        </div>
      </div>

      {view === "OVERVIEW" ? (
        <div className="mt-8 grid gap-4 xl:grid-cols-[1fr_1fr]">
          <Panel title={t("Performance Snapshot", "လုပ်ဆောင်မှု အနှစ်ချုပ်") }>
            <div className="grid gap-4 md:grid-cols-2">
              <InfoCard title={t("Revenue Target", "ဝင်ငွေ Target")} value={formatMMK(overview.totalRevenueTarget)} icon={<BarChart3 size={16} className="text-[#0d2c54]" />} />
              <InfoCard title={t("Revenue Actual", "အမှန်တကယ် ဝင်ငွေ")} value={formatMMK(overview.totalRevenueActual)} icon={<TrendingUp size={16} className="text-[#0d2c54]" />} />
              <InfoCard title={t("Submitted Reports", "တင်သွင်းထားသော Report များ")} value={String(overview.submittedReports)} icon={<FileText size={16} className="text-[#0d2c54]" />} />
              <InfoCard title={t("Active Plans", "အသုံးပြုနေသော Plan များ")} value={String(plans.length)} icon={<Megaphone size={16} className="text-[#0d2c54]" />} />
            </div>
          </Panel>

          <Panel title={t("Merchant Progress vs Target", "Merchant Progress နှင့် Target နှိုင်းယှဉ်မှု") }>
            <div className="h-[320px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="merchant" tick={{ fontSize: 11 }} />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="target" name={t("Target", "Target")} radius={[8, 8, 0, 0]} />
                  <Bar dataKey="actual" name={t("Actual", "အမှန်တကယ်")} radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Panel>

          <Panel title={t("Top Merchants", "ထိပ်တန်း Merchant များ") }>
            <div className="space-y-3">
              {filteredMerchants.slice(0, 4).map((item) => (
                <div key={item.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div className="font-black text-[#0d2c54]">{item.name}</div>
                    <span className={`rounded-full px-3 py-1 text-[10px] font-black uppercase ${tierClass(item.tier)}`}>{item.tier}</span>
                  </div>
                  <div className="mt-2 text-sm text-slate-500">{item.category} • {item.township}</div>
                  <div className="mt-2 text-sm font-semibold text-slate-700">{t("Parcel Progress", "Parcel Progress")} : {item.monthlyActual} / {item.monthlyTarget}</div>
                </div>
              ))}
            </div>
          </Panel>

          <Panel title={t("Today’s Daily Reports", "ယနေ့ နေ့စဉ် Report များ") }>
            <div className="space-y-3">
              {filteredReports.slice(0, 4).map((item) => (
                <div key={item.id} className="rounded-2xl border border-slate-200 bg-white p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div className="font-black text-[#0d2c54]">{item.staffName}</div>
                    <span className={`rounded-full px-3 py-1 text-[10px] font-black uppercase ${reportStatusClass(item.status)}`}>{item.status}</span>
                  </div>
                  <div className="mt-2 text-sm text-slate-500">{formatDate(item.reportDate)}</div>
                  <div className="mt-2 text-sm font-semibold text-slate-700">{t("Visited", "တွေ့ဆုံခဲ့သော merchant များ")} : {item.visitedMerchants} • {t("Leads", "Lead များ")} : {item.newLeads}</div>
                </div>
              ))}
            </div>
          </Panel>
        </div>
      ) : null}

      {view === "REGISTRY" ? (
        <div className="mt-8 grid gap-4 xl:grid-cols-[0.95fr_1.05fr]">
          <Panel
            title={t("Register Customer / Merchant", "Customer / Merchant မှတ်ပုံတင်ရန်")}
            subtitle={t("Marketing staff can register customers and merchants and keep basic lead information ready.", "Marketing staff များသည် customer နှင့် merchant များကို မှတ်ပုံတင်ပြီး lead အခြေခံအချက်အလက်များကို စနစ်တကျထားနိုင်သည်။")}
          >
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-[11px] font-black uppercase tracking-[0.2em] text-slate-500">{t("Record Type", "Record အမျိုးအစား")}</label>
                <select value={registryForm.type} onChange={(e) => setRegistryForm((prev) => ({ ...prev, type: e.target.value as RegistryForm["type"] }))} className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-700 outline-none">
                  <option value="CUSTOMER">CUSTOMER</option>
                  <option value="MERCHANT">MERCHANT</option>
                </select>
              </div>
              <Field label={t("Name *", "အမည် *")} value={registryForm.name} onChange={(value) => setRegistryForm((prev) => ({ ...prev, name: value }))} />
              <Field label={t("Phone *", "ဖုန်း *")} value={registryForm.phone} onChange={(value) => setRegistryForm((prev) => ({ ...prev, phone: value }))} />
              <Field label={t("Township *", "မြို့နယ် *")} value={registryForm.township} onChange={(value) => setRegistryForm((prev) => ({ ...prev, township: value }))} />
              <Field label={t("Address", "လိပ်စာ")} value={registryForm.address} onChange={(value) => setRegistryForm((prev) => ({ ...prev, address: value }))} />
              <div>
                <label className="mb-2 block text-[11px] font-black uppercase tracking-[0.2em] text-slate-500">{t("Lead Source", "Lead Source")}</label>
                <select value={registryForm.source} onChange={(e) => setRegistryForm((prev) => ({ ...prev, source: e.target.value as LeadSource }))} className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-700 outline-none">
                  <option value="FIELD_VISIT">FIELD_VISIT</option>
                  <option value="FACEBOOK">FACEBOOK</option>
                  <option value="REFERRAL">REFERRAL</option>
                  <option value="CALL_CENTER">CALL_CENTER</option>
                  <option value="WALK_IN">WALK_IN</option>
                  <option value="OTHER">OTHER</option>
                </select>
              </div>
              {registryForm.type === "CUSTOMER" ? (
                <Field label={t("Interested Service", "စိတ်ဝင်စားသော Service")} value={registryForm.interestedService} onChange={(value) => setRegistryForm((prev) => ({ ...prev, interestedService: value }))} />
              ) : (
                <>
                  <Field label={t("Merchant Category", "Merchant Category")} value={registryForm.category} onChange={(value) => setRegistryForm((prev) => ({ ...prev, category: value }))} />
                  <div>
                    <label className="mb-2 block text-[11px] font-black uppercase tracking-[0.2em] text-slate-500">{t("Merchant Tier", "Merchant Tier")}</label>
                    <select value={registryForm.tier} onChange={(e) => setRegistryForm((prev) => ({ ...prev, tier: e.target.value as MerchantTier }))} className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-700 outline-none">
                      <option value="NEW">NEW</option>
                      <option value="STANDARD">STANDARD</option>
                      <option value="PRIORITY">PRIORITY</option>
                      <option value="ENTERPRISE">ENTERPRISE</option>
                    </select>
                  </div>
                  <Field label={t("Assigned Staff", "တာဝန်ပေးထားသော Staff")} value={registryForm.assignedMarketingStaff} onChange={(value) => setRegistryForm((prev) => ({ ...prev, assignedMarketingStaff: value }))} />
                </>
              )}
            </div>
            <div className="mt-4">
              <button type="button" onClick={handleRegister} className="inline-flex items-center gap-2 rounded-2xl bg-[#ffd700] px-6 py-3 text-sm font-black uppercase tracking-wider text-[#0d2c54]">
                <UserPlus size={16} /> {t("Save Registry", "Registry ကို သိမ်းမည်")}
              </button>
            </div>
          </Panel>

          <Panel
            title={t("Current Registry Information", "လက်ရှိ Registry အချက်အလက်များ")}
            subtitle={t("Marketing team can quickly check customer and merchant information related to their tasks.", "Marketing team များသည် ၎င်းတို့၏လုပ်ငန်းနှင့်ဆက်စပ်သော customer နှင့် merchant အချက်အလက်များကို မြန်ဆန်စွာ စစ်ဆေးနိုင်သည်။")}
          >
            <div className="space-y-6">
              <div>
                <div className="mb-3 text-sm font-black uppercase tracking-[0.2em] text-slate-400">{t("Merchants", "Merchant များ")}</div>
                <div className="space-y-3">
                  {filteredMerchants.slice(0, 4).map((item) => (
                    <div key={item.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                      <div className="flex items-center justify-between gap-3">
                        <div className="font-black text-[#0d2c54]">{item.name}</div>
                        <span className={`rounded-full px-3 py-1 text-[10px] font-black uppercase ${tierClass(item.tier)}`}>{item.tier}</span>
                      </div>
                      <div className="mt-2 text-sm text-slate-500">{item.phone} • {item.township}</div>
                      <div className="mt-1 text-sm text-slate-500">{item.category} • {item.assignedMarketingStaff}</div>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <div className="mb-3 text-sm font-black uppercase tracking-[0.2em] text-slate-400">{t("Customers", "Customer များ")}</div>
                <div className="space-y-3">
                  {filteredCustomers.slice(0, 3).map((item) => (
                    <div key={item.id} className="rounded-2xl border border-slate-200 bg-white p-4">
                      <div className="font-black text-[#0d2c54]">{item.name}</div>
                      <div className="mt-2 text-sm text-slate-500">{item.phone} • {item.township}</div>
                      <div className="mt-1 text-sm text-slate-500">{item.interestedService} • {item.source}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Panel>
        </div>
      ) : null}

      {view === "KPI" ? (
        <div className="mt-8 grid gap-4 xl:grid-cols-[0.9fr_1.1fr]">
          <Panel
            title={t("Merchant KPI Target Form", "Merchant KPI Target ဖောင်")}
            subtitle={t("Super Admin and Admin can set monthly merchant targets for marketing team progress tracking.", "Marketing team progress စောင့်ကြည့်ရန်အတွက် Super Admin နှင့် Admin တို့သည် merchant monthly target များသတ်မှတ်နိုင်သည်။")}
          >
            <div className="grid gap-4">
              <div>
                <label className="mb-2 block text-[11px] font-black uppercase tracking-[0.2em] text-slate-500">{t("Merchant", "Merchant")}</label>
                <select value={kpiForm.merchantId} onChange={(e) => setKpiForm((prev) => ({ ...prev, merchantId: e.target.value }))} className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-700 outline-none">
                  <option value="">{t("Choose merchant", "Merchant ရွေးပါ")}</option>
                  {merchants.map((item) => (
                    <option key={item.id} value={item.id}>{item.name}</option>
                  ))}
                </select>
              </div>
              <Field label={t("Target Parcels", "Target Parcel အရေအတွက်")} value={kpiForm.targetParcels} onChange={(value) => setKpiForm((prev) => ({ ...prev, targetParcels: value }))} type="number" />
              <Field label={t("Target Revenue (MMK)", "Target Revenue (MMK)")} value={kpiForm.targetRevenueMmk} onChange={(value) => setKpiForm((prev) => ({ ...prev, targetRevenueMmk: value }))} type="number" />
              <Field label={t("Month", "လ") } value={kpiForm.monthLabel} onChange={(value) => setKpiForm((prev) => ({ ...prev, monthLabel: value }))} type="month" />
              <button type="button" onClick={handleSaveKpi} className="inline-flex items-center gap-2 rounded-2xl bg-[#0d2c54] px-6 py-3 text-sm font-black uppercase tracking-wider text-white">
                <Target size={16} /> {t("Save Target", "Target ကို သိမ်းမည်")}
              </button>
              {!targetAllowed ? (
                <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
                  {t("Target editing is limited to Super Admin and Admin.", "Target ပြင်ဆင်ခွင့်ကို Super Admin နှင့် Admin တို့အတွက်သာ ကန့်သတ်ထားသည်။")}
                </div>
              ) : null}
            </div>
          </Panel>

          <Panel
            title={t("Merchant KPI Board", "Merchant KPI Board")}
            subtitle={t("Marketing staff can see the merchants, their parcel performance, and the gap against assigned target clearly.", "Marketing staff များသည် merchant များ၏ parcel လုပ်ဆောင်မှုနှင့် ပေးထားသော target အကြားကွာဟမှုကို ရှင်းလင်းစွာ မြင်နိုင်သည်။")}
          >
            <div className="overflow-hidden rounded-2xl border border-slate-200">
              <table className="min-w-full text-sm">
                <thead className="bg-slate-50 text-left text-slate-500">
                  <tr>
                    <th className="px-4 py-3 font-black">{t("Merchant", "Merchant")}</th>
                    <th className="px-4 py-3 font-black">{t("Target Parcels", "Target Parcel")}</th>
                    <th className="px-4 py-3 font-black">{t("Actual Parcels", "Actual Parcel")}</th>
                    <th className="px-4 py-3 font-black">{t("Target Revenue", "Target Revenue")}</th>
                    <th className="px-4 py-3 font-black">{t("Actual Revenue", "Actual Revenue")}</th>
                    <th className="px-4 py-3 font-black">{t("Month", "လ")}</th>
                  </tr>
                </thead>
                <tbody>
                  {kpis.map((item) => (
                    <tr key={item.id} className="border-t border-slate-100">
                      <td className="px-4 py-3 font-semibold text-[#0d2c54]">{item.merchantName}</td>
                      <td className="px-4 py-3">{item.targetParcels}</td>
                      <td className="px-4 py-3">{item.actualParcels}</td>
                      <td className="px-4 py-3">{formatMMK(item.targetRevenueMmk)}</td>
                      <td className="px-4 py-3">{formatMMK(item.actualRevenueMmk)}</td>
                      <td className="px-4 py-3">{item.monthLabel}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Panel>
        </div>
      ) : null}

      {view === "PLAN" ? (
        <div className="mt-8 grid gap-4 xl:grid-cols-[0.9fr_1.1fr]">
          <Panel
            title={t("Marketing Plan Form", "Marketing Plan ဖောင်")}
            subtitle={t("Marketing team can plan the marketing way, destination area, and objective for daily execution.", "Marketing team သည် marketing way, destination area နှင့် objective တို့ကို နေ့စဉ်အကောင်အထည်ဖော်ရန် စီစဉ်နိုင်သည်။")}
          >
            <div className="grid gap-4 md:grid-cols-2">
              <Field label={t("Plan Title", "Plan ခေါင်းစဉ်")} value={planForm.title} onChange={(value) => setPlanForm((prev) => ({ ...prev, title: value }))} />
              <Field label={t("Planned Date", "စီစဉ်သည့်ရက်") } value={planForm.plannedDate} onChange={(value) => setPlanForm((prev) => ({ ...prev, plannedDate: value }))} type="date" />
              <Field label={t("Marketing Way", "Marketing လုပ်နည်း")} value={planForm.marketingWay} onChange={(value) => setPlanForm((prev) => ({ ...prev, marketingWay: value }))} />
              <Field label={t("Destination", "သွားရမည့်နေရာ")} value={planForm.destination} onChange={(value) => setPlanForm((prev) => ({ ...prev, destination: value }))} />
              <Field label={t("Estimated Leads", "ခန့်မှန်း Lead အရေအတွက်")} value={planForm.estimatedLeads} onChange={(value) => setPlanForm((prev) => ({ ...prev, estimatedLeads: value }))} type="number" />
              <Field label={t("Objective", "ရည်ရွယ်ချက်")} value={planForm.objective} onChange={(value) => setPlanForm((prev) => ({ ...prev, objective: value }))} />
            </div>
            <div className="mt-4">
              <label className="mb-2 block text-[11px] font-black uppercase tracking-[0.2em] text-slate-500">{t("Notes", "မှတ်ချက်")}</label>
              <textarea value={planForm.note} onChange={(e) => setPlanForm((prev) => ({ ...prev, note: e.target.value }))} className="min-h-[140px] w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none" />
            </div>
            <div className="mt-4">
              <button type="button" onClick={handleSavePlan} className="inline-flex items-center gap-2 rounded-2xl bg-[#ffd700] px-6 py-3 text-sm font-black uppercase tracking-wider text-[#0d2c54]">
                <MapPinned size={16} /> {t("Save Plan", "Plan ကို သိမ်းမည်")}
              </button>
            </div>
          </Panel>

          <Panel
            title={t("Planned Marketing Ways", "စီစဉ်ထားသော Marketing Ways")}
            subtitle={t("The team can review where to go, how to approach, and what the objective is for each plan.", "Plan တစ်ခုစီအတွက် ဘယ်နေရာသို့သွားမည်၊ ဘယ်လိုချဉ်းကပ်မည်၊ ဘာရည်ရွယ်ချက်ရှိသည်ကို အဖွဲ့က စစ်ဆေးနိုင်သည်။")}
          >
            <div className="space-y-3">
              {filteredPlans.map((item) => (
                <div key={item.id} className="rounded-2xl border border-slate-200 bg-white p-4">
                  <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                    <div>
                      <div className="font-black text-[#0d2c54]">{item.title}</div>
                      <div className="mt-1 text-sm text-slate-500">{item.marketingWay} • {item.destination}</div>
                      <div className="mt-2 text-sm font-semibold text-slate-700">{item.objective}</div>
                      <div className="mt-1 text-xs text-slate-400">{item.owner} • {formatDate(item.plannedDate)}</div>
                    </div>
                    <div className="rounded-2xl bg-slate-50 px-4 py-3 text-right">
                      <div className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">{t("Est. Leads", "ခန့်မှန်း Lead")}</div>
                      <div className="mt-1 text-xl font-black text-[#0d2c54]">{item.estimatedLeads}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Panel>
        </div>
      ) : null}

      {view === "REPORT" ? (
        <div className="mt-8 grid gap-4 xl:grid-cols-[0.95fr_1.05fr]">
          <Panel
            title={t("Daily Marketing Report Form", "နေ့စဉ် Marketing Report ဖောင်")}
            subtitle={t("Marketing staff can submit the field report every day for management review and arrangement.", "Marketing staff များသည် management review နှင့် arrangement အတွက် နေ့စဉ် field report တင်သွင်းနိုင်သည်။")}
          >
            <div className="grid gap-4 md:grid-cols-2">
              <Field label={t("Report Date", "Report ရက်စွဲ")} value={reportForm.reportDate} onChange={(value) => setReportForm((prev) => ({ ...prev, reportDate: value }))} type="date" />
              <div className="rounded-2xl bg-slate-50 p-4">
                <div className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">{t("Reporting Staff", "Report တင်သည့် Staff")}</div>
                <div className="mt-2 font-black text-[#0d2c54]">{actorName}</div>
              </div>
              <Field label={t("Visited Merchants", "တွေ့ဆုံခဲ့သော Merchant များ")} value={reportForm.visitedMerchants} onChange={(value) => setReportForm((prev) => ({ ...prev, visitedMerchants: value }))} type="number" />
              <Field label={t("New Leads", "Lead အသစ်များ")} value={reportForm.newLeads} onChange={(value) => setReportForm((prev) => ({ ...prev, newLeads: value }))} type="number" />
              <Field label={t("Converted Merchants", "ပြောင်းလဲနိုင်ခဲ့သော Merchant များ")} value={reportForm.convertedMerchants} onChange={(value) => setReportForm((prev) => ({ ...prev, convertedMerchants: value }))} type="number" />
            </div>
            <div className="mt-4">
              <label className="mb-2 block text-[11px] font-black uppercase tracking-[0.2em] text-slate-500">{t("Issues / Blockers", "ပြဿနာများ / အတားအဆီးများ")}</label>
              <textarea value={reportForm.issues} onChange={(e) => setReportForm((prev) => ({ ...prev, issues: e.target.value }))} className="min-h-[110px] w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none" />
            </div>
            <div className="mt-4">
              <label className="mb-2 block text-[11px] font-black uppercase tracking-[0.2em] text-slate-500">{t("Actions Taken / Next Action", "ဆောင်ရွက်ပြီးသောအရာ / နောက်တစ်ဆင့်")}</label>
              <textarea value={reportForm.actions} onChange={(e) => setReportForm((prev) => ({ ...prev, actions: e.target.value }))} className="min-h-[120px] w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none" />
            </div>
            <div className="mt-4">
              <button type="button" onClick={handleSubmitReport} className="inline-flex items-center gap-2 rounded-2xl bg-[#0d2c54] px-6 py-3 text-sm font-black uppercase tracking-wider text-white">
                <Send size={16} /> {t("Submit Report", "Report တင်သွင်းမည်")}
              </button>
            </div>
          </Panel>

          <Panel
            title={t("Submitted Daily Reports", "တင်သွင်းထားသော နေ့စဉ် Report များ")}
            subtitle={t("Super Admin, Admin, and Supervisor can check and export reports from different users for proper arrangement.", "Super Admin, Admin နှင့် Supervisor တို့သည် user အမျိုးမျိုးမှ report များကို စစ်ဆေးပြီး export ထုတ်ကာ စီမံခန့်ခွဲနိုင်သည်။")}
          >
            <div className="space-y-3">
              {filteredReports.map((item) => (
                <div key={item.id} className="rounded-2xl border border-slate-200 bg-white p-4">
                  <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                    <div>
                      <div className="font-black text-[#0d2c54]">{item.staffName}</div>
                      <div className="mt-1 text-sm text-slate-500">{formatDate(item.reportDate)}</div>
                      <div className="mt-2 text-sm font-semibold text-slate-700">{t("Visited", "တွေ့ဆုံခဲ့သော merchant များ")} {item.visitedMerchants} • {t("New Leads", "Lead အသစ်များ")} {item.newLeads} • {t("Converted", "ပြောင်းလဲနိုင်ခဲ့သည်")} {item.convertedMerchants}</div>
                      <div className="mt-2 text-sm text-slate-500">{item.issues || t("No issues entered.", "ပြဿနာမထည့်ထားပါ။")}</div>
                    </div>
                    <span className={`rounded-full px-3 py-1 text-[10px] font-black uppercase ${reportStatusClass(item.status)}`}>{item.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </Panel>
        </div>
      ) : null}

      {view === "PROGRESS" ? (
        <div className="mt-8 grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
          <Panel
            title={t("Merchant Parcel Progress Chart", "Merchant Parcel Progress Chart")}
            subtitle={t("Current merchants and their parcel list are compared against targets set by Super Admin and Admin so progress is visible clearly.", "Super Admin နှင့် Admin များသတ်မှတ်ထားသော target များနှင့် လက်ရှိ merchant များ၏ parcel စာရင်းကို နှိုင်းယှဉ်ပြထားသောကြောင့် progress ကို ရှင်းလင်းစွာ မြင်နိုင်သည်။")}
          >
            <div className="h-[420px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 30 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="merchant" angle={-15} textAnchor="end" height={70} tick={{ fontSize: 11 }} />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="target" name={t("Target Parcels", "Target Parcel")} radius={[8, 8, 0, 0]} />
                  <Bar dataKey="actual" name={t("Actual Parcels", "Actual Parcel")} radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Panel>

          <Panel
            title={t("Merchant Progress Table", "Merchant Progress ဇယား")}
            subtitle={t("This board helps marketing staff understand which merchants are behind target and require immediate action.", "ဤ board သည် ဘယ် merchant များက target နောက်ကျနေသည်၊ ဘယ်သူများအပေါ် ချက်ချင်းဆောင်ရွက်ရမည်ကို marketing staff များ နားလည်ရန် ကူညီပေးသည်။")}
          >
            <div className="space-y-3">
              {filteredMerchants.map((item) => {
                const percent = item.monthlyTarget > 0 ? Math.min(100, Math.round((item.monthlyActual / item.monthlyTarget) * 100)) : 0;
                return (
                  <div key={item.id} className="rounded-2xl border border-slate-200 bg-white p-4">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <div className="font-black text-[#0d2c54]">{item.name}</div>
                        <div className="mt-1 text-sm text-slate-500">{item.assignedMarketingStaff} • {item.category}</div>
                      </div>
                      <span className={`rounded-full px-3 py-1 text-[10px] font-black uppercase ${tierClass(item.tier)}`}>{item.tier}</span>
                    </div>
                    <div className="mt-3 h-3 overflow-hidden rounded-full bg-slate-100">
                      <div className="h-full rounded-full bg-[#0d2c54]" style={{ width: `${percent}%` }} />
                    </div>
                    <div className="mt-2 flex items-center justify-between text-sm">
                      <span className="font-semibold text-slate-700">{item.monthlyActual} / {item.monthlyTarget}</span>
                      <span className="font-black text-[#0d2c54]">{percent}%</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </Panel>
        </div>
      ) : null}

      {loading ? (
        <div className="pointer-events-none fixed bottom-6 right-6 rounded-full bg-[#0d2c54] px-4 py-2 text-xs font-black uppercase tracking-wider text-white shadow-lg">
          Syncing marketing API...
        </div>
      ) : null}
    </div>
  );
}

function LanguageToggle({ value, onChange }: { value: UiLanguage; onChange: (value: UiLanguage) => void }) {
  const items: Array<{ value: UiLanguage; label: string }> = [
    { value: "en", label: "EN" },
    { value: "my", label: "မြန်မာ" },
    { value: "both", label: "EN + မြန်မာ" },
  ];

  return (
    <div className="inline-flex flex-wrap items-center gap-2 rounded-2xl border border-slate-200 bg-white p-2 shadow-sm">
      <div className="flex items-center gap-2 rounded-xl bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-500">
        <Globe2 size={14} />
        <span>Language</span>
      </div>
      {items.map((item) => {
        const active = item.value === value;
        return (
          <button key={item.value} type="button" onClick={() => onChange(item.value)} className={`rounded-xl px-3 py-2 text-sm font-semibold transition ${active ? "bg-[#0d2c54] text-white shadow" : "bg-slate-50 text-slate-600 hover:bg-slate-100"}`}>
            {item.label}
          </button>
        );
      })}
    </div>
  );
}

function ViewButton({ active, onClick, label }: { active: boolean; onClick: () => void; label: string }) {
  return (
    <button type="button" onClick={onClick} className={`rounded-2xl px-4 py-3 text-xs font-black uppercase tracking-wider transition ${active ? "bg-[#0d2c54] text-white" : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"}`}>
      {label}
    </button>
  );
}

function Panel({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <div className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-lg font-black text-[#0d2c54]">{title}</h2>
      {subtitle ? <p className="mt-1 text-sm text-slate-500">{subtitle}</p> : null}
      <div className="mt-4">{children}</div>
    </div>
  );
}

function StatCard({ icon: Icon, title, value, accent = "default" }: { icon: React.ComponentType<{ size?: number; className?: string }>; title: string; value: string; accent?: "default" | "sky" | "amber" | "emerald" }) {
  const iconClass = accent === "sky" ? "text-sky-500" : accent === "amber" ? "text-amber-500" : accent === "emerald" ? "text-emerald-500" : "text-[#0d2c54]";
  const valueClass = accent === "sky" ? "text-sky-600" : accent === "amber" ? "text-amber-600" : accent === "emerald" ? "text-emerald-600" : "text-slate-800";
  return (
    <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
      <Icon size={24} className={iconClass} />
      <p className="mt-5 text-xs font-black uppercase tracking-[0.2em] text-slate-400">{title}</p>
      <p className={`mt-4 text-3xl font-black ${valueClass}`}>{value}</p>
    </div>
  );
}

function InfoCard({ title, value, icon }: { title: string; value: string; icon: React.ReactNode }) {
  return (
    <div className="rounded-2xl bg-slate-50 p-4">
      <div className="flex items-center gap-2">
        {icon}
        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">{title}</span>
      </div>
      <div className="mt-2 font-black text-[#0d2c54]">{value}</div>
    </div>
  );
}

function Field({ label, value, onChange, type = "text" }: { label: string; value: string; onChange: (value: string) => void; type?: string }) {
  return (
    <div>
      <label className="mb-2 block text-[11px] font-black uppercase tracking-[0.2em] text-slate-500">{label}</label>
      <input value={value} onChange={(e) => onChange(e.target.value)} type={type} className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-700 outline-none" />
    </div>
  );
}