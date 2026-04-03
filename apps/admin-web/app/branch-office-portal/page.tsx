"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  Building2,
  CheckCircle2,
  Coins,
  GitBranch,
  History,
  MapPin,
  Package,
  Pencil,
  RefreshCw,
  Search,
  ShieldCheck,
  Trash2,
  Truck,
  UserCircle,
  UsersRound,
  Workflow,
} from "lucide-react";
import {
  BRANCH_ENDPOINTS,
  appendQuery,
  formatDateTime,
  formatMMK,
  getItems,
  toNumber,
  toText,
  tryGet,
} from "@/lib/productionApi";

type Language = "en" | "my" | "both";
type WorkspaceTab =
  | "accounting"
  | "branches"
  | "sync"
  | "coverage"
  | "stationNetwork"
  | "stationCoverages";
type AccountingTab = "overview" | "receivable" | "payable" | "received" | "paid" | "history";

type BranchRow = {
  id: string;
  name: string;
  code: string;
  city: string;
  manager: string;
  status: string;
  description: string;
};

type ShipmentRow = {
  id: string;
  trackingNo: string;
  customer: string;
  status: string;
  codAmount: number;
  updatedAt: string;
};

type BranchFinanceRow = {
  id: string;
  branchName: string;
  receivableWays: number;
  payableWays: number;
  balance: number;
  description: string;
  status: string;
};

type BranchHistoryRow = {
  id: string;
  referenceNo: string;
  branchName: string;
  type: string;
  amount: number;
  status: string;
  createdAt: string;
};

type ZoneCoverageRow = {
  id: string;
  branch: string;
  name: string;
  prefix: string;
  deliveryman: string;
  towns: string;
};

type StationNetworkRow = {
  id: string;
  from: string;
  to: string;
  driving: string;
  biking: string;
  onFoot: string;
};

type CoverageAreaRow = {
  id: string;
  branch: string;
  title: string;
};

const endpointMap = BRANCH_ENDPOINTS as Record<string, string | undefined>;
const ENDPOINTS = {
  branches: endpointMap.branches ?? "/api/v1/branches",
  shipments: endpointMap.shipments ?? "/api/v1/shipments",
  accounting: endpointMap.accounting ?? endpointMap.financialCenter ?? "/api/v1/branches/accounting",
  history: endpointMap.history ?? "/api/v1/branches/accounting/history",
  zoneCoverage: endpointMap.zoneCoverage ?? endpointMap.zoneAndAutoAssign ?? "/api/v1/branches/zone-coverage",
  stationNetwork: endpointMap.stationNetwork ?? "/api/v1/branches/station-network",
  stationCoverages: endpointMap.stationCoverages ?? "/api/v1/branches/station-coverages",
  syncUsers: endpointMap.syncUsers ?? endpointMap.syncUsersToHRM ?? "/api/v1/branches/sync-users",
};

function bi(language: Language, en: string, my: string) {
  if (language === "en") return en;
  if (language === "my") return my;
  return `${en} / ${my}`;
}

function normalizeBranches(input: unknown): BranchRow[] {
  return getItems(input).map((row, index) => ({
    id: toText(row.id, `b-${index}`),
    name: toText(row.name, row.branch_name, `Branch ${index + 1}`),
    code: toText(row.code, row.branch_code, "-"),
    city: toText(row.city, row.township, row.town, "-"),
    manager: toText(row.manager_name, row.branch_manager, "-"),
    status: toText(row.status, "active"),
    description: toText(row.description, row.remark, row.branch_description, "-"),
  }));
}

function normalizeShipments(input: unknown): ShipmentRow[] {
  return getItems(input).map((row, index) => ({
    id: toText(row.id, `s-${index}`),
    trackingNo: toText(row.tracking_no, row.waybill_no, row.tracking_number, `WB-${index + 1}`),
    customer: toText(row.customer_name, row.recipient_name, row.receiver_name, "-"),
    status: toText(row.current_status, row.status, "processing"),
    codAmount: toNumber(row.cod_amount, row.total_collectable, row.total_collectable_amount),
    updatedAt: toText(row.updated_at, row.created_at, "-"),
  }));
}

function normalizeBranchFinance(input: unknown): BranchFinanceRow[] {
  return getItems(input).map((row, index) => ({
    id: toText(row.id, row.branch_id, `f-${index}`),
    branchName: toText(row.branch_name, row.name, `Branch ${index + 1}`),
    receivableWays: toNumber(row.receivable_ways, row.receivable_count, row.receivable),
    payableWays: toNumber(row.payable_ways, row.payable_count, row.payable),
    balance: toNumber(row.balance, row.net_balance),
    description: toText(row.description, row.remark, row.branch_description, "-"),
    status: toText(row.status, "active"),
  }));
}

function normalizeHistory(input: unknown): BranchHistoryRow[] {
  return getItems(input).map((row, index) => ({
    id: toText(row.id, `h-${index}`),
    referenceNo: toText(row.reference_no, row.code, row.history_no, `HIS-${index + 1}`),
    branchName: toText(row.branch_name, row.name, "-"),
    type: toText(row.type, row.entry_type, "history"),
    amount: toNumber(row.amount, row.total_amount, row.balance_amount),
    status: toText(row.status, "completed"),
    createdAt: toText(row.created_at, row.updated_at, "-"),
  }));
}

function normalizeZoneCoverage(input: unknown): ZoneCoverageRow[] {
  return getItems(input).map((row, index) => ({
    id: toText(row.id, `z-${index}`),
    branch: toText(row.branch_name, row.branch, "-"),
    name: toText(row.name, row.zone_name, `Zone ${index + 1}`),
    prefix: toText(row.prefix, row.code, "-"),
    deliveryman: toText(row.deliveryman_name, row.deliveryman, row.assign_to, "-"),
    towns: toText(row.towns, row.town_names, row.service_areas, "-"),
  }));
}

function normalizeStationNetwork(input: unknown): StationNetworkRow[] {
  return getItems(input).map((row, index) => ({
    id: toText(row.id, `n-${index}`),
    from: toText(row.from, row.from_station, "-"),
    to: toText(row.to, row.to_station, "-"),
    driving: toText(row.driving, row.driving_time, row.driving_distance, "-"),
    biking: toText(row.biking, row.biking_time, row.biking_distance, "-"),
    onFoot: toText(row.on_foot, row.walking, row.walking_time, "-"),
  }));
}

function normalizeCoverages(input: unknown): CoverageAreaRow[] {
  return getItems(input).map((row, index) => ({
    id: toText(row.id, `c-${index}`),
    branch: toText(row.branch_name, row.branch, "-"),
    title: toText(row.title, row.name, row.area_name, `Coverage ${index + 1}`),
  }));
}

function badge(status: string) {
  const s = status.toLowerCase();
  if (["active", "delivered", "completed", "received", "paid"].includes(s)) {
    return "bg-emerald-100 text-emerald-700";
  }
  if (["processing", "out_for_delivery", "in_transit", "pending", "receivable", "payable"].includes(s)) {
    return "bg-amber-100 text-amber-700";
  }
  if (["failed", "returned", "closed", "issue"].includes(s)) {
    return "bg-rose-100 text-rose-700";
  }
  return "bg-slate-100 text-slate-700";
}

function LanguageToggle({
  value,
  onChange,
}: {
  value: Language;
  onChange: (value: Language) => void;
}) {
  const items: Array<{ value: Language; label: string }> = [
    { value: "en", label: "EN" },
    { value: "my", label: "မြန်မာ" },
    { value: "both", label: "EN + မြန်မာ" },
  ];

  return (
    <div className="inline-flex flex-wrap items-center gap-2 rounded-2xl border border-slate-200 bg-white p-2 shadow-sm">
      {items.map((item) => {
        const active = item.value === value;
        return (
          <button
            key={item.value}
            type="button"
            onClick={() => onChange(item.value)}
            className={[
              "rounded-xl px-3 py-2 text-sm font-semibold transition",
              active ? "bg-[#0d2c54] text-white" : "bg-slate-50 text-slate-600 hover:bg-slate-100",
            ].join(" ")}
          >
            {item.label}
          </button>
        );
      })}
    </div>
  );
}

function WorkspaceTabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "rounded-2xl px-4 py-2 text-sm font-bold transition",
        active ? "bg-[#0d2c54] text-white shadow" : "bg-slate-50 text-slate-600 hover:bg-slate-100",
      ].join(" ")}
    >
      {children}
    </button>
  );
}

function AccountingSubtabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "rounded-xl px-3 py-2 text-xs font-black uppercase tracking-[0.18em] transition",
        active ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200",
      ].join(" ")}
    >
      {children}
    </button>
  );
}

function StatCard({
  icon: Icon,
  title,
  value,
}: {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  title: string;
  value: string;
}) {
  return (
    <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
      <Icon size={24} className="text-[#0d2c54]" />
      <p className="mt-5 text-xs font-black uppercase tracking-[0.2em] text-slate-400">{title}</p>
      <p className="mt-4 text-3xl font-black text-[#0d2c54]">{value}</p>
    </div>
  );
}

function Panel({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-lg font-black text-[#0d2c54]">{title}</h2>
      {subtitle ? <p className="mt-1 text-sm text-slate-500">{subtitle}</p> : null}
      <div className="mt-4">{children}</div>
    </div>
  );
}

function InfoCard({
  icon,
  title,
  value,
}: {
  icon: React.ReactNode;
  title: string;
  value: string;
}) {
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

function DataTable({
  headers,
  rows,
  emptyText,
}: {
  headers: string[];
  rows: React.ReactNode[][];
  emptyText: string;
}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200">
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-50 text-left text-slate-500">
            <tr>
              {headers.map((header) => (
                <th key={header} className="px-4 py-3 font-black">
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={headers.length} className="px-4 py-8 text-center text-slate-400">
                  {emptyText}
                </td>
              </tr>
            ) : (
              rows.map((row, idx) => (
                <tr key={idx} className="border-t border-slate-100 align-top">
                  {row.map((cell, cellIdx) => (
                    <td key={cellIdx} className="px-4 py-3">
                      {cell}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function BranchOfficePortalPage() {
  const [language, setLanguage] = useState<Language>("both");
  const [workspaceTab, setWorkspaceTab] = useState<WorkspaceTab>("accounting");
  const [accountingTab, setAccountingTab] = useState<AccountingTab>("overview");

  const [branches, setBranches] = useState<BranchRow[]>([]);
  const [branchFinanceRows, setBranchFinanceRows] = useState<BranchFinanceRow[]>([]);
  const [historyRows, setHistoryRows] = useState<BranchHistoryRow[]>([]);
  const [zoneCoverageRows, setZoneCoverageRows] = useState<ZoneCoverageRow[]>([]);
  const [stationNetworkRows, setStationNetworkRows] = useState<StationNetworkRow[]>([]);
  const [coverageAreaRows, setCoverageAreaRows] = useState<CoverageAreaRow[]>([]);
  const [shipments, setShipments] = useState<ShipmentRow[]>([]);

  const [selectedBranchId, setSelectedBranchId] = useState("");
  const [loading, setLoading] = useState(false);
  const [shipmentLoading, setShipmentLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const selectedBranch = useMemo(
    () => branches.find((item) => item.id === selectedBranchId) ?? null,
    [branches, selectedBranchId],
  );

  useEffect(() => {
    fetchAll();
  }, []);

  useEffect(() => {
    if (!selectedBranchId) return;
    fetchShipments(selectedBranchId);
  }, [selectedBranchId]);

  async function fetchAll() {
    setLoading(true);
    setError(null);

    const [branchRes, financeRes, historyRes, coverageRes, networkRes, mapRes] = await Promise.allSettled([
      tryGet<unknown>(ENDPOINTS.branches),
      tryGet<unknown>(ENDPOINTS.accounting),
      tryGet<unknown>(ENDPOINTS.history),
      tryGet<unknown>(ENDPOINTS.zoneCoverage),
      tryGet<unknown>(ENDPOINTS.stationNetwork),
      tryGet<unknown>(ENDPOINTS.stationCoverages),
    ]);

    if (branchRes.status === "fulfilled") {
      const normalizedBranches = normalizeBranches(branchRes.value);
      setBranches(normalizedBranches);
      if (!selectedBranchId && normalizedBranches.length > 0) {
        setSelectedBranchId(normalizedBranches[0].id);
      }
    } else {
      setBranches([]);
    }

    if (financeRes.status === "fulfilled") {
      setBranchFinanceRows(normalizeBranchFinance(financeRes.value));
    } else {
      setBranchFinanceRows([]);
    }

    if (historyRes.status === "fulfilled") {
      setHistoryRows(normalizeHistory(historyRes.value));
    } else {
      setHistoryRows([]);
    }

    if (coverageRes.status === "fulfilled") {
      setZoneCoverageRows(normalizeZoneCoverage(coverageRes.value));
    } else {
      setZoneCoverageRows([]);
    }

    if (networkRes.status === "fulfilled") {
      setStationNetworkRows(normalizeStationNetwork(networkRes.value));
    } else {
      setStationNetworkRows([]);
    }

    if (mapRes.status === "fulfilled") {
      setCoverageAreaRows(normalizeCoverages(mapRes.value));
    } else {
      setCoverageAreaRows([]);
    }

    if (
      branchRes.status === "rejected" &&
      financeRes.status === "rejected" &&
      historyRes.status === "rejected"
    ) {
      setError(
        bi(
          language,
          "Unable to load branch office services. Check branch endpoints and API base URL.",
          "Branch office service များကိုမရယူနိုင်ပါ။ Branch endpoint များနှင့် API base URL ကိုစစ်ဆေးပါ။",
        ),
      );
    }

    setLoading(false);
  }

  async function fetchShipments(branchId: string) {
    setShipmentLoading(true);
    try {
      const data = await tryGet<unknown>(appendQuery(ENDPOINTS.shipments, { branch_id: branchId }));
      setShipments(normalizeShipments(data));
    } catch {
      setShipments([]);
    } finally {
      setShipmentLoading(false);
    }
  }

  async function startSync() {
    setSyncing(true);
    try {
      await tryGet<unknown>(ENDPOINTS.syncUsers);
    } catch {
      setError(
        bi(
          language,
          "Sync service is unavailable. Check the HR sync endpoint.",
          "Sync service ကိုအသုံးမပြုနိုင်ပါ။ HR sync endpoint ကိုစစ်ဆေးပါ။",
        ),
      );
    } finally {
      setSyncing(false);
    }
  }

  const derivedBranchFinanceRows = useMemo(() => {
    if (branchFinanceRows.length > 0) return branchFinanceRows;
    return branches.map((branch) => ({
      id: branch.id,
      branchName: branch.name,
      receivableWays: 0,
      payableWays: 0,
      balance: 0,
      description: branch.description,
      status: branch.status,
    }));
  }, [branchFinanceRows, branches]);

  const branchSearchNeedle = search.trim().toLowerCase();

  const visibleBranchFinanceRows = useMemo(() => {
    const filtered = derivedBranchFinanceRows.filter((row) => {
      if (!branchSearchNeedle) return true;
      return `${row.branchName} ${row.description} ${row.status}`.toLowerCase().includes(branchSearchNeedle);
    });

    switch (accountingTab) {
      case "receivable":
        return filtered.filter((row) => row.receivableWays > 0 || row.balance > 0);
      case "payable":
        return filtered.filter((row) => row.payableWays > 0 || row.balance < 0);
      default:
        return filtered;
    }
  }, [derivedBranchFinanceRows, accountingTab, branchSearchNeedle]);

  const visibleHistoryRows = useMemo(() => {
    const filtered = historyRows.filter((row) => {
      if (!branchSearchNeedle) return true;
      return `${row.referenceNo} ${row.branchName} ${row.type} ${row.status}`
        .toLowerCase()
        .includes(branchSearchNeedle);
    });

    switch (accountingTab) {
      case "received":
        return filtered.filter((row) => row.status.toLowerCase().includes("received"));
      case "paid":
        return filtered.filter((row) => row.status.toLowerCase().includes("paid"));
      case "history":
        return filtered;
      default:
        return filtered;
    }
  }, [historyRows, accountingTab, branchSearchNeedle]);

  const visibleBranches = useMemo(
    () =>
      branches.filter((row) => {
        if (!branchSearchNeedle) return true;
        return `${row.name} ${row.description} ${row.city} ${row.manager}`
          .toLowerCase()
          .includes(branchSearchNeedle);
      }),
    [branches, branchSearchNeedle],
  );

  const visibleZoneCoverageRows = useMemo(
    () =>
      zoneCoverageRows.filter((row) => {
        if (!branchSearchNeedle) return true;
        return `${row.branch} ${row.name} ${row.prefix} ${row.deliveryman} ${row.towns}`
          .toLowerCase()
          .includes(branchSearchNeedle);
      }),
    [zoneCoverageRows, branchSearchNeedle],
  );

  const visibleStationNetworkRows = useMemo(
    () =>
      stationNetworkRows.filter((row) => {
        if (!branchSearchNeedle) return true;
        return `${row.from} ${row.to} ${row.driving} ${row.biking} ${row.onFoot}`
          .toLowerCase()
          .includes(branchSearchNeedle);
      }),
    [stationNetworkRows, branchSearchNeedle],
  );

  const visibleCoverageAreaRows = useMemo(
    () =>
      coverageAreaRows.filter((row) => {
        if (!branchSearchNeedle) return true;
        return `${row.branch} ${row.title}`.toLowerCase().includes(branchSearchNeedle);
      }),
    [coverageAreaRows, branchSearchNeedle],
  );

  const totals = useMemo(() => {
    const delivered = shipments.filter((item) => item.status.toLowerCase() === "delivered").length;
    const inTransit = shipments.filter((item) => ["processing", "in_transit", "out_for_delivery"].includes(item.status.toLowerCase())).length;
    const codTotal = shipments.reduce((sum, row) => sum + row.codAmount, 0);
    const issues = shipments.filter((item) => ["failed", "returned"].includes(item.status.toLowerCase())).length;
    return {
      queue: shipments.length,
      delivered,
      inTransit,
      codTotal,
      issues,
    };
  }, [shipments]);

  return (
    <div className="min-h-screen bg-[#f7f9fc] p-8">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
        <div className="space-y-2">
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-slate-400">
            {bi(language, "Administration", "စီမံခန့်ခွဲမှု")}
          </p>
          <h1 className="text-4xl font-black tracking-tight text-[#0d2c54]">
            {bi(language, "Branch Office Portal", "ဌာနခွဲရုံးပေါ်တယ်")}
          </h1>
          <p className="max-w-4xl text-slate-500">
            {bi(
              language,
              "Branch accounting, branch directory, HR sync, service coverage management, station network maintenance, and local shipment visibility.",
              "Branch accounting၊ ဌာနခွဲစာရင်း၊ HR sync၊ ဝန်ဆောင်မှုဧရိယာစီမံခန့်ခွဲမှု၊ station network နှင့် local shipment မြင်ကွင်းကို တစ်နေရာတည်းတွင် စီမံနိုင်သည်။",
            )}
          </p>
        </div>

        <LanguageToggle value={language} onChange={setLanguage} />
      </div>

      {error ? (
        <div className="mt-6 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-bold text-rose-700">
          {error}
        </div>
      ) : null}

      <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={Package} title={bi(language, "Local Queue", "ဒေသတွင်းစာရင်း")} value={`${totals.queue}`} />
        <StatCard icon={Truck} title={bi(language, "In Transit", "လမ်းကြောင်းပေါ်တွင်")} value={`${totals.inTransit}`} />
        <StatCard icon={CheckCircle2} title={bi(language, "Delivered", "ပို့ဆောင်ပြီး")} value={`${totals.delivered}`} />
        <StatCard icon={Coins} title={bi(language, "Cash & COD", "ငွေသားနှင့် COD")} value={formatMMK(totals.codTotal)} />
      </div>

      <div className="mt-8 flex flex-wrap gap-2">
        <WorkspaceTabButton active={workspaceTab === "accounting"} onClick={() => setWorkspaceTab("accounting")}>
          {bi(language, "Financial Center", "ငွေကြေးစင်တာ")}
        </WorkspaceTabButton>
        <WorkspaceTabButton active={workspaceTab === "branches"} onClick={() => setWorkspaceTab("branches")}>
          {bi(language, "Branches", "ဌာနခွဲများ")}
        </WorkspaceTabButton>
        <WorkspaceTabButton active={workspaceTab === "sync"} onClick={() => setWorkspaceTab("sync")}>
          {bi(language, "Sync Users to HRM", "HRM နှင့် user sync")}
        </WorkspaceTabButton>
        <WorkspaceTabButton active={workspaceTab === "coverage"} onClick={() => setWorkspaceTab("coverage")}>
          {bi(language, "Zone and Auto Assign", "ဇုန်နှင့် Auto Assign")}
        </WorkspaceTabButton>
        <WorkspaceTabButton active={workspaceTab === "stationNetwork"} onClick={() => setWorkspaceTab("stationNetwork")}>
          {bi(language, "Station Network", "Station network")}
        </WorkspaceTabButton>
        <WorkspaceTabButton active={workspaceTab === "stationCoverages"} onClick={() => setWorkspaceTab("stationCoverages")}>
          {bi(language, "Station Coverages", "Station coverage များ")}
        </WorkspaceTabButton>
      </div>

      <div className="mt-8 rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex-1">
            <label className="mb-2 block text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">
              {bi(language, "Select Branch", "ဌာနခွဲရွေးချယ်ရန်")}
            </label>
            <select
              value={selectedBranchId}
              onChange={(e) => setSelectedBranchId(e.target.value)}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold text-slate-700 outline-none"
            >
              <option value="">{bi(language, "Choose branch", "ဌာနခွဲရွေးပါ")}</option>
              {branches.map((branch) => (
                <option key={branch.id} value={branch.id}>
                  {branch.name} ({branch.code})
                </option>
              ))}
            </select>
          </div>

          <label className="relative flex-1 lg:max-w-md">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={bi(language, "Search branch data", "Branch data ရှာရန်")}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-sm font-semibold text-slate-700 outline-none placeholder:text-slate-400"
            />
          </label>

          <button
            onClick={fetchAll}
            className="inline-flex items-center gap-2 rounded-2xl bg-[#0d2c54] px-4 py-3 text-xs font-black uppercase tracking-wider text-white hover:opacity-95"
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
            {loading ? bi(language, "Refreshing...", "ပြန်လည်ရယူနေသည်...") : bi(language, "Refresh", "ပြန်လည်ရယူမည်")}
          </button>
        </div>
      </div>

      {workspaceTab === "accounting" ? (
        <div className="mt-8 space-y-6">
          <Panel
            title={bi(language, "Branch Accounting", "ဌာနခွဲစာရင်းကိုင်")}
            subtitle={bi(
              language,
              "Process financial accounting for branches with receivable, payable, received, paid, and history views.",
              "Receivable၊ payable၊ received၊ paid နှင့် history view များဖြင့် ဌာနခွဲစာရင်းကိုင်လုပ်ငန်းကို ဆောင်ရွက်နိုင်သည်။",
            )}
          >
            <div className="mb-4 flex flex-wrap gap-2">
              <AccountingSubtabButton active={accountingTab === "overview"} onClick={() => setAccountingTab("overview")}>
                {bi(language, "Overview", "အကျဉ်းချုပ်")}
              </AccountingSubtabButton>
              <AccountingSubtabButton active={accountingTab === "receivable"} onClick={() => setAccountingTab("receivable")}>
                {bi(language, "Receivable", "ရရန်")}
              </AccountingSubtabButton>
              <AccountingSubtabButton active={accountingTab === "payable"} onClick={() => setAccountingTab("payable")}>
                {bi(language, "Payable", "ပေးရန်")}
              </AccountingSubtabButton>
              <AccountingSubtabButton active={accountingTab === "received"} onClick={() => setAccountingTab("received")}>
                {bi(language, "Already Received", "လက်ခံပြီး")}
              </AccountingSubtabButton>
              <AccountingSubtabButton active={accountingTab === "paid"} onClick={() => setAccountingTab("paid")}>
                {bi(language, "Already Paid", "ပေးပြီး")}
              </AccountingSubtabButton>
              <AccountingSubtabButton active={accountingTab === "history"} onClick={() => setAccountingTab("history")}>
                {bi(language, "History", "မှတ်တမ်း")}
              </AccountingSubtabButton>
            </div>

            {accountingTab === "history" || accountingTab === "received" || accountingTab === "paid" ? (
              <DataTable
                headers={[
                  bi(language, "Reference", "ရည်ညွှန်းနံပါတ်"),
                  bi(language, "Branch", "ဌာနခွဲ"),
                  bi(language, "Type", "အမျိုးအစား"),
                  bi(language, "Amount", "ငွေပမာဏ"),
                  bi(language, "Status", "အခြေအနေ"),
                  bi(language, "Created", "ဖန်တီးချိန်"),
                ]}
                rows={visibleHistoryRows.map((row) => [
                  row.referenceNo,
                  row.branchName,
                  row.type,
                  formatMMK(row.amount),
                  <span key={`${row.id}-status`} className={`rounded-full px-3 py-1 text-[10px] font-black uppercase ${badge(row.status)}`}>
                    {row.status}
                  </span>,
                  formatDateTime(row.createdAt),
                ])}
                emptyText={bi(language, "No branch accounting history found.", "ဌာနခွဲစာရင်းကိုင်မှတ်တမ်းမတွေ့ပါ။")}
              />
            ) : (
              <DataTable
                headers={[
                  bi(language, "No.", "စဉ်"),
                  bi(language, "Branch Name", "ဌာနခွဲအမည်"),
                  bi(language, "Receivable / Ways", "ရရန် / Ways"),
                  bi(language, "Payable / Ways", "ပေးရန် / Ways"),
                  bi(language, "Balance (R - P)", "လက်ကျန် (ရရန် - ပေးရန်)"),
                ]}
                rows={visibleBranchFinanceRows.map((row, index) => [
                  String(index + 1),
                  row.branchName,
                  `${row.receivableWays}`,
                  `${row.payableWays}`,
                  formatMMK(row.balance),
                ])}
                emptyText={bi(language, "No branch accounting rows found.", "ဌာနခွဲစာရင်းကိုင် row မတွေ့ပါ။")}
              />
            )}
          </Panel>

          <div className="grid gap-4 xl:grid-cols-[0.85fr_1.15fr]">
            <Panel title={bi(language, "Branch Dashboard", "ဌာနခွဲအခြေအနေ")}>
              {!selectedBranch ? (
                <div className="rounded-2xl bg-slate-50 p-6 text-slate-500">
                  {bi(language, "Select a branch to load details.", "အသေးစိတ်ကြည့်ရန် ဌာနခွဲတစ်ခုရွေးပါ။")}
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2">
                  <InfoCard icon={<Building2 size={16} className="text-[#0d2c54]" />} title={bi(language, "Branch", "ဌာနခွဲ")} value={selectedBranch.name} />
                  <InfoCard icon={<MapPin size={16} className="text-[#0d2c54]" />} title={bi(language, "City", "မြို့")} value={selectedBranch.city} />
                  <InfoCard icon={<UserCircle size={16} className="text-[#0d2c54]" />} title={bi(language, "Manager", "မန်နေဂျာ")} value={selectedBranch.manager} />
                  <InfoCard icon={<CheckCircle2 size={16} className="text-[#0d2c54]" />} title={bi(language, "Status", "အခြေအနေ")} value={selectedBranch.status.toUpperCase()} />
                  <InfoCard icon={<AlertTriangle size={16} className="text-[#0d2c54]" />} title={bi(language, "Issue Register", "ပြဿနာမှတ်တမ်း")} value={bi(language, `${totals.issues} open issues`, `ဖွင့်လှစ်ထားသော ပြဿနာ ${totals.issues} ခု`)} />
                  <InfoCard icon={<Coins size={16} className="text-[#0d2c54]" />} title={bi(language, "COD Summary", "COD အနှစ်ချုပ်")} value={formatMMK(totals.codTotal)} />
                </div>
              )}
            </Panel>

            <Panel title={bi(language, "Local Shipment Queue", "ဒေသတွင်းကုန်စည်စာရင်း")}>
              <DataTable
                headers={[
                  bi(language, "Tracking", "Tracking"),
                  bi(language, "Customer", "ဖောက်သည်"),
                  bi(language, "Status", "အခြေအနေ"),
                  bi(language, "COD", "COD"),
                  bi(language, "Updated", "နောက်ဆုံးပြင်ဆင်ချိန်"),
                ]}
                rows={
                  shipmentLoading
                    ? []
                    : shipments.map((row) => [
                        row.trackingNo,
                        row.customer,
                        <span key={`${row.id}-ship-status`} className={`rounded-full px-3 py-1 text-[10px] font-black uppercase ${badge(row.status)}`}>
                          {row.status}
                        </span>,
                        formatMMK(row.codAmount),
                        formatDateTime(row.updatedAt),
                      ])
                }
                emptyText={
                  shipmentLoading
                    ? bi(language, "Loading branch shipments...", "Branch shipment များကိုရယူနေသည်...")
                    : bi(language, "No branch shipments found.", "ဌာနခွဲ shipment မတွေ့ပါ။")
                }
              />
            </Panel>
          </div>
        </div>
      ) : null}

      {workspaceTab === "branches" ? (
        <div className="mt-8">
          <Panel
            title={bi(language, "Branches", "ဌာနခွဲများ")}
            subtitle={bi(language, "Branch management for finance and operations.", "Finance နှင့် operations အတွက် branch စီမံခန့်ခွဲမှု။")}
          >
            <div className="mb-4 flex items-center justify-between gap-3">
              <button className="rounded-2xl bg-[#0d2c54] px-4 py-3 text-xs font-black uppercase tracking-wider text-white">
                {bi(language, "Add New", "အသစ်ထည့်မည်")}
              </button>
            </div>
            <DataTable
              headers={[
                bi(language, "Branch Name", "ဌာနခွဲအမည်"),
                bi(language, "Description", "ဖော်ပြချက်"),
                bi(language, "Edit", "ပြင်ဆင်ရန်"),
                bi(language, "Delete", "ဖျက်ရန်"),
                bi(language, "Work as Branch", "Branch အဖြစ်ဝင်ရန်"),
              ]}
              rows={visibleBranches.map((row) => [
                row.name,
                row.description,
                <button key={`${row.id}-edit`} className="text-[#0d2c54]"><Pencil size={16} /></button>,
                <button key={`${row.id}-delete`} className="text-rose-600"><Trash2 size={16} /></button>,
                <button key={`${row.id}-work`} className="text-slate-600"><Building2 size={16} /></button>,
              ])}
              emptyText={bi(language, "No branches found.", "ဌာနခွဲမတွေ့ပါ။")}
            />
          </Panel>
        </div>
      ) : null}

      {workspaceTab === "sync" ? (
        <div className="mt-8">
          <Panel
            title={bi(language, "Sync to HR Management System", "HR Management System သို့ Sync")}
            subtitle={bi(
              language,
              "Administrators, managers, finance users, customer service users, and deliverymen will be synchronized with the HRM platform.",
              "Administrator၊ manager၊ finance user၊ customer service user နှင့် deliveryman များကို HRM platform နှင့် sync လုပ်နိုင်သည်။",
            )}
          >
            <div className="mx-auto max-w-lg rounded-[28px] border border-slate-200 bg-slate-50 p-8 text-center">
              <div className="mx-auto flex h-32 w-32 items-center justify-center rounded-full bg-slate-200 text-[#0d2c54]">
                <UsersRound size={56} />
              </div>
              <p className="mt-6 text-sm leading-7 text-slate-600">
                {bi(
                  language,
                  "The same credentials can be synchronized to the HR Management System so users can work across branch operations, finance, and HR-linked apps.",
                  "တူညီသော login credential များကို HR Management System သို့ sync လုပ်ကာ branch operations၊ finance နှင့် HR ဆိုင်ရာ app များတွင်အသုံးပြုနိုင်သည်။",
                )}
              </p>
              <button
                type="button"
                onClick={startSync}
                className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-[#0d2c54] px-6 py-3 text-sm font-black uppercase tracking-wider text-white"
              >
                <RefreshCw size={16} className={syncing ? "animate-spin" : ""} />
                {syncing ? bi(language, "Starting Sync...", "Sync စတင်နေသည်...") : bi(language, "Start Sync", "Sync စတင်မည်")}
              </button>
            </div>
          </Panel>
        </div>
      ) : null}

      {workspaceTab === "coverage" ? (
        <div className="mt-8">
          <Panel
            title={bi(language, "Service Zone and Service Coverage Areas", "ဝန်ဆောင်မှုဇုန်နှင့် ဝန်ဆောင်မှုဧရိယာများ")}
            subtitle={bi(
              language,
              "The areas where deliverymen will serve and be allocated.",
              "Deliveryman များကို တာဝန်ပေး၍ ဝန်ဆောင်မှုပေးမည့် ဧရိယာများ။",
            )}
          >
            <div className="mb-4 flex items-center justify-end">
              <button className="rounded-2xl bg-[#0d2c54] px-4 py-3 text-xs font-black uppercase tracking-wider text-white">
                {bi(language, "Add New", "အသစ်ထည့်မည်")}
              </button>
            </div>
            <DataTable
              headers={[
                bi(language, "Branch", "ဌာနခွဲ"),
                bi(language, "Name", "အမည်"),
                bi(language, "Prefix", "Prefix"),
                bi(language, "Deliveryman", "Deliveryman"),
                bi(language, "Towns", "မြို့နယ်များ"),
              ]}
              rows={visibleZoneCoverageRows.map((row) => [row.branch, row.name, row.prefix, row.deliveryman, row.towns])}
              emptyText={bi(language, "No service zone data found.", "Service zone data မတွေ့ပါ။")}
            />
          </Panel>
        </div>
      ) : null}

      {workspaceTab === "stationNetwork" ? (
        <div className="mt-8">
          <Panel
            title={bi(language, "Station Network", "Station network")}
            subtitle={bi(language, "Links from station to stations.", "Station တစ်ခုမှ အခြား station များသို့ ချိတ်ဆက်မှုများ။")}
          >
            <div className="mb-4 flex items-center justify-end">
              <button className="rounded-2xl bg-[#0d2c54] px-4 py-3 text-xs font-black uppercase tracking-wider text-white">
                {bi(language, "Add New", "အသစ်ထည့်မည်")}
              </button>
            </div>
            <DataTable
              headers={[
                bi(language, "From", "မှ"),
                bi(language, "To", "သို့"),
                bi(language, "Driving", "ကားဖြင့်"),
                bi(language, "Biking", "စက်ဘီး / ဆိုင်ကယ်"),
                bi(language, "On Foot", "ခြေကျင်"),
              ]}
              rows={visibleStationNetworkRows.map((row) => [row.from, row.to, row.driving, row.biking, row.onFoot])}
              emptyText={bi(language, "No station network links found.", "Station network link မတွေ့ပါ။")}
            />
          </Panel>
        </div>
      ) : null}

      {workspaceTab === "stationCoverages" ? (
        <div className="mt-8">
          <Panel
            title={bi(language, "Station Coverages", "Station coverage များ")}
            subtitle={bi(
              language,
              "Coverage areas that can be delivered by stations.",
              "Station များမှ ပို့ဆောင်နိုင်သော coverage ဧရိယာများ။",
            )}
          >
            <div className="overflow-hidden rounded-[28px] border border-slate-200 bg-slate-50">
              <div className="relative min-h-[420px] overflow-hidden bg-[linear-gradient(135deg,#dff7df_0%,#eef6ff_50%,#d7f4d7_100%)]">
                <div className="absolute inset-0 opacity-70">
                  <div className="absolute left-[8%] top-[12%] h-28 w-40 rounded-[40px] border-4 border-lime-500/80 bg-lime-400/10" />
                  <div className="absolute left-[22%] top-[25%] h-36 w-52 rounded-[56px] border-4 border-lime-500/80 bg-lime-400/10" />
                  <div className="absolute left-[48%] top-[10%] h-48 w-72 rounded-[64px] border-4 border-lime-500/80 bg-lime-400/10" />
                  <div className="absolute left-[64%] top-[38%] h-40 w-60 rounded-[60px] border-4 border-lime-500/80 bg-lime-400/10" />
                  <div className="absolute left-[35%] top-[55%] h-32 w-44 rounded-[48px] border-4 border-lime-500/80 bg-lime-400/10" />
                </div>

                <div className="absolute left-4 top-4 rounded-2xl bg-white/90 p-4 shadow">
                  <div className="flex items-center gap-2 text-[#0d2c54]">
                    <Workflow size={18} />
                    <span className="text-sm font-black">
                      {bi(language, "Coverage Preview", "Coverage အကြိုကြည့်ရှုမှု")}
                    </span>
                  </div>
                  <p className="mt-2 max-w-xs text-xs leading-6 text-slate-600">
                    {bi(
                      language,
                      "Use this section to connect real map polygons, service zones, and station-delivery boundaries.",
                      "ဤအပိုင်းတွင် အမှန်တကယ် map polygon များ၊ service zone များနှင့် station-delivery boundary များကို ချိတ်ဆက်အသုံးပြုနိုင်သည်။",
                    )}
                  </p>
                </div>

                <div className="absolute bottom-4 left-4 right-4 rounded-2xl bg-white/90 p-4 shadow">
                  <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-400">
                    {bi(language, "Available Coverage Areas", "ရနိုင်သော Coverage ဧရိယာများ")}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {visibleCoverageAreaRows.length === 0 ? (
                      <span className="text-sm text-slate-500">
                        {bi(language, "No coverage areas available.", "Coverage ဧရိယာမတွေ့ပါ။")}
                      </span>
                    ) : (
                      visibleCoverageAreaRows.slice(0, 12).map((row) => (
                        <span key={row.id} className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-bold text-slate-600">
                          {row.branch} · {row.title}
                        </span>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>
          </Panel>
        </div>
      ) : null}
    </div>
  );
}
