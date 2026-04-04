"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import { Inter, Noto_Sans_Myanmar } from "next/font/google";
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Eye,
  Globe2,
  Loader2,
  MapPinned,
  PackageSearch,
  RefreshCcw,
  RotateCcw,
  Route,
  Search,
  XCircle,
} from "lucide-react";

type Language = "en" | "my" | "both";
type WayTab =
  | "all"
  | "pickup"
  | "transit"
  | "delivery"
  | "success"
  | "failed"
  | "returns"
  | "map";

type ShipmentRow = {
  id?: string | number;
  tracking_number?: string | null;
  sender_name?: string | null;
  sender_phone?: string | null;
  sender_address?: string | null;
  recipient_name?: string | null;
  recipient_phone?: string | null;
  recipient_address?: string | null;
  product_name?: string | null;
  product_weight?: number | null;
  product_qty?: number | null;
  payment_term?: string | null;
  delivery_fee_mmks?: number | null;
  extra_weight_charges?: number | null;
  cod_amount_mmks?: number | null;
  total_collectable_amount?: number | null;
  rider_remark?: string | null;
  status?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
};

type ApiWayRecord = {
  id?: string | number;
  tracking_no?: string | null;
  tracking_number?: string | null;
  sender_name?: string | null;
  sender_phone?: string | null;
  sender_address?: string | null;
  recipient_name?: string | null;
  recipient_phone?: string | null;
  recipient_address?: string | null;
  product_name?: string | null;
  product_weight?: number | null;
  product_qty?: number | null;
  payment_term?: string | null;
  delivery_fee?: number | null;
  delivery_fee_mmks?: number | null;
  extra_weight_charge?: number | null;
  extra_weight_charges?: number | null;
  cod_amount?: number | null;
  cod_amount_mmks?: number | null;
  collectable_amount?: number | null;
  total_collectable_amount?: number | null;
  rider_remark?: string | null;
  remark?: string | null;
  current_status?: string | null;
  status?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
};

type ApiWayMetrics = {
  active?: number;
  success?: number;
  failures?: number;
  returns?: number;
  all_ways?: number;
};

// --- MOCK DATA ---
const MOCK_WAYS: ApiWayRecord[] = [
  {
    id: "way-1",
    tracking_number: "BEX-YGN-0001",
    sender_name: "Britium Fashion",
    sender_phone: "0991111111",
    sender_address: "Kamayut, Yangon",
    recipient_name: "U Aung",
    recipient_phone: "0970001111",
    recipient_address: "Bahan, Yangon",
    product_name: "Clothing",
    product_weight: 1.5,
    product_qty: 2,
    payment_term: "COD",
    delivery_fee_mmks: 3000,
    extra_weight_charges: 0,
    cod_amount_mmks: 25000,
    total_collectable_amount: 28000,
    rider_remark: "Deliver before 5 PM",
    status: "pending_pickup",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "way-2",
    tracking_number: "BEX-MDY-0002",
    sender_name: "Beauty City",
    sender_phone: "0992222222",
    sender_address: "Chanayethazan, Mandalay",
    recipient_name: "Ma Su",
    recipient_phone: "0970002222",
    recipient_address: "Ahlone, Yangon",
    product_name: "Cosmetics",
    product_weight: 0.5,
    product_qty: 1,
    payment_term: "PREPAID",
    delivery_fee_mmks: 2500,
    extra_weight_charges: 0,
    cod_amount_mmks: 0,
    total_collectable_amount: 0,
    rider_remark: "Fragile",
    status: "in_transit",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "way-3",
    tracking_number: "BEX-YGN-0003",
    sender_name: "Tech Store",
    sender_phone: "0993333333",
    sender_address: "Hlaing, Yangon",
    recipient_name: "Ko Kyaw",
    recipient_phone: "0970003333",
    recipient_address: "Mayangone, Yangon",
    product_name: "Headphones",
    product_weight: 0.8,
    product_qty: 1,
    payment_term: "COD",
    delivery_fee_mmks: 2500,
    extra_weight_charges: 0,
    cod_amount_mmks: 45000,
    total_collectable_amount: 47500,
    rider_remark: "Call before delivery",
    status: "out_for_delivery",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "way-4",
    tracking_number: "BEX-YGN-0004",
    sender_name: "Local Shop",
    sender_phone: "0994444444",
    sender_address: "Insein, Yangon",
    recipient_name: "Daw Mya",
    recipient_phone: "0970004444",
    recipient_address: "Tamwe, Yangon",
    product_name: "Groceries",
    product_weight: 5.0,
    product_qty: 3,
    payment_term: "PREPAID",
    delivery_fee_mmks: 4000,
    extra_weight_charges: 1500,
    cod_amount_mmks: 0,
    total_collectable_amount: 0,
    rider_remark: "",
    status: "delivered",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "way-5",
    tracking_number: "BEX-YGN-0005",
    sender_name: "Online Seller",
    sender_phone: "0995555555",
    sender_address: "Sanchaung, Yangon",
    recipient_name: "Mg Mg",
    recipient_phone: "0970005555",
    recipient_address: "Dagon, Yangon",
    product_name: "Shoes",
    product_weight: 1.0,
    product_qty: 1,
    payment_term: "COD",
    delivery_fee_mmks: 3000,
    extra_weight_charges: 0,
    cod_amount_mmks: 15000,
    total_collectable_amount: 18000,
    rider_remark: "Customer not answering",
    status: "delivery_failed",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

const MOCK_METRICS: ApiWayMetrics = {
  active: 3,
  success: 1,
  failures: 1,
  returns: 0,
  all_ways: 5,
};
// -----------------

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-en",
});

const myanmar = Noto_Sans_Myanmar({
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
  variable: "--font-my",
});

const terminalStatuses = new Set(["delivered", "delivery_failed", "canceled", "returned"]);
const successStatuses = new Set(["delivered"]);
const failureStatuses = new Set(["delivery_failed", "failed", "canceled", "exception"]);
const returnStatuses = new Set(["return_initiated", "returned", "return_to_sender"]);
const pickupStatuses = new Set(["pending_pickup", "pickup_assigned", "picked_up"]);
const transitStatuses = new Set(["in_transit", "at_hub", "at_station", "routed", "hub_received"]);
const deliveryStatuses = new Set(["delivery_assigned", "out_for_delivery"]);

function normalizeStatus(status?: string | null) {
  return String(status || "pending_pickup").trim().toLowerCase();
}

function toNumber(value?: number | null) {
  return Number.isFinite(Number(value)) ? Number(value) : 0;
}

function copyFor(language: Language, en: string, my: string) {
  if (language === "en") return en;
  if (language === "my") return my;
  return `${en} / ${my}`;
}

function normalizeApiRow(row: ApiWayRecord): ShipmentRow {
  const deliveryFee = toNumber(row.delivery_fee_mmks ?? row.delivery_fee);
  const extraWeightCharges = toNumber(row.extra_weight_charges ?? row.extra_weight_charge);
  const codAmount = toNumber(row.cod_amount_mmks ?? row.cod_amount);
  const collectable =
    row.total_collectable_amount ?? row.collectable_amount ?? deliveryFee + extraWeightCharges + codAmount;

  return {
    id: row.id,
    tracking_number: row.tracking_number ?? row.tracking_no ?? null,
    sender_name: row.sender_name ?? null,
    sender_phone: row.sender_phone ?? null,
    sender_address: row.sender_address ?? null,
    recipient_name: row.recipient_name ?? null,
    recipient_phone: row.recipient_phone ?? null,
    recipient_address: row.recipient_address ?? null,
    product_name: row.product_name ?? null,
    product_weight: row.product_weight ?? null,
    product_qty: row.product_qty ?? null,
    payment_term: row.payment_term ?? null,
    delivery_fee_mmks: deliveryFee,
    extra_weight_charges: extraWeightCharges,
    cod_amount_mmks: codAmount,
    total_collectable_amount: toNumber(collectable),
    rider_remark: row.rider_remark ?? row.remark ?? null,
    status: row.status ?? row.current_status ?? null,
    created_at: row.created_at ?? null,
    updated_at: row.updated_at ?? null,
  };
}

function LocalizedText({
  language,
  en,
  my,
  englishClassName = "",
  myanmarClassName = "",
  separatorClassName = "text-slate-400",
}: {
  language: Language;
  en: string;
  my: string;
  englishClassName?: string;
  myanmarClassName?: string;
  separatorClassName?: string;
}) {
  if (language === "en") {
    return (
      <span lang="en" className={englishClassName}>
        {en}
      </span>
    );
  }

  if (language === "my") {
    return (
      <span lang="my" className={myanmarClassName}>
        {my}
      </span>
    );
  }

  return (
    <span className="inline-flex flex-wrap items-baseline gap-2">
      <span lang="en" className={englishClassName}>
        {en}
      </span>
      <span className={separatorClassName}>/</span>
      <span lang="my" className={myanmarClassName}>
        {my}
      </span>
    </span>
  );
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
      <div className="flex items-center gap-2 rounded-xl bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-500">
        <Globe2 size={14} />
        <span>Language</span>
      </div>
      {items.map((item) => {
        const active = item.value === value;
        return (
          <button
            key={item.value}
            type="button"
            onClick={() => onChange(item.value)}
            className={[
              "rounded-xl px-3 py-2 text-sm font-semibold transition",
              active
                ? "bg-[#0d2c54] text-white shadow"
                : "bg-slate-50 text-slate-600 hover:bg-slate-100",
            ].join(" ")}
          >
            {item.label}
          </button>
        );
      })}
    </div>
  );
}

function tabLabels(language: Language): Array<{ value: WayTab; label: ReactNode }> {
  return [
    {
      value: "all",
      label: (
        <LocalizedText language={language} en="All Ways" my="အားလုံး" englishClassName="font-semibold" myanmarClassName="font-semibold tracking-normal" />
      ),
    },
    {
      value: "pickup",
      label: (
        <LocalizedText language={language} en="Pickup Ways" my="လာယူပို့ဆောင်ရန်" englishClassName="font-semibold" myanmarClassName="font-semibold tracking-normal" />
      ),
    },
    {
      value: "transit",
      label: (
        <LocalizedText language={language} en="Transit Route" my="လမ်းကြောင်းပြောင်းရွှေ့မှု" englishClassName="font-semibold" myanmarClassName="font-semibold tracking-normal" />
      ),
    },
    {
      value: "delivery",
      label: (
        <LocalizedText language={language} en="Delivery Ways" my="ပို့ဆောင်ရန်" englishClassName="font-semibold" myanmarClassName="font-semibold tracking-normal" />
      ),
    },
    {
      value: "success",
      label: (
        <LocalizedText language={language} en="Success" my="အောင်မြင်ပြီး" englishClassName="font-semibold" myanmarClassName="font-semibold tracking-normal" />
      ),
    },
    {
      value: "failed",
      label: (
        <LocalizedText language={language} en="Failures" my="မအောင်မြင်" englishClassName="font-semibold" myanmarClassName="font-semibold tracking-normal" />
      ),
    },
    {
      value: "returns",
      label: (
        <LocalizedText language={language} en="Returns" my="ပြန်ပို့ရန်" englishClassName="font-semibold" myanmarClassName="font-semibold tracking-normal" />
      ),
    },
    {
      value: "map",
      label: (
        <LocalizedText language={language} en="Tracking Map" my="မြေပုံကြည့်ရန်" englishClassName="font-semibold" myanmarClassName="font-semibold tracking-normal" />
      ),
    },
  ];
}

function statusLabel(language: Language, status?: string | null) {
  const normalized = normalizeStatus(status);
  const dictionary: Record<string, { en: string; my: string }> = {
    pending_pickup: { en: "Pending Pickup", my: "လာယူရန်စောင့်ဆိုင်း" },
    pickup_assigned: { en: "Pickup Assigned", my: "လာယူသူသတ်မှတ်ပြီး" },
    picked_up: { en: "Picked Up", my: "လာယူပြီး" },
    in_transit: { en: "In Transit", my: "လမ်းကြောင်းပေါ်တွင်" },
    at_hub: { en: "At Hub", my: "ဟပ်တွင်ရောက်ရှိ" },
    at_station: { en: "At Station", my: "စခန်းတွင်ရောက်ရှိ" },
    routed: { en: "Routed", my: "လမ်းကြောင်းချမှတ်ပြီး" },
    hub_received: { en: "Hub Received", my: "ဟပ်လက်ခံပြီး" },
    delivery_assigned: { en: "Delivery Assigned", my: "ပို့ဆောင်သူသတ်မှတ်ပြီး" },
    out_for_delivery: { en: "Out for Delivery", my: "ပို့ဆောင်နေသည်" },
    delivered: { en: "Delivered", my: "ပို့ဆောင်ပြီး" },
    delivery_failed: { en: "Delivery Failed", my: "ပို့ဆောင်မှုမအောင်မြင်" },
    failed: { en: "Failed", my: "မအောင်မြင်" },
    canceled: { en: "Canceled", my: "ပယ်ဖျက်ပြီး" },
    exception: { en: "Exception", my: "အခက်အခဲရှိသည်" },
    return_initiated: { en: "Return Initiated", my: "ပြန်ပို့ရန်စတင်" },
    returned: { en: "Returned", my: "ပြန်ပို့ပြီး" },
    return_to_sender: { en: "Return to Sender", my: "ပေးပို့သူထံပြန်ပို့" },
  };

  const entry = dictionary[normalized] || {
    en: normalized.replaceAll("_", " "),
    my: normalized.replaceAll("_", " "),
  };

  return copyFor(language, entry.en, entry.my);
}

function statusTone(status?: string | null) {
  const normalized = normalizeStatus(status);
  if (successStatuses.has(normalized)) return "bg-emerald-50 text-emerald-700 border-emerald-200";
  if (failureStatuses.has(normalized)) return "bg-rose-50 text-rose-700 border-rose-200";
  if (returnStatuses.has(normalized)) return "bg-amber-50 text-amber-700 border-amber-200";
  if (deliveryStatuses.has(normalized)) return "bg-sky-50 text-sky-700 border-sky-200";
  if (transitStatuses.has(normalized)) return "bg-violet-50 text-violet-700 border-violet-200";
  return "bg-slate-50 text-slate-700 border-slate-200";
}

function matchesTab(row: ShipmentRow, tab: WayTab) {
  const status = normalizeStatus(row.status);
  switch (tab) {
    case "pickup":
      return pickupStatuses.has(status);
    case "transit":
      return transitStatuses.has(status);
    case "delivery":
      return deliveryStatuses.has(status);
    case "success":
      return successStatuses.has(status);
    case "failed":
      return failureStatuses.has(status);
    case "returns":
      return returnStatuses.has(status);
    case "map":
      return true;
    case "all":
    default:
      return true;
  }
}

function nextWorkflowStatus(status?: string | null) {
  const normalized = normalizeStatus(status);
  const flow: Record<string, { next: string; en: string; my: string }> = {
    pending_pickup: {
      next: "pickup_assigned",
      en: "Assign Pickup",
      my: "လာယူမှုသတ်မှတ်မည်",
    },
    pickup_assigned: {
      next: "picked_up",
      en: "Mark Picked Up",
      my: "လာယူပြီးအဖြစ်သတ်မှတ်မည်",
    },
    picked_up: {
      next: "in_transit",
      en: "Move to Transit",
      my: "လမ်းကြောင်းသို့ရွှေ့မည်",
    },
    in_transit: {
      next: "delivery_assigned",
      en: "Assign Delivery",
      my: "ပို့ဆောင်မှုသတ်မှတ်မည်",
    },
    at_hub: {
      next: "delivery_assigned",
      en: "Assign Delivery",
      my: "ပို့ဆောင်မှုသတ်မှတ်မည်",
    },
    at_station: {
      next: "delivery_assigned",
      en: "Assign Delivery",
      my: "ပို့ဆောင်မှုသတ်မှတ်မည်",
    },
    delivery_assigned: {
      next: "out_for_delivery",
      en: "Dispatch Now",
      my: "ယခုထွက်ပို့မည်",
    },
    out_for_delivery: {
      next: "delivered",
      en: "Mark Delivered",
      my: "ပို့ဆောင်ပြီးအဖြစ်သတ်မှတ်မည်",
    },
    delivery_failed: {
      next: "delivery_assigned",
      en: "Retry Delivery",
      my: "ပြန်လည်ပို့ဆောင်မည်",
    },
    return_initiated: {
      next: "returned",
      en: "Complete Return",
      my: "ပြန်ပို့ပြီးအဖြစ်သတ်မှတ်မည်",
    },
  };

  return flow[normalized] || null;
}

function formatMoney(language: Language, value?: number | null) {
  const locale = language === "my" ? "my-MM" : "en-US";
  return toNumber(value).toLocaleString(locale);
}

function SummaryCard({
  title,
  value,
  accent,
  badge,
  dark = false,
}: {
  title: ReactNode;
  value: number;
  accent: ReactNode;
  badge?: ReactNode;
  dark?: boolean;
}) {
  return (
    <div
      className={[
        "rounded-[28px] border p-6 shadow-sm",
        dark ? "border-slate-900 bg-[#081735] text-white" : "border-slate-200 bg-white text-slate-900",
      ].join(" ")}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className={dark ? "text-sm font-bold text-slate-300" : "text-sm font-bold text-slate-400"}>{title}</p>
          <p className="mt-3 text-5xl font-black">{value}</p>
        </div>
        <div className="flex flex-col items-end gap-2">
          {badge}
          <div>{accent}</div>
        </div>
      </div>
    </div>
  );
}

function WayManagementClient() {
  const [language, setLanguage] = useState<Language>("both");
  const [activeTab, setActiveTab] = useState<WayTab>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [query, setQuery] = useState("");
  const [rows, setRows] = useState<ShipmentRow[]>([]);
  const [apiMetrics, setApiMetrics] = useState<ApiWayMetrics | null>(null);
  const [selected, setSelected] = useState<ShipmentRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [busyTracking, setBusyTracking] = useState<string>("");

  const loadShipments = async (refresh = false) => {
    setErrorMsg("");
    refresh ? setRefreshing(true) : setLoading(true);

    try {
      // Simulate network delay
      await new Promise((resolve) => setTimeout(resolve, 800));

      const shipmentRows = MOCK_WAYS.map(normalizeApiRow);
      setApiMetrics(MOCK_METRICS);
      setRows(shipmentRows);
      setSelected((current) => {
        if (!current?.tracking_number) return shipmentRows[0] || null;
        return shipmentRows.find((row) => row.tracking_number === current.tracking_number) || shipmentRows[0] || null;
      });
    } catch {
      setErrorMsg(
        copyFor(
          language,
          "Unable to load way management data.",
          "Way management data ကို မရယူနိုင်ပါ။",
        ),
      );
      setRows([]);
      setApiMetrics(null);
    } finally {
      refresh ? setRefreshing(false) : setLoading(false);
    }
  };

  useEffect(() => {
    loadShipments(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!errorMsg) return;
    setErrorMsg("");
  }, [language]);

  const uniqueStatuses = useMemo(() => {
    return Array.from(new Set(rows.map((row) => normalizeStatus(row.status)))).sort();
  }, [rows]);

  const derivedSummary = useMemo(() => {
    const all = rows.length;
    const success = rows.filter((row) => successStatuses.has(normalizeStatus(row.status))).length;
    const failures = rows.filter((row) => failureStatuses.has(normalizeStatus(row.status))).length;
    const returns = rows.filter((row) => returnStatuses.has(normalizeStatus(row.status))).length;
    const active = rows.filter((row) => !terminalStatuses.has(normalizeStatus(row.status))).length;

    return { all, success, failures, returns, active };
  }, [rows]);

  const summary = {
    all: apiMetrics?.all_ways ?? derivedSummary.all,
    success: apiMetrics?.success ?? derivedSummary.success,
    failures: apiMetrics?.failures ?? derivedSummary.failures,
    returns: apiMetrics?.returns ?? derivedSummary.returns,
    active: apiMetrics?.active ?? derivedSummary.active,
  };

  const filteredRows = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return rows.filter((row) => {
      if (!matchesTab(row, activeTab)) return false;
      if (statusFilter !== "all" && normalizeStatus(row.status) !== statusFilter) return false;
      if (!needle) return true;

      const haystack = [
        row.tracking_number,
        row.sender_name,
        row.recipient_name,
        row.sender_phone,
        row.recipient_phone,
        row.sender_address,
        row.recipient_address,
        row.product_name,
        row.status,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return haystack.includes(needle);
    });
  }, [activeTab, query, rows, statusFilter]);

  useEffect(() => {
    if (!filteredRows.length) {
      setSelected(null);
      return;
    }

    if (!selected?.tracking_number) {
      setSelected(filteredRows[0]);
      return;
    }

    const match = filteredRows.find((row) => row.tracking_number === selected.tracking_number);
    if (!match) setSelected(filteredRows[0]);
  }, [filteredRows, selected]);

  const updateShipmentStatus = async (row: ShipmentRow, nextStatus: string) => {
    const tracking = row.tracking_number || String(row.id || "");
    if (!tracking) return;

    setBusyTracking(tracking);
    setErrorMsg("");

    try {
      // Simulate network delay
      await new Promise((resolve) => setTimeout(resolve, 600));

      // Optimistically update the UI
      setRows((current) =>
        current.map((item) =>
          item.tracking_number === tracking ? { ...item, status: nextStatus } : item,
        ),
      );
      setSelected((current) =>
        current?.tracking_number === tracking ? { ...current, status: nextStatus } : current,
      );
    } catch {
      setErrorMsg(
        copyFor(
          language,
          "Status update failed. Adjust the PATCH route if your backend uses another endpoint.",
          "Status update မအောင်မြင်ပါ။ Backend ၏ PATCH route မတူပါက endpoint ကို ပြင်ပါ။",
        ),
      );
    } finally {
      setBusyTracking("");
    }
  };

  const openAddressInMap = (address?: string | null) => {
    if (!address) return;
    window.open(`http://googleusercontent.com/maps.google.com/?q=${encodeURIComponent(address)}`, "_blank");
  };

  const tabs = tabLabels(language);

  return (
    <div
      className={`${inter.variable} ${myanmar.variable} space-y-8`}
      style={{
        fontFamily:
          'var(--font-en), var(--font-my), "Noto Sans Myanmar", "Myanmar Text", "Pyidaungsu", system-ui, sans-serif',
      }}
    >
      <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
        <div className="space-y-2">
          <h1 className="text-3xl font-black text-[#0d2c54] md:text-4xl">
            <LocalizedText
              language={language}
              en="WAY MANAGEMENT"
              my="ကုန်ပစ္စည်းလမ်းကြောင်းစီမံခန့်ခွဲမှု"
              englishClassName="tracking-tight"
              myanmarClassName="tracking-normal normal-case text-[0.82em]"
            />
          </h1>
          <p className="text-sm text-slate-500 md:text-lg">
            <LocalizedText
              language={language}
              en="Chain of custody, dispatch routing, status control, and proof-of-delivery review."
              my="ကုန်ပစ္စည်းလက်ဆင့်ကမ်းမှု၊ လမ်းကြောင်းချခြင်း၊ အခြေအနေထိန်းချုပ်မှုနှင့် ပို့ဆောင်ပြီးစစ်ဆေးမှု။"
              englishClassName="font-medium"
              myanmarClassName="font-medium tracking-normal"
            />
          </p>
        </div>

        <LanguageToggle value={language} onChange={setLanguage} />
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
        <SummaryCard
          dark
          title={<LocalizedText language={language} en="All Ways" my="စုစုပေါင်း" englishClassName="uppercase tracking-[0.18em]" myanmarClassName="tracking-normal normal-case" />}
          value={summary.all}
          badge={
            <span className="rounded-full bg-[#19366f] px-3 py-1 text-xs font-bold text-sky-200">
              <LocalizedText language={language} en="ACTIVE" my="လုပ်ဆောင်ဆဲ" englishClassName="uppercase" myanmarClassName="tracking-normal normal-case" />
            </span>
          }
          accent={<Route size={18} className="text-[#ffd700]" />}
        />

        <SummaryCard
          title={<LocalizedText language={language} en="Success" my="အောင်မြင်ပြီး" englishClassName="uppercase tracking-[0.18em]" myanmarClassName="tracking-normal normal-case" />}
          value={summary.success}
          accent={<CheckCircle2 size={18} className="text-emerald-500" />}
        />

        <SummaryCard
          title={<LocalizedText language={language} en="Failures" my="မအောင်မြင်" englishClassName="uppercase tracking-[0.18em]" myanmarClassName="tracking-normal normal-case" />}
          value={summary.failures}
          accent={<XCircle size={18} className="text-rose-500" />}
        />

        <SummaryCard
          title={<LocalizedText language={language} en="Returns" my="ပြန်ပို့ရန်" englishClassName="uppercase tracking-[0.18em]" myanmarClassName="tracking-normal normal-case" />}
          value={summary.returns}
          accent={<RotateCcw size={18} className="text-amber-500" />}
        />
      </div>

      <div className="rounded-[32px] border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-4 border-b border-slate-100 pb-4">
          <div className="flex flex-wrap gap-2">
            {tabs.map((tab) => {
              const active = activeTab === tab.value;
              return (
                <button
                  key={tab.value}
                  type="button"
                  onClick={() => setActiveTab(tab.value)}
                  className={[
                    "rounded-2xl px-4 py-2 text-sm transition",
                    active
                      ? "bg-[#0d2c54] text-white shadow"
                      : "bg-slate-50 text-slate-600 hover:bg-slate-100",
                  ].join(" ")}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
            <div className="flex flex-1 flex-col gap-3 md:flex-row">
              <label className="relative min-w-[240px] flex-1">
                <Search className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={copyFor(language, "Search tracking, customer, phone, address, product", "tracking, customer, phone, address, product များရှာရန်")}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm font-medium text-slate-700 outline-none placeholder:text-slate-400"
                />
              </label>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="min-w-[220px] rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700 outline-none"
              >
                <option value="all">{copyFor(language, "All Statuses", "အခြေအနေအားလုံး")}</option>
                {uniqueStatuses.map((status) => (
                  <option key={status} value={status}>
                    {statusLabel(language, status)}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="button"
              onClick={() => loadShipments(true)}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#0d2c54] px-5 py-3 text-sm font-black text-white transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-60"
              disabled={refreshing || loading}
            >
              {refreshing ? <Loader2 size={18} className="animate-spin" /> : <RefreshCcw size={18} />}
              <LocalizedText language={language} en="REFRESH" my="ပြန်လည်ရယူမည်" englishClassName="uppercase tracking-[0.18em]" myanmarClassName="tracking-normal normal-case" />
            </button>
          </div>
        </div>

        {errorMsg && (
          <div className="mt-4 flex items-center gap-3 rounded-2xl bg-rose-50 p-4 text-rose-700">
            <AlertTriangle size={18} />
            <p className="font-semibold">{errorMsg}</p>
          </div>
        )}

        {loading ? (
          <div className="flex min-h-[280px] items-center justify-center">
            <div className="flex items-center gap-3 rounded-2xl bg-slate-50 px-5 py-4 text-slate-600">
              <Loader2 size={20} className="animate-spin" />
              <LocalizedText language={language} en="Loading way records..." my="လမ်းကြောင်းမှတ်တမ်းများရယူနေသည်..." englishClassName="font-semibold" myanmarClassName="font-semibold tracking-normal" />
            </div>
          </div>
        ) : activeTab === "map" ? (
          <div className="grid grid-cols-1 gap-4 pt-5 lg:grid-cols-2">
            {filteredRows.length === 0 ? (
              <div className="col-span-full rounded-3xl border border-dashed border-slate-200 bg-slate-50 p-10 text-center text-slate-500">
                <MapPinned className="mx-auto mb-3" size={28} />
                <p className="font-semibold">
                  {copyFor(language, "No route records found for the current filters.", "လက်ရှိ filter များနှင့် ကိုက်ညီသော လမ်းကြောင်းမှတ်တမ်းမရှိပါ။")}
                </p>
              </div>
            ) : (
              filteredRows.map((row) => (
                <div key={row.tracking_number || String(row.id)} className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-400">{row.tracking_number || "-"}</p>
                      <p className="mt-2 text-lg font-black text-[#0d2c54]">{row.recipient_name || row.sender_name || "-"}</p>
                    </div>
                    <span className={`rounded-full border px-3 py-1 text-xs font-bold ${statusTone(row.status)}`}>
                      {statusLabel(language, row.status)}
                    </span>
                  </div>

                  <div className="mt-5 grid gap-4 sm:grid-cols-2">
                    <div className="rounded-2xl bg-white p-4">
                      <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-400">
                        {copyFor(language, "Pickup", "လာယူမည့်နေရာ")}
                      </p>
                      <p className="mt-2 text-sm font-semibold text-slate-700">{row.sender_address || "-"}</p>
                      <button
                        type="button"
                        onClick={() => openAddressInMap(row.sender_address)}
                        className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-[#0d2c54]"
                      >
                        <MapPinned size={15} />
                        {copyFor(language, "Open Map", "မြေပုံဖွင့်မည်")}
                      </button>
                    </div>
                    <div className="rounded-2xl bg-white p-4">
                      <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-400">
                        {copyFor(language, "Delivery", "ပို့ဆောင်မည့်နေရာ")}
                      </p>
                      <p className="mt-2 text-sm font-semibold text-slate-700">{row.recipient_address || "-"}</p>
                      <button
                        type="button"
                        onClick={() => openAddressInMap(row.recipient_address)}
                        className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-[#0d2c54]"
                      >
                        <MapPinned size={15} />
                        {copyFor(language, "Open Map", "မြေပုံဖွင့်မည်")}
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 pt-5 2xl:grid-cols-[minmax(0,1.5fr)_minmax(360px,0.9fr)]">
            <div className="overflow-hidden rounded-[28px] border border-slate-200">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200">
                  <thead className="bg-slate-50">
                    <tr className="text-left text-xs font-black uppercase tracking-[0.16em] text-slate-500">
                      <th className="px-6 py-4">{copyFor(language, "Tracking", "Tracking")}</th>
                      <th className="px-6 py-4">{copyFor(language, "Customer", "Customer / ဖောက်သည်")}</th>
                      <th className="px-6 py-4">{copyFor(language, "Status", "အခြေအနေ")}</th>
                      <th className="px-6 py-4">{copyFor(language, "Collectable", "ကောက်ခံရန်")}</th>
                      <th className="px-6 py-4 text-right">{copyFor(language, "Action", "ဆောင်ရွက်ရန်")}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {filteredRows.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-6 py-16 text-center text-slate-400">
                          <PackageSearch className="mx-auto mb-3" size={28} />
                          <p className="font-semibold">
                            {copyFor(
                              language,
                              "No shipment records found matching criteria.",
                              "လိုအပ်ချက်နှင့်ကိုက်ညီသော shipment record မတွေ့ပါ။",
                            )}
                          </p>
                        </td>
                      </tr>
                    ) : (
                      filteredRows.map((row) => {
                        const active = selected?.tracking_number === row.tracking_number;
                        const nextStep = nextWorkflowStatus(row.status);
                        const tracking = row.tracking_number || String(row.id) || "-";
                        return (
                          <tr key={tracking} className={active ? "bg-[#f7faff]" : "hover:bg-slate-50"}>
                            <td className="px-6 py-5 align-top">
                              <button type="button" onClick={() => setSelected(row)} className="text-left">
                                <p className="font-black text-[#0d2c54]">{tracking}</p>
                                <p className="mt-1 text-xs text-slate-400">{row.product_name || "-"}</p>
                              </button>
                            </td>
                            <td className="px-6 py-5 align-top">
                              <p className="font-semibold text-slate-800">{row.recipient_name || row.sender_name || "-"}</p>
                              <p className="mt-1 text-sm text-slate-500">{row.recipient_phone || row.sender_phone || "-"}</p>
                            </td>
                            <td className="px-6 py-5 align-top">
                              <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-bold ${statusTone(row.status)}`}>
                                {statusLabel(language, row.status)}
                              </span>
                            </td>
                            <td className="px-6 py-5 align-top">
                              <p className="font-black text-slate-800">{formatMoney(language, row.total_collectable_amount)} MMK</p>
                              <p className="mt-1 text-xs text-slate-400">{row.payment_term || "-"}</p>
                            </td>
                            <td className="px-6 py-5 align-top">
                              <div className="flex flex-wrap justify-end gap-2">
                                <button
                                  type="button"
                                  onClick={() => setSelected(row)}
                                  className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-xs font-bold text-slate-600"
                                >
                                  <Eye size={14} />
                                  {copyFor(language, "View", "ကြည့်မည်")}
                                </button>

                                {nextStep && (
                                  <button
                                    type="button"
                                    disabled={busyTracking === tracking}
                                    onClick={() => updateShipmentStatus(row, nextStep.next)}
                                    className="inline-flex items-center gap-2 rounded-xl bg-[#0d2c54] px-3 py-2 text-xs font-bold text-white disabled:cursor-not-allowed disabled:opacity-60"
                                  >
                                    {busyTracking === tracking ? (
                                      <Loader2 size={14} className="animate-spin" />
                                    ) : (
                                      <ArrowRight size={14} />
                                    )}
                                    {copyFor(language, nextStep.en, nextStep.my)}
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="rounded-[28px] border border-slate-200 bg-slate-50 p-5">
              <div className="flex items-start justify-between gap-4 border-b border-slate-200 pb-4">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.16em] text-slate-400">
                    {copyFor(language, "Shipment Detail", "Shipment အသေးစိတ်")}
                  </p>
                  <h3 className="mt-2 text-xl font-black text-[#0d2c54]">{selected?.tracking_number || "-"}</h3>
                </div>
                {selected?.status && (
                  <span className={`rounded-full border px-3 py-1 text-xs font-bold ${statusTone(selected.status)}`}>
                    {statusLabel(language, selected.status)}
                  </span>
                )}
              </div>

              {!selected ? (
                <div className="py-14 text-center text-slate-400">
                  <PackageSearch className="mx-auto mb-3" size={28} />
                  <p className="font-semibold">
                    {copyFor(language, "Select a record to inspect details.", "အသေးစိတ်ကြည့်ရန် record တစ်ခုကို ရွေးပါ။")}
                  </p>
                </div>
              ) : (
                <div className="space-y-4 pt-4">
                  <div className="rounded-2xl bg-white p-4">
                    <p className="text-xs font-black uppercase tracking-[0.16em] text-slate-400">
                      {copyFor(language, "Customer", "ဖောက်သည်")}
                    </p>
                    <div className="mt-3 space-y-3">
                      <div>
                        <p className="text-xs font-bold text-slate-400">{copyFor(language, "Sender", "ပေးပို့သူ")}</p>
                        <p className="font-semibold text-slate-800">{selected.sender_name || "-"}</p>
                        <p className="text-sm text-slate-500">{selected.sender_phone || "-"}</p>
                        <p className="mt-1 text-sm text-slate-500">{selected.sender_address || "-"}</p>
                      </div>
                      <div className="border-t border-slate-100 pt-3">
                        <p className="text-xs font-bold text-slate-400">{copyFor(language, "Recipient", "လက်ခံသူ")}</p>
                        <p className="font-semibold text-slate-800">{selected.recipient_name || "-"}</p>
                        <p className="text-sm text-slate-500">{selected.recipient_phone || "-"}</p>
                        <p className="mt-1 text-sm text-slate-500">{selected.recipient_address || "-"}</p>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-2xl bg-white p-4">
                    <p className="text-xs font-black uppercase tracking-[0.16em] text-slate-400">
                      {copyFor(language, "Package", "ကုန်ပစ္စည်း")}
                    </p>
                    <div className="mt-3 grid gap-3 sm:grid-cols-2">
                      <div>
                        <p className="text-xs font-bold text-slate-400">{copyFor(language, "Product", "ပစ္စည်း")}</p>
                        <p className="font-semibold text-slate-800">{selected.product_name || "-"}</p>
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-400">{copyFor(language, "Quantity", "အရေအတွက်")}</p>
                        <p className="font-semibold text-slate-800">{selected.product_qty ?? "-"}</p>
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-400">{copyFor(language, "Weight", "အလေးချိန်")}</p>
                        <p className="font-semibold text-slate-800">{selected.product_weight ?? "-"} KG</p>
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-400">{copyFor(language, "Payment Term", "ငွေပေးချေမှု")}</p>
                        <p className="font-semibold text-slate-800">{selected.payment_term || "-"}</p>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-2xl bg-white p-4">
                    <p className="text-xs font-black uppercase tracking-[0.16em] text-slate-400">
                      {copyFor(language, "Billing", "ငွေကြေး")}
                    </p>
                    <div className="mt-3 grid gap-3 sm:grid-cols-2">
                      <div>
                        <p className="text-xs font-bold text-slate-400">{copyFor(language, "Collectable", "ကောက်ခံရန်")}</p>
                        <p className="font-semibold text-slate-800">{formatMoney(language, selected.total_collectable_amount)} MMK</p>
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-400">{copyFor(language, "COD", "COD")}</p>
                        <p className="font-semibold text-slate-800">{formatMoney(language, selected.cod_amount_mmks)} MMK</p>
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-400">{copyFor(language, "Delivery Fee", "ပို့ဆောင်ခ")}</p>
                        <p className="font-semibold text-slate-800">{formatMoney(language, selected.delivery_fee_mmks)} MMK</p>
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-400">{copyFor(language, "Extra Weight", "အလေးချိန်ပိုကြေး")}</p>
                        <p className="font-semibold text-slate-800">{formatMoney(language, selected.extra_weight_charges)} MMK</p>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-2xl bg-white p-4">
                    <p className="text-xs font-black uppercase tracking-[0.16em] text-slate-400">
                      {copyFor(language, "Operational Actions", "လုပ်ဆောင်ချက်များ")}
                    </p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {nextWorkflowStatus(selected.status) && (
                        <button
                          type="button"
                          disabled={busyTracking === (selected.tracking_number || String(selected.id || ""))}
                          onClick={() => updateShipmentStatus(selected, nextWorkflowStatus(selected.status)!.next)}
                          className="inline-flex items-center gap-2 rounded-xl bg-[#0d2c54] px-4 py-2 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {busyTracking === (selected.tracking_number || String(selected.id || "")) ? (
                            <Loader2 size={16} className="animate-spin" />
                          ) : (
                            <ArrowRight size={16} />
                          )}
                          {copyFor(language, nextWorkflowStatus(selected.status)!.en, nextWorkflowStatus(selected.status)!.my)}
                        </button>
                      )}

                      {!successStatuses.has(normalizeStatus(selected.status)) && (
                        <button
                          type="button"
                          disabled={busyTracking === (selected.tracking_number || String(selected.id || ""))}
                          onClick={() => updateShipmentStatus(selected, "delivery_failed")}
                          className="inline-flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-2 text-sm font-bold text-rose-700 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          <XCircle size={16} />
                          {copyFor(language, "Mark Failed", "မအောင်မြင်အဖြစ်သတ်မှတ်မည်")}
                        </button>
                      )}

                      {!returnStatuses.has(normalizeStatus(selected.status)) && (
                        <button
                          type="button"
                          disabled={busyTracking === (selected.tracking_number || String(selected.id || ""))}
                          onClick={() => updateShipmentStatus(selected, "return_initiated")}
                          className="inline-flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-2 text-sm font-bold text-amber-700 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          <RotateCcw size={16} />
                          {copyFor(language, "Start Return", "ပြန်ပို့ရန်စတင်မည်")}
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => openAddressInMap(selected.recipient_address || selected.sender_address)}
                        className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-700"
                      >
                        <MapPinned size={16} />
                        {copyFor(language, "Open Route Map", "လမ်းကြောင်းမြေပုံဖွင့်မည်")}
                      </button>
                    </div>
                  </div>

                  <div className="rounded-2xl bg-white p-4">
                    <p className="text-xs font-black uppercase tracking-[0.16em] text-slate-400">
                      {copyFor(language, "Rider Remark", "မှတ်ချက်")}
                    </p>
                    <p className="mt-3 whitespace-pre-wrap text-sm font-medium text-slate-600">
                      {selected.rider_remark || copyFor(language, "No remarks", "မှတ်ချက်မရှိပါ")}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default WayManagementClient;