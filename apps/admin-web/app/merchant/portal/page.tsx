"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  Building2,
  CheckCircle2,
  Coins,
  Facebook,
  Globe2,
  Package,
  Phone,
  PlusCircle,
  RefreshCw,
  Search,
  ShieldCheck,
  Store,
  Truck,
  User,
  Wallet,
  Webhook,
} from "lucide-react";
import {
  MERCHANT_ENDPOINTS,
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
type MerchantTab = "create" | "directory" | "integrations";

type MerchantRow = {
  id: string;
  merchantId: string;
  branchId: string;
  branchName: string;
  name: string;
  phone: string;
  email: string;
  state: string;
  township: string;
  street: string;
  houseNo: string;
  profileName: string;
  packagePlan: string;
  facebookLinked: boolean;
  viberLinked: boolean;
  activeDeliveredWays: number;
  completedWays: number;
  toRefund: number;
  status: string;
  createdAt: string;
};

type MerchantWebhookRow = {
  id: string;
  url: string;
  eventType: string;
  status: string;
};

type MerchantForm = {
  branchId: string;
  name: string;
  accountId: string;
  phone: string;
  email: string;
  state: string;
  township: string;
  street: string;
  houseNo: string;
  loginPhone: string;
  password: string;
  confirmPassword: string;
};

const DEFAULT_FORM: MerchantForm = {
  branchId: "",
  name: "",
  accountId: "",
  phone: "",
  email: "",
  state: "",
  township: "",
  street: "",
  houseNo: "",
  loginPhone: "",
  password: "",
  confirmPassword: "",
};

function bi(language: Language, en: string, my: string) {
  if (language === "en") return en;
  if (language === "my") return my;
  return `${en} / ${my}`;
}

function badge(status: string) {
  const s = status.toLowerCase();
  if (["active", "approved", "enabled"].includes(s)) return "bg-emerald-100 text-emerald-700";
  if (["pending", "queued", "draft"].includes(s)) return "bg-amber-100 text-amber-700";
  if (["blocked", "inactive", "disabled", "terminated"].includes(s)) return "bg-rose-100 text-rose-700";
  return "bg-slate-100 text-slate-700";
}

function normalizeMerchants(input: unknown): MerchantRow[] {
  return getItems(input).map((row, index) => ({
    id: toText(row.id, `merchant-${index}`),
    merchantId: toText(row.merchant_id, row.account_id, row.code, `M${100000 + index}`),
    branchId: toText(row.branch_id, row.branchId, ""),
    branchName: toText(row.branch_name, row.branchName, "Head Office"),
    name: toText(row.name, row.merchant_name, `Merchant ${index + 1}`),
    phone: toText(row.phone, row.mobile_phone, row.primary_phone, "-"),
    email: toText(row.email, row.email_address, "-"),
    state: toText(row.state, row.region, "-"),
    township: toText(row.township, row.city, "-"),
    street: toText(row.street, row.address_line_1, "-"),
    houseNo: toText(row.house_no, row.address_line_2, "-"),
    profileName: toText(row.price_profile, row.package_plan, row.plan_name, "Regular"),
    facebookLinked: Boolean(row.facebook_page_id ?? row.facebook_linked ?? false),
    viberLinked: Boolean(row.viber_bot_id ?? row.viber_linked ?? false),
    activeDeliveredWays: toNumber(row.active_delivered_ways, row.active_ways, row.open_shipments),
    completedWays: toNumber(row.completed_ways, row.delivered_ways, row.completed_shipments),
    toRefund: toNumber(row.to_refund, row.refund_balance),
    status: toText(row.status, "active"),
    createdAt: toText(row.created_at, row.registered_at, "-"),
  }));
}

function normalizeWebhooks(input: unknown): MerchantWebhookRow[] {
  return getItems(input).map((row, index) => ({
    id: toText(row.id, `webhook-${index}`),
    url: toText(row.target_url, row.url, "-"),
    eventType: toText(row.event_type, row.topic, "shipment.*"),
    status: toText(row.status, "active"),
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

export default function MerchantPortalPage() {
  const [language, setLanguage] = useState<Language>("both");
  const [activeTab, setActiveTab] = useState<MerchantTab>("create");
  const [merchants, setMerchants] = useState<MerchantRow[]>([]);
  const [webhooks, setWebhooks] = useState<MerchantWebhookRow[]>([]);
  const [branches, setBranches] = useState<Array<{ id: string; name: string }>>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "blocked" | "pending">("all");
  const [form, setForm] = useState<MerchantForm>(DEFAULT_FORM);

  const t = (en: string, my: string) => bi(language, en, my);

  useEffect(() => {
    void fetchAll();
  }, []);

  async function fetchAll() {
    setLoading(true);
    setError(null);
    setSuccess(null);

    const results = await Promise.allSettled([
      tryGet<unknown>(MERCHANT_ENDPOINTS.merchants ?? ["/api/v1/merchants"]),
      tryGet<unknown>(MERCHANT_ENDPOINTS.webhooks ?? ["/api/v1/merchant-webhooks"]),
      tryGet<unknown>(MERCHANT_ENDPOINTS.branches ?? ["/api/v1/branches"]),
    ]);

    const [merchantRes, webhookRes, branchRes] = results;

    if (merchantRes.status === "fulfilled") {
      setMerchants(normalizeMerchants(merchantRes.value));
    } else {
      setMerchants([]);
    }

    if (webhookRes.status === "fulfilled") {
      setWebhooks(normalizeWebhooks(webhookRes.value));
    } else {
      setWebhooks([]);
    }

    if (branchRes.status === "fulfilled") {
      setBranches(
        getItems(branchRes.value).map((row, index) => ({
          id: toText(row.id, `b-${index}`),
          name: toText(row.name, row.branch_name, `Branch ${index + 1}`),
        })),
      );
    } else {
      setBranches([]);
    }

    if (merchantRes.status === "rejected" && webhookRes.status === "rejected") {
      setError(
        t(
          "Unable to load merchant APIs. Check merchant endpoints and API base URL.",
          "Merchant API များ မရရှိနိုင်ပါ။ endpoint နှင့် API base URL ကို စစ်ဆေးပါ။",
        ),
      );
    }

    setLoading(false);
  }

  function updateForm<K extends keyof MerchantForm>(key: K, value: MerchantForm[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function createMerchant() {
    setError(null);
    setSuccess(null);

    if (!form.branchId || !form.name || !form.phone || !form.state || !form.township || !form.street || !form.houseNo || !form.loginPhone || !form.password) {
      setError(t("Please fill all required fields.", "လိုအပ်သောအချက်အလက်များအားလုံး ဖြည့်ပါ။"));
      return;
    }

    if (form.password !== form.confirmPassword) {
      setError(t("Password and confirm password do not match.", "Password နှင့် confirm password မတူပါ။"));
      return;
    }

    const payload = {
      branch_id: form.branchId,
      name: form.name,
      account_id: form.accountId || undefined,
      phone: form.phone,
      email: form.email || undefined,
      state: form.state,
      township: form.township,
      street: form.street,
      house_no: form.houseNo,
      user_login_mobile_phone: form.loginPhone,
      password: form.password,
      confirm_password: form.confirmPassword,
    };

    setSaving(true);
    try {
      await tryPost(
        (MERCHANT_ENDPOINTS.merchants ?? ["/api/v1/merchants"]).map((path) => ({
          path,
          body: payload,
          idempotency: true,
        })),
      );

      setSuccess(t("Merchant created successfully.", "Merchant ကို အောင်မြင်စွာ ဖန်တီးပြီးပါပြီ။"));
      setForm(DEFAULT_FORM);
      setActiveTab("directory");
      await fetchAll();
    } catch (err) {
      setError(
        err instanceof Error
          ? t(
              "Merchant creation failed. Confirm merchant endpoint mapping and auth.",
              "Merchant ဖန်တီးမှု မအောင်မြင်ပါ။ endpoint mapping နှင့် auth ကို စစ်ဆေးပါ။",
            )
          : t("Merchant creation failed.", "Merchant ဖန်တီးမှု မအောင်မြင်ပါ။"),
      );
    } finally {
      setSaving(false);
    }
  }

  const filteredMerchants = useMemo(() => {
    const q = query.trim().toLowerCase();
    return merchants.filter((row) => {
      const matchesStatus = statusFilter === "all" ? true : row.status.toLowerCase() === statusFilter;
      const matchesQuery =
        !q ||
        row.name.toLowerCase().includes(q) ||
        row.phone.toLowerCase().includes(q) ||
        row.merchantId.toLowerCase().includes(q);
      return matchesStatus && matchesQuery;
    });
  }, [merchants, query, statusFilter]);

  const totals = useMemo(() => {
    const active = merchants.filter((x) => x.status.toLowerCase() === "active").length;
    const blocked = merchants.filter((x) => x.status.toLowerCase() === "blocked").length;
    const activeDeliveredWays = merchants.reduce((sum, row) => sum + row.activeDeliveredWays, 0);
    const completedWays = merchants.reduce((sum, row) => sum + row.completedWays, 0);
    const refund = merchants.reduce((sum, row) => sum + row.toRefund, 0);

    return {
      total: merchants.length,
      active,
      blocked,
      activeDeliveredWays,
      completedWays,
      refund,
      webhooks: webhooks.length,
    };
  }, [merchants, webhooks]);

  return (
    <div className="min-h-screen bg-[#f7f9fc] p-8">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div className="space-y-2">
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-slate-400">Merchant Management</p>
          <h1 className="text-4xl font-black uppercase tracking-tight text-[#0d2c54]">
            Merchant Portal <span className="font-normal">/ ကုန်သည်ပေါ်တယ်</span>
          </h1>
          <p className="text-slate-500">
            {t(
              "Merchant registration, merchant directory, KPI visibility, social linkage status, refund exposure, and operational account control.",
              "Merchant စာရင်းသွင်းခြင်း၊ merchant စာရင်း၊ KPI အချက်အလက်၊ social linkage အခြေအနေ၊ refund ပမာဏနှင့် လုပ်ငန်းဆိုင်ရာ account စီမံခန့်ခွဲမှု။",
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
        <StatCard icon={Store} title={t("Merchants", "Merchant စုစုပေါင်း")} value={`${totals.total}`} />
        <StatCard icon={ShieldCheck} title={t("Active", "အသုံးပြုနေ")} value={`${totals.active}`} />
        <StatCard icon={Package} title={t("Active Ways", "လက်ရှိ Ways")} value={`${totals.activeDeliveredWays}`} />
        <StatCard icon={Truck} title={t("Completed", "ပြီးစီး")} value={`${totals.completedWays}`} />
        <StatCard icon={Wallet} title={t("To Refund", "ပြန်အမ်းရန်")} value={formatMMK(totals.refund)} />
        <StatCard icon={Webhook} title={t("Webhooks", "Webhook များ")} value={`${totals.webhooks}`} />
      </div>

      <div className="mt-8 flex flex-wrap gap-3">
        <TabButton active={activeTab === "create"} onClick={() => setActiveTab("create")}>
          <PlusCircle size={16} /> {t("Create Merchant", "Merchant အသစ်ဖန်တီးရန်")}
        </TabButton>
        <TabButton active={activeTab === "directory"} onClick={() => setActiveTab("directory")}>
          <Store size={16} /> {t("Merchant List", "Merchant စာရင်း")}
        </TabButton>
        <TabButton active={activeTab === "integrations"} onClick={() => setActiveTab("integrations")}>
          <Webhook size={16} /> {t("Social & Webhooks", "Social နှင့် Webhook")}
        </TabButton>
      </div>

      {activeTab === "create" ? (
        <div className="mt-8 rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-black text-[#0d2c54]">{t("Create new merchant", "Merchant အသစ်ဖန်တီးရန်")}</h2>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <Field label={t("Select the branch", "ဌာနခွဲရွေးပါ")} required>
              <select
                value={form.branchId}
                onChange={(e) => updateForm("branchId", e.target.value)}
                className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm outline-none"
              >
                <option value="">{t("Select branch", "ဌာနခွဲရွေးပါ")}</option>
                {branches.map((branch) => (
                  <option key={branch.id} value={branch.id}>
                    {branch.name}
                  </option>
                ))}
              </select>
            </Field>

            <div className="md:col-span-2 grid gap-4 md:grid-cols-2">
              <Field label={t("Name", "အမည်")} required>
                <input value={form.name} onChange={(e) => updateForm("name", e.target.value)} className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm outline-none" />
              </Field>
              <Field label={t("Account ID", "Account ID")}>
                <input value={form.accountId} onChange={(e) => updateForm("accountId", e.target.value)} className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm outline-none" />
              </Field>
              <Field label={t("Phone number", "ဖုန်းနံပါတ်")} required>
                <input value={form.phone} onChange={(e) => updateForm("phone", e.target.value)} className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm outline-none" />
              </Field>
              <Field label={t("Email address", "Email လိပ်စာ")}>
                <input value={form.email} onChange={(e) => updateForm("email", e.target.value)} className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm outline-none" />
              </Field>
              <Field label={t("Select State", "State ရွေးပါ")} required>
                <input value={form.state} onChange={(e) => updateForm("state", e.target.value)} className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm outline-none" />
              </Field>
              <Field label={t("Select Township", "Township ရွေးပါ")} required>
                <input value={form.township} onChange={(e) => updateForm("township", e.target.value)} className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm outline-none" />
              </Field>
              <Field label={t("Street", "လမ်းအမည်")} required>
                <input value={form.street} onChange={(e) => updateForm("street", e.target.value)} className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm outline-none" />
              </Field>
              <Field label={t("House No / Unit / Floor", "အိမ်အမှတ် / Unit / Floor")} required>
                <input value={form.houseNo} onChange={(e) => updateForm("houseNo", e.target.value)} className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm outline-none" />
              </Field>
              <Field label={t("User login mobile phone", "Login ဖုန်းနံပါတ်")} required>
                <input value={form.loginPhone} onChange={(e) => updateForm("loginPhone", e.target.value)} className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm outline-none" />
              </Field>
              <Field label={t("Password", "စကားဝှက်")} required>
                <input type="password" value={form.password} onChange={(e) => updateForm("password", e.target.value)} className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm outline-none" />
              </Field>
              <Field label={t("Confirm password", "စကားဝှက် အတည်ပြုရန်")} required>
                <input type="password" value={form.confirmPassword} onChange={(e) => updateForm("confirmPassword", e.target.value)} className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm outline-none" />
              </Field>
            </div>
          </div>

          <div className="mt-5 flex flex-wrap gap-3">
            <button
              onClick={createMerchant}
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-xl bg-[#0d2c54] px-5 py-3 text-sm font-black text-white hover:opacity-95 disabled:opacity-60"
            >
              <CheckCircle2 size={16} /> {saving ? t("Saving...", "သိမ်းနေသည်...") : t("Save", "သိမ်းမည်")}
            </button>
            <button
              onClick={() => setForm(DEFAULT_FORM)}
              type="button"
              className="rounded-xl bg-slate-100 px-5 py-3 text-sm font-bold text-slate-600 hover:bg-slate-200"
            >
              {t("Cancel", "မလုပ်တော့")}
            </button>
          </div>
        </div>
      ) : null}

      {activeTab === "directory" ? (
        <div className="mt-8 rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div>
              <h2 className="text-lg font-black text-[#0d2c54]">{t("Merchant", "Merchant")}</h2>
              <p className="text-sm text-slate-500">
                {t("The list of merchants who will work with you.", "သင်နှင့်အတူ လုပ်ကိုင်မည့် merchant များ၏ စာရင်း။")}
              </p>
            </div>

            <div className="flex flex-col gap-3 md:flex-row">
              <div className="relative w-full md:w-80">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={t("Search e.g. Merchant ID, Merchant name", "Merchant ID သို့မဟုတ် Merchant name ဖြင့်ရှာရန်")}
                  className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 text-sm outline-none"
                />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
                className="h-11 rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm outline-none"
              >
                <option value="all">{t("All status", "အခြေအနေအားလုံး")}</option>
                <option value="active">{t("Active", "အသုံးပြုနေ")}</option>
                <option value="pending">{t("Pending", "စောင့်ဆိုင်းနေ")}</option>
                <option value="blocked">{t("Block", "ပိတ်ထား")}</option>
              </select>
            </div>
          </div>

          <div className="mt-5 overflow-hidden rounded-2xl border border-slate-200">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-50 text-left text-slate-500">
                <tr>
                  <th className="px-4 py-3 font-black">{t("Name", "အမည်")}</th>
                  <th className="px-4 py-3 font-black">{t("Phone", "ဖုန်း")}</th>
                  <th className="px-4 py-3 font-black">{t("Merchant ID", "Merchant ID")}</th>
                  <th className="px-4 py-3 font-black">{t("Active delivered ways", "Active delivered ways")}</th>
                  <th className="px-4 py-3 font-black">{t("Completed ways", "Completed ways")}</th>
                  <th className="px-4 py-3 font-black">{t("To refund", "ပြန်အမ်းရန်")}</th>
                  <th className="px-4 py-3 font-black">{t("Price profile", "ဈေးနှုန်း profile")}</th>
                  <th className="px-4 py-3 font-black">Facebook</th>
                  <th className="px-4 py-3 font-black">Viber</th>
                  <th className="px-4 py-3 font-black">{t("Status", "အခြေအနေ")}</th>
                </tr>
              </thead>
              <tbody>
                {filteredMerchants.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="px-4 py-10 text-center text-slate-400">
                      {t("No merchants found.", "Merchant မတွေ့ပါ။")}
                    </td>
                  </tr>
                ) : (
                  filteredMerchants.map((row) => (
                    <tr key={row.id} className="border-t border-slate-100">
                      <td className="px-4 py-3">
                        <div className="font-bold text-[#0d2c54]">{row.name}</div>
                        <div className="text-xs text-slate-400">{row.branchName}</div>
                      </td>
                      <td className="px-4 py-3">{row.phone}</td>
                      <td className="px-4 py-3">{row.merchantId}</td>
                      <td className="px-4 py-3">{row.activeDeliveredWays}</td>
                      <td className="px-4 py-3">{row.completedWays}</td>
                      <td className="px-4 py-3">{formatMMK(row.toRefund)}</td>
                      <td className="px-4 py-3">{row.profileName}</td>
                      <td className="px-4 py-3">
                        <SocialPill linked={row.facebookLinked} icon={<Facebook size={12} />} label="Link" />
                      </td>
                      <td className="px-4 py-3">
                        <SocialPill linked={row.viberLinked} icon={<Phone size={12} />} label="Link" />
                      </td>
                      <td className="px-4 py-3">
                        <span className={`rounded-full px-3 py-1 text-[10px] font-black uppercase ${badge(row.status)}`}>
                          {row.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : null}

      {activeTab === "integrations" ? (
        <div className="mt-8 grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
          <Panel title={t("Webhook registry", "Webhook စာရင်း")}>
            <div className="overflow-hidden rounded-2xl border border-slate-200">
              <table className="min-w-full text-sm">
                <thead className="bg-slate-50 text-left text-slate-500">
                  <tr>
                    <th className="px-4 py-3 font-black">URL</th>
                    <th className="px-4 py-3 font-black">{t("Event Type", "Event Type")}</th>
                    <th className="px-4 py-3 font-black">{t("Status", "အခြေအနေ")}</th>
                  </tr>
                </thead>
                <tbody>
                  {webhooks.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="px-4 py-8 text-center text-slate-400">
                        {t("No merchant webhooks found.", "Merchant webhook မတွေ့ပါ။")}
                      </td>
                    </tr>
                  ) : (
                    webhooks.map((row) => (
                      <tr key={row.id} className="border-t border-slate-100">
                        <td className="px-4 py-3 text-[#0d2c54]">{row.url}</td>
                        <td className="px-4 py-3">{row.eventType}</td>
                        <td className="px-4 py-3">
                          <span className={`rounded-full px-3 py-1 text-[10px] font-black uppercase ${badge(row.status)}`}>
                            {row.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </Panel>

          <Panel title={t("Merchant account summary", "Merchant အကောင့်အနှစ်ချုပ်")}>
            <div className="space-y-4">
              <InfoCard icon={<Coins size={16} className="text-[#0d2c54]" />} title={t("Refund exposure", "ပြန်အမ်းရန်ပမာဏ")} value={formatMMK(totals.refund)} />
              <InfoCard icon={<Building2 size={16} className="text-[#0d2c54]" />} title={t("Total merchants", "Merchant စုစုပေါင်း")} value={`${totals.total}`} />
              <InfoCard icon={<Truck size={16} className="text-[#0d2c54]" />} title={t("Completed ways", "ပြီးစီးသော ways")} value={`${totals.completedWays}`} />
              <InfoCard icon={<Webhook size={16} className="text-[#0d2c54]" />} title={t("Webhook count", "Webhook အရေအတွက်")} value={`${totals.webhooks}`} />
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
      <p className="mt-4 text-3xl font-black text-[#0d2c54]">{value}</p>
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

function SocialPill({
  linked,
  icon,
  label,
}: {
  linked: boolean;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-md border px-2 py-1 text-xs font-bold ${
        linked ? "border-[#0d2c54] bg-slate-50 text-[#0d2c54]" : "border-slate-200 bg-slate-100 text-slate-400"
      }`}
    >
      {icon}
      {label}
    </span>
  );
}
