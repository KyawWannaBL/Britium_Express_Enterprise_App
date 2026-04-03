"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  AlertTriangle,
  BellRing,
  CheckCircle2,
  ChevronRight,
  Download,
  FileDown,
  Filter,
  Globe2,
  History,
  Inbox,
  MessageSquare,
  Phone,
  RefreshCw,
  Search,
  Send,
  ShieldCheck,
  Store,
  Truck,
  UserCircle2,
  Warehouse,
  XCircle,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";

type UiLanguage = "en" | "my" | "both";
type ServiceView = "OVERVIEW" | "DIRECTORY" | "OPERATIONS" | "ALERTS" | "CASES" | "MESSAGES" | "EXPORTS";
type Priority = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
type CaseStatus = "OPEN" | "IN_PROGRESS" | "WAITING" | "RESOLVED" | "CLOSED";
type SourceType = "SYSTEM" | "MERCHANT" | "CUSTOMER" | "RIDER" | "DRIVER" | "WAREHOUSE";
type ParcelAlertType = "WAREHOUSE_DUMP" | "FAILED_SCAN" | "MISSING_HANDBACK" | "DAMAGED" | "PAYMENT_HOLD";
type ExportType = "CASES" | "ALERTS" | "MESSAGES" | "CONTACTS";
type ToastTone = "ok" | "warn" | "err";

type AuthUser = {
  email?: string;
  role?: string;
  permissions?: string[];
  displayName?: string;
  branchType?: "HEAD_OFFICE" | "BRANCH";
};

type ContactCard = {
  id: string;
  category: "MERCHANT" | "CUSTOMER";
  name: string;
  phone: string;
  otherPhone?: string;
  email?: string;
  township: string;
  address: string;
  updatedAt: string;
  note?: string;
};

type OperationFeedItem = {
  id: string;
  parcelTrackingNo: string;
  source: SourceType;
  headline: string;
  detail: string;
  createdAt: string;
  createdBy: string;
  branchName?: string;
  priority: Priority;
  status: string;
};

type ParcelAlert = {
  id: string;
  trackingNo: string;
  type: ParcelAlertType;
  reason: string;
  warehouseName: string;
  ageHours: number;
  createdAt: string;
  priority: Priority;
  assignedTo?: string;
  resolved: boolean;
};

type ServiceCase = {
  id: string;
  ticketNo: string;
  title: string;
  trackingNo?: string;
  complainantName: string;
  complainantType: "CUSTOMER" | "MERCHANT" | "INTERNAL";
  source: SourceType;
  detail: string;
  status: CaseStatus;
  priority: Priority;
  assignedTeam: string;
  assignedUser?: string;
  createdAt: string;
  createdBy: string;
  updatedAt: string;
};

type ParcelMessage = {
  id: string;
  parcelTrackingNo: string;
  targetType: "CUSTOMER" | "MERCHANT" | "BOTH";
  recipientName: string;
  channel: "APP" | "SMS" | "VIBER" | "MESSENGER";
  subject: string;
  body: string;
  createdAt: string;
  createdBy: string;
  scheduledAt?: string;
  sent: boolean;
};

type MessageForm = {
  parcelTrackingNo: string;
  targetType: "CUSTOMER" | "MERCHANT" | "BOTH";
  recipientName: string;
  channel: "APP" | "SMS" | "VIBER" | "MESSENGER";
  subject: string;
  body: string;
  scheduledAt: string;
};

const ACCESS_ROLES = [
  "SUPER_ADMIN",
  "ADMIN",
  "SUPERVISOR",
  "WAREHOUSE_CONTROLLER",
  "CUSTOMER_SERVICE",
  "CUSTOMER_SERVICE_AGENT",
  "CS",
] as const;

const CONTACTS: ContactCard[] = [
  {
    id: "merchant-1",
    category: "MERCHANT",
    name: "Beauty City",
    phone: "09767146464",
    otherPhone: "09767146464",
    township: "Kamayut",
    address: "Kamayut Township, Yangon",
    updatedAt: "2026-01-08T09:00:00Z",
    note: "High daily parcel volume",
  },
  {
    id: "merchant-2",
    category: "MERCHANT",
    name: "Britium Fashion House",
    phone: "09409948999",
    otherPhone: "09409948999",
    township: "Lanmadaw",
    address: "Lanmadaw, Yangon",
    updatedAt: "2025-12-23T09:00:00Z",
  },
  {
    id: "customer-1",
    category: "CUSTOMER",
    name: "Kyaw Zayar",
    phone: "0970001111",
    township: "Bahan",
    address: "Bahan Township, Yangon",
    updatedAt: "2026-01-24T08:10:00Z",
  },
  {
    id: "customer-2",
    category: "CUSTOMER",
    name: "Ma Thuzar",
    phone: "0970002222",
    township: "Mayangone",
    address: "Mayangone Township, Yangon",
    updatedAt: "2026-01-24T08:15:00Z",
  },
];

const FEEDS: OperationFeedItem[] = [
  {
    id: "feed-1",
    parcelTrackingNo: "BEX-LIVE-001",
    source: "WAREHOUSE",
    headline: "Inbound parcel not sorted within SLA",
    detail: "Parcel reached Head Office warehouse but still not staged after 5 hours.",
    createdAt: "2026-01-24T09:10:00Z",
    createdBy: "warehouse.controller@britium.com",
    branchName: "Head Office",
    priority: "HIGH",
    status: "OPEN",
  },
  {
    id: "feed-2",
    parcelTrackingNo: "BEX-LIVE-002",
    source: "MERCHANT",
    headline: "Customer requested urgent same-day callback",
    detail: "Merchant noted recipient will only be available before 2 PM.",
    createdAt: "2026-01-24T09:18:00Z",
    createdBy: "merchant.portal",
    branchName: "Kamayut",
    priority: "MEDIUM",
    status: "ACTIVE",
  },
  {
    id: "feed-3",
    parcelTrackingNo: "BR-100001",
    source: "RIDER",
    headline: "Recipient address landmark updated",
    detail: "Rider uploaded corrected landmark and floor details.",
    createdAt: "2026-01-24T09:24:00Z",
    createdBy: "rider.app",
    priority: "LOW",
    status: "SYNCED",
  },
  {
    id: "feed-4",
    parcelTrackingNo: "BR-100002",
    source: "SYSTEM",
    headline: "COD payout hold due to mismatch",
    detail: "System flagged COD mismatch between pickup and delivered amount.",
    createdAt: "2026-01-24T10:00:00Z",
    createdBy: "operations.engine",
    priority: "CRITICAL",
    status: "ESCALATED",
  },
];

const ALERTS: ParcelAlert[] = [
  {
    id: "alert-1",
    trackingNo: "BEX-LIVE-001",
    type: "WAREHOUSE_DUMP",
    reason: "Parcel has been sitting in warehouse unsorted for 8 hours.",
    warehouseName: "Head Office Hub",
    ageHours: 8,
    createdAt: "2026-01-24T08:00:00Z",
    priority: "CRITICAL",
    assignedTo: "customer.service@britium.com",
    resolved: false,
  },
  {
    id: "alert-2",
    trackingNo: "BEX-LIVE-003",
    type: "DAMAGED",
    reason: "Driver uploaded damaged carton evidence during handover.",
    warehouseName: "Mandalay Station",
    ageHours: 3,
    createdAt: "2026-01-24T11:00:00Z",
    priority: "HIGH",
    resolved: false,
  },
  {
    id: "alert-3",
    trackingNo: "BR-100001",
    type: "PAYMENT_HOLD",
    reason: "COD release blocked until merchant confirms amount.",
    warehouseName: "Finance Hold Queue",
    ageHours: 11,
    createdAt: "2026-01-24T07:30:00Z",
    priority: "HIGH",
    resolved: false,
  },
];

const CASES: ServiceCase[] = [
  {
    id: "case-1",
    ticketNo: "CS-2026-001",
    title: "Late delivery complaint",
    trackingNo: "BEX-LIVE-001",
    complainantName: "Kyaw Zayar",
    complainantType: "CUSTOMER",
    source: "CUSTOMER",
    detail: "Customer says parcel has been in warehouse since morning and needs urgent update.",
    status: "OPEN",
    priority: "HIGH",
    assignedTeam: "Customer Service",
    assignedUser: "supervisor@britium.com",
    createdAt: "2026-01-24T09:30:00Z",
    createdBy: "call.center@britium.com",
    updatedAt: "2026-01-24T09:35:00Z",
  },
  {
    id: "case-2",
    ticketNo: "CS-2026-002",
    title: "COD discrepancy follow-up",
    trackingNo: "BR-100001",
    complainantName: "Beauty City",
    complainantType: "MERCHANT",
    source: "MERCHANT",
    detail: "Merchant requests COD correction before settlement batch closes.",
    status: "IN_PROGRESS",
    priority: "CRITICAL",
    assignedTeam: "Operations Control",
    assignedUser: "warehouse.controller@britium.com",
    createdAt: "2026-01-24T10:20:00Z",
    createdBy: "merchant.portal",
    updatedAt: "2026-01-24T10:45:00Z",
  },
];

const MESSAGES: ParcelMessage[] = [
  {
    id: "msg-1",
    parcelTrackingNo: "BEX-LIVE-001",
    targetType: "CUSTOMER",
    recipientName: "Kyaw Zayar",
    channel: "APP",
    subject: "Warehouse delay update",
    body: "Your parcel is under warehouse sorting review and customer service is following up.",
    createdAt: "2026-01-24T09:40:00Z",
    createdBy: "customer.service@britium.com",
    sent: true,
  },
  {
    id: "msg-2",
    parcelTrackingNo: "BR-100001",
    targetType: "MERCHANT",
    recipientName: "Beauty City",
    channel: "SMS",
    subject: "COD check required",
    body: "Please confirm COD amount for settlement hold release.",
    createdAt: "2026-01-24T10:50:00Z",
    createdBy: "admin@britium.com",
    scheduledAt: "2026-01-24T11:15:00Z",
    sent: false,
  },
];

function bi(language: UiLanguage, en: string, my: string) {
  if (language === "en") return en;
  if (language === "my") return my;
  return `${en} / ${my}`;
}

function formatDateTime(input?: string) {
  if (!input) return "-";
  try {
    return new Date(input).toLocaleString();
  } catch {
    return input;
  }
}

function priorityClass(priority: Priority) {
  if (priority === "CRITICAL") return "bg-rose-100 text-rose-700";
  if (priority === "HIGH") return "bg-amber-100 text-amber-700";
  if (priority === "MEDIUM") return "bg-sky-100 text-sky-700";
  return "bg-slate-100 text-slate-700";
}

function caseStatusClass(status: CaseStatus) {
  if (status === "RESOLVED" || status === "CLOSED") return "bg-emerald-100 text-emerald-700";
  if (status === "IN_PROGRESS") return "bg-sky-100 text-sky-700";
  if (status === "WAITING") return "bg-amber-100 text-amber-700";
  return "bg-rose-100 text-rose-700";
}

function sourceClass(source: SourceType) {
  if (source === "SYSTEM") return "bg-slate-100 text-slate-700";
  if (source === "MERCHANT") return "bg-violet-100 text-violet-700";
  if (source === "CUSTOMER") return "bg-sky-100 text-sky-700";
  if (source === "WAREHOUSE") return "bg-amber-100 text-amber-700";
  return "bg-emerald-100 text-emerald-700";
}

function getCurrentUser(auth: unknown): AuthUser {
  const anyAuth = auth as { user?: AuthUser } | undefined;
  return anyAuth?.user ?? {};
}

function hasPortalAccess(user: AuthUser) {
  const role = (user.role ?? "").toUpperCase();
  return ACCESS_ROLES.includes(role as (typeof ACCESS_ROLES)[number]);
}

function canExportData(user: AuthUser) {
  const role = (user.role ?? "").toUpperCase();
  const perms = (user.permissions ?? []).map((item) => item.toUpperCase());
  return ["SUPER_ADMIN", "ADMIN", "SUPERVISOR", "WAREHOUSE_CONTROLLER"].includes(role) || perms.includes("CUSTOMER_SERVICE_EXPORT");
}

function canWriteManagementNote(user: AuthUser) {
  const role = (user.role ?? "").toUpperCase();
  return ["SUPER_ADMIN", "ADMIN", "SUPERVISOR", "WAREHOUSE_CONTROLLER", "CUSTOMER_SERVICE", "CUSTOMER_SERVICE_AGENT", "CS"].includes(role);
}

async function fetchJson<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });
  const raw = await res.text();
  const parsed = raw ? JSON.parse(raw) : {};
  if (!res.ok) {
    throw new Error(parsed?.message || parsed?.error || `Request failed: ${res.status}`);
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

function emptyMessageForm(): MessageForm {
  const now = new Date();
  const local = new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
  return {
    parcelTrackingNo: "",
    targetType: "CUSTOMER",
    recipientName: "",
    channel: "APP",
    subject: "",
    body: "",
    scheduledAt: local,
  };
}

export default function CustomerServicePortalPage() {
  const auth = (() => {
    try {
      return useAuth();
    } catch {
      return undefined;
    }
  })();
  const langContext = (() => {
    try {
      return useLanguage();
    } catch {
      return undefined;
    }
  })();

  const user = getCurrentUser(auth);
  const [language, setLanguage] = useState<UiLanguage>(langContext?.lang === "en" ? "en" : langContext?.lang === "mm" ? "my" : "both");
  const [view, setView] = useState<ServiceView>("OVERVIEW");
  const [contacts, setContacts] = useState<ContactCard[]>(CONTACTS);
  const [feeds, setFeeds] = useState<OperationFeedItem[]>(FEEDS);
  const [alerts, setAlerts] = useState<ParcelAlert[]>(ALERTS);
  const [cases, setCases] = useState<ServiceCase[]>(CASES);
  const [messages, setMessages] = useState<ParcelMessage[]>(MESSAGES);
  const [query, setQuery] = useState("");
  const [sourceFilter, setSourceFilter] = useState<SourceType | "ALL">("ALL");
  const [toast, setToast] = useState<{ tone: ToastTone; message: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [messageForm, setMessageForm] = useState<MessageForm>(emptyMessageForm());
  const [complaintTitle, setComplaintTitle] = useState("");
  const [complaintTracking, setComplaintTracking] = useState("");
  const [complainantName, setComplainantName] = useState("");
  const [complaintDetail, setComplaintDetail] = useState("");
  const [complaintPriority, setComplaintPriority] = useState<Priority>("MEDIUM");
  const [caseStatusFilter, setCaseStatusFilter] = useState<CaseStatus | "ALL">("ALL");
  const [selectedTracking, setSelectedTracking] = useState<string | null>(ALERTS[0]?.trackingNo ?? FEEDS[0]?.parcelTrackingNo ?? null);
  const searchRef = useRef<HTMLInputElement | null>(null);

  const t = useCallback((en: string, my: string) => bi(language, en, my), [language]);
  const accessAllowed = hasPortalAccess(user);
  const exportAllowed = canExportData(user);
  const writeAllowed = canWriteManagementNote(user);
  const actorName = user.displayName || user.email || "Customer Service";

  useEffect(() => {
    searchRef.current?.focus();
  }, [view]);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(null), 2500);
    return () => window.clearTimeout(timer);
  }, [toast]);

  useEffect(() => {
    let ignore = false;
    async function bootstrap() {
      if (!accessAllowed) return;
      setLoading(true);
      try {
        const [remoteContacts, remoteFeeds, remoteAlerts, remoteCases, remoteMessages] = await Promise.allSettled([
          fetchJson<ContactCard[]>("/api/v1/customer-service/contacts"),
          fetchJson<OperationFeedItem[]>("/api/v1/customer-service/feeds"),
          fetchJson<ParcelAlert[]>("/api/v1/customer-service/alerts"),
          fetchJson<ServiceCase[]>("/api/v1/customer-service/cases"),
          fetchJson<ParcelMessage[]>("/api/v1/customer-service/messages"),
        ]);
        if (ignore) return;
        if (remoteContacts.status === "fulfilled" && remoteContacts.value.length) setContacts(remoteContacts.value);
        if (remoteFeeds.status === "fulfilled" && remoteFeeds.value.length) setFeeds(remoteFeeds.value);
        if (remoteAlerts.status === "fulfilled" && remoteAlerts.value.length) setAlerts(remoteAlerts.value);
        if (remoteCases.status === "fulfilled" && remoteCases.value.length) setCases(remoteCases.value);
        if (remoteMessages.status === "fulfilled" && remoteMessages.value.length) setMessages(remoteMessages.value);
      } catch {
        // keep local demo fallback
      } finally {
        if (!ignore) setLoading(false);
      }
    }
    bootstrap();
    return () => {
      ignore = true;
    };
  }, [accessAllowed]);

  const filteredContacts = useMemo(() => {
    const q = query.trim().toLowerCase();
    return contacts.filter((contact) => {
      if (!q) return true;
      return [contact.name, contact.phone, contact.address, contact.township, contact.email ?? "", contact.category]
        .join(" ")
        .toLowerCase()
        .includes(q);
    });
  }, [contacts, query]);

  const filteredFeeds = useMemo(() => {
    const q = query.trim().toLowerCase();
    return feeds.filter((item) => {
      if (sourceFilter !== "ALL" && item.source !== sourceFilter) return false;
      if (!q) return true;
      return [item.parcelTrackingNo, item.headline, item.detail, item.createdBy, item.branchName ?? ""]
        .join(" ")
        .toLowerCase()
        .includes(q);
    });
  }, [feeds, query, sourceFilter]);

  const filteredAlerts = useMemo(() => {
    const q = query.trim().toLowerCase();
    return alerts.filter((item) => {
      if (!q) return true;
      return [item.trackingNo, item.reason, item.warehouseName, item.type].join(" ").toLowerCase().includes(q);
    });
  }, [alerts, query]);

  const filteredCases = useMemo(() => {
    const q = query.trim().toLowerCase();
    return cases.filter((item) => {
      if (caseStatusFilter !== "ALL" && item.status !== caseStatusFilter) return false;
      if (!q) return true;
      return [item.ticketNo, item.title, item.detail, item.complainantName, item.trackingNo ?? ""].join(" ").toLowerCase().includes(q);
    });
  }, [caseStatusFilter, cases, query]);

  const relatedContact = useMemo(() => {
    if (!selectedTracking) return null;
    const linkedCase = cases.find((item) => item.trackingNo === selectedTracking);
    if (!linkedCase) return null;
    return contacts.find((item) => item.name.toLowerCase() === linkedCase.complainantName.toLowerCase()) ?? null;
  }, [cases, contacts, selectedTracking]);

  const overview = useMemo(() => {
    return {
      contacts: contacts.length,
      liveFeeds: feeds.length,
      openCases: cases.filter((item) => item.status === "OPEN" || item.status === "IN_PROGRESS" || item.status === "WAITING").length,
      warehouseDump: alerts.filter((item) => item.type === "WAREHOUSE_DUMP" && !item.resolved).length,
    };
  }, [alerts, cases, contacts.length, feeds.length]);

  const exportData = useCallback(
    (type: ExportType) => {
      if (!exportAllowed) {
        setToast({ tone: "err", message: t("You do not have export access.", "Export လုပ်ရန် ခွင့်ပြုချက်မရှိပါ။") });
        return;
      }

      if (type === "CONTACTS") {
        downloadCsv("customer-service-contacts.csv", [
          ["category", "name", "phone", "otherPhone", "email", "township", "address", "updatedAt"],
          ...filteredContacts.map((item) => [item.category, item.name, item.phone, item.otherPhone ?? "", item.email ?? "", item.township, item.address, item.updatedAt]),
        ]);
      }
      if (type === "ALERTS") {
        downloadCsv("customer-service-alerts.csv", [
          ["trackingNo", "type", "reason", "warehouseName", "ageHours", "priority", "assignedTo", "resolved"],
          ...filteredAlerts.map((item) => [item.trackingNo, item.type, item.reason, item.warehouseName, String(item.ageHours), item.priority, item.assignedTo ?? "", String(item.resolved)]),
        ]);
      }
      if (type === "CASES") {
        downloadCsv("customer-service-cases.csv", [
          ["ticketNo", "title", "trackingNo", "complainantName", "source", "status", "priority", "assignedTeam", "updatedAt"],
          ...filteredCases.map((item) => [item.ticketNo, item.title, item.trackingNo ?? "", item.complainantName, item.source, item.status, item.priority, item.assignedTeam, item.updatedAt]),
        ]);
      }
      if (type === "MESSAGES") {
        downloadCsv("customer-service-messages.csv", [
          ["trackingNo", "targetType", "recipientName", "channel", "subject", "body", "createdAt", "sent"],
          ...messages.map((item) => [item.parcelTrackingNo, item.targetType, item.recipientName, item.channel, item.subject, item.body, item.createdAt, String(item.sent)]),
        ]);
      }
      setToast({ tone: "ok", message: t("Export generated.", "Export ဖိုင်ထုတ်ပြီးပါပြီ။") });
    },
    [exportAllowed, filteredAlerts, filteredCases, filteredContacts, messages, t],
  );

  const handleSendMessage = useCallback(async () => {
    if (!writeAllowed) {
      setToast({ tone: "err", message: t("You do not have message write access.", "Message ရေးသားခွင့်မရှိပါ။") });
      return;
    }
    if (!messageForm.parcelTrackingNo.trim() || !messageForm.recipientName.trim() || !messageForm.subject.trim() || !messageForm.body.trim()) {
      setToast({ tone: "err", message: t("Please complete required fields.", "လိုအပ်သောအကွက်များကို ဖြည့်ပါ။") });
      return;
    }

    const payload: ParcelMessage = {
      id: crypto.randomUUID(),
      parcelTrackingNo: messageForm.parcelTrackingNo.trim().toUpperCase(),
      targetType: messageForm.targetType,
      recipientName: messageForm.recipientName.trim(),
      channel: messageForm.channel,
      subject: messageForm.subject.trim(),
      body: messageForm.body.trim(),
      createdAt: new Date().toISOString(),
      createdBy: actorName,
      scheduledAt: messageForm.scheduledAt || undefined,
      sent: false,
    };

    try {
      try {
        await fetchJson<ParcelMessage>("/api/v1/customer-service/messages", {
          method: "POST",
          body: JSON.stringify(payload),
        });
      } catch {
        // fallback to local demo state
      }
      setMessages((prev) => [payload, ...prev]);
      setMessageForm(emptyMessageForm());
      setToast({ tone: "ok", message: t("Parcel message queued successfully.", "Parcel message ကို အောင်မြင်စွာ စီစဉ်ပြီးပါပြီ။") });
    } catch (error) {
      setToast({ tone: "err", message: error instanceof Error ? error.message : t("Unable to queue message.", "Message မစီစဉ်နိုင်ပါ။") });
    }
  }, [actorName, messageForm, t, writeAllowed]);

  const handleCreateComplaint = useCallback(async () => {
    if (!writeAllowed) {
      setToast({ tone: "err", message: t("You do not have complaint write access.", "တိုင်ကြားချက်ရေးသားခွင့်မရှိပါ။") });
      return;
    }
    if (!complaintTitle.trim() || !complainantName.trim() || !complaintDetail.trim()) {
      setToast({ tone: "err", message: t("Please fill complaint title, complainant, and detail.", "တိုင်ကြားချက်ခေါင်းစဉ်၊ တိုင်ကြားသူနှင့် အသေးစိတ်အချက်အလက် ဖြည့်ပါ။") });
      return;
    }

    const payload: ServiceCase = {
      id: crypto.randomUUID(),
      ticketNo: `CS-${new Date().getFullYear()}-${String(cases.length + 1).padStart(3, "0")}`,
      title: complaintTitle.trim(),
      trackingNo: complaintTracking.trim() || undefined,
      complainantName: complainantName.trim(),
      complainantType: "CUSTOMER",
      source: "CUSTOMER",
      detail: complaintDetail.trim(),
      status: "OPEN",
      priority: complaintPriority,
      assignedTeam: "Customer Service",
      assignedUser: actorName,
      createdAt: new Date().toISOString(),
      createdBy: actorName,
      updatedAt: new Date().toISOString(),
    };

    try {
      try {
        await fetchJson<ServiceCase>("/api/v1/customer-service/cases", {
          method: "POST",
          body: JSON.stringify(payload),
        });
      } catch {
        // local fallback
      }
      setCases((prev) => [payload, ...prev]);
      setComplaintTitle("");
      setComplaintTracking("");
      setComplainantName("");
      setComplaintDetail("");
      setComplaintPriority("MEDIUM");
      setToast({ tone: "ok", message: t("Complaint ticket created.", "တိုင်ကြားချက် ticket ဖန်တီးပြီးပါပြီ။") });
    } catch (error) {
      setToast({ tone: "err", message: error instanceof Error ? error.message : t("Unable to create complaint.", "တိုင်ကြားချက် မဖန်တီးနိုင်ပါ။") });
    }
  }, [actorName, cases.length, complaintDetail, complaintPriority, complaintTitle, complaintTracking, complainantName, t, writeAllowed]);

  const markAlertResolved = useCallback(
    async (id: string) => {
      const current = alerts.find((item) => item.id === id);
      if (!current) return;
      const next = { ...current, resolved: true, assignedTo: actorName };
      try {
        try {
          await fetchJson<ParcelAlert>(`/api/v1/customer-service/alerts/${id}`, {
            method: "PATCH",
            body: JSON.stringify(next),
          });
        } catch {
          // local fallback
        }
        setAlerts((prev) => prev.map((item) => (item.id === id ? next : item)));
        setToast({ tone: "ok", message: t("Alert resolved.", "Alert ကို ဖြေရှင်းပြီးပါပြီ။") });
      } catch (error) {
        setToast({ tone: "err", message: error instanceof Error ? error.message : t("Unable to update alert.", "Alert ကို မပြင်နိုင်ပါ။") });
      }
    },
    [actorName, alerts, t],
  );

  if (!accessAllowed) {
    return (
      <div className="min-h-screen bg-[#f7f9fc] p-8">
        <div className="rounded-[32px] border border-rose-200 bg-white p-8 shadow-sm">
          <div className="flex items-start gap-4">
            <div className="rounded-2xl bg-rose-50 p-3 text-rose-600">
              <ShieldCheck size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-black text-[#0d2c54]">Customer Service Access Restricted</h1>
              <p className="mt-2 text-sm text-slate-500">
                This portal is only for Super Admin, Admin, Supervisor, Warehouse Controller, and Customer Service staff. /
                ဤ portal ကို Super Admin, Admin, Supervisor, Warehouse Controller နှင့် Customer Service ဝန်ထမ်းများသာ အသုံးပြုနိုင်သည်။
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
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-slate-400">Customer Service Operations</p>
          <h1 className="text-4xl font-black uppercase tracking-tight text-[#0d2c54]">
            Customer Service Portal <span className="font-normal text-blue-500">/ ဖောက်သည်ဝန်ဆောင်မှု ပေါ်တယ်</span>
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            {t(
              "Customer and merchant lookup, operation feeds from multiple sources, warehouse dump alarms, parcel messaging, and complaint control in one workspace.",
              "Customer နှင့် merchant အချက်အလက်ရှာဖွေရန်၊ အမျိုးမျိုးသော source များမှ operation feed များ၊ warehouse dump alarm များ၊ parcel message များနှင့် complaint ထိန်းချုပ်မှုကို workspace တစ်ခုတည်းတွင် စုစည်းထားသည်။",
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
        <StatCard icon={UserCircle2} title={t("Customer & Merchant Contacts", "Customer နှင့် Merchant Contact များ")} value={String(overview.contacts)} />
        <StatCard icon={Inbox} title={t("Live Operation Feeds", "Live Operation Feed များ")} value={String(overview.liveFeeds)} accent="sky" />
        <StatCard icon={MessageSquare} title={t("Open Service Cases", "ဖွင့်ထားသော Service Case များ")} value={String(overview.openCases)} accent="amber" />
        <StatCard icon={Warehouse} title={t("Warehouse Dump Alerts", "Warehouse Dump Alert များ")} value={String(overview.warehouseDump)} accent="rose" />
      </div>

      <div className="mt-8 flex flex-wrap gap-3">
        <ViewButton active={view === "OVERVIEW"} onClick={() => setView("OVERVIEW")} label={t("Overview", "အနှစ်ချုပ်")} />
        <ViewButton active={view === "DIRECTORY"} onClick={() => setView("DIRECTORY")} label={t("Customer & Merchant Info", "Customer နှင့် Merchant အချက်အလက်")} />
        <ViewButton active={view === "OPERATIONS"} onClick={() => setView("OPERATIONS")} label={t("Operation Feeds", "Operation Feed များ")} />
        <ViewButton active={view === "ALERTS"} onClick={() => setView("ALERTS")} label={t("Alarm Desk", "Alarm Desk")} />
        <ViewButton active={view === "CASES"} onClick={() => setView("CASES")} label={t("Complaints & Cases", "တိုင်ကြားချက်နှင့် Case များ")} />
        <ViewButton active={view === "MESSAGES"} onClick={() => setView("MESSAGES")} label={t("Parcel Messages", "Parcel Message များ")} />
        <ViewButton active={view === "EXPORTS"} onClick={() => setView("EXPORTS")} label={t("Exports", "Export များ")} />
      </div>

      <div className="mt-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="relative w-full md:max-w-xl">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            ref={searchRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t("Search parcel, customer, merchant, ticket, or warehouse...", "parcel, customer, merchant, ticket သို့မဟုတ် warehouse ဖြင့်ရှာရန်...")}
            className="w-full rounded-2xl border border-slate-200 bg-white py-3 pl-11 pr-4 text-sm outline-none focus:border-[#0d2c54]"
          />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={sourceFilter}
            onChange={(e) => setSourceFilter(e.target.value as SourceType | "ALL")}
            className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none"
          >
            <option value="ALL">{t("All Sources", "Source အားလုံး")}</option>
            <option value="SYSTEM">SYSTEM</option>
            <option value="MERCHANT">MERCHANT</option>
            <option value="CUSTOMER">CUSTOMER</option>
            <option value="RIDER">RIDER</option>
            <option value="DRIVER">DRIVER</option>
            <option value="WAREHOUSE">WAREHOUSE</option>
          </select>
          <button
            type="button"
            onClick={() => {
              setQuery("");
              setSourceFilter("ALL");
              setCaseStatusFilter("ALL");
              setToast({ tone: "ok", message: t("Filters reset.", "Filter များကို ပြန်ရှင်းပြီးပါပြီ။") });
            }}
            className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-xs font-black uppercase tracking-wider text-slate-600 hover:bg-slate-50"
          >
            <Filter size={14} /> Reset
          </button>
        </div>
      </div>

      {view === "OVERVIEW" ? (
        <div className="mt-8 grid gap-4 xl:grid-cols-[1fr_1fr]">
          <Panel title={t("Accessible Information at Hand", "အလွယ်တကူလက်လှမ်းမီသော အချက်အလက်များ")}>
            <div className="grid gap-4 md:grid-cols-2">
              <InfoCard title={t("Merchant contacts", "Merchant contact များ")} value={String(contacts.filter((c) => c.category === "MERCHANT").length)} icon={<Store size={16} className="text-[#0d2c54]" />} />
              <InfoCard title={t("Customer contacts", "Customer contact များ")} value={String(contacts.filter((c) => c.category === "CUSTOMER").length)} icon={<UserCircle2 size={16} className="text-[#0d2c54]" />} />
              <InfoCard title={t("Warehouse alarms", "Warehouse alarm များ")} value={String(alerts.filter((a) => !a.resolved).length)} icon={<BellRing size={16} className="text-[#0d2c54]" />} />
              <InfoCard title={t("Complaint tickets", "တိုင်ကြားချက် ticket များ")} value={String(cases.length)} icon={<MessageSquare size={16} className="text-[#0d2c54]" />} />
            </div>
          </Panel>

          <Panel title={t("Selected Parcel Snapshot", "ရွေးထားသော parcel အခြေအနေ") }>
            <div className="grid gap-4 md:grid-cols-2">
              <InfoCard title={t("Tracking", "Tracking") } value={selectedTracking ?? "-"} icon={<Truck size={16} className="text-[#0d2c54]" />} />
              <InfoCard title={t("Linked contact", "ချိတ်ဆက်ထားသော contact") } value={relatedContact?.name ?? "-"} icon={<Phone size={16} className="text-[#0d2c54]" />} />
              <InfoCard title={t("Open alerts", "ဖွင့်ထားသော alert များ") } value={String(alerts.filter((a) => a.trackingNo === selectedTracking && !a.resolved).length)} icon={<AlertTriangle size={16} className="text-[#0d2c54]" />} />
              <InfoCard title={t("Message history", "Message မှတ်တမ်း") } value={String(messages.filter((m) => m.parcelTrackingNo === selectedTracking).length)} icon={<History size={16} className="text-[#0d2c54]" />} />
            </div>
          </Panel>

          <Panel title={t("Latest Operation Inputs", "နောက်ဆုံး operation input များ")}>
            <div className="space-y-3">
              {filteredFeeds.slice(0, 4).map((feed) => (
                <div key={feed.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div className="font-black text-[#0d2c54]">{feed.parcelTrackingNo}</div>
                    <div className="flex gap-2">
                      <span className={`rounded-full px-3 py-1 text-[10px] font-black uppercase ${sourceClass(feed.source)}`}>{feed.source}</span>
                      <span className={`rounded-full px-3 py-1 text-[10px] font-black uppercase ${priorityClass(feed.priority)}`}>{feed.priority}</span>
                    </div>
                  </div>
                  <div className="mt-2 text-sm font-semibold text-slate-700">{feed.headline}</div>
                  <div className="mt-1 text-sm text-slate-500">{feed.detail}</div>
                </div>
              ))}
            </div>
          </Panel>

          <Panel title={t("Immediate Action Queue", "ချက်ချင်းဆောင်ရွက်ရန် စာရင်း")}>
            <div className="space-y-3">
              {filteredAlerts.filter((item) => !item.resolved).slice(0, 4).map((alert) => (
                <div key={alert.id} className="rounded-2xl border border-rose-200 bg-rose-50 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div className="font-black text-rose-700">{alert.trackingNo}</div>
                    <span className={`rounded-full px-3 py-1 text-[10px] font-black uppercase ${priorityClass(alert.priority)}`}>{alert.priority}</span>
                  </div>
                  <div className="mt-2 text-sm font-semibold text-slate-700">{alert.reason}</div>
                  <div className="mt-1 text-xs text-slate-500">{alert.warehouseName} • {alert.ageHours}h</div>
                </div>
              ))}
            </div>
          </Panel>
        </div>
      ) : null}

      {view === "DIRECTORY" ? (
        <div className="mt-8">
          <Panel
            title={t("Customer & Merchant Directory", "Customer နှင့် Merchant Directory")}
            subtitle={t("Information is searchable for quick support and arrangement work.", "ဝန်ဆောင်မှုနှင့် စီမံခန့်ခွဲမှုလုပ်ငန်းများအတွက် အမြန်ရှာဖွေနိုင်သည်။")}
          >
            <div className="overflow-hidden rounded-2xl border border-slate-200">
              <table className="min-w-full text-sm">
                <thead className="bg-slate-50 text-left text-slate-500">
                  <tr>
                    <th className="px-4 py-3 font-black">{t("Type", "အမျိုးအစား")}</th>
                    <th className="px-4 py-3 font-black">{t("Name", "အမည်")}</th>
                    <th className="px-4 py-3 font-black">{t("Phone", "ဖုန်း")}</th>
                    <th className="px-4 py-3 font-black">{t("Township", "မြို့နယ်")}</th>
                    <th className="px-4 py-3 font-black">{t("Address", "လိပ်စာ")}</th>
                    <th className="px-4 py-3 font-black">{t("Updated", "ပြင်ဆင်ချိန်")}</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredContacts.map((contact) => (
                    <tr key={contact.id} className="border-t border-slate-100">
                      <td className="px-4 py-3"><span className={`rounded-full px-3 py-1 text-[10px] font-black uppercase ${contact.category === "MERCHANT" ? "bg-violet-100 text-violet-700" : "bg-sky-100 text-sky-700"}`}>{contact.category}</span></td>
                      <td className="px-4 py-3 font-semibold text-[#0d2c54]">{contact.name}</td>
                      <td className="px-4 py-3">{contact.phone}</td>
                      <td className="px-4 py-3">{contact.township}</td>
                      <td className="px-4 py-3">{contact.address}</td>
                      <td className="px-4 py-3">{formatDateTime(contact.updatedAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Panel>
        </div>
      ) : null}

      {view === "OPERATIONS" ? (
        <div className="mt-8">
          <Panel
            title={t("Operation Inputs from Multiple Sources", "Source အမျိုးမျိုးမှ operation input များ")}
            subtitle={t("Feeds from system, merchants, customers, riders, drivers, and warehouse are shown in one queue.", "System, merchant, customer, rider, driver နှင့် warehouse မှ feed များကို queue တစ်ခုတည်းတွင် ပြသထားသည်။")}
          >
            <div className="space-y-4">
              {filteredFeeds.map((feed) => (
                <button
                  type="button"
                  key={feed.id}
                  onClick={() => setSelectedTracking(feed.parcelTrackingNo)}
                  className={`w-full rounded-2xl border p-4 text-left transition ${selectedTracking === feed.parcelTrackingNo ? "border-[#0d2c54] bg-slate-50" : "border-slate-200 bg-white hover:bg-slate-50"}`}
                >
                  <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                    <div>
                      <div className="font-black text-[#0d2c54]">{feed.parcelTrackingNo}</div>
                      <div className="mt-1 text-sm font-semibold text-slate-700">{feed.headline}</div>
                      <div className="mt-1 text-sm text-slate-500">{feed.detail}</div>
                      <div className="mt-2 text-xs text-slate-400">{feed.createdBy} • {formatDateTime(feed.createdAt)}</div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <span className={`rounded-full px-3 py-1 text-[10px] font-black uppercase ${sourceClass(feed.source)}`}>{feed.source}</span>
                      <span className={`rounded-full px-3 py-1 text-[10px] font-black uppercase ${priorityClass(feed.priority)}`}>{feed.priority}</span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </Panel>
        </div>
      ) : null}

      {view === "ALERTS" ? (
        <div className="mt-8">
          <Panel
            title={t("Alarm Desk for Warehouse-Dumped Cargoes", "Warehouse တွင်ပိတ်မိနေသော cargo အတွက် alarm desk")}
            subtitle={t("Customer service can monitor, assign, and resolve cargo alarms quickly.", "Customer service မှ cargo alarm များကို စောင့်ကြည့်၊ assign လုပ်ပြီး မြန်ဆန်စွာဖြေရှင်းနိုင်သည်။")}
          >
            <div className="space-y-4">
              {filteredAlerts.map((alert) => (
                <div key={alert.id} className={`rounded-2xl border p-4 ${alert.resolved ? "border-emerald-200 bg-emerald-50" : "border-rose-200 bg-white"}`}>
                  <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                    <div>
                      <div className="font-black text-[#0d2c54]">{alert.trackingNo}</div>
                      <div className="mt-1 text-sm font-semibold text-slate-700">{alert.type}</div>
                      <div className="mt-1 text-sm text-slate-500">{alert.reason}</div>
                      <div className="mt-2 text-xs text-slate-400">{alert.warehouseName} • {alert.ageHours}h • {formatDateTime(alert.createdAt)}</div>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`rounded-full px-3 py-1 text-[10px] font-black uppercase ${priorityClass(alert.priority)}`}>{alert.priority}</span>
                      {alert.resolved ? (
                        <span className="rounded-full bg-emerald-100 px-3 py-1 text-[10px] font-black uppercase text-emerald-700">{t("Resolved", "ဖြေရှင်းပြီး")}</span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => markAlertResolved(alert.id)}
                          className="rounded-xl bg-[#0d2c54] px-4 py-2 text-xs font-black uppercase tracking-wider text-white"
                        >
                          {t("Resolve", "ဖြေရှင်းမည်")}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Panel>
        </div>
      ) : null}

      {view === "CASES" ? (
        <div className="mt-8 grid gap-4 xl:grid-cols-[1fr_1fr]">
          <Panel
            title={t("Complaint / Ticket Form", "တိုင်ကြားချက် / Ticket ဖောင်")}
            subtitle={t("Customer service staff can record parcel complaints and service notes for arrangement.", "Customer service ဝန်ထမ်းများသည် parcel complaint နှင့် arrangement note များကို မှတ်တမ်းတင်နိုင်သည်။")}
          >
            <div className="grid gap-4 md:grid-cols-2">
              <Field label={t("Complaint Title *", "တိုင်ကြားချက်ခေါင်းစဉ် *")} value={complaintTitle} onChange={setComplaintTitle} />
              <Field label={t("Tracking No", "Tracking No")} value={complaintTracking} onChange={setComplaintTracking} />
              <Field label={t("Complainant Name *", "တိုင်ကြားသူအမည် *")} value={complainantName} onChange={setComplainantName} />
              <div>
                <label className="mb-2 block text-[11px] font-black uppercase tracking-[0.2em] text-slate-500">{t("Priority", "ဦးစားပေးမှု")}</label>
                <select value={complaintPriority} onChange={(e) => setComplaintPriority(e.target.value as Priority)} className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-700 outline-none">
                  <option value="LOW">LOW</option>
                  <option value="MEDIUM">MEDIUM</option>
                  <option value="HIGH">HIGH</option>
                  <option value="CRITICAL">CRITICAL</option>
                </select>
              </div>
            </div>
            <div className="mt-4">
              <label className="mb-2 block text-[11px] font-black uppercase tracking-[0.2em] text-slate-500">{t("Complaint Detail *", "တိုင်ကြားချက်အသေးစိတ် *")}</label>
              <textarea value={complaintDetail} onChange={(e) => setComplaintDetail(e.target.value)} className="min-h-[140px] w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none" />
            </div>
            <div className="mt-4 flex gap-3">
              <button type="button" onClick={handleCreateComplaint} className="inline-flex items-center gap-2 rounded-2xl bg-[#ffd700] px-6 py-3 text-sm font-black uppercase tracking-wider text-[#0d2c54]">
                <ChevronRight size={16} /> {t("Create Complaint", "တိုင်ကြားချက်ဖန်တီးမည်")}
              </button>
            </div>
          </Panel>

          <Panel
            title={t("Case Control Board", "Case Control Board")}
            subtitle={t("Different management users can review, export, and arrange service cases.", "Super Admin, Admin, Supervisor, Warehouse Controller စသည့် user များသည် service case များကို စစ်ဆေး၊ export လုပ်ပြီး စီမံနိုင်သည်။")}
          >
            <div className="mb-4 flex flex-wrap items-center gap-2">
              <select value={caseStatusFilter} onChange={(e) => setCaseStatusFilter(e.target.value as CaseStatus | "ALL")} className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none">
                <option value="ALL">ALL</option>
                <option value="OPEN">OPEN</option>
                <option value="IN_PROGRESS">IN_PROGRESS</option>
                <option value="WAITING">WAITING</option>
                <option value="RESOLVED">RESOLVED</option>
                <option value="CLOSED">CLOSED</option>
              </select>
              <button type="button" onClick={() => exportData("CASES")} className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-xs font-black uppercase tracking-wider text-slate-600 hover:bg-slate-50">
                <FileDown size={14} /> {t("Export Cases", "Case များ Export ထုတ်မည်")}
              </button>
            </div>
            <div className="space-y-3">
              {filteredCases.map((item) => (
                <div key={item.id} className="rounded-2xl border border-slate-200 bg-white p-4">
                  <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                    <div>
                      <div className="font-black text-[#0d2c54]">{item.ticketNo}</div>
                      <div className="mt-1 text-sm font-semibold text-slate-700">{item.title}</div>
                      <div className="mt-1 text-sm text-slate-500">{item.detail}</div>
                      <div className="mt-2 text-xs text-slate-400">{item.complainantName} • {item.trackingNo ?? "NO TRACKING"} • {formatDateTime(item.updatedAt)}</div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <span className={`rounded-full px-3 py-1 text-[10px] font-black uppercase ${caseStatusClass(item.status)}`}>{item.status}</span>
                      <span className={`rounded-full px-3 py-1 text-[10px] font-black uppercase ${priorityClass(item.priority)}`}>{item.priority}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Panel>
        </div>
      ) : null}

      {view === "MESSAGES" ? (
        <div className="mt-8 grid gap-4 xl:grid-cols-[1fr_1fr]">
          <Panel
            title={t("Parcel Message Composer", "Parcel Message ရေးသားရန်ဖောင်")}
            subtitle={t("Write a message regarding the parcel and send or schedule it according to customer or merchant needs.", "Parcel နှင့်ပတ်သက်သော message ကို customer သို့မဟုတ် merchant လိုအပ်ချက်အရ ရေးသားပြီး ပို့နိုင် သို့မဟုတ် schedule လုပ်နိုင်သည်။")}
          >
            <div className="grid gap-4 md:grid-cols-2">
              <Field label={t("Tracking No *", "Tracking No *")} value={messageForm.parcelTrackingNo} onChange={(value) => setMessageForm((prev) => ({ ...prev, parcelTrackingNo: value }))} />
              <Field label={t("Recipient Name *", "လက်ခံမည့်အမည် *")} value={messageForm.recipientName} onChange={(value) => setMessageForm((prev) => ({ ...prev, recipientName: value }))} />
              <div>
                <label className="mb-2 block text-[11px] font-black uppercase tracking-[0.2em] text-slate-500">{t("Target", "ပို့မည့်သူ")}</label>
                <select value={messageForm.targetType} onChange={(e) => setMessageForm((prev) => ({ ...prev, targetType: e.target.value as MessageForm["targetType"] }))} className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-700 outline-none">
                  <option value="CUSTOMER">CUSTOMER</option>
                  <option value="MERCHANT">MERCHANT</option>
                  <option value="BOTH">BOTH</option>
                </select>
              </div>
              <div>
                <label className="mb-2 block text-[11px] font-black uppercase tracking-[0.2em] text-slate-500">{t("Channel", "Channel")}</label>
                <select value={messageForm.channel} onChange={(e) => setMessageForm((prev) => ({ ...prev, channel: e.target.value as MessageForm["channel"] }))} className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-700 outline-none">
                  <option value="APP">APP</option>
                  <option value="SMS">SMS</option>
                  <option value="VIBER">VIBER</option>
                  <option value="MESSENGER">MESSENGER</option>
                </select>
              </div>
              <Field label={t("Subject *", "ခေါင်းစဉ် *")} value={messageForm.subject} onChange={(value) => setMessageForm((prev) => ({ ...prev, subject: value }))} />
              <Field label={t("Schedule At", "ပို့မည့်အချိန်")} value={messageForm.scheduledAt} type="datetime-local" onChange={(value) => setMessageForm((prev) => ({ ...prev, scheduledAt: value }))} />
            </div>
            <div className="mt-4">
              <label className="mb-2 block text-[11px] font-black uppercase tracking-[0.2em] text-slate-500">{t("Message Body *", "Message စာသား *")}</label>
              <textarea value={messageForm.body} onChange={(e) => setMessageForm((prev) => ({ ...prev, body: e.target.value }))} className="min-h-[160px] w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none" />
            </div>
            <div className="mt-4 flex gap-3">
              <button type="button" onClick={handleSendMessage} className="inline-flex items-center gap-2 rounded-2xl bg-[#0d2c54] px-6 py-3 text-sm font-black uppercase tracking-wider text-white">
                <Send size={16} /> {t("Queue Message", "Message ကို queue ထဲသို့ပို့မည်")}
              </button>
            </div>
          </Panel>

          <Panel
            title={t("Message History", "Message မှတ်တမ်း")}
            subtitle={t("Customer service and management users can review and export sent or scheduled parcel messages.", "Customer service နှင့် management user များသည် ပို့ပြီးသော သို့မဟုတ် schedule လုပ်ထားသော parcel message များကို စစ်ဆေးနှင့် export လုပ်နိုင်သည်။")}
          >
            <div className="mb-4">
              <button type="button" onClick={() => exportData("MESSAGES")} className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-xs font-black uppercase tracking-wider text-slate-600 hover:bg-slate-50">
                <Download size={14} /> {t("Export Messages", "Message များ Export ထုတ်မည်")}
              </button>
            </div>
            <div className="space-y-3">
              {messages.map((item) => (
                <div key={item.id} className="rounded-2xl border border-slate-200 bg-white p-4">
                  <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                    <div>
                      <div className="font-black text-[#0d2c54]">{item.parcelTrackingNo}</div>
                      <div className="mt-1 text-sm font-semibold text-slate-700">{item.subject}</div>
                      <div className="mt-1 text-sm text-slate-500">{item.body}</div>
                      <div className="mt-2 text-xs text-slate-400">{item.recipientName} • {item.channel} • {formatDateTime(item.createdAt)}</div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <span className={`rounded-full px-3 py-1 text-[10px] font-black uppercase ${item.sent ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>{item.sent ? t("Sent", "ပို့ပြီး") : t("Queued", "စောင့်ဆိုင်း")}</span>
                      <span className="rounded-full bg-slate-100 px-3 py-1 text-[10px] font-black uppercase text-slate-700">{item.targetType}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Panel>
        </div>
      ) : null}

      {view === "EXPORTS" ? (
        <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <ExportCard title={t("Export Contacts", "Contact များ Export ထုတ်မည်")} description={t("Customer and merchant directory for coordination work.", "Customer နှင့် merchant directory ကို coordination အတွက် export ထုတ်နိုင်သည်။")} onClick={() => exportData("CONTACTS")} />
          <ExportCard title={t("Export Alerts", "Alert များ Export ထုတ်မည်")} description={t("Warehouse-dumped cargo and operational alarms.", "Warehouse တွင်ပိတ်မိနေသော cargo နှင့် operation alarm များ။")} onClick={() => exportData("ALERTS")} />
          <ExportCard title={t("Export Cases", "Case များ Export ထုတ်မည်")} description={t("Complaint and ticket history for management review.", "Management review အတွက် complaint နှင့် ticket မှတ်တမ်း။")} onClick={() => exportData("CASES")} />
          <ExportCard title={t("Export Messages", "Message များ Export ထုတ်မည်")} description={t("Parcel communication log across channels.", "Channel အမျိုးမျိုးမှ parcel communication log များ။")} onClick={() => exportData("MESSAGES")} />
        </div>
      ) : null}

      {loading ? (
        <div className="pointer-events-none fixed bottom-6 right-6 rounded-full bg-[#0d2c54] px-4 py-2 text-xs font-black uppercase tracking-wider text-white shadow-lg">
          Syncing customer-service API...
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

function StatCard({ icon: Icon, title, value, accent = "default" }: { icon: React.ComponentType<{ size?: number; className?: string }>; title: string; value: string; accent?: "default" | "sky" | "amber" | "rose" }) {
  const iconClass = accent === "sky" ? "text-sky-500" : accent === "amber" ? "text-amber-500" : accent === "rose" ? "text-rose-500" : "text-[#0d2c54]";
  const valueClass = accent === "sky" ? "text-sky-600" : accent === "amber" ? "text-amber-600" : accent === "rose" ? "text-rose-600" : "text-slate-800";
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

function ExportCard({ title, description, onClick }: { title: string; description: string; onClick: () => void }) {
  return (
    <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
      <div className="rounded-2xl bg-slate-100 p-3 w-fit text-[#0d2c54]">
        <Download size={20} />
      </div>
      <div className="mt-4 text-lg font-black text-[#0d2c54]">{title}</div>
      <div className="mt-2 text-sm text-slate-500">{description}</div>
      <button type="button" onClick={onClick} className="mt-5 inline-flex items-center gap-2 rounded-2xl bg-[#0d2c54] px-4 py-3 text-xs font-black uppercase tracking-wider text-white">
        <FileDown size={14} /> Export
      </button>
    </div>
  );
}
