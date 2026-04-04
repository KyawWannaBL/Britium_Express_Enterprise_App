"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  Bell,
  CheckCircle2,
  Clock3,
  Coins,
  Globe2,
  Home,
  LifeBuoy,
  MapPin,
  Package,
  PlusCircle,
  RefreshCw,
  Search,
  ShieldCheck,
  Smartphone,
  Truck,
  User,
} from "lucide-react";
import {
  appendQuery,
  formatDateTime,
  formatMMK,
  getItems,
  toNumber,
  toText,
  tryGet,
  tryPost,
} from "@/lib/productionApi";

type Language = "en" | "my" | "both";
type CustomerTab = "overview" | "orders" | "addresses" | "support";

type CustomerEndpoints = {
  profile: string[];
  shipments: string[];
  addresses: string[];
  complaints: string[];
  notifications: string[];
};

const CUSTOMER_ENDPOINTS: CustomerEndpoints = {
  profile: ["/api/v1/customer/profile", "/api/customer/profile"],
  shipments: ["/api/v1/customer/shipments", "/api/customer/shipments"],
  addresses: ["/api/v1/customer/addresses", "/api/customer/addresses"],
  complaints: ["/api/v1/customer/complaints", "/api/customer/complaints"],
  notifications: ["/api/v1/customer/notifications", "/api/customer/notifications"],
};

type CustomerProfile = {
  id: string;
  fullName: string;
  phone: string;
  email: string;
  defaultAddress: string;
  status: string;
};

type CustomerShipment = {
  id: string;
  trackingNo: string;
  parcelName: string;
  senderName: string;
  receiverName: string;
  status: string;
  codAmount: number;
  deliveryFee: number;
  currentLocation: string;
  eta: string;
  createdAt: string;
};

type CustomerAddress = {
  id: string;
  label: string;
  phone: string;
  addressLine: string;
  township: string;
  state: string;
  isDefault: boolean;
};

type CustomerComplaint = {
  id: string;
  trackingNo: string;
  subject: string;
  message: string;
  status: string;
  createdAt: string;
};

type CustomerNotification = {
  id: string;
  title: string;
  message: string;
  level: string;
  createdAt: string;
};

type AddressForm = {
  label: string;
  phone: string;
  addressLine: string;
  township: string;
  state: string;
  isDefault: boolean;
};

type ComplaintForm = {
  trackingNo: string;
  subject: string;
  message: string;
};

const DEFAULT_ADDRESS_FORM: AddressForm = {
  label: "",
  phone: "",
  addressLine: "",
  township: "",
  state: "",
  isDefault: false,
};

const DEFAULT_COMPLAINT_FORM: ComplaintForm = {
  trackingNo: "",
  subject: "",
  message: "",
};

function bi(language: Language, en: string, my: string) {
  if (language === "en") return en;
  if (language === "my") return my;
  return `${en} / ${my}`;
}

function statusBadge(status: string) {
  const s = status.toLowerCase();
  if (["active", "delivered", "resolved", "normal"].includes(s)) return "bg-emerald-100 text-emerald-700";
  if (["pending", "processing", "booked", "in_transit", "warning"].includes(s)) return "bg-amber-100 text-amber-700";
  if (["failed", "cancelled", "exception", "critical"].includes(s)) return "bg-rose-100 text-rose-700";
  return "bg-slate-100 text-slate-700";
}

function normalizeProfile(input: unknown): CustomerProfile | null {
  if (!input || typeof input !== "object") return null;
  const row = input as Record<string, unknown>;
  return {
    id: toText(row.id, "customer-profile"),
    fullName: toText(row.full_name, row.name, "Customer"),
    phone: toText(row.phone, row.mobile_phone, "-"),
    email: toText(row.email, row.email_address, "-"),
    defaultAddress: toText(row.default_address, row.address, row.address_line_1, "-"),
    status: toText(row.status, "active"),
  };
}

function normalizeShipments(input: unknown): CustomerShipment[] {
  return getItems(input).map((row, index) => ({
    id: toText(row.id, `shipment-${index}`),
    trackingNo: toText(row.tracking_no, row.waybill_no, `WB-${index + 1}`),
    parcelName: toText(row.parcel_name, row.product_name, row.package_type, "Parcel"),
    senderName: toText(row.sender_name, row.merchant_name, "-"),
    receiverName: toText(row.receiver_name, row.customer_name, "-"),
    status: toText(row.current_status, row.status, "booked"),
    codAmount: toNumber(row.cod_amount, row.total_collectable),
    deliveryFee: toNumber(row.delivery_fee, row.shipping_fee),
    currentLocation: toText(row.current_location, row.last_location, row.current_branch, "-"),
    eta: toText(row.estimated_delivery, row.eta, "-"),
    createdAt: toText(row.created_at, row.booked_at, "-"),
  }));
}

function normalizeAddresses(input: unknown): CustomerAddress[] {
  return getItems(input).map((row, index) => ({
    id: toText(row.id, `address-${index}`),
    label: toText(row.label, row.name, `Address ${index + 1}`),
    phone: toText(row.phone, row.mobile_phone, "-"),
    addressLine: toText(row.address_line, row.address_line_1, row.address, "-"),
    township: toText(row.township, row.city, "-"),
    state: toText(row.state, row.region, "-"),
    isDefault: Boolean(row.is_default ?? false),
  }));
}

function normalizeComplaints(input: unknown): CustomerComplaint[] {
  return getItems(input).map((row, index) => ({
    id: toText(row.id, `complaint-${index}`),
    trackingNo: toText(row.tracking_no, row.waybill_no, "-"),
    subject: toText(row.subject, row.title, "Support"),
    message: toText(row.message, row.description, "-"),
    status: toText(row.status, "pending"),
    createdAt: toText(row.created_at, row.submitted_at, "-"),
  }));
}

function normalizeNotifications(input: unknown): CustomerNotification[] {
  return getItems(input).map((row, index) => ({
    id: toText(row.id, `notification-${index}`),
    title: toText(row.title, `Notification ${index + 1}`),
    message: toText(row.message, row.body, "-"),
    level: toText(row.level, row.type, "normal"),
    createdAt: toText(row.created_at, row.sent_at, "-"),
  }));
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
              active ? "bg-[#0d2c54] text-white shadow" : "bg-slate-50 text-slate-600 hover:bg-slate-100",
            ].join(" ")}
          >
            {item.label}
          </button>
        );
      })}
    </div>
  );
}

export default function CustomerPortalPage() {
  const [language, setLanguage] = useState<Language>("both");
  const [activeTab, setActiveTab] = useState<CustomerTab>("overview");
  const [profile, setProfile] = useState<CustomerProfile | null>(null);
  const [shipments, setShipments] = useState<CustomerShipment[]>([]);
  const [addresses, setAddresses] = useState<CustomerAddress[]>([]);
  const [complaints, setComplaints] = useState<CustomerComplaint[]>([]);
  const [notifications, setNotifications] = useState<CustomerNotification[]>([]);
  const [loading, setLoading] = useState(false);
  const [savingAddress, setSavingAddress] = useState(false);
  const [savingComplaint, setSavingComplaint] = useState(false);
  const [query, setQuery] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [addressForm, setAddressForm] = useState<AddressForm>(DEFAULT_ADDRESS_FORM);
  const [complaintForm, setComplaintForm] = useState<ComplaintForm>(DEFAULT_COMPLAINT_FORM);

  const t = (en: string, my: string) => bi(language, en, my);

  useEffect(() => {
    void fetchAll();
  }, []);

  async function fetchAll() {
    setLoading(true);
    setError(null);
    setSuccess(null);

    const results = await Promise.allSettled([
      tryGet<unknown>(CUSTOMER_ENDPOINTS.profile),
      tryGet<unknown>(CUSTOMER_ENDPOINTS.shipments),
      tryGet<unknown>(CUSTOMER_ENDPOINTS.addresses),
      tryGet<unknown>(CUSTOMER_ENDPOINTS.complaints),
      tryGet<unknown>(CUSTOMER_ENDPOINTS.notifications),
    ]);

    const [profileRes, shipmentsRes, addressesRes, complaintsRes, notificationsRes] = results;

    if (profileRes.status === "fulfilled") {
      setProfile(normalizeProfile(profileRes.value));
    } else {
      setProfile(null);
    }

    if (shipmentsRes.status === "fulfilled") {
      setShipments(normalizeShipments(shipmentsRes.value));
    } else {
      setShipments([]);
    }

    if (addressesRes.status === "fulfilled") {
      setAddresses(normalizeAddresses(addressesRes.value));
    } else {
      setAddresses([]);
    }

    if (complaintsRes.status === "fulfilled") {
      setComplaints(normalizeComplaints(complaintsRes.value));
    } else {
      setComplaints([]);
    }

    if (notificationsRes.status === "fulfilled") {
      setNotifications(normalizeNotifications(notificationsRes.value));
    } else {
      setNotifications([]);
    }

    const failures = results.filter((item) => item.status === "rejected").length;
    if (failures >= 3) {
      setError(
        t(
          "Unable to load customer APIs. Check customer endpoints and API base URL.",
          "Customer API များ မရရှိနိုင်ပါ။ endpoint နှင့် API base URL ကို စစ်ဆေးပါ။",
        ),
      );
    }

    setLoading(false);
  }

  async function saveAddress() {
    setError(null);
    setSuccess(null);

    if (!addressForm.label || !addressForm.phone || !addressForm.addressLine || !addressForm.township || !addressForm.state) {
      setError(t("Please fill all required address fields.", "လိုအပ်သောလိပ်စာအချက်အလက်များကို ဖြည့်ပါ။"));
      return;
    }

    setSavingAddress(true);
    try {
      await tryPost(
        CUSTOMER_ENDPOINTS.addresses.map((path) => ({
          path,
          body: {
            label: addressForm.label,
            phone: addressForm.phone,
            address_line: addressForm.addressLine,
            township: addressForm.township,
            state: addressForm.state,
            is_default: addressForm.isDefault,
          },
          idempotency: true,
        })),
      );
      setSuccess(t("Address saved successfully.", "လိပ်စာကို အောင်မြင်စွာ သိမ်းပြီးပါပြီ။"));
      setAddressForm(DEFAULT_ADDRESS_FORM);
      await fetchAll();
    } catch {
      setError(t("Saving address failed.", "လိပ်စာသိမ်းဆည်းမှု မအောင်မြင်ပါ။"));
    } finally {
      setSavingAddress(false);
    }
  }

  async function saveComplaint() {
    setError(null);
    setSuccess(null);

    if (!complaintForm.subject || !complaintForm.message) {
      setError(t("Please complete the support form.", "Support form ကို ပြည့်စုံအောင် ဖြည့်ပါ။"));
      return;
    }

    setSavingComplaint(true);
    try {
      await tryPost(
        CUSTOMER_ENDPOINTS.complaints.map((path) => ({
          path,
          body: {
            tracking_no: complaintForm.trackingNo || undefined,
            subject: complaintForm.subject,
            message: complaintForm.message,
          },
          idempotency: true,
        })),
      );
      setSuccess(t("Support request submitted.", "Support request ကို တင်ပြီးပါပြီ။"));
      setComplaintForm(DEFAULT_COMPLAINT_FORM);
      await fetchAll();
    } catch {
      setError(t("Support request submission failed.", "Support request တင်ခြင်း မအောင်မြင်ပါ။"));
    } finally {
      setSavingComplaint(false);
    }
  }

  const filteredShipments = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return shipments;
    return shipments.filter((row) => {
      return (
        row.trackingNo.toLowerCase().includes(q) ||
        row.parcelName.toLowerCase().includes(q) ||
        row.senderName.toLowerCase().includes(q) ||
        row.receiverName.toLowerCase().includes(q)
      );
    });
  }, [query, shipments]);

  const totals = useMemo(() => {
    const delivered = shipments.filter((x) => x.status.toLowerCase() === "delivered").length;
    const inTransit = shipments.filter((x) => ["booked", "processing", "in_transit", "out_for_delivery"].includes(x.status.toLowerCase())).length;
    const exceptions = notifications.filter((x) => ["warning", "critical"].includes(x.level.toLowerCase())).length;
    const cod = shipments.reduce((sum, row) => sum + row.codAmount, 0);
    return {
      totalShipments: shipments.length,
      delivered,
      inTransit,
      cod,
      addresses: addresses.length,
      exceptions,
    };
  }, [shipments, addresses, notifications]);

  return (
    <div className="min-h-screen bg-[#f7f9fc] p-8">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div className="space-y-2">
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-slate-400">Customer Experience</p>
          <h1 className="text-4xl font-black uppercase tracking-tight text-[#0d2c54]">
            Customer Portal <span className="font-normal">/ သာမန်ဖောက်သည်ပေါ်တယ်</span>
          </h1>
          <p className="text-slate-500">
            {t(
              "Personal shipment tracking, address management, notifications, delivery status visibility, and customer support requests.",
              "ကိုယ်ပိုင် shipment စောင့်ကြည့်ခြင်း၊ လိပ်စာစီမံခန့်ခွဲမှု၊ notification များ၊ delivery status ကြည့်ရှုနိုင်မှုနှင့် customer support request များ။",
            )}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <LanguageToggle value={language} onChange={setLanguage} />
          <button
            onClick={() => void fetchAll()}
            className="inline-flex items-center gap-2 rounded-2xl bg-[#0d2c54] px-5 py-3 text-xs font-black uppercase tracking-wider text-white hover:opacity-95"
          >
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
            {loading ? t("Refreshing...", "ပြန်လည်ရယူနေသည်...") : t("Refresh", "ပြန်လည်ရယူမည်")}
          </button>
        </div>
      </div>

      {error ? (
        <div className="mt-6 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-bold text-rose-700">
          {error}
        </div>
      ) : null}

      {success ? (
        <div className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-700">
          {success}
        </div>
      ) : null}

      <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-6">
        <StatCard icon={User} title={t("Customer", "ဖောက်သည်")} value={profile?.fullName ?? "-"} />
        <StatCard icon={Package} title={t("Shipments", "Shipment စုစုပေါင်း")} value={`${totals.totalShipments}`} />
        <StatCard icon={Truck} title={t("In Transit", "လမ်းပေါ်တွင်")}
          value={`${totals.inTransit}`} />
        <StatCard icon={CheckCircle2} title={t("Delivered", "ပို့ပြီး")}
          value={`${totals.delivered}`} />
        <StatCard icon={Coins} title={t("COD", "COD ပမာဏ")}
          value={formatMMK(totals.cod)} />
        <StatCard icon={Bell} title={t("Alerts", "သတိပေးချက်များ")}
          value={`${totals.exceptions}`} />
      </div>

      <div className="mt-8 flex flex-wrap gap-3">
        <TabButton active={activeTab === "overview"} onClick={() => setActiveTab("overview")}>
          <User size={16} /> {t("Overview", "အနှစ်ချုပ်")}
        </TabButton>
        <TabButton active={activeTab === "orders"} onClick={() => setActiveTab("orders")}>
          <Package size={16} /> {t("Orders", "မှာယူမှုများ")}
        </TabButton>
        <TabButton active={activeTab === "addresses"} onClick={() => setActiveTab("addresses")}>
          <Home size={16} /> {t("Addresses", "လိပ်စာများ")}
        </TabButton>
        <TabButton active={activeTab === "support"} onClick={() => setActiveTab("support")}>
          <LifeBuoy size={16} /> {t("Support", "အကူအညီ")}
        </TabButton>
      </div>

      {activeTab === "overview" ? (
        <div className="mt-8 grid gap-4 xl:grid-cols-[0.95fr_1.05fr]">
          <Panel title={t("Customer profile", "ဖောက်သည်အချက်အလက်")}>
            <div className="space-y-4">
              <InfoCard icon={<User size={16} className="text-[#0d2c54]" />} title={t("Full name", "အမည်")} value={profile?.fullName ?? "-"} />
              <InfoCard icon={<Smartphone size={16} className="text-[#0d2c54]" />} title={t("Phone", "ဖုန်း")} value={profile?.phone ?? "-"} />
              <InfoCard icon={<Bell size={16} className="text-[#0d2c54]" />} title={t("Status", "အခြေအနေ")} value={profile?.status ?? "-"} />
              <InfoCard icon={<MapPin size={16} className="text-[#0d2c54]" />} title={t("Default address", "မူလလိပ်စာ")} value={profile?.defaultAddress ?? "-"} />
            </div>
          </Panel>

          <Panel title={t("Notifications", "အသိပေးချက်များ")}>
            <div className="space-y-3">
              {notifications.length === 0 ? (
                <div className="rounded-2xl bg-slate-50 p-6 text-slate-500">
                  {t("No notifications found.", "Notification မတွေ့ပါ။")}
                </div>
              ) : (
                notifications.slice(0, 8).map((row) => (
                  <div key={row.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <div className="flex items-center justify-between gap-3">
                      <p className="font-black text-[#0d2c54]">{row.title}</p>
                      <span className={`rounded-full px-3 py-1 text-[10px] font-black uppercase ${statusBadge(row.level)}`}>
                        {row.level}
                      </span>
                    </div>
                    <p className="mt-2 text-sm text-slate-600">{row.message}</p>
                    <p className="mt-2 text-xs text-slate-400">{formatDateTime(row.createdAt)}</p>
                  </div>
                ))
              )}
            </div>
          </Panel>
        </div>
      ) : null}

      {activeTab === "orders" ? (
        <div className="mt-8 rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div>
              <h2 className="text-lg font-black text-[#0d2c54]">{t("My shipments", "ကျွန်ုပ်၏ shipment များ")}</h2>
              <p className="text-sm text-slate-500">
                {t("Track current and past deliveries in one place.", "လက်ရှိနှင့် ယခင် delivery များကို တစ်နေရာတည်းတွင် ကြည့်ရှုနိုင်သည်။")}
              </p>
            </div>

            <div className="relative w-full md:w-80">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={t("Search by tracking, parcel, sender, receiver", "Tracking, parcel, sender, receiver ဖြင့် ရှာရန်")}
                className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 text-sm outline-none"
              />
            </div>
          </div>

          <div className="mt-5 overflow-hidden rounded-2xl border border-slate-200">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-50 text-left text-slate-500">
                <tr>
                  <th className="px-4 py-3 font-black">{t("Tracking", "Tracking")}</th>
                  <th className="px-4 py-3 font-black">{t("Parcel", "ကုန်ပစ္စည်း")}</th>
                  <th className="px-4 py-3 font-black">{t("Sender", "ပို့သူ")}</th>
                  <th className="px-4 py-3 font-black">{t("Status", "အခြေအနေ")}</th>
                  <th className="px-4 py-3 font-black">{t("Location", "တည်နေရာ")}</th>
                  <th className="px-4 py-3 font-black">ETA</th>
                  <th className="px-4 py-3 font-black">{t("Created", "ဖန်တီးချိန်")}</th>
                </tr>
              </thead>
              <tbody>
                {filteredShipments.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-10 text-center text-slate-400">
                      {t("No shipments found.", "Shipment မတွေ့ပါ။")}
                    </td>
                  </tr>
                ) : (
                  filteredShipments.map((row) => (
                    <tr key={row.id} className="border-t border-slate-100">
                      <td className="px-4 py-3 font-bold text-[#0d2c54]">{row.trackingNo}</td>
                      <td className="px-4 py-3">{row.parcelName}</td>
                      <td className="px-4 py-3">{row.senderName}</td>
                      <td className="px-4 py-3">
                        <span className={`rounded-full px-3 py-1 text-[10px] font-black uppercase ${statusBadge(row.status)}`}>
                          {row.status}
                        </span>
                      </td>
                      <td className="px-4 py-3">{row.currentLocation}</td>
                      <td className="px-4 py-3">{formatDateTime(row.eta)}</td>
                      <td className="px-4 py-3">{formatDateTime(row.createdAt)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : null}

      {activeTab === "addresses" ? (
        <div className="mt-8 grid gap-4 xl:grid-cols-[0.92fr_1.08fr]">
          <Panel title={t("Saved addresses", "သိမ်းထားသောလိပ်စာများ")}>
            <div className="space-y-3">
              {addresses.length === 0 ? (
                <div className="rounded-2xl bg-slate-50 p-6 text-slate-500">
                  {t("No addresses found.", "လိပ်စာမတွေ့ပါ။")}
                </div>
              ) : (
                addresses.map((row) => (
                  <div key={row.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="font-black text-[#0d2c54]">{row.label}</p>
                        <p className="text-sm text-slate-500">{row.phone}</p>
                      </div>
                      {row.isDefault ? (
                        <span className="rounded-full bg-emerald-100 px-3 py-1 text-[10px] font-black uppercase text-emerald-700">
                          {t("Default", "မူလ")}
                        </span>
                      ) : null}
                    </div>
                    <p className="mt-2 text-sm text-slate-600">{row.addressLine}</p>
                    <p className="text-sm text-slate-500">{row.township}, {row.state}</p>
                  </div>
                ))
              )}
            </div>
          </Panel>

          <Panel title={t("Add new address", "လိပ်စာအသစ်ထည့်မည်")}>
            <div className="grid gap-4 md:grid-cols-2">
              <Field label={t("Label", "Label")} required>
                <input value={addressForm.label} onChange={(e) => setAddressForm((p) => ({ ...p, label: e.target.value }))} className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm outline-none" />
              </Field>
              <Field label={t("Phone", "ဖုန်း")} required>
                <input value={addressForm.phone} onChange={(e) => setAddressForm((p) => ({ ...p, phone: e.target.value }))} className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm outline-none" />
              </Field>
              <div className="md:col-span-2">
                <Field label={t("Address line", "လိပ်စာ")} required>
                  <input value={addressForm.addressLine} onChange={(e) => setAddressForm((p) => ({ ...p, addressLine: e.target.value }))} className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm outline-none" />
                </Field>
              </div>
              <Field label={t("Township", "မြို့နယ်")} required>
                <input value={addressForm.township} onChange={(e) => setAddressForm((p) => ({ ...p, township: e.target.value }))} className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm outline-none" />
              </Field>
              <Field label={t("State", "တိုင်း/ပြည်နယ်")} required>
                <input value={addressForm.state} onChange={(e) => setAddressForm((p) => ({ ...p, state: e.target.value }))} className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm outline-none" />
              </Field>
            </div>

            <label className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-slate-600">
              <input
                type="checkbox"
                checked={addressForm.isDefault}
                onChange={(e) => setAddressForm((p) => ({ ...p, isDefault: e.target.checked }))}
                className="h-4 w-4 accent-[#0d2c54]"
              />
              {t("Set as default address", "မူလလိပ်စာအဖြစ် သတ်မှတ်မည်")}
            </label>

            <div className="mt-5 flex gap-3">
              <button
                onClick={saveAddress}
                disabled={savingAddress}
                className="inline-flex items-center gap-2 rounded-xl bg-[#0d2c54] px-5 py-3 text-sm font-black text-white hover:opacity-95 disabled:opacity-60"
              >
                <PlusCircle size={16} /> {savingAddress ? t("Saving...", "သိမ်းနေသည်...") : t("Save address", "လိပ်စာသိမ်းမည်")}
              </button>
              <button
                type="button"
                onClick={() => setAddressForm(DEFAULT_ADDRESS_FORM)}
                className="rounded-xl bg-slate-100 px-5 py-3 text-sm font-bold text-slate-600 hover:bg-slate-200"
              >
                {t("Reset", "ပြန်ချ")}
              </button>
            </div>
          </Panel>
        </div>
      ) : null}

      {activeTab === "support" ? (
        <div className="mt-8 grid gap-4 xl:grid-cols-[0.9fr_1.1fr]">
          <Panel title={t("Submit complaint / request", "တိုင်ကြားချက် / တောင်းဆိုချက် တင်ရန်")}>
            <div className="space-y-4">
              <Field label={t("Tracking number", "Tracking number") }>
                <input value={complaintForm.trackingNo} onChange={(e) => setComplaintForm((p) => ({ ...p, trackingNo: e.target.value }))} className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm outline-none" />
              </Field>
              <Field label={t("Subject", "အကြောင်းအရာ")} required>
                <input value={complaintForm.subject} onChange={(e) => setComplaintForm((p) => ({ ...p, subject: e.target.value }))} className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm outline-none" />
              </Field>
              <Field label={t("Message", "အကြောင်းအရာအသေးစိတ်")} required>
                <textarea value={complaintForm.message} onChange={(e) => setComplaintForm((p) => ({ ...p, message: e.target.value }))} className="min-h-[140px] w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none" />
              </Field>

              <button
                onClick={saveComplaint}
                disabled={savingComplaint}
                className="inline-flex items-center gap-2 rounded-xl bg-[#0d2c54] px-5 py-3 text-sm font-black text-white hover:opacity-95 disabled:opacity-60"
              >
                <LifeBuoy size={16} /> {savingComplaint ? t("Submitting...", "တင်နေသည်...") : t("Submit", "တင်မည်")}
              </button>
            </div>
          </Panel>

          <Panel title={t("Complaint history", "တိုင်ကြားချက်မှတ်တမ်း")}>
            <div className="space-y-3">
              {complaints.length === 0 ? (
                <div className="rounded-2xl bg-slate-50 p-6 text-slate-500">
                  {t("No complaints found.", "တိုင်ကြားချက် မတွေ့ပါ။")}
                </div>
              ) : (
                complaints.map((row) => (
                  <div key={row.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="font-black text-[#0d2c54]">{row.subject}</p>
                        <p className="text-xs text-slate-400">{row.trackingNo}</p>
                      </div>
                      <span className={`rounded-full px-3 py-1 text-[10px] font-black uppercase ${statusBadge(row.status)}`}>
                        {row.status}
                      </span>
                    </div>
                    <p className="mt-2 text-sm text-slate-600">{row.message}</p>
                    <p className="mt-2 text-xs text-slate-400">{formatDateTime(row.createdAt)}</p>
                  </div>
                ))
              )}
            </div>
          </Panel>
        </div>
      ) : null}
    </div>
  );
}

function TabButton({
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
        "inline-flex items-center gap-2 rounded-2xl px-5 py-4 text-xs font-black uppercase tracking-widest transition-colors",
        active ? "bg-[#0d2c54] text-white" : "border bg-white text-slate-500 hover:bg-slate-50",
      ].join(" ")}
    >
      {children}
    </button>
  );
}

function Field({
  label,
  children,
  required,
}: {
  label: string;
  children: React.ReactNode;
  required?: boolean;
}) {
  return (
    <label className="block space-y-2 text-sm font-semibold text-slate-600">
      <span>
        {label}
        {required ? " *" : ""}
      </span>
      {children}
    </label>
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
      <p className="mt-4 text-2xl font-black text-[#0d2c54] break-words">{value}</p>
    </div>
  );
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-lg font-black text-[#0d2c54]">{title}</h2>
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
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <div className="flex items-center gap-2">
        {icon}
        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">{title}</span>
      </div>
      <div className="mt-2 font-black text-[#0d2c54]">{value}</div>
    </div>
  );
}
