"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  AlertTriangle,
  Boxes,
  CheckCircle2,
  ChevronRight,
  Clock3,
  Eye,
  FileImage,
  Globe2,
  Image as ImageIcon,
  Lock,
  Pencil,
  QrCode,
  RefreshCw,
  Save,
  Search,
  ShieldCheck,
  Truck,
  Upload,
  UserCircle2,
  Warehouse,
  XCircle,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";

type UiLanguage = "en" | "my" | "both";
type EntryMode = "BEFORE_PICKUP" | "AFTER_PICKUP" | "IN_OFFICE_RECEIVE";
type EntryStatus = "DRAFT" | "SUBMITTED" | "PENDING_PICKUP" | "IN_TRANSIT" | "ARRIVED_HUB" | "DELIVERED";
type UploaderType = "CUSTOMER" | "MERCHANT" | "RIDER" | "DRIVER";
type ToastTone = "ok" | "warn" | "err";

type IntakeImage = {
  id: string;
  url: string;
  uploadedBy: UploaderType;
  uploadedAt: string;
  caption: string;
  parcelTrackingNo?: string;
  checklistTag: "PACKAGE" | "ITEMS" | "ADDRESS" | "COD" | "DAMAGE_CHECK";
};

type DataEntryRecord = {
  id: string;
  trackingNo: string;
  senderName: string;
  senderPhone: string;
  recipientName: string;
  recipientPhone: string;
  otherPhone?: string;
  fromTownship: string;
  toTownship: string;
  mode: EntryMode;
  status: EntryStatus;
  weightKg: number;
  declaredValueMmk: number;
  deliveryFeeMmk: number;
  codAmountMmk: number;
  pickupDate: string;
  remark?: string;
  merchantName?: string;
  customerName?: string;
  packageCount: number;
  orderPicked: boolean;
  intakeCheckedBy?: string;
  submittedBy?: string;
  submittedAt?: string;
  editableAfterSubmit: boolean;
  imageIds: string[];
  createdAt: string;
  updatedAt: string;
};

type IntakeForm = {
  trackingNo: string;
  senderName: string;
  senderPhone: string;
  recipientName: string;
  recipientPhone: string;
  otherPhone: string;
  fromTownship: string;
  toTownship: string;
  weightKg: string;
  declaredValueMmk: string;
  deliveryFeeMmk: string;
  codAmountMmk: string;
  pickupDate: string;
  remark: string;
  merchantName: string;
  customerName: string;
  packageCount: string;
  orderPicked: boolean;
};

type ViewerFilter = "ALL" | UploaderType;

type AuthUser = {
  email?: string;
  role?: string;
  permissions?: string[];
  branchType?: "HEAD_OFFICE" | "BRANCH";
  displayName?: string;
};

const DEMO_IMAGES: IntakeImage[] = [
  {
    id: "img-1",
    url: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=1200&q=80",
    uploadedBy: "MERCHANT",
    uploadedAt: "2026-01-24T08:10:00Z",
    caption: "Merchant packed items overview",
    parcelTrackingNo: "BEX-LIVE-001",
    checklistTag: "ITEMS",
  },
  {
    id: "img-2",
    url: "https://images.unsplash.com/photo-1553413077-190dd305871c?auto=format&fit=crop&w=1200&q=80",
    uploadedBy: "CUSTOMER",
    uploadedAt: "2026-01-24T08:11:00Z",
    caption: "Customer address on package",
    parcelTrackingNo: "BEX-LIVE-001",
    checklistTag: "ADDRESS",
  },
  {
    id: "img-3",
    url: "https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&w=1200&q=80",
    uploadedBy: "RIDER",
    uploadedAt: "2026-01-24T08:14:00Z",
    caption: "Pickup proof from rider",
    parcelTrackingNo: "BEX-LIVE-002",
    checklistTag: "PACKAGE",
  },
  {
    id: "img-4",
    url: "https://images.unsplash.com/photo-1520607162513-77705c0f0d4a?auto=format&fit=crop&w=1200&q=80",
    uploadedBy: "DRIVER",
    uploadedAt: "2026-01-24T08:16:00Z",
    caption: "Driver handover confirmation photo",
    parcelTrackingNo: "BEX-LIVE-003",
    checklistTag: "DAMAGE_CHECK",
  },
  {
    id: "img-5",
    url: "https://images.unsplash.com/photo-1581092919535-7146ff1a5902?auto=format&fit=crop&w=1200&q=80",
    uploadedBy: "MERCHANT",
    uploadedAt: "2026-01-24T08:19:00Z",
    caption: "COD slip image",
    parcelTrackingNo: "BR-100001",
    checklistTag: "COD",
  },
];

const DEMO_RECORDS: DataEntryRecord[] = [
  {
    id: "rec-1",
    trackingNo: "BEX-LIVE-001",
    senderName: "Britium Fashion House",
    senderPhone: "0991111111",
    recipientName: "Kyaw Zayar",
    recipientPhone: "0970001111",
    otherPhone: "0945002233",
    fromTownship: "Kamayut",
    toTownship: "Bahan",
    mode: "BEFORE_PICKUP",
    status: "PENDING_PICKUP",
    weightKg: 1.2,
    declaredValueMmk: 45000,
    deliveryFeeMmk: 3000,
    codAmountMmk: 20000,
    pickupDate: "2026-01-24",
    remark: "Handle with care",
    merchantName: "Britium Fashion House",
    customerName: "Kyaw Zayar",
    packageCount: 1,
    orderPicked: false,
    editableAfterSubmit: false,
    imageIds: ["img-1", "img-2"],
    createdAt: "2026-01-24T08:10:00Z",
    updatedAt: "2026-01-24T08:11:00Z",
    intakeCheckedBy: "supervisor@britium.com",
    submittedBy: "dataentry@britium.com",
    submittedAt: "2026-01-24T08:13:00Z",
  },
  {
    id: "rec-2",
    trackingNo: "BEX-LIVE-002",
    senderName: "Beauty City",
    senderPhone: "0992222222",
    recipientName: "Ma Thuzar",
    recipientPhone: "0970002222",
    fromTownship: "Hlaing",
    toTownship: "Mayangone",
    mode: "AFTER_PICKUP",
    status: "IN_TRANSIT",
    weightKg: 0.8,
    declaredValueMmk: 25000,
    deliveryFeeMmk: 2500,
    codAmountMmk: 0,
    pickupDate: "2026-01-24",
    merchantName: "Beauty City",
    customerName: "Ma Thuzar",
    packageCount: 1,
    orderPicked: true,
    editableAfterSubmit: true,
    imageIds: ["img-3"],
    createdAt: "2026-01-24T08:14:00Z",
    updatedAt: "2026-01-24T08:18:00Z",
    intakeCheckedBy: "supervisor@britium.com",
    submittedBy: "dataentry@britium.com",
    submittedAt: "2026-01-24T08:18:00Z",
  },
  {
    id: "rec-3",
    trackingNo: "BEX-LIVE-003",
    senderName: "Office Intake Desk",
    senderPhone: "0944004400",
    recipientName: "Ko Aung",
    recipientPhone: "0970003333",
    fromTownship: "Lanmadaw",
    toTownship: "Ahlone",
    mode: "IN_OFFICE_RECEIVE",
    status: "DELIVERED",
    weightKg: 1.6,
    declaredValueMmk: 30000,
    deliveryFeeMmk: 3500,
    codAmountMmk: 10000,
    pickupDate: "2026-01-24",
    merchantName: "Walk-in Customer",
    customerName: "Ko Aung",
    packageCount: 2,
    orderPicked: true,
    editableAfterSubmit: false,
    imageIds: ["img-4"],
    createdAt: "2026-01-24T08:17:00Z",
    updatedAt: "2026-01-24T09:00:00Z",
    intakeCheckedBy: "supervisor@britium.com",
    submittedBy: "dataentry@britium.com",
    submittedAt: "2026-01-24T08:21:00Z",
  },
  {
    id: "rec-4",
    trackingNo: "BR-100001",
    senderName: "Baby Genius OS",
    senderPhone: "0993333333",
    recipientName: "Mya Mya",
    recipientPhone: "0970004444",
    fromTownship: "Insein",
    toTownship: "Tamwe",
    mode: "BEFORE_PICKUP",
    status: "SUBMITTED",
    weightKg: 2.1,
    declaredValueMmk: 50000,
    deliveryFeeMmk: 4500,
    codAmountMmk: 32000,
    pickupDate: "2026-01-24",
    merchantName: "Baby Genius OS",
    customerName: "Mya Mya",
    packageCount: 3,
    orderPicked: false,
    editableAfterSubmit: true,
    imageIds: ["img-5"],
    createdAt: "2026-01-24T08:22:00Z",
    updatedAt: "2026-01-24T08:25:00Z",
    intakeCheckedBy: "supervisor@britium.com",
    submittedBy: "dataentry@britium.com",
    submittedAt: "2026-01-24T08:25:00Z",
  },
];

const HEAD_OFFICE_ONLY_ROLES = ["SUPER_ADMIN", "ADMIN", "SUPERVISOR", "DATA_ENTRY", "DATA_ENTRY_STAFF"];

function t(label: UiLanguage, en: string, my: string) {
  if (label === "en") return en;
  if (label === "my") return my;
  return `${en} / ${my}`;
}

function formatMMK(value: number) {
  return `${value.toLocaleString()} MMK`;
}

function formatDateTime(input?: string) {
  if (!input) return "-";
  try {
    return new Date(input).toLocaleString();
  } catch {
    return input;
  }
}

function statusClass(status: EntryStatus) {
  if (["DELIVERED"].includes(status)) return "bg-emerald-100 text-emerald-700";
  if (["PENDING_PICKUP", "IN_TRANSIT", "ARRIVED_HUB"].includes(status)) return "bg-amber-100 text-amber-700";
  if (["SUBMITTED", "DRAFT"].includes(status)) return "bg-slate-100 text-slate-700";
  return "bg-slate-100 text-slate-700";
}

function uploaderClass(type: UploaderType) {
  if (type === "CUSTOMER") return "bg-sky-100 text-sky-700";
  if (type === "MERCHANT") return "bg-violet-100 text-violet-700";
  if (type === "RIDER") return "bg-amber-100 text-amber-700";
  return "bg-emerald-100 text-emerald-700";
}

function getCurrentUser(auth: unknown): AuthUser {
  const anyAuth = auth as { user?: AuthUser } | undefined;
  return anyAuth?.user ?? {};
}

function hasSubmittedEditAuthority(user: AuthUser) {
  const role = (user.role ?? "").toUpperCase();
  const perms = (user.permissions ?? []).map((item) => item.toUpperCase());
  if (role === "SUPER_ADMIN") return true;
  if (role === "ADMIN" && perms.includes("DATA_ENTRY_EDIT_SUBMITTED")) return true;
  return false;
}

function canAccessDataEntry(user: AuthUser) {
  const role = (user.role ?? "").toUpperCase();
  return HEAD_OFFICE_ONLY_ROLES.includes(role) && (user.branchType ?? "HEAD_OFFICE") === "HEAD_OFFICE";
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

function emptyForm(): IntakeForm {
  const today = new Date().toISOString().slice(0, 10);
  return {
    trackingNo: "",
    senderName: "",
    senderPhone: "",
    recipientName: "",
    recipientPhone: "",
    otherPhone: "",
    fromTownship: "",
    toTownship: "",
    weightKg: "",
    declaredValueMmk: "",
    deliveryFeeMmk: "",
    codAmountMmk: "",
    pickupDate: today,
    remark: "",
    merchantName: "",
    customerName: "",
    packageCount: "1",
    orderPicked: false,
  };
}

export default function DataEntryTurboProductionPage() {
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
  const [mode, setMode] = useState<EntryMode>("BEFORE_PICKUP");
  const [records, setRecords] = useState<DataEntryRecord[]>(DEMO_RECORDS);
  const [images, setImages] = useState<IntakeImage[]>(DEMO_IMAGES);
  const [form, setForm] = useState<IntakeForm>(emptyForm());
  const [query, setQuery] = useState("");
  const [toast, setToast] = useState<{ tone: ToastTone; message: string } | null>(null);
  const [saving, setSaving] = useState(false);
  const [selectedRecordId, setSelectedRecordId] = useState<string | null>(DEMO_RECORDS[0]?.id ?? null);
  const [viewerFilter, setViewerFilter] = useState<ViewerFilter>("ALL");
  const [onlyLinkedImages, setOnlyLinkedImages] = useState(true);
  const [zoom, setZoom] = useState(1);
  const [statusFilter, setStatusFilter] = useState<EntryStatus | "ALL">("ALL");
  const [editingSubmittedId, setEditingSubmittedId] = useState<string | null>(null);
  const [loadingRemote, setLoadingRemote] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const accessAllowed = canAccessDataEntry(user);
  const editSubmittedAllowed = hasSubmittedEditAuthority(user);
  const actorName = user.displayName || user.email || "Head Office Staff";

  useEffect(() => {
    inputRef.current?.focus();
  }, [mode]);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(null), 2600);
    return () => window.clearTimeout(timer);
  }, [toast]);

  useEffect(() => {
    let ignore = false;
    async function bootstrap() {
      if (!accessAllowed) return;
      setLoadingRemote(true);
      try {
        const [remoteRecords, remoteImages] = await Promise.allSettled([
          fetchJson<DataEntryRecord[]>("/api/v1/data-entry/records"),
          fetchJson<IntakeImage[]>("/api/v1/data-entry/images"),
        ]);

        if (ignore) return;

        if (remoteRecords.status === "fulfilled" && remoteRecords.value.length) {
          setRecords(remoteRecords.value);
          setSelectedRecordId(remoteRecords.value[0]?.id ?? null);
        }
        if (remoteImages.status === "fulfilled" && remoteImages.value.length) {
          setImages(remoteImages.value);
        }
      } catch {
        // Keep demo data when remote API is unavailable.
      } finally {
        if (!ignore) setLoadingRemote(false);
      }
    }
    bootstrap();
    return () => {
      ignore = true;
    };
  }, [accessAllowed]);

  const stats = useMemo(() => {
    return {
      drafts: records.filter((item) => item.status === "DRAFT").length,
      pending: records.filter((item) => item.status === "PENDING_PICKUP").length,
      submitted: records.filter((item) => item.status === "SUBMITTED").length,
      imagePool: images.length,
    };
  }, [images.length, records]);

  const filteredRecords = useMemo(() => {
    const q = query.trim().toLowerCase();
    return records.filter((record) => {
      if (statusFilter !== "ALL" && record.status !== statusFilter) return false;
      if (record.mode !== mode) return false;
      if (!q) return true;
      return [
        record.trackingNo,
        record.recipientName,
        record.senderName,
        record.merchantName ?? "",
        record.customerName ?? "",
        record.toTownship,
      ]
        .join(" ")
        .toLowerCase()
        .includes(q);
    });
  }, [mode, query, records, statusFilter]);

  const selectedRecord = useMemo(
    () => records.find((item) => item.id === (editingSubmittedId ?? selectedRecordId)) ?? null,
    [editingSubmittedId, records, selectedRecordId],
  );

  const visibleImages = useMemo(() => {
    const linkedIds = new Set(selectedRecord?.imageIds ?? []);
    return images.filter((image) => {
      if (viewerFilter !== "ALL" && image.uploadedBy !== viewerFilter) return false;
      if (onlyLinkedImages && linkedIds.size > 0 && !linkedIds.has(image.id)) return false;
      return true;
    });
  }, [images, onlyLinkedImages, selectedRecord?.imageIds, viewerFilter]);

  const groupedImages = useMemo(() => {
    return {
      CUSTOMER: visibleImages.filter((img) => img.uploadedBy === "CUSTOMER"),
      MERCHANT: visibleImages.filter((img) => img.uploadedBy === "MERCHANT"),
      RIDER: visibleImages.filter((img) => img.uploadedBy === "RIDER"),
      DRIVER: visibleImages.filter((img) => img.uploadedBy === "DRIVER"),
    };
  }, [visibleImages]);

  const setField = useCallback(<K extends keyof IntakeForm>(key: K, value: IntakeForm[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  }, []);

  const fillFormFromRecord = useCallback((record: DataEntryRecord) => {
    setForm({
      trackingNo: record.trackingNo,
      senderName: record.senderName,
      senderPhone: record.senderPhone,
      recipientName: record.recipientName,
      recipientPhone: record.recipientPhone,
      otherPhone: record.otherPhone ?? "",
      fromTownship: record.fromTownship,
      toTownship: record.toTownship,
      weightKg: String(record.weightKg),
      declaredValueMmk: String(record.declaredValueMmk),
      deliveryFeeMmk: String(record.deliveryFeeMmk),
      codAmountMmk: String(record.codAmountMmk),
      pickupDate: record.pickupDate,
      remark: record.remark ?? "",
      merchantName: record.merchantName ?? "",
      customerName: record.customerName ?? "",
      packageCount: String(record.packageCount),
      orderPicked: record.orderPicked,
    });
    setMode(record.mode);
  }, []);

  const resetForm = useCallback(() => {
    setForm(emptyForm());
    setEditingSubmittedId(null);
  }, []);

  const validateForm = useCallback(() => {
    if (!form.trackingNo.trim()) return "Tracking number is required.";
    if (!form.recipientName.trim()) return "Recipient name is required.";
    if (!form.recipientPhone.trim()) return "Recipient phone is required.";
    if (!form.weightKg.trim()) return "Weight is required.";
    if (!form.deliveryFeeMmk.trim()) return "Delivery fee is required.";
    return null;
  }, [form.deliveryFeeMmk, form.recipientName, form.recipientPhone, form.trackingNo, form.weightKg]);

  const upsertRecordLocal = useCallback(
    (record: DataEntryRecord) => {
      setRecords((prev) => {
        const exists = prev.some((item) => item.id === record.id);
        if (exists) return prev.map((item) => (item.id === record.id ? record : item));
        return [record, ...prev];
      });
      setSelectedRecordId(record.id);
    },
    [],
  );

  const handleSave = useCallback(
    async (submit: boolean) => {
      const error = validateForm();
      if (error) {
        setToast({ tone: "err", message: error });
        return;
      }

      setSaving(true);
      const now = new Date().toISOString();
      const editingRecord = editingSubmittedId ? records.find((item) => item.id === editingSubmittedId) : null;
      const nextStatus: EntryStatus = submit
        ? mode === "BEFORE_PICKUP"
          ? "PENDING_PICKUP"
          : mode === "AFTER_PICKUP"
            ? "IN_TRANSIT"
            : "ARRIVED_HUB"
        : "DRAFT";

      const payload: DataEntryRecord = {
        id: editingRecord?.id ?? crypto.randomUUID(),
        trackingNo: form.trackingNo.trim().toUpperCase(),
        senderName: form.senderName.trim(),
        senderPhone: form.senderPhone.trim(),
        recipientName: form.recipientName.trim(),
        recipientPhone: form.recipientPhone.trim(),
        otherPhone: form.otherPhone.trim() || undefined,
        fromTownship: form.fromTownship.trim(),
        toTownship: form.toTownship.trim(),
        mode,
        status: submit ? nextStatus : "DRAFT",
        weightKg: Number(form.weightKg || 0),
        declaredValueMmk: Number(form.declaredValueMmk || 0),
        deliveryFeeMmk: Number(form.deliveryFeeMmk || 0),
        codAmountMmk: Number(form.codAmountMmk || 0),
        pickupDate: form.pickupDate,
        remark: form.remark.trim() || undefined,
        merchantName: form.merchantName.trim() || undefined,
        customerName: form.customerName.trim() || undefined,
        packageCount: Number(form.packageCount || 1),
        orderPicked: form.orderPicked,
        intakeCheckedBy: actorName,
        submittedBy: submit ? actorName : editingRecord?.submittedBy,
        submittedAt: submit ? now : editingRecord?.submittedAt,
        editableAfterSubmit: editingRecord?.editableAfterSubmit ?? (submit ? false : true),
        imageIds: editingRecord?.imageIds ?? [],
        createdAt: editingRecord?.createdAt ?? now,
        updatedAt: now,
      };

      try {
        try {
          await fetchJson<DataEntryRecord>(editingRecord ? `/api/v1/data-entry/records/${payload.id}` : "/api/v1/data-entry/records", {
            method: editingRecord ? "PATCH" : "POST",
            body: JSON.stringify(payload),
          });
        } catch {
          // local fallback
        }

        upsertRecordLocal(payload);
        setToast({
          tone: "ok",
          message: submit ? "Data entry submitted successfully." : "Draft saved successfully.",
        });
        if (!editingSubmittedId) resetForm();
      } catch (e) {
        setToast({ tone: "err", message: e instanceof Error ? e.message : "Unable to save data entry record." });
      } finally {
        setSaving(false);
      }
    },
    [actorName, editingSubmittedId, form, mode, records, resetForm, upsertRecordLocal, validateForm],
  );

  const startEditSubmitted = useCallback(() => {
    if (!selectedRecord) return;
    if (selectedRecord.status === "SUBMITTED" || selectedRecord.status === "PENDING_PICKUP" || selectedRecord.status === "IN_TRANSIT" || selectedRecord.status === "ARRIVED_HUB") {
      if (!editSubmittedAllowed) {
        setToast({ tone: "err", message: "Submitted records can only be edited by Super Admin or authorized Admin." });
        return;
      }
    }
    setEditingSubmittedId(selectedRecord.id);
    fillFormFromRecord(selectedRecord);
    setToast({ tone: "warn", message: "Editing mode enabled for selected record." });
  }, [editSubmittedAllowed, fillFormFromRecord, selectedRecord]);

  const currentImageCount = selectedRecord?.imageIds.length ?? 0;

  if (!accessAllowed) {
    return (
      <div className="min-h-screen bg-[#f7f9fc] p-8">
        <div className="rounded-[32px] border border-rose-200 bg-white p-8 shadow-sm">
          <div className="flex items-start gap-4">
            <div className="rounded-2xl bg-rose-50 p-3 text-rose-600">
              <Lock size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-black text-[#0d2c54]">Data Entry Turbo Access Restricted</h1>
              <p className="mt-2 text-sm text-slate-500">
                This workspace is only for Head Office Super Admin, Admin, Supervisor, and Data Entry staff. /
                ဤစာမျက်နှာသည် Head Office မှ Super Admin, Admin, Supervisor နှင့် Data Entry staff များသာ အသုံးပြုနိုင်သည်။
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
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-slate-400">Head Office Operations</p>
          <h1 className="text-4xl font-black uppercase tracking-tight text-[#0d2c54]">
            Data Entry Turbo <span className="font-normal text-blue-500">/ အချက်အလက်သွင်းမြန်နှုန်းမြင့်စနစ်</span>
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            {t(
              language,
              "Head-office data entry before or after order picking, barcode-ready intake, image review wall, and controlled post-submit editing.",
              "Head Office အတွက် order picking မတိုင်မီ သို့မဟုတ် ပြီးနောက် data entry ပြုလုပ်ရန်၊ barcode-ready intake, ပုံများကို တပြိုင်နက်တည်း စစ်ဆေးရန်နှင့် submit လုပ်ပြီးနောက် controlled editing စနစ်ပါဝင်သည်။",
            )}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <LanguageToggle value={language} onChange={setLanguage} />
          <button
            type="button"
            onClick={() => {
              setRecords([...records]);
              setImages([...images]);
              setToast({ tone: "ok", message: "Data entry workspace refreshed." });
            }}
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
        <StatCard icon={Save} title={t(language, "Draft Queue", "Draft စာရင်း")} value={String(stats.drafts)} />
        <StatCard icon={Clock3} title={t(language, "Pending Pickup", "Pickup စောင့်ဆိုင်း")} value={String(stats.pending)} accent="amber" />
        <StatCard icon={CheckCircle2} title={t(language, "Submitted", "Submit ပြီး")} value={String(stats.submitted)} accent="emerald" />
        <StatCard icon={FileImage} title={t(language, "Image Pool", "ပုံဖိုင်များ")} value={String(stats.imagePool)} accent="violet" />
      </div>

      <div className="mt-8 grid gap-4 xl:grid-cols-[1fr_0.44fr]">
        <div className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-5 flex flex-wrap gap-3 border-b border-slate-200 pb-4">
            <ModeButton active={mode === "BEFORE_PICKUP"} onClick={() => setMode("BEFORE_PICKUP")} label={t(language, "Before Order Pickup", "Order pickup မတိုင်မီ")} />
            <ModeButton active={mode === "AFTER_PICKUP"} onClick={() => setMode("AFTER_PICKUP")} label={t(language, "After Order Pickup", "Order pickup ပြီးနောက်")} />
            <ModeButton active={mode === "IN_OFFICE_RECEIVE"} onClick={() => setMode("IN_OFFICE_RECEIVE")} label={t(language, "In Office Receive", "ရုံးတွင် လက်ခံ")} />
          </div>

          <div className="mb-6 grid gap-4 md:grid-cols-2">
            <Field
              label={t(language, "Tracking No *", "Tracking No *")}
              value={form.trackingNo}
              onChange={(value) => setField("trackingNo", value)}
              inputRef={inputRef}
              placeholder="BEX-YGN-000001"
              icon={<QrCode size={16} className="text-blue-500" />}
            />
            <Field
              label={t(language, "Recipient Name *", "လက်ခံသူအမည် *")}
              value={form.recipientName}
              onChange={(value) => setField("recipientName", value)}
              placeholder={t(language, "Customer Name", "လက်ခံသူအမည်")}
            />
            <Field
              label={t(language, "Sender Name", "ပေးပို့သူအမည်")}
              value={form.senderName}
              onChange={(value) => setField("senderName", value)}
              placeholder={t(language, "Merchant or sender", "Merchant သို့မဟုတ် ပေးပို့သူ")}
            />
            <Field
              label={t(language, "Recipient Phone *", "လက်ခံသူဖုန်း *")}
              value={form.recipientPhone}
              onChange={(value) => setField("recipientPhone", value)}
              placeholder="09xxxxxxxxx"
            />
            <Field
              label={t(language, "Sender Phone", "ပေးပို့သူဖုန်း")}
              value={form.senderPhone}
              onChange={(value) => setField("senderPhone", value)}
              placeholder="09xxxxxxxxx"
            />
            <Field
              label={t(language, "Other Phones", "အခြားဖုန်းများ")}
              value={form.otherPhone}
              onChange={(value) => setField("otherPhone", value)}
              placeholder={t(language, "Additional phones", "အပိုဖုန်းနံပါတ်များ")}
            />
            <Field
              label={t(language, "From Township", "ပို့သည့်မြို့နယ်")}
              value={form.fromTownship}
              onChange={(value) => setField("fromTownship", value)}
              placeholder={t(language, "Origin township", "စတင်မြို့နယ်")}
            />
            <Field
              label={t(language, "To Township", "လက်ခံမြို့နယ်")}
              value={form.toTownship}
              onChange={(value) => setField("toTownship", value)}
              placeholder={t(language, "Destination township", "သွားမည့်မြို့နယ်")}
            />
            <Field
              label={t(language, "Weight (KG)", "အလေးချိန် (KG)")}
              value={form.weightKg}
              onChange={(value) => setField("weightKg", value)}
              type="number"
            />
            <Field
              label={t(language, "Delivery Fee (MMK)", "ပို့ဆောင်ခ (MMK)")}
              value={form.deliveryFeeMmk}
              onChange={(value) => setField("deliveryFeeMmk", value)}
              type="number"
            />
            <Field
              label={t(language, "COD to Collect (MMK)", "ကောက်ခံရမည့် COD (MMK)")}
              value={form.codAmountMmk}
              onChange={(value) => setField("codAmountMmk", value)}
              type="number"
            />
            <Field
              label={t(language, "Declared Value (MMK)", "ပစ္စည်းတန်ဖိုး (MMK)")}
              value={form.declaredValueMmk}
              onChange={(value) => setField("declaredValueMmk", value)}
              type="number"
            />
            <Field
              label={t(language, "Merchant Name", "Merchant အမည်")}
              value={form.merchantName}
              onChange={(value) => setField("merchantName", value)}
              placeholder={t(language, "Merchant / shop", "Merchant / ဆိုင်အမည်")}
            />
            <Field
              label={t(language, "Customer Name", "Customer အမည်")}
              value={form.customerName}
              onChange={(value) => setField("customerName", value)}
              placeholder={t(language, "Customer reference", "Customer reference")}
            />
            <Field
              label={t(language, "Number of Packages", "အထုပ်အရေအတွက်")}
              value={form.packageCount}
              onChange={(value) => setField("packageCount", value)}
              type="number"
            />
            <Field
              label={t(language, "Pickup Date", "Pickup ရက်စွဲ")}
              value={form.pickupDate}
              onChange={(value) => setField("pickupDate", value)}
              type="date"
            />
          </div>

          <div className="mb-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <label className="flex items-center gap-3 text-sm font-semibold text-slate-600">
              <input
                type="checkbox"
                checked={form.orderPicked}
                onChange={(e) => setField("orderPicked", e.target.checked)}
                className="h-4 w-4 accent-[#0d2c54]"
              />
              {t(language, "Order already picked / parcel already received", "Order pickup ပြီးသား / parcel ကိုလက်ခံပြီးသား")}
            </label>
          </div>

          <div className="mb-6">
            <label className="mb-2 block text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">
              {t(language, "Remark", "မှတ်ချက်")}
            </label>
            <textarea
              value={form.remark}
              onChange={(e) => setField("remark", e.target.value)}
              className="min-h-[92px] w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none focus:border-[#0d2c54] focus:bg-white"
              placeholder={t(language, "Instruction, fragile note, address help", "ညွှန်ကြားချက်၊ fragile note၊ လိပ်စာအကူအညီ")}
            />
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              disabled={saving}
              onClick={() => handleSave(false)}
              className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 px-5 py-3 text-sm font-black uppercase tracking-wider text-[#0d2c54] hover:bg-slate-50 disabled:opacity-50"
            >
              <Save size={16} /> {t(language, "Save Draft", "Draft သိမ်းမည်")}
            </button>
            <button
              type="button"
              disabled={saving}
              onClick={() => handleSave(true)}
              className="inline-flex items-center gap-2 rounded-2xl bg-[#ffd700] px-6 py-3 text-sm font-black uppercase tracking-wider text-[#0d2c54] hover:opacity-95 disabled:opacity-50"
            >
              <ChevronRight size={16} /> {t(language, "Create Entry", "စာရင်းသွင်းမည်")}
            </button>
            <button
              type="button"
              onClick={resetForm}
              className="rounded-2xl border border-slate-200 px-5 py-3 text-sm font-black uppercase tracking-wider text-slate-500 hover:bg-slate-50"
            >
              {t(language, "Reset", "ပြန်ရှင်းမည်")}
            </button>
          </div>
        </div>

        <div className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-black text-[#0d2c54]">{t(language, "Recent Queue", "မကြာသေးမီ စာရင်း")}</h2>
              <p className="mt-1 text-sm text-slate-500">{t(language, "Head office view of live intake records.", "Head office မှ live intake records စာရင်း။")}</p>
            </div>
            <StatusFilter value={statusFilter} onChange={setStatusFilter} />
          </div>

          <div className="relative mt-4">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t(language, "Search tracking / customer / merchant...", "tracking / customer / merchant ဖြင့်ရှာရန်...")}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm outline-none focus:border-[#0d2c54] focus:bg-white"
            />
          </div>

          <div className="mt-4 space-y-3">
            {filteredRecords.map((record) => (
              <button
                key={record.id}
                type="button"
                onClick={() => {
                  setSelectedRecordId(record.id);
                  setEditingSubmittedId(null);
                }}
                className={`w-full rounded-2xl border p-4 text-left transition ${selectedRecord?.id === record.id ? "border-[#0d2c54] bg-slate-50" : "border-slate-200 bg-white hover:bg-slate-50"}`}
              >
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="font-black text-[#0d2c54]">{record.trackingNo}</div>
                    <div className="mt-1 text-sm text-slate-500">{record.recipientName}</div>
                  </div>
                  <span className={`rounded-full px-3 py-1 text-[10px] font-black uppercase ${statusClass(record.status)}`}>
                    {record.status}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-8 grid gap-4 xl:grid-cols-[0.9fr_1.1fr]">
        <div className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-lg font-black text-[#0d2c54]">{t(language, "Submitted Record Viewer", "Submit ပြီးသော record viewer")}</h2>
              <p className="mt-1 text-sm text-slate-500">
                {t(
                  language,
                  "Super Admin, Admin, and Supervisor can view. Post-submit editing is restricted by authority.",
                  "Super Admin, Admin နှင့် Supervisor များ view လုပ်နိုင်သည်။ Submit ပြီးနောက် ပြင်ဆင်မှုကို authority ဖြင့်သာ ကန့်သတ်ထားသည်။",
                )}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => selectedRecord && fillFormFromRecord(selectedRecord)}
                className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 px-4 py-3 text-xs font-black uppercase tracking-wider text-slate-600 hover:bg-slate-50"
              >
                <Eye size={14} /> {t(language, "Load Into Form", "Form ထဲသို့တင်မည်")}
              </button>
              <button
                type="button"
                onClick={startEditSubmitted}
                className="inline-flex items-center gap-2 rounded-2xl bg-[#0d2c54] px-4 py-3 text-xs font-black uppercase tracking-wider text-white hover:opacity-95"
              >
                <Pencil size={14} /> {t(language, "Edit Submitted", "Submit ပြီးသားကို ပြင်မည်")}
              </button>
            </div>
          </div>

          {selectedRecord ? (
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <InfoCard label={t(language, "Tracking No", "Tracking No")} value={selectedRecord.trackingNo} />
              <InfoCard label={t(language, "Mode", "လုပ်ငန်းပုံစံ")} value={selectedRecord.mode.replaceAll("_", " ")} />
              <InfoCard label={t(language, "Recipient", "လက်ခံသူ")} value={selectedRecord.recipientName} />
              <InfoCard label={t(language, "Township", "မြို့နယ်")} value={`${selectedRecord.fromTownship} → ${selectedRecord.toTownship}`} />
              <InfoCard label={t(language, "Delivery Fee", "ပို့ဆောင်ခ")} value={formatMMK(selectedRecord.deliveryFeeMmk)} />
              <InfoCard label={t(language, "COD", "COD")} value={formatMMK(selectedRecord.codAmountMmk)} />
              <InfoCard label={t(language, "Submitted By", "Submit လုပ်သူ")} value={selectedRecord.submittedBy ?? "-"} />
              <InfoCard label={t(language, "Submitted At", "Submit လုပ်ချိန်")} value={formatDateTime(selectedRecord.submittedAt)} />
              <InfoCard label={t(language, "Checked By", "စစ်ဆေးသူ")} value={selectedRecord.intakeCheckedBy ?? "-"} />
              <InfoCard label={t(language, "Editable After Submit", "Submit ပြီးနောက် ပြင်နိုင်မှု")} value={selectedRecord.editableAfterSubmit ? t(language, "Yes", "Yes / ရသည်") : t(language, "No", "No / မရ") } />
            </div>
          ) : (
            <div className="mt-5 rounded-2xl bg-slate-50 p-4 text-sm text-slate-500">{t(language, "Select a record from queue.", "Queue မှ record တစ်ခုရွေးပါ။")}</div>
          )}
        </div>

        <div className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
            <div>
              <h2 className="text-lg font-black text-[#0d2c54]">{t(language, "Unified Image Review Wall", "ပုံများကိုတစ်ပြိုင်နက်ကြည့်ရှုစစ်ဆေးရန် wall")}</h2>
              <p className="mt-1 text-sm text-slate-500">
                {t(
                  language,
                  "Customer, merchant, rider, and driver uploads are arranged in one review surface without opening one-by-one.",
                  "Customer, merchant, rider နှင့် driver တင်ထားသော ပုံများကို တစ်ပုံချင်းမဖွင့်ဘဲ တစ်နေရာတည်းတွင် စီစဉ်ပြသမည်။",
                )}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <select
                value={viewerFilter}
                onChange={(e) => setViewerFilter(e.target.value as ViewerFilter)}
                className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none"
              >
                <option value="ALL">{t(language, "All Uploaders", "Uploader အားလုံး")}</option>
                <option value="CUSTOMER">Customer</option>
                <option value="MERCHANT">Merchant</option>
                <option value="RIDER">Rider</option>
                <option value="DRIVER">Driver</option>
              </select>
              <label className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-600">
                <input
                  type="checkbox"
                  checked={onlyLinkedImages}
                  onChange={(e) => setOnlyLinkedImages(e.target.checked)}
                  className="h-4 w-4 accent-[#0d2c54]"
                />
                {t(language, "Linked only", "ချိတ်ဆက်ထားသောပုံများသာ")}
              </label>
            </div>
          </div>

          <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <label className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">{t(language, "Zoom", "အရွယ်ချဲ့")} ({zoom.toFixed(1)}x)</label>
            <input type="range" min={0.8} max={1.8} step={0.1} value={zoom} onChange={(e) => setZoom(Number(e.target.value))} className="mt-2 w-full" />
          </div>

          <div className="mt-5 space-y-5">
            {(["CUSTOMER", "MERCHANT", "RIDER", "DRIVER"] as UploaderType[]).map((type) => (
              <div key={type}>
                <div className="mb-3 flex items-center justify-between">
                  <span className={`rounded-full px-3 py-1 text-[10px] font-black uppercase ${uploaderClass(type)}`}>{type}</span>
                  <span className="text-xs text-slate-400">{groupedImages[type].length} {t(language, "images", "ပုံများ")}</span>
                </div>
                {groupedImages[type].length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-4 text-sm text-slate-400">
                    {t(language, "No images in this lane.", "ဤအုပ်စုတွင် ပုံမရှိပါ။")}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                    {groupedImages[type].map((image) => (
                      <div key={image.id} className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
                        <div className="aspect-[4/3] overflow-hidden bg-slate-100">
                          <img
                            src={image.url}
                            alt={image.caption}
                            className="h-full w-full object-cover"
                            style={{ transform: `scale(${zoom})` }}
                          />
                        </div>
                        <div className="space-y-1 p-3">
                          <div className="text-sm font-black text-[#0d2c54]">{image.parcelTrackingNo ?? "UNLINKED"}</div>
                          <div className="text-xs text-slate-500">{image.caption}</div>
                          <div className="flex items-center justify-between text-[11px] text-slate-400">
                            <span>{image.checklistTag}</span>
                            <span>{formatDateTime(image.uploadedAt)}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-8 grid gap-4 xl:grid-cols-[0.95fr_1.05fr]">
        <div className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <ShieldCheck size={20} className="text-[#0d2c54]" />
            <h2 className="text-lg font-black text-[#0d2c54]">{t(language, "Authority Rules", "ခွင့်ပြုချက်စည်းကမ်းများ")}</h2>
          </div>
          <div className="mt-4 space-y-3 text-sm text-slate-600">
            <RuleRow title={t(language, "Access", "အသုံးပြုခွင့်")} body={t(language, "Available to Head Office Super Admin, Admin, Supervisor, and Data Entry staff.", "Head Office မှ Super Admin, Admin, Supervisor နှင့် Data Entry staff များအသုံးပြုနိုင်သည်။")} />
            <RuleRow title={t(language, "Submission", "Submit လုပ်ခြင်း")} body={t(language, "Staff can create draft and submit records before or after order pickup, including in-office receive.", "Staff များသည် order pickup မတိုင်မီ သို့မဟုတ် ပြီးနောက်နှင့် office receive အတွက် draft သိမ်းရန်နှင့် submit လုပ်ရန် အသုံးပြုနိုင်သည်။")} />
            <RuleRow title={t(language, "Post-submit editing", "Submit ပြီးနောက် ပြင်ဆင်ခြင်း")} body={t(language, "Only Super Admin or Admin with explicit authority from Super Admin can edit submitted records.", "Submit ပြီးသား record များကို Super Admin သို့မဟုတ် Super Admin မှ authority ပေးထားသော Admin များသာ ပြင်နိုင်သည်။")} />
            <RuleRow title={t(language, "Image review", "ပုံစစ်ဆေးခြင်း")} body={t(language, "Uploads from customer, merchant, rider, and driver are grouped visually for fast review without opening images one by one.", "Customer, merchant, rider နှင့် driver ပုံများကို တစ်ပုံချင်းမဖွင့်ဘဲ မြင်ကွင်းတစ်ခုတည်းတွင် အုပ်စုလိုက်ပြသပေးသည်။")} />
          </div>
        </div>

        <div className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <Boxes size={20} className="text-[#0d2c54]" />
            <h2 className="text-lg font-black text-[#0d2c54]">{t(language, "Selected Record Summary", "ရွေးထားသော record အနှစ်ချုပ်")}</h2>
          </div>
          {selectedRecord ? (
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <SummaryMetric label={t(language, "Status", "အခြေအနေ")} value={selectedRecord.status} pill />
              <SummaryMetric label={t(language, "Images Linked", "ချိတ်ထားသောပုံများ")} value={String(currentImageCount)} />
              <SummaryMetric label={t(language, "Packages", "အထုပ်အရေအတွက်")} value={String(selectedRecord.packageCount)} />
              <SummaryMetric label={t(language, "Weight", "အလေးချိန်")} value={`${selectedRecord.weightKg} KG`} />
              <SummaryMetric label={t(language, "Fee", "ပို့ဆောင်ခ")} value={formatMMK(selectedRecord.deliveryFeeMmk)} />
              <SummaryMetric label={t(language, "COD", "COD")} value={formatMMK(selectedRecord.codAmountMmk)} />
              <SummaryMetric label={t(language, "Picked", "Pickup ပြီး/မပြီး")} value={selectedRecord.orderPicked ? t(language, "Picked", "ပြီး") : t(language, "Not Yet", "မပြီးသေး")} />
              <SummaryMetric label={t(language, "Last Update", "နောက်ဆုံးပြင်ဆင်ချိန်")} value={formatDateTime(selectedRecord.updatedAt)} />
            </div>
          ) : (
            <div className="mt-4 rounded-2xl bg-slate-50 p-4 text-sm text-slate-500">{t(language, "No record selected.", "Record မရွေးရသေးပါ။")}</div>
          )}
        </div>
      </div>

      {loadingRemote ? (
        <div className="pointer-events-none fixed bottom-6 right-6 rounded-full bg-[#0d2c54] px-4 py-2 text-xs font-black uppercase tracking-wider text-white shadow-lg">
          Syncing data-entry API...
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
          <button
            key={item.value}
            type="button"
            onClick={() => onChange(item.value)}
            className={`rounded-xl px-3 py-2 text-sm font-semibold transition ${active ? "bg-[#0d2c54] text-white shadow" : "bg-slate-50 text-slate-600 hover:bg-slate-100"}`}
          >
            {item.label}
          </button>
        );
      })}
    </div>
  );
}

function ModeButton({ active, onClick, label }: { active: boolean; onClick: () => void; label: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-2xl px-4 py-3 text-sm font-black uppercase tracking-wider transition ${active ? "bg-[#0d2c54] text-white" : "bg-slate-50 text-slate-600 hover:bg-slate-100"}`}
    >
      {label}
    </button>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  icon,
  inputRef,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
  icon?: React.ReactNode;
  inputRef?: React.RefObject<HTMLInputElement | null>;
}) {
  return (
    <div>
      <label className="mb-2 block text-[11px] font-black uppercase tracking-[0.2em] text-slate-500">{label}</label>
      <div className="relative">
        {icon ? <div className="absolute left-3 top-1/2 -translate-y-1/2">{icon}</div> : null}
        <input
          ref={inputRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          type={type}
          placeholder={placeholder}
          className={`h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-700 outline-none focus:border-[#0d2c54] focus:bg-white ${icon ? "pl-10" : ""}`}
        />
      </div>
    </div>
  );
}

function StatCard({
  icon: Icon,
  title,
  value,
  accent = "default",
}: {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  title: string;
  value: string;
  accent?: "default" | "amber" | "emerald" | "violet";
}) {
  const iconClass = accent === "amber" ? "text-amber-500" : accent === "emerald" ? "text-emerald-500" : accent === "violet" ? "text-violet-500" : "text-[#0d2c54]";
  const valueClass = accent === "amber" ? "text-amber-600" : accent === "emerald" ? "text-emerald-600" : accent === "violet" ? "text-violet-600" : "text-slate-800";
  return (
    <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
      <Icon size={24} className={iconClass} />
      <p className="mt-5 text-xs font-black uppercase tracking-[0.2em] text-slate-400">{title}</p>
      <p className={`mt-4 text-3xl font-black ${valueClass}`}>{value}</p>
    </div>
  );
}

function StatusFilter({ value, onChange }: { value: EntryStatus | "ALL"; onChange: (value: EntryStatus | "ALL") => void }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value as EntryStatus | "ALL")}
      className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none"
    >
      <option value="ALL">ALL STATUS</option>
      <option value="DRAFT">DRAFT</option>
      <option value="SUBMITTED">SUBMITTED</option>
      <option value="PENDING_PICKUP">PENDING PICKUP</option>
      <option value="IN_TRANSIT">IN TRANSIT</option>
      <option value="ARRIVED_HUB">ARRIVED HUB</option>
      <option value="DELIVERED">DELIVERED</option>
    </select>
  );
}

function InfoCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-slate-50 p-4">
      <div className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">{label}</div>
      <div className="mt-2 font-black text-[#0d2c54]">{value || "-"}</div>
    </div>
  );
}

function RuleRow({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-2xl bg-slate-50 p-4">
      <div className="font-black text-[#0d2c54]">{title}</div>
      <div className="mt-2 text-sm text-slate-500">{body}</div>
    </div>
  );
}

function SummaryMetric({ label, value, pill = false }: { label: string; value: string; pill?: boolean }) {
  return (
    <div className="rounded-2xl bg-slate-50 p-4">
      <div className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">{label}</div>
      <div className="mt-2">
        {pill ? (
          <span className="inline-flex rounded-full bg-[#0d2c54] px-3 py-1 text-[10px] font-black uppercase text-white">{value}</span>
        ) : (
          <div className="font-black text-[#0d2c54]">{value}</div>
        )}
      </div>
    </div>
  );
}
