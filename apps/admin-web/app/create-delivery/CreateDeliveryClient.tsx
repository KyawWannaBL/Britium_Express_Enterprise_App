"use client";

import { useMemo, useState } from "react";
import { Inter, Noto_Sans_Myanmar } from "next/font/google";
import { createClient } from "@/lib/supabase/client";
import {
  Banknote,
  CheckCircle2,
  ClipboardList,
  Globe2,
  Package,
  Truck,
  User,
  XCircle,
} from "lucide-react";

type Language = "en" | "my" | "both";
type DeliveryMode = "pickup_delivery" | "office_to_office";

type FormState = {
  sender_name: string;
  sender_phone: string;
  sender_address: string;
  recipient_name: string;
  recipient_phone: string;
  recipient_address: string;
  product_name: string;
  product_weight: string;
  product_qty: string;
  payment_term: "COD" | "PREPAID";
  delivery_fee_mmks: string;
  extra_weight_charges: string;
  cod_amount_mmks: string;
  rider_remark: string;
};

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

const emptyForm: FormState = {
  sender_name: "",
  sender_phone: "",
  sender_address: "",
  recipient_name: "",
  recipient_phone: "",
  recipient_address: "",
  product_name: "",
  product_weight: "",
  product_qty: "1",
  payment_term: "COD",
  delivery_fee_mmks: "",
  extra_weight_charges: "",
  cod_amount_mmks: "",
  rider_remark: "",
};

function toNumber(value: string) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function copyFor(language: Language, en: string, my: string) {
  if (language === "en") return en;
  if (language === "my") return my;
  return `${en} / ${my}`;
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

function ModeToggle({
  language,
  value,
  onChange,
}: {
  language: Language;
  value: DeliveryMode;
  onChange: (value: DeliveryMode) => void;
}) {
  const items: Array<{ value: DeliveryMode; en: string; my: string }> = [
    {
      value: "pickup_delivery",
      en: "Pickup & Delivery",
      my: "လာယူပို့ဆောင်ခြင်း",
    },
    {
      value: "office_to_office",
      en: "Office to Office",
      my: "ရုံးမှရုံးသို့",
    },
  ];

  return (
    <div className="inline-flex flex-wrap rounded-2xl border border-slate-200 bg-white p-2 shadow-sm">
      {items.map((item) => {
        const active = item.value === value;
        return (
          <button
            key={item.value}
            type="button"
            onClick={() => onChange(item.value)}
            className={[
              "rounded-xl px-4 py-2 text-sm transition",
              active ? "bg-[#ffd700] text-[#0d2c54] shadow" : "text-slate-600 hover:bg-slate-50",
            ].join(" ")}
          >
            <LocalizedText
              language={language}
              en={item.en}
              my={item.my}
              englishClassName="font-semibold"
              myanmarClassName="font-semibold tracking-normal normal-case"
            />
          </button>
        );
      })}
    </div>
  );
}

function SectionTitle({
  icon,
  language,
  en,
  my,
  iconClassName,
  borderClassName = "border-b",
  textClassName = "text-[#0d2c54]",
}: {
  icon: React.ReactNode;
  language: Language;
  en: string;
  my: string;
  iconClassName?: string;
  borderClassName?: string;
  textClassName?: string;
}) {
  return (
    <h3
      className={[
        "flex items-center gap-2 pb-4 text-xs font-black",
        borderClassName,
        textClassName,
      ].join(" ")}
    >
      <span className={iconClassName}>{icon}</span>
      <LocalizedText
        language={language}
        en={en}
        my={my}
        englishClassName="uppercase tracking-[0.2em]"
        myanmarClassName="tracking-normal normal-case text-sm"
      />
    </h3>
  );
}

function FieldLabel({
  language,
  en,
  my,
  tone = "default",
}: {
  language: Language;
  en: string;
  my: string;
  tone?: "default" | "blue" | "white";
}) {
  const toneClass =
    tone === "blue"
      ? "text-blue-400"
      : tone === "white"
        ? "text-white/50"
        : "text-slate-400";

  return (
    <label className={["block text-[11px] font-bold", toneClass].join(" ")}>
      <LocalizedText
        language={language}
        en={en}
        my={my}
        englishClassName="uppercase tracking-[0.18em]"
        myanmarClassName="tracking-normal normal-case text-xs"
        separatorClassName={tone === "white" ? "text-white/30" : "text-slate-300"}
      />
    </label>
  );
}

export default function CreateDeliveryClient() {
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [language, setLanguage] = useState<Language>("both");
  const [deliveryMode, setDeliveryMode] = useState<DeliveryMode>("pickup_delivery");
  const [form, setForm] = useState<FormState>(emptyForm);

  const totalToCollect = useMemo(() => {
    const cod = form.payment_term === "COD" ? toNumber(form.cod_amount_mmks) : 0;
    return cod + toNumber(form.delivery_fee_mmks) + toNumber(form.extra_weight_charges);
  }, [form]);

  const currencyLocale = language === "my" ? "my-MM" : "en-US";

  const senderAddressLabel =
    deliveryMode === "pickup_delivery"
      ? { en: "Pick-up Address", my: "လာယူမည့်လိပ်စာ" }
      : { en: "Drop-off Office", my: "ပို့မည့်ရုံး" };

  const recipientAddressLabel =
    deliveryMode === "pickup_delivery"
      ? { en: "Delivery Address", my: "ပို့ဆောင်မည့်လိပ်စာ" }
      : { en: "Receiving Office", my: "လက်ခံမည့်ရုံး" };

  const setField = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccessMsg("");
    setErrorMsg("");

    const trackingNo = `BEX-${Date.now().toString().slice(-8)}`;

    const structuredRemark = [
      form.rider_remark.trim(),
      `Mode: ${deliveryMode}`,
      `Language: ${language}`,
    ]
      .filter(Boolean)
      .join("\n");

    const { error } = await supabase.from("shipments").insert([
      {
        tracking_number: trackingNo,
        sender_name: form.sender_name.trim(),
        sender_phone: form.sender_phone.trim(),
        sender_address: form.sender_address.trim(),
        recipient_name: form.recipient_name.trim(),
        recipient_phone: form.recipient_phone.trim(),
        recipient_address: form.recipient_address.trim(),
        product_name: form.product_name.trim(),
        product_weight: toNumber(form.product_weight),
        product_qty: toNumber(form.product_qty),
        payment_term: form.payment_term,
        delivery_fee_mmks: toNumber(form.delivery_fee_mmks),
        extra_weight_charges: toNumber(form.extra_weight_charges),
        cod_amount_mmks: toNumber(form.cod_amount_mmks),
        rider_remark: structuredRemark,
        total_collectable_amount: totalToCollect,
        status: "pending_pickup",
      },
    ]);

    if (error) {
      setErrorMsg(
        copyFor(
          language,
          "Unable to create the waybill. Please check the shipment table columns and try again.",
          "Waybill မဖန်တီးနိုင်ပါ။ shipment table column များကို စစ်ဆေးပြီး ထပ်မံကြိုးစားပါ။",
        ),
      );
      setLoading(false);
      return;
    }

    setSuccessMsg(
      copyFor(
        language,
        `Success: ${trackingNo} created`,
        `အောင်မြင်ပါသည် - ${trackingNo} ဖန်တီးပြီးပါပြီ`,
      ),
    );
    setForm(emptyForm);
    window.scrollTo({ top: 0, behavior: "smooth" });
    setLoading(false);
  };

  const commonInputClass =
    "w-full rounded-2xl border border-transparent bg-transparent px-0 py-1 text-base font-semibold text-[#0d2c54] outline-none placeholder:text-slate-400";

  const cardClass = "rounded-[40px] border border-slate-200 bg-white p-8 shadow-sm";

  return (
    <form
      onSubmit={handleSubmit}
      className={`${inter.variable} ${myanmar.variable} space-y-8`}
      style={{
        fontFamily:
          'var(--font-en), var(--font-my), "Noto Sans Myanmar", "Myanmar Text", "Pyidaungsu", system-ui, sans-serif',
      }}
    >
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div className="space-y-2">
          <h1 className="text-3xl font-black text-[#0d2c54] md:text-4xl">
            <LocalizedText
              language={language}
              en="INTAKE CONSOLE"
              my="ကုန်ပစ္စည်းလက်ခံရေးစနစ်"
              englishClassName="tracking-tight"
              myanmarClassName="tracking-normal normal-case text-[0.85em]"
            />
          </h1>
          <p className="text-sm text-slate-500">
            <LocalizedText
              language={language}
              en="Enterprise waybill creation with correct Myanmar rendering"
              my="မြန်မာစာဖောင့်မှန်ကန်စွာဖြင့် Enterprise waybill ဖန်တီးခြင်း"
              englishClassName="font-medium"
              myanmarClassName="font-medium tracking-normal"
            />
          </p>
        </div>

        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <LanguageToggle value={language} onChange={setLanguage} />
          <ModeToggle language={language} value={deliveryMode} onChange={setDeliveryMode} />
        </div>
      </div>

      {successMsg && (
        <div className="flex items-center gap-3 rounded-[28px] bg-emerald-600 p-5 text-white shadow-xl">
          <CheckCircle2 size={28} />
          <p className="font-bold">{successMsg}</p>
        </div>
      )}

      {errorMsg && (
        <div className="flex items-center gap-3 rounded-[28px] bg-rose-600 p-5 text-white shadow-xl">
          <XCircle size={28} />
          <p className="font-bold">{errorMsg}</p>
        </div>
      )}

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className={`${cardClass} space-y-6`}>
          <SectionTitle
            icon={<User size={18} />}
            language={language}
            en="Parties"
            my="လူပုဂ္ဂိုလ်များ"
            iconClassName="text-blue-500"
          />

          <div className="space-y-4">
            <div className="rounded-3xl border border-slate-100 bg-slate-50 p-5">
              <FieldLabel language={language} en="Sender" my="ပေးပို့သူ" />
              <div className="mt-3 space-y-3">
                <div>
                  <FieldLabel language={language} en="Name" my="အမည်" />
                  <input
                    required
                    value={form.sender_name}
                    onChange={(e) => setField("sender_name", e.target.value)}
                    placeholder={copyFor(language, "Sender name", "ပေးပို့သူအမည်")}
                    className={commonInputClass}
                  />
                </div>
                <div className="border-t border-slate-200 pt-3">
                  <FieldLabel language={language} en="Phone" my="ဖုန်းနံပါတ်" />
                  <input
                    required
                    inputMode="tel"
                    value={form.sender_phone}
                    onChange={(e) => setField("sender_phone", e.target.value)}
                    placeholder={copyFor(language, "09xxxxxxxxx", "09xxxxxxxxx")}
                    className={commonInputClass}
                  />
                </div>
                <div className="border-t border-slate-200 pt-3">
                  <FieldLabel language={language} en={senderAddressLabel.en} my={senderAddressLabel.my} />
                  <textarea
                    required
                    rows={3}
                    value={form.sender_address}
                    onChange={(e) => setField("sender_address", e.target.value)}
                    placeholder={copyFor(language, senderAddressLabel.en, senderAddressLabel.my)}
                    className={`${commonInputClass} resize-none`}
                  />
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-blue-100 bg-blue-50/50 p-5">
              <FieldLabel language={language} en="Recipient" my="လက်ခံသူ" tone="blue" />
              <div className="mt-3 space-y-3">
                <div>
                  <FieldLabel language={language} en="Name" my="အမည်" tone="blue" />
                  <input
                    required
                    value={form.recipient_name}
                    onChange={(e) => setField("recipient_name", e.target.value)}
                    placeholder={copyFor(language, "Recipient name", "လက်ခံသူအမည်")}
                    className={commonInputClass}
                  />
                </div>
                <div className="border-t border-blue-100 pt-3">
                  <FieldLabel language={language} en="Phone" my="ဖုန်းနံပါတ်" tone="blue" />
                  <input
                    required
                    inputMode="tel"
                    value={form.recipient_phone}
                    onChange={(e) => setField("recipient_phone", e.target.value)}
                    placeholder={copyFor(language, "09xxxxxxxxx", "09xxxxxxxxx")}
                    className={commonInputClass}
                  />
                </div>
                <div className="border-t border-blue-100 pt-3">
                  <FieldLabel language={language} en={recipientAddressLabel.en} my={recipientAddressLabel.my} tone="blue" />
                  <textarea
                    required
                    rows={3}
                    value={form.recipient_address}
                    onChange={(e) => setField("recipient_address", e.target.value)}
                    placeholder={copyFor(language, recipientAddressLabel.en, recipientAddressLabel.my)}
                    className={`${commonInputClass} resize-none`}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className={`${cardClass} space-y-6`}>
          <SectionTitle
            icon={<Package size={18} />}
            language={language}
            en="Specs"
            my="ကုန်ပစ္စည်းအချက်အလက်"
            iconClassName="text-amber-500"
          />

          <div className="space-y-4">
            <div className="rounded-3xl bg-slate-50 p-4">
              <FieldLabel language={language} en="Product Name" my="ကုန်ပစ္စည်းအမည်" />
              <input
                required
                value={form.product_name}
                onChange={(e) => setField("product_name", e.target.value)}
                placeholder={copyFor(language, "Product name", "ကုန်ပစ္စည်းအမည်")}
                className={`${commonInputClass} px-1`}
              />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="rounded-3xl bg-slate-50 p-4">
                <FieldLabel language={language} en="Weight (KG)" my="အလေးချိန် (ကီလို)" />
                <input
                  type="number"
                  min="0"
                  step="0.1"
                  value={form.product_weight}
                  onChange={(e) => setField("product_weight", e.target.value)}
                  placeholder={copyFor(language, "0", "0")}
                  className={`${commonInputClass} px-1`}
                />
              </div>
              <div className="rounded-3xl bg-slate-50 p-4">
                <FieldLabel language={language} en="Quantity" my="အရေအတွက်" />
                <input
                  type="number"
                  min="1"
                  value={form.product_qty}
                  onChange={(e) => setField("product_qty", e.target.value)}
                  placeholder={copyFor(language, "1", "1")}
                  className={`${commonInputClass} px-1`}
                />
              </div>
            </div>

            <div className="pt-2">
              <SectionTitle
                icon={<ClipboardList size={18} />}
                language={language}
                en="Rider Remark"
                my="မှတ်ချက်"
                iconClassName="text-slate-400"
              />
              <textarea
                rows={5}
                value={form.rider_remark}
                onChange={(e) => setField("rider_remark", e.target.value)}
                placeholder={copyFor(
                  language,
                  "Instructions for pickup, handling, office transfer, or delivery",
                  "လာယူခြင်း၊ ကိုင်တွယ်ခြင်း၊ ရုံးပြောင်းပို့ခြင်း သို့မဟုတ် ပို့ဆောင်ခြင်းအတွက် မှတ်ချက်များ",
                )}
                className="mt-2 w-full resize-none rounded-3xl border-none bg-slate-50 p-4 text-base font-semibold text-slate-700 outline-none placeholder:text-slate-400"
              />
            </div>
          </div>
        </div>

        <div className="rounded-[40px] bg-[#0d2c54] p-8 text-white shadow-2xl">
          <div className="space-y-6">
            <SectionTitle
              icon={<Banknote size={18} />}
              language={language}
              en="Billing"
              my="ငွေတောင်းခံလွှာ"
              iconClassName="text-[#ffd700]"
              borderClassName="border-b border-white/10"
              textClassName="text-[#ffd700]"
            />

            <div className="space-y-6">
              <div>
                <FieldLabel language={language} en="Payment Term" my="ငွေပေးချေမှုအမျိုးအစား" tone="white" />
                <select
                  value={form.payment_term}
                  onChange={(e) => setField("payment_term", e.target.value as FormState["payment_term"])}
                  className="mt-2 w-full rounded-2xl border border-white/10 bg-white/10 p-4 text-sm font-bold text-[#ffd700] outline-none"
                >
                  <option value="COD">{copyFor(language, "Cash on Delivery (COD)", "ပစ္စည်းရောက်မှငွေချေ (COD)")}</option>
                  <option value="PREPAID">{copyFor(language, "Prepaid (Merchant Paid)", "ကြိုတင်ပေးချေပြီး (Merchant Paid)")}</option>
                </select>
              </div>

              <div className="space-y-1">
                <FieldLabel language={language} en="Delivery Fee" my="ပို့ဆောင်ခ" tone="white" />
                <input
                  type="number"
                  min="0"
                  value={form.delivery_fee_mmks}
                  onChange={(e) => setField("delivery_fee_mmks", e.target.value)}
                  className="w-full border-b border-white/20 bg-transparent pb-2 text-2xl font-black text-[#ffd700] outline-none"
                  placeholder="0"
                />
              </div>

              <div className="space-y-1">
                <FieldLabel language={language} en="Extra Weight Surcharge" my="အလေးချိန်ပိုကြေး" tone="white" />
                <input
                  type="number"
                  min="0"
                  value={form.extra_weight_charges}
                  onChange={(e) => setField("extra_weight_charges", e.target.value)}
                  className="w-full border-b border-white/20 bg-transparent pb-2 text-2xl font-black text-white outline-none"
                  placeholder="0"
                />
              </div>

              <div className="space-y-1">
                <FieldLabel language={language} en="COD Amount" my="COD ငွေပမာဏ" tone="white" />
                <input
                  type="number"
                  min="0"
                  disabled={form.payment_term !== "COD"}
                  value={form.cod_amount_mmks}
                  onChange={(e) => setField("cod_amount_mmks", e.target.value)}
                  className="w-full border-b border-white/20 bg-transparent pb-2 text-2xl font-black text-white outline-none disabled:cursor-not-allowed disabled:opacity-50"
                  placeholder="0"
                />
              </div>

              <div className="border-t border-white/10 pt-8">
                <p className="text-[11px] font-bold text-white/50">
                  <LocalizedText
                    language={language}
                    en="Total to Collect"
                    my="စုစုပေါင်းကောက်ခံရမည့်ငွေ"
                    englishClassName="uppercase tracking-[0.18em]"
                    myanmarClassName="tracking-normal normal-case"
                    separatorClassName="text-white/30"
                  />
                </p>
                <p className="mt-2 text-5xl font-black text-[#ffd700]">
                  {totalToCollect.toLocaleString(currencyLocale)}
                  <span className="ml-2 text-sm font-medium text-white">MMK</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <button
        disabled={loading}
        className="w-full rounded-[30px] bg-[#ffd700] px-6 py-6 text-lg font-black text-[#0d2c54] shadow-[0_20px_50px_rgba(255,215,0,0.3)] transition-transform hover:scale-[1.01] active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
      >
        <span className="inline-flex items-center gap-3">
          <Truck size={20} />
          <LocalizedText
            language={language}
            en={loading ? "Initializing..." : "Create Enterprise Waybill"}
            my={loading ? "စတင်ဆောင်ရွက်နေသည်..." : "Enterprise Waybill ဖန်တီးမည်"}
            englishClassName="uppercase tracking-[0.3em]"
            myanmarClassName="tracking-normal normal-case"
            separatorClassName="text-[#0d2c54]/50"
          />
        </span>
      </button>
    </form>
  );
}
