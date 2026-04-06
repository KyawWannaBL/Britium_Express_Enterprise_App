"use client";

import React, { useEffect, useMemo, useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import {
  AlertCircle,
  Banknote,
  Boxes,
  Building2,
  CalendarClock,
  CheckCircle2,
  ClipboardList,
  Globe2,
  MapPin,
  Package2,
  Printer,
  Save,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Truck,
  User,
  WalletCards,
  XCircle,
} from "lucide-react";
import {
  ActionButton,
  BilingualText,
  DarkPremiumCard,
  EnterprisePage,
  FieldLabel,
  HeroShell,
  MetricCard,
  PremiumCard,
  PremiumInput,
  PremiumSelect,
  PremiumTextarea,
  SectionHeader,
  StatusBadge,
} from "@/components/enterprise-ui-kit";

type Language = "en" | "my" | "both";
type DeliveryMode = "pickup_delivery" | "office_to_office";
type ActionType = "draft" | "submit" | "print";

type FormState = {
  service_type: "express" | "same_day" | "next_day" | "scheduled";
  priority: "normal" | "urgent" | "vip";
  booking_reference: string;
  branch_code: string;
  merchant_account_id: string;
  schedule_date: string;

  sender_name: string;
  sender_phone: string;
  sender_alt_phone: string;
  sender_township: string;
  sender_address: string;
  sender_landmark: string;
  sender_lat: string;
  sender_lng: string;
  pickup_time_from: string;
  pickup_time_to: string;

  recipient_name: string;
  recipient_phone: string;
  recipient_alt_phone: string;
  recipient_township: string;
  recipient_address: string;
  recipient_landmark: string;
  recipient_lat: string;
  recipient_lng: string;
  delivery_time_from: string;
  delivery_time_to: string;

  product_name: string;
  product_category: string;
  product_weight: string;
  product_length_cm: string;
  product_width_cm: string;
  product_height_cm: string;
  product_qty: string;
  package_count: string;
  declared_value_mmks: string;
  fragile: boolean;
  special_handling: string;
  rider_remark: string;

  payment_term: "COD" | "PREPAID" | "ACCOUNT";
  payer_type: "sender" | "recipient" | "merchant" | "account";
  delivery_fee_mmks: string;
  extra_weight_charges: string;
  insurance_fee_mmks: string;
  discount_mmks: string;
  cod_amount_mmks: string;

  pod_type: "none" | "photo" | "signature" | "pin" | "barcode" | "id_check";
  contactless_ok: boolean;
  return_if_failed: boolean;
  dispatch_mode: "auto" | "manual";
  preferred_vehicle: "bike" | "car" | "van" | "office_transfer";
  send_tracking_sms: boolean;
  print_label_after_create: boolean;
};

type FormErrors = Partial<Record<keyof FormState | "general", string>>;

const emptyForm: FormState = {
  service_type: "same_day",
  priority: "normal",
  booking_reference: "",
  branch_code: "YGN-HQ",
  merchant_account_id: "",
  schedule_date: "",

  sender_name: "",
  sender_phone: "",
  sender_alt_phone: "",
  sender_township: "",
  sender_address: "",
  sender_landmark: "",
  sender_lat: "",
  sender_lng: "",
  pickup_time_from: "",
  pickup_time_to: "",

  recipient_name: "",
  recipient_phone: "",
  recipient_alt_phone: "",
  recipient_township: "",
  recipient_address: "",
  recipient_landmark: "",
  recipient_lat: "",
  recipient_lng: "",
  delivery_time_from: "",
  delivery_time_to: "",

  product_name: "",
  product_category: "General",
  product_weight: "",
  product_length_cm: "",
  product_width_cm: "",
  product_height_cm: "",
  product_qty: "1",
  package_count: "1",
  declared_value_mmks: "0",
  fragile: false,
  special_handling: "",
  rider_remark: "",

  payment_term: "COD",
  payer_type: "recipient",
  delivery_fee_mmks: "",
  extra_weight_charges: "0",
  insurance_fee_mmks: "0",
  discount_mmks: "0",
  cod_amount_mmks: "",

  pod_type: "signature",
  contactless_ok: false,
  return_if_failed: true,
  dispatch_mode: "auto",
  preferred_vehicle: "bike",
  send_tracking_sms: true,
  print_label_after_create: true,
};

function toNumber(value: string | number) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function copyFor(language: Language, en: string, my: string) {
  if (language === "en") return en;
  if (language === "my") return my;
  return `${en} / ${my}`;
}

function normalizePhone(phone: string) {
  return phone.replace(/[\s-]/g, "");
}

function isValidMyanmarPhone(phone: string) {
  const normalized = normalizePhone(phone);
  return /^(09\d{7,11}|\+?959\d{7,11})$/.test(normalized);
}

function formatMoney(value: number, locale: string) {
  return value.toLocaleString(locale);
}

function ErrorText({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="mt-2 text-xs font-bold text-rose-500">{message}</p>;
}

function ToggleRow({
  title,
  description,
  checked,
  onChange,
}: {
  title: { en: string; my: string };
  description: { en: string; my: string };
  checked: boolean;
  onChange: (next: boolean) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={[
        "flex w-full items-center justify-between gap-4 rounded-2xl border px-4 py-4 text-left transition",
        checked
          ? "border-[#0d2c54]/15 bg-[#0d2c54]/[0.03]"
          : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/80",
      ].join(" ")}
    >
      <div>
        <BilingualText
          text={title}
          className="text-sm font-bold text-[#0d2c54]"
          secondaryClassName="mt-1 text-xs font-semibold text-slate-500"
        />
        <BilingualText
          text={description}
          className="mt-2 text-xs font-medium leading-5 text-slate-500"
          secondaryClassName="mt-1 text-xs font-medium leading-5 text-slate-500"
        />
      </div>
      <motion.span
        animate={{ backgroundColor: checked ? "#ffd700" : "#e2e8f0" }}
        className="relative flex h-7 w-12 items-center rounded-full p-1"
      >
        <motion.span
          layout
          transition={{ type: "spring", stiffness: 700, damping: 34 }}
          className="h-5 w-5 rounded-full bg-white shadow-sm"
          style={{ marginLeft: checked ? 20 : 0 }}
        />
      </motion.span>
    </button>
  );
}

function SegmentedControl<T extends string>({
  value,
  onChange,
  items,
  layoutId,
}: {
  value: T;
  onChange: (value: T) => void;
  items: Array<{ value: T; label: ReactNode }>;
  layoutId: string;
}) {
  return (
    <div className="inline-flex flex-wrap items-center gap-1 rounded-2xl border border-white/70 bg-white/70 p-1.5 shadow-[0_10px_30px_rgba(15,23,42,0.08)] backdrop-blur-xl">
      {items.map((item) => {
        const active = item.value === value;
        return (
          <button
            key={item.value}
            type="button"
            onClick={() => onChange(item.value)}
            className="relative rounded-[14px] px-3.5 py-2 text-sm font-semibold text-slate-600 transition-colors"
          >
            {active && (
              <motion.span
                layoutId={layoutId}
                className="absolute inset-0 rounded-[14px] bg-[#0d2c54] shadow-[0_10px_20px_rgba(13,44,84,0.22)]"
                transition={{ type: "spring", stiffness: 380, damping: 32 }}
              />
            )}
            <span className={active ? "relative z-10 text-white" : "relative z-10"}>
              {item.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}

export default function CreateDeliveryClient() {
  const supabase = createClient();

  const [loadingAction, setLoadingAction] = useState<ActionType | null>(null);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [fieldErrors, setFieldErrors] = useState<FormErrors>({});
  const [language, setLanguage] = useState<Language>("both");
  const [deliveryMode, setDeliveryMode] = useState<DeliveryMode>("pickup_delivery");
  const [form, setForm] = useState<FormState>(emptyForm);

  const loading = loadingAction !== null;
  const currencyLocale = language === "my" ? "my-MM" : "en-US";

  useEffect(() => {
    if (form.payment_term !== "COD" && form.cod_amount_mmks !== "") {
      setForm((prev) => ({ ...prev, cod_amount_mmks: "" }));
    }
  }, [form.payment_term, form.cod_amount_mmks]);

  useEffect(() => {
    if (deliveryMode === "office_to_office" && form.preferred_vehicle === "bike") {
      setForm((prev) => ({ ...prev, preferred_vehicle: "office_transfer" }));
    }
  }, [deliveryMode, form.preferred_vehicle]);

  const senderAddressLabel =
    deliveryMode === "pickup_delivery"
      ? { en: "Pickup Address", my: "လာယူမည့်လိပ်စာ" }
      : { en: "Sending Office", my: "ပို့မည့်ရုံး" };

  const recipientAddressLabel =
    deliveryMode === "pickup_delivery"
      ? { en: "Delivery Address", my: "ပို့ဆောင်မည့်လိပ်စာ" }
      : { en: "Receiving Office", my: "လက်ခံမည့်ရုံး" };

  const volWeight = useMemo(() => {
    const l = toNumber(form.product_length_cm);
    const w = toNumber(form.product_width_cm);
    const h = toNumber(form.product_height_cm);
    if (!l || !w || !h) return 0;
    return (l * w * h) / 5000;
  }, [form.product_length_cm, form.product_width_cm, form.product_height_cm]);

  const chargeSubtotal = useMemo(() => {
    const fee = toNumber(form.delivery_fee_mmks);
    const extra = toNumber(form.extra_weight_charges);
    const insurance = toNumber(form.insurance_fee_mmks);
    const discount = toNumber(form.discount_mmks);
    return Math.max(0, fee + extra + insurance - discount);
  }, [
    form.delivery_fee_mmks,
    form.extra_weight_charges,
    form.insurance_fee_mmks,
    form.discount_mmks,
  ]);

  const totalToCollect = useMemo(() => {
    const cod = form.payment_term === "COD" ? toNumber(form.cod_amount_mmks) : 0;
    const deliveryChargeCollectable = form.payer_type === "recipient" ? chargeSubtotal : 0;
    return Math.max(0, cod + deliveryChargeCollectable);
  }, [form.payment_term, form.cod_amount_mmks, form.payer_type, chargeSubtotal]);

  const chargeableWeight = useMemo(() => {
    return Math.max(toNumber(form.product_weight), volWeight);
  }, [form.product_weight, volWeight]);

  const setField = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setFieldErrors((prev) => {
      if (!prev[key] && !prev.general) return prev;
      const next = { ...prev };
      delete next[key];
      delete next.general;
      return next;
    });
  };

  const resetForm = () => {
    setForm((prev) => ({
      ...emptyForm,
      branch_code: prev.branch_code || emptyForm.branch_code,
      merchant_account_id: prev.merchant_account_id,
    }));
    setFieldErrors({});
  };

  const validateForSubmit = (): FormErrors => {
    const errors: FormErrors = {};
    const setError = (key: keyof FormErrors, message: string) => {
      if (!errors[key]) errors[key] = message;
    };

    const requiredMsg = "Required / လိုအပ်သည်";
    const invalidMsg = "Invalid / မမှန်ကန်ပါ";
    const invalidRangeMsg = "Invalid range / အချိန်အပိုင်းအခြားမမှန်ပါ";
    const minOneMsg = "Must be at least 1 / အနည်းဆုံး ၁ ဖြစ်ရမည်";

    if (!form.service_type) setError("service_type", requiredMsg);
    if (!form.priority) setError("priority", requiredMsg);
    if (!form.branch_code.trim()) setError("branch_code", requiredMsg);
    if (form.service_type === "scheduled" && !form.schedule_date) {
      setError("schedule_date", requiredMsg);
    }

    if (!form.sender_name.trim()) setError("sender_name", requiredMsg);
    if (!form.sender_township.trim()) setError("sender_township", requiredMsg);
    if (!form.sender_address.trim()) setError("sender_address", requiredMsg);
    if (!isValidMyanmarPhone(form.sender_phone)) setError("sender_phone", invalidMsg);
    if (form.sender_alt_phone.trim() && !isValidMyanmarPhone(form.sender_alt_phone)) {
      setError("sender_alt_phone", invalidMsg);
    }
    if (form.pickup_time_from && form.pickup_time_to && form.pickup_time_from > form.pickup_time_to) {
      setError("pickup_time_to", invalidRangeMsg);
    }

    if (form.sender_lat.trim()) {
      const lat = Number(form.sender_lat);
      if (!Number.isFinite(lat) || lat < -90 || lat > 90) setError("sender_lat", invalidMsg);
    }
    if (form.sender_lng.trim()) {
      const lng = Number(form.sender_lng);
      if (!Number.isFinite(lng) || lng < -180 || lng > 180) setError("sender_lng", invalidMsg);
    }

    if (!form.recipient_name.trim()) setError("recipient_name", requiredMsg);
    if (!form.recipient_township.trim()) setError("recipient_township", requiredMsg);
    if (!form.recipient_address.trim()) setError("recipient_address", requiredMsg);
    if (!isValidMyanmarPhone(form.recipient_phone)) setError("recipient_phone", invalidMsg);
    if (form.recipient_alt_phone.trim() && !isValidMyanmarPhone(form.recipient_alt_phone)) {
      setError("recipient_alt_phone", invalidMsg);
    }
    if (
      form.delivery_time_from &&
      form.delivery_time_to &&
      form.delivery_time_from > form.delivery_time_to
    ) {
      setError("delivery_time_to", invalidRangeMsg);
    }

    if (form.recipient_lat.trim()) {
      const lat = Number(form.recipient_lat);
      if (!Number.isFinite(lat) || lat < -90 || lat > 90) setError("recipient_lat", invalidMsg);
    }
    if (form.recipient_lng.trim()) {
      const lng = Number(form.recipient_lng);
      if (!Number.isFinite(lng) || lng < -180 || lng > 180) setError("recipient_lng", invalidMsg);
    }

    if (!form.product_name.trim()) setError("product_name", requiredMsg);
    if (!form.product_category.trim()) setError("product_category", requiredMsg);
    if (toNumber(form.product_qty) < 1) setError("product_qty", minOneMsg);
    if (toNumber(form.package_count) < 1) setError("package_count", minOneMsg);
    if (toNumber(form.product_weight) < 0) setError("product_weight", invalidMsg);
    if (toNumber(form.declared_value_mmks) < 0) setError("declared_value_mmks", invalidMsg);
    if (form.product_length_cm.trim() && toNumber(form.product_length_cm) < 0) {
      setError("product_length_cm", invalidMsg);
    }
    if (form.product_width_cm.trim() && toNumber(form.product_width_cm) < 0) {
      setError("product_width_cm", invalidMsg);
    }
    if (form.product_height_cm.trim() && toNumber(form.product_height_cm) < 0) {
      setError("product_height_cm", invalidMsg);
    }

    if (!form.payment_term) setError("payment_term", requiredMsg);
    if (!form.payer_type) setError("payer_type", requiredMsg);
    if (toNumber(form.delivery_fee_mmks) < 0) setError("delivery_fee_mmks", invalidMsg);
    if (toNumber(form.extra_weight_charges) < 0) setError("extra_weight_charges", invalidMsg);
    if (toNumber(form.insurance_fee_mmks) < 0) setError("insurance_fee_mmks", invalidMsg);
    if (toNumber(form.discount_mmks) < 0) setError("discount_mmks", invalidMsg);
    if (form.payment_term === "COD" && toNumber(form.cod_amount_mmks) <= 0) {
      setError("cod_amount_mmks", requiredMsg);
    }
    if (form.payment_term === "ACCOUNT" && !form.merchant_account_id.trim()) {
      setError("merchant_account_id", requiredMsg);
    }

    if (!form.pod_type) setError("pod_type", requiredMsg);
    if (!form.dispatch_mode) setError("dispatch_mode", requiredMsg);
    if (!form.preferred_vehicle) setError("preferred_vehicle", requiredMsg);

    if (
      deliveryMode === "office_to_office" &&
      !["office_transfer", "car", "van"].includes(form.preferred_vehicle)
    ) {
      setError("preferred_vehicle", "Invalid mode / မမှန်ကန်သော mode");
    }

    if (
      form.sender_phone.trim() &&
      form.recipient_phone.trim() &&
      normalizePhone(form.sender_phone) === normalizePhone(form.recipient_phone)
    ) {
      setError(
        "general",
        "Sender and recipient phone should not be the same / ပေးပို့သူနှင့် လက်ခံသူဖုန်းနံပါတ် မတူရပါ",
      );
    }

    return errors;
  };

  const handleAction = async (actionType: ActionType) => {
    setLoadingAction(actionType);
    setSuccessMsg("");
    setErrorMsg("");

    try {
      if (actionType !== "draft") {
        const errors = validateForSubmit();
        if (Object.keys(errors).length > 0) {
          setFieldErrors(errors);
          setErrorMsg(
            copyFor(
              language,
              "Please review the highlighted fields.",
              "မီးပြထားသော field များကို ပြန်လည်စစ်ဆေးပါ။",
            ),
          );
          return;
        }
      }

      const trackingNo = `BEX-${Date.now().toString().slice(-8)}`;

      const payload = {
        tracking_number: trackingNo,
        status: actionType === "draft" ? "draft" : "pending_pickup",

        service_type: form.service_type,
        priority: form.priority,
        delivery_mode: deliveryMode,
        booking_reference: form.booking_reference.trim() || null,
        branch_code: form.branch_code.trim() || null,
        merchant_account_id: form.merchant_account_id.trim() || null,
        schedule_date:
          form.service_type === "scheduled" && form.schedule_date ? form.schedule_date : null,

        sender_name: form.sender_name.trim(),
        sender_phone: normalizePhone(form.sender_phone),
        sender_alt_phone: form.sender_alt_phone.trim()
          ? normalizePhone(form.sender_alt_phone)
          : null,
        sender_township: form.sender_township.trim() || null,
        sender_address: form.sender_address.trim(),
        sender_landmark: form.sender_landmark.trim() || null,
        sender_lat: form.sender_lat ? toNumber(form.sender_lat) : null,
        sender_lng: form.sender_lng ? toNumber(form.sender_lng) : null,
        pickup_time_from: form.pickup_time_from || null,
        pickup_time_to: form.pickup_time_to || null,

        recipient_name: form.recipient_name.trim(),
        recipient_phone: normalizePhone(form.recipient_phone),
        recipient_alt_phone: form.recipient_alt_phone.trim()
          ? normalizePhone(form.recipient_alt_phone)
          : null,
        recipient_township: form.recipient_township.trim() || null,
        recipient_address: form.recipient_address.trim(),
        recipient_landmark: form.recipient_landmark.trim() || null,
        recipient_lat: form.recipient_lat ? toNumber(form.recipient_lat) : null,
        recipient_lng: form.recipient_lng ? toNumber(form.recipient_lng) : null,
        delivery_time_from: form.delivery_time_from || null,
        delivery_time_to: form.delivery_time_to || null,

        product_name: form.product_name.trim(),
        product_category: form.product_category || null,
        product_weight: toNumber(form.product_weight),
        product_length_cm: form.product_length_cm ? toNumber(form.product_length_cm) : null,
        product_width_cm: form.product_width_cm ? toNumber(form.product_width_cm) : null,
        product_height_cm: form.product_height_cm ? toNumber(form.product_height_cm) : null,
        product_qty: toNumber(form.product_qty),
        package_count: toNumber(form.package_count),
        declared_value_mmks: toNumber(form.declared_value_mmks),
        fragile: form.fragile,
        special_handling: form.special_handling.trim() || null,
        volumetric_weight: volWeight ? Number(volWeight.toFixed(3)) : 0,
        chargeable_weight: Number(chargeableWeight.toFixed(3)),

        payment_term: form.payment_term,
        payer_type: form.payer_type,
        delivery_fee_mmks: toNumber(form.delivery_fee_mmks),
        extra_weight_charges: toNumber(form.extra_weight_charges),
        insurance_fee_mmks: toNumber(form.insurance_fee_mmks),
        discount_mmks: toNumber(form.discount_mmks),
        cod_amount_mmks: form.payment_term === "COD" ? toNumber(form.cod_amount_mmks) : 0,
        charge_subtotal_mmks: chargeSubtotal,
        total_collectable_amount: totalToCollect,

        pod_type: form.pod_type,
        contactless_ok: form.contactless_ok,
        return_if_failed: form.return_if_failed,
        dispatch_mode: form.dispatch_mode,
        preferred_vehicle: form.preferred_vehicle,
        send_tracking_sms: form.send_tracking_sms,
        print_label_after_create: form.print_label_after_create,

        rider_remark: form.rider_remark.trim() || null,
        enterprise_payload: {
          ui_language: language,
          created_from: "intake_console",
          action_type: actionType,
          app_version: 3,
        },
      };

      const { error } = await supabase.from("shipments").insert([payload]);

      if (error) {
        setErrorMsg(
          copyFor(
            language,
            `Unable to save shipment: ${error.message}`,
            `Shipment ကို သိမ်းဆည်းမရပါ - ${error.message}`,
          ),
        );
        return;
      }

      setSuccessMsg(
        copyFor(
          language,
          `Success: ${trackingNo} created successfully.`,
          `အောင်မြင်ပါသည် - ${trackingNo} ဖန်တီးပြီးပါပြီ။`,
        ),
      );

      if (actionType === "print") {
        const afterPrint = () => {
          window.onafterprint = null;
          resetForm();
          setLoadingAction(null);
        };
        window.onafterprint = afterPrint;
        window.print();
        return;
      }

      resetForm();
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error occurred";
      setErrorMsg(
        copyFor(language, `Unexpected error: ${message}`, `မမျှော်လင့်ထားသောအမှား - ${message}`),
      );
    } finally {
      if (actionType !== "print") {
        setLoadingAction(null);
      }
    }
  };

  return (
    <EnterprisePage>
      <HeroShell>
        <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-slate-200/90 bg-white/90 px-3 py-1.5 shadow-sm">
              <Sparkles size={14} className="text-[#0d2c54]" />
              <span className="text-[11px] font-black uppercase tracking-[0.24em] text-slate-500">
                Enterprise Intake Console
              </span>
            </div>

            <BilingualText
              text={{
                en: "Premium Shipment Intake",
                my: "အရည်အသွေးမြင့် ကုန်စည်လက်ခံရေးစနစ်",
              }}
              className="mt-4 text-3xl font-black tracking-tight text-[#0d2c54] md:text-5xl"
              secondaryClassName="mt-3 text-base font-semibold text-slate-500 md:text-lg"
            />

            <BilingualText
              text={{
                en: "A refined, dispatch-ready intake experience for enterprise logistics teams.",
                my: "Enterprise logistics အဖွဲ့များအတွက် dispatch-ready intake experience",
              }}
              className="mt-4 text-sm font-medium leading-6 text-slate-500 md:text-[15px]"
              secondaryClassName="mt-1 text-sm font-medium leading-6 text-slate-500 md:text-[15px]"
            />
          </div>

          <div className="flex flex-col gap-3 xl:items-end">
            <div className="flex items-center gap-2 rounded-full border border-white/80 bg-white/75 px-4 py-2 shadow-sm">
              <Globe2 size={14} className="text-slate-500" />
              <span className="text-[11px] font-black uppercase tracking-[0.16em] text-slate-400">
                Language
              </span>
            </div>

            <SegmentedControl
              layoutId="language-switch"
              value={language}
              onChange={setLanguage}
              items={[
                { value: "en", label: "EN" },
                { value: "my", label: "မြန်မာ" },
                { value: "both", label: "EN + မြန်မာ" },
              ]}
            />

            <SegmentedControl
              layoutId="mode-switch"
              value={deliveryMode}
              onChange={setDeliveryMode}
              items={[
                {
                  value: "pickup_delivery",
                  label: copyFor(language, "Pickup & Delivery", "လာယူပို့ဆောင်ခြင်း"),
                },
                {
                  value: "office_to_office",
                  label: copyFor(language, "Office to Office", "ရုံးမှရုံးသို့"),
                },
              ]}
            />
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
          <MetricCard
            label={{ en: "Service Type", my: "ဝန်ဆောင်မှုအမျိုးအစား" }}
            value={form.service_type.replaceAll("_", " ")}
          />
          <MetricCard
            label={{ en: "Chargeable Weight", my: "တွက်ချက်အလေးချိန်" }}
            value={`${chargeableWeight.toFixed(2)} kg`}
          />
          <MetricCard
            label={{ en: "Total Collectable", my: "စုစုပေါင်းကောက်ခံရန်" }}
            value={`${formatMoney(totalToCollect, currencyLocale)} Ks`}
          />
        </div>
      </HeroShell>

      <AnimatePresence mode="popLayout">
        {successMsg ? (
          <motion.div
            key="success"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="flex items-start gap-3 rounded-2xl border border-emerald-300/60 bg-emerald-50/90 p-4 shadow-sm backdrop-blur"
          >
            <CheckCircle2 size={20} className="mt-0.5 text-emerald-600" />
            <div>
              <p className="text-sm font-black text-emerald-700">Shipment saved</p>
              <p className="mt-1 text-sm font-semibold text-emerald-700/90">{successMsg}</p>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <AnimatePresence mode="popLayout">
        {errorMsg ? (
          <motion.div
            key="error"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="flex items-start gap-3 rounded-2xl border border-rose-300/60 bg-rose-50/90 p-4 shadow-sm backdrop-blur"
          >
            <XCircle size={20} className="mt-0.5 text-rose-600" />
            <div>
              <p className="text-sm font-black text-rose-700">Action needed</p>
              <p className="mt-1 text-sm font-semibold text-rose-700/90">{errorMsg}</p>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-12">
        <div className="space-y-6 xl:col-span-8">
          <PremiumCard>
            <SectionHeader
              icon={<ClipboardList size={18} />}
              title={{ en: "Booking Setup", my: "မှတ်တမ်းအချက်အလက်" }}
              subtitle={{
                en: "Set the operational context so routing, billing, and dispatch behave correctly.",
                my: "Routing၊ billing နှင့် dispatch မှန်ကန်စွာ လုပ်ဆောင်နိုင်ရန် booking context ကို သတ်မှတ်ပါ။",
              }}
            />

            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
              <div>
                <FieldLabel label={{ en: "Service Type", my: "ဝန်ဆောင်မှုအမျိုးအစား" }} />
                <PremiumSelect
                  value={form.service_type}
                  onChange={(value) => setField("service_type", value as FormState["service_type"])}
                  options={[
                    { value: "express", label: copyFor(language, "Express", "အမြန်ပို့") },
                    { value: "same_day", label: copyFor(language, "Same-Day", "နေ့ချင်းပြီး") },
                    { value: "next_day", label: copyFor(language, "Next-Day", "နောက်နေ့ပို့") },
                    { value: "scheduled", label: copyFor(language, "Scheduled", "အချိန်သတ်မှတ်") },
                  ]}
                />
                <ErrorText message={fieldErrors.service_type} />
              </div>

              <div>
                <FieldLabel label={{ en: "Priority", my: "ဦးစားပေးအဆင့်" }} />
                <PremiumSelect
                  value={form.priority}
                  onChange={(value) => setField("priority", value as FormState["priority"])}
                  options={[
                    { value: "normal", label: copyFor(language, "Normal", "ပုံမှန်") },
                    { value: "urgent", label: copyFor(language, "Urgent", "အရေးပေါ်") },
                    { value: "vip", label: copyFor(language, "VIP", "အထူး") },
                  ]}
                />
                <ErrorText message={fieldErrors.priority} />
              </div>

              <div>
                <FieldLabel label={{ en: "Reference No", my: "ရည်ညွှန်းနံပါတ်" }} />
                <PremiumInput
                  value={form.booking_reference}
                  onChange={(value) => setField("booking_reference", value)}
                  placeholder="INV-2026-0001"
                  icon={<ClipboardList size={15} />}
                />
              </div>

              <div>
                <FieldLabel label={{ en: "Branch Code", my: "ရုံးခွဲကုဒ်" }} />
                <PremiumInput
                  value={form.branch_code}
                  onChange={(value) => setField("branch_code", value)}
                  placeholder="YGN-HQ"
                  icon={<Building2 size={15} />}
                />
                <ErrorText message={fieldErrors.branch_code} />
              </div>

              <div className="md:col-span-2 xl:col-span-3">
                <FieldLabel
                  label={{ en: "Merchant Account", my: "Merchant အကောင့်" }}
                  helper={{
                    en: form.payment_term === "ACCOUNT" ? "Required for account billing" : "Optional",
                    my:
                      form.payment_term === "ACCOUNT"
                        ? "Account billing အတွက် လိုအပ်သည်"
                        : "မဖြစ်မနေမဟုတ်",
                  }}
                />
                <PremiumInput
                  value={form.merchant_account_id}
                  onChange={(value) => setField("merchant_account_id", value)}
                  placeholder={copyFor(
                    language,
                    "Optional merchant / B2B ID",
                    "ရွေးချယ်ထည့်နိုင်သော merchant ID",
                  )}
                  icon={<User size={15} />}
                />
                <ErrorText message={fieldErrors.merchant_account_id} />
              </div>

              <AnimatePresence initial={false}>
                {form.service_type === "scheduled" ? (
                  <motion.div
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                  >
                    <FieldLabel label={{ en: "Scheduled Date", my: "သတ်မှတ်ရက်" }} />
                    <PremiumInput
                      type="date"
                      value={form.schedule_date}
                      onChange={(value) => setField("schedule_date", value)}
                      placeholder=""
                      icon={<CalendarClock size={15} />}
                    />
                    <ErrorText message={fieldErrors.schedule_date} />
                  </motion.div>
                ) : null}
              </AnimatePresence>
            </div>
          </PremiumCard>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <PremiumCard>
              <SectionHeader
                icon={<MapPin size={18} />}
                title={{ en: "Sender & Pickup", my: "ပေးပို့သူ နှင့် လာယူမည့်နေရာ" }}
                subtitle={{
                  en: "Capture the pickup contact, location, and timing with clean operational detail.",
                  my: "လာယူရန်ဆက်သွယ်ရန်အချက်အလက်၊ နေရာနှင့် အချိန်ကို တိကျစွာဖြည့်သွင်းပါ။",
                }}
              />

              <div className="space-y-5">
                <div>
                  <FieldLabel label={{ en: "Name / Company", my: "အမည် / ကုမ္ပဏီ" }} />
                  <PremiumInput
                    value={form.sender_name}
                    onChange={(value) => setField("sender_name", value)}
                    placeholder={copyFor(language, "Sender name", "ပေးပို့သူအမည်")}
                    icon={<User size={15} />}
                  />
                  <ErrorText message={fieldErrors.sender_name} />
                </div>

                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  <div>
                    <FieldLabel label={{ en: "Primary Phone", my: "ဖုန်းနံပါတ် (၁)" }} />
                    <PremiumInput
                      value={form.sender_phone}
                      onChange={(value) => setField("sender_phone", value)}
                      placeholder="09..."
                      icon={<Smartphone size={15} />}
                    />
                    <ErrorText message={fieldErrors.sender_phone} />
                  </div>
                  <div>
                    <FieldLabel label={{ en: "Alt Phone", my: "ဖုန်းနံပါတ် (၂)" }} />
                    <PremiumInput
                      value={form.sender_alt_phone}
                      onChange={(value) => setField("sender_alt_phone", value)}
                      placeholder={copyFor(language, "Optional", "မဖြစ်မနေမဟုတ်")}
                    />
                    <ErrorText message={fieldErrors.sender_alt_phone} />
                  </div>
                </div>

                <div>
                  <FieldLabel label={{ en: "Township", my: "မြို့နယ်" }} />
                  <PremiumInput
                    value={form.sender_township}
                    onChange={(value) => setField("sender_township", value)}
                    placeholder={copyFor(language, "Township", "မြို့နယ်")}
                  />
                  <ErrorText message={fieldErrors.sender_township} />
                </div>

                <div>
                  <FieldLabel label={senderAddressLabel} />
                  <PremiumTextarea
                    value={form.sender_address}
                    onChange={(value) => setField("sender_address", value)}
                    placeholder={copyFor(language, senderAddressLabel.en, senderAddressLabel.my)}
                  />
                  <ErrorText message={fieldErrors.sender_address} />
                </div>

                <div>
                  <FieldLabel label={{ en: "Landmark / Notes", my: "အနီးအနားမှတ်တိုင် / မှတ်ချက်" }} />
                  <PremiumInput
                    value={form.sender_landmark}
                    onChange={(value) => setField("sender_landmark", value)}
                    placeholder={copyFor(language, "Landmark, gate, floor", "မှတ်တိုင်၊ ဂိတ်၊ အထပ်")}
                  />
                </div>

                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  <div>
                    <FieldLabel label={{ en: "Latitude", my: "လတ္တီတွဒ်" }} />
                    <PremiumInput
                      value={form.sender_lat}
                      onChange={(value) => setField("sender_lat", value)}
                      placeholder="16.8661"
                    />
                    <ErrorText message={fieldErrors.sender_lat} />
                  </div>
                  <div>
                    <FieldLabel label={{ en: "Longitude", my: "လောင်ဂျီတွဒ်" }} />
                    <PremiumInput
                      value={form.sender_lng}
                      onChange={(value) => setField("sender_lng", value)}
                      placeholder="96.1951"
                    />
                    <ErrorText message={fieldErrors.sender_lng} />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  <div>
                    <FieldLabel label={{ en: "Pickup Time (From)", my: "လာယူချိန် (မှ)" }} />
                    <PremiumInput
                      type="time"
                      value={form.pickup_time_from}
                      onChange={(value) => setField("pickup_time_from", value)}
                      placeholder=""
                    />
                  </div>
                  <div>
                    <FieldLabel label={{ en: "Pickup Time (To)", my: "လာယူချိန် (ထိ)" }} />
                    <PremiumInput
                      type="time"
                      value={form.pickup_time_to}
                      onChange={(value) => setField("pickup_time_to", value)}
                      placeholder=""
                    />
                    <ErrorText message={fieldErrors.pickup_time_to} />
                  </div>
                </div>
              </div>
            </PremiumCard>

            <PremiumCard className="border-sky-100 bg-[linear-gradient(180deg,rgba(240,249,255,0.88)_0%,rgba(255,255,255,0.86)_100%)]">
              <SectionHeader
                icon={<MapPin size={18} />}
                title={{ en: "Recipient & Drop-off", my: "လက်ခံသူ နှင့် ပို့မည့်နေရာ" }}
                subtitle={{
                  en: "Design a reliable handoff with destination detail, contact clarity, and timing.",
                  my: "ပို့ဆောင်ရမည့်နေရာ၊ ဆက်သွယ်ရန်အချက်အလက်နှင့် အချိန်ကို တိကျစွာဖြည့်သွင်းပါ။",
                }}
              />

              <div className="space-y-5">
                <div>
                  <FieldLabel label={{ en: "Name / Company", my: "အမည် / ကုမ္ပဏီ" }} />
                  <PremiumInput
                    value={form.recipient_name}
                    onChange={(value) => setField("recipient_name", value)}
                    placeholder={copyFor(language, "Recipient name", "လက်ခံသူအမည်")}
                    icon={<User size={15} />}
                  />
                  <ErrorText message={fieldErrors.recipient_name} />
                </div>

                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  <div>
                    <FieldLabel label={{ en: "Primary Phone", my: "ဖုန်းနံပါတ် (၁)" }} />
                    <PremiumInput
                      value={form.recipient_phone}
                      onChange={(value) => setField("recipient_phone", value)}
                      placeholder="09..."
                      icon={<Smartphone size={15} />}
                    />
                    <ErrorText message={fieldErrors.recipient_phone} />
                  </div>
                  <div>
                    <FieldLabel label={{ en: "Alt Phone", my: "ဖုန်းနံပါတ် (၂)" }} />
                    <PremiumInput
                      value={form.recipient_alt_phone}
                      onChange={(value) => setField("recipient_alt_phone", value)}
                      placeholder={copyFor(language, "Optional", "မဖြစ်မနေမဟုတ်")}
                    />
                    <ErrorText message={fieldErrors.recipient_alt_phone} />
                  </div>
                </div>

                <div>
                  <FieldLabel label={{ en: "Township", my: "မြို့နယ်" }} />
                  <PremiumInput
                    value={form.recipient_township}
                    onChange={(value) => setField("recipient_township", value)}
                    placeholder={copyFor(language, "Township", "မြို့နယ်")}
                  />
                  <ErrorText message={fieldErrors.recipient_township} />
                </div>

                <div>
                  <FieldLabel label={recipientAddressLabel} />
                  <PremiumTextarea
                    value={form.recipient_address}
                    onChange={(value) => setField("recipient_address", value)}
                    placeholder={copyFor(language, recipientAddressLabel.en, recipientAddressLabel.my)}
                  />
                  <ErrorText message={fieldErrors.recipient_address} />
                </div>

                <div>
                  <FieldLabel label={{ en: "Landmark / Notes", my: "အနီးအနားမှတ်တိုင် / မှတ်ချက်" }} />
                  <PremiumInput
                    value={form.recipient_landmark}
                    onChange={(value) => setField("recipient_landmark", value)}
                    placeholder={copyFor(language, "Landmark, gate, floor", "မှတ်တိုင်၊ ဂိတ်၊ အထပ်")}
                  />
                </div>

                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  <div>
                    <FieldLabel label={{ en: "Latitude", my: "လတ္တီတွဒ်" }} />
                    <PremiumInput
                      value={form.recipient_lat}
                      onChange={(value) => setField("recipient_lat", value)}
                      placeholder="16.8661"
                    />
                    <ErrorText message={fieldErrors.recipient_lat} />
                  </div>
                  <div>
                    <FieldLabel label={{ en: "Longitude", my: "လောင်ဂျီတွဒ်" }} />
                    <PremiumInput
                      value={form.recipient_lng}
                      onChange={(value) => setField("recipient_lng", value)}
                      placeholder="96.1951"
                    />
                    <ErrorText message={fieldErrors.recipient_lng} />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  <div>
                    <FieldLabel label={{ en: "Delivery Time (From)", my: "ပို့ချိန် (မှ)" }} />
                    <PremiumInput
                      type="time"
                      value={form.delivery_time_from}
                      onChange={(value) => setField("delivery_time_from", value)}
                      placeholder=""
                    />
                  </div>
                  <div>
                    <FieldLabel label={{ en: "Delivery Time (To)", my: "ပို့ချိန် (ထိ)" }} />
                    <PremiumInput
                      type="time"
                      value={form.delivery_time_to}
                      onChange={(value) => setField("delivery_time_to", value)}
                      placeholder=""
                    />
                    <ErrorText message={fieldErrors.delivery_time_to} />
                  </div>
                </div>
              </div>
            </PremiumCard>
          </div>

          <PremiumCard>
            <SectionHeader
              icon={<Package2 size={18} />}
              title={{ en: "Shipment Details", my: "ကုန်ပစ္စည်းအချက်အလက်" }}
              subtitle={{
                en: "Capture item, weight, dimensions, declared value, and handling rules.",
                my: "ပစ္စည်းအမျိုးအမည်၊ အလေးချိန်၊ အတိုင်းအတာ၊ တန်ဖိုးနှင့် ကိုင်တွယ်မှုစည်းကမ်းများကို တိကျစွာ ဖြည့်သွင်းပါ။",
              }}
            />

            <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
              <div className="md:col-span-2">
                <FieldLabel label={{ en: "Item Description", my: "ပစ္စည်းအမည်" }} />
                <PremiumInput
                  value={form.product_name}
                  onChange={(value) => setField("product_name", value)}
                  placeholder={copyFor(language, "E.g. clothing, cosmetics", "ဥပမာ - အဝတ်အထည်၊ အလှကုန်")}
                  icon={<Boxes size={15} />}
                />
                <ErrorText message={fieldErrors.product_name} />
              </div>

              <div>
                <FieldLabel label={{ en: "Category", my: "အမျိုးအစား" }} />
                <PremiumSelect
                  value={form.product_category}
                  onChange={(value) => setField("product_category", value)}
                  options={[
                    { value: "General", label: "General" },
                    { value: "Document", label: "Document" },
                    { value: "Electronics", label: "Electronics" },
                    { value: "Fashion", label: "Fashion" },
                    { value: "Food / Perishable", label: "Food / Perishable" },
                    { value: "Healthcare", label: "Healthcare" },
                  ]}
                />
                <ErrorText message={fieldErrors.product_category} />
              </div>

              <div>
                <FieldLabel label={{ en: "Actual Weight (kg)", my: "အမှန်တကယ်အလေးချိန် (kg)" }} />
                <PremiumInput
                  type="number"
                  value={form.product_weight}
                  onChange={(value) => setField("product_weight", value)}
                  placeholder="0.0"
                />
                <ErrorText message={fieldErrors.product_weight} />
              </div>

              <div>
                <FieldLabel label={{ en: "Units", my: "အရေအတွက်" }} />
                <PremiumInput
                  type="number"
                  value={form.product_qty}
                  onChange={(value) => setField("product_qty", value)}
                  placeholder="1"
                />
                <ErrorText message={fieldErrors.product_qty} />
              </div>

              <div>
                <FieldLabel label={{ en: "Packages / Pieces", my: "အထုပ်အရေအတွက်" }} />
                <PremiumInput
                  type="number"
                  value={form.package_count}
                  onChange={(value) => setField("package_count", value)}
                  placeholder="1"
                />
                <ErrorText message={fieldErrors.package_count} />
              </div>

              <div>
                <FieldLabel label={{ en: "Declared Value (MMK)", my: "ပစ္စည်းတန်ဖိုး (MMK)" }} />
                <PremiumInput
                  type="number"
                  value={form.declared_value_mmks}
                  onChange={(value) => setField("declared_value_mmks", value)}
                  placeholder="0"
                />
                <ErrorText message={fieldErrors.declared_value_mmks} />
              </div>
            </div>

            <div className="mt-5 rounded-[24px] border border-slate-200 bg-[linear-gradient(180deg,#fbfdff_0%,#f7fafc_100%)] p-5 shadow-inner">
              <div className="mb-4">
                <BilingualText
                  text={{
                    en: "Dimensions & Weight Logic",
                    my: "အတိုင်းအတာနှင့် အလေးချိန်တွက်ချက်မှု",
                  }}
                  className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400"
                  secondaryClassName="mt-2 text-sm font-medium text-slate-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4 xl:grid-cols-5">
                <div>
                  <FieldLabel label={{ en: "Length", my: "အလျား" }} />
                  <PremiumInput
                    type="number"
                    value={form.product_length_cm}
                    onChange={(value) => setField("product_length_cm", value)}
                    placeholder="L"
                  />
                  <ErrorText message={fieldErrors.product_length_cm} />
                </div>
                <div>
                  <FieldLabel label={{ en: "Width", my: "အနံ" }} />
                  <PremiumInput
                    type="number"
                    value={form.product_width_cm}
                    onChange={(value) => setField("product_width_cm", value)}
                    placeholder="W"
                  />
                  <ErrorText message={fieldErrors.product_width_cm} />
                </div>
                <div>
                  <FieldLabel label={{ en: "Height", my: "အမြင့်" }} />
                  <PremiumInput
                    type="number"
                    value={form.product_height_cm}
                    onChange={(value) => setField("product_height_cm", value)}
                    placeholder="H"
                  />
                  <ErrorText message={fieldErrors.product_height_cm} />
                </div>

                <MetricCard
                  label={{ en: "Volumetric", my: "ထုထည်အလေးချိန်" }}
                  value={`${volWeight.toFixed(2)} kg`}
                />
                <MetricCard
                  label={{ en: "Chargeable", my: "တွက်ချက်အလေးချိန်" }}
                  value={`${chargeableWeight.toFixed(2)} kg`}
                />
              </div>
            </div>

            <div className="mt-5 grid grid-cols-1 gap-5 md:grid-cols-2">
              <ToggleRow
                title={{ en: "Fragile shipment", my: "ကွဲလွယ်သောပစ္စည်း" }}
                description={{
                  en: "Mark this shipment for careful handling and rider awareness.",
                  my: "ဂရုတစိုက်ကိုင်တွယ်ရန်အတွက် shipment ကို မှတ်သားပါ။",
                }}
                checked={form.fragile}
                onChange={(next) => setField("fragile", next)}
              />

              <div>
                <FieldLabel label={{ en: "Special Handling", my: "အထူးကိုင်တွယ်ရန်" }} />
                <PremiumInput
                  value={form.special_handling}
                  onChange={(value) => setField("special_handling", value)}
                  placeholder={copyFor(language, "Keep upright / cold chain / etc.", "တည့်တည့်ထား / အအေးထိန်း / စသည်")}
                />
              </div>
            </div>

            <div className="mt-5">
              <FieldLabel label={{ en: "Internal Remarks", my: "အတွင်းရေးမှတ်ချက်" }} />
              <PremiumTextarea
                value={form.rider_remark}
                onChange={(value) => setField("rider_remark", value)}
                placeholder={copyFor(language, "Operations, pickup or delivery notes", "လုပ်ငန်းဆိုင်ရာ မှတ်ချက်များ")}
              />
            </div>
          </PremiumCard>
        </div>

        <div className="space-y-6 xl:col-span-4 xl:sticky xl:top-6 xl:self-start">
          <DarkPremiumCard>
            <div className="flex items-start justify-between gap-4 border-b border-white/10 pb-5">
              <div>
                <BilingualText
                  text={{ en: "Settlement & Collection", my: "ငွေတောင်းခံမှု နှင့် စာရင်းရှင်းလင်းမှု" }}
                  className="text-2xl font-black tracking-tight text-white"
                  secondaryClassName="mt-2 text-sm font-medium leading-6 text-white/55"
                />
              </div>
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/10 text-[#ffd700]">
                <Banknote size={20} />
              </span>
            </div>

            <div className="mt-5 space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <FieldLabel tone="light" label={{ en: "Payment Term", my: "ငွေချေစနစ်" }} />
                  <PremiumSelect
                    dark
                    value={form.payment_term}
                    onChange={(value) => setField("payment_term", value as FormState["payment_term"])}
                    options={[
                      { value: "COD", label: "COD" },
                      { value: "PREPAID", label: "Prepaid" },
                      { value: "ACCOUNT", label: "Account" },
                    ]}
                  />
                  <ErrorText message={fieldErrors.payment_term} />
                </div>
                <div>
                  <FieldLabel tone="light" label={{ en: "Payer", my: "ပို့ခပေးမည့်သူ" }} />
                  <PremiumSelect
                    dark
                    value={form.payer_type}
                    onChange={(value) => setField("payer_type", value as FormState["payer_type"])}
                    options={[
                      { value: "recipient", label: "Recipient" },
                      { value: "sender", label: "Sender" },
                      { value: "merchant", label: "Merchant" },
                      { value: "account", label: "Account" },
                    ]}
                  />
                  <ErrorText message={fieldErrors.payer_type} />
                </div>
              </div>

              <div className="space-y-4 rounded-[24px] border border-white/10 bg-white/[0.04] p-4">
                <div>
                  <FieldLabel tone="light" label={{ en: "Delivery Fee", my: "ပို့ဆောင်ခ" }} />
                  <PremiumInput
                    dark
                    type="number"
                    value={form.delivery_fee_mmks}
                    onChange={(value) => setField("delivery_fee_mmks", value)}
                    placeholder="0"
                  />
                  <ErrorText message={fieldErrors.delivery_fee_mmks} />
                </div>

                <div>
                  <FieldLabel tone="light" label={{ en: "Weight Surcharge", my: "အလေးချိန်ပိုကြေး" }} />
                  <PremiumInput
                    dark
                    type="number"
                    value={form.extra_weight_charges}
                    onChange={(value) => setField("extra_weight_charges", value)}
                    placeholder="0"
                  />
                  <ErrorText message={fieldErrors.extra_weight_charges} />
                </div>

                <div>
                  <FieldLabel tone="light" label={{ en: "Insurance", my: "အာမခံ" }} />
                  <PremiumInput
                    dark
                    type="number"
                    value={form.insurance_fee_mmks}
                    onChange={(value) => setField("insurance_fee_mmks", value)}
                    placeholder="0"
                  />
                  <ErrorText message={fieldErrors.insurance_fee_mmks} />
                </div>

                <div>
                  <FieldLabel tone="light" label={{ en: "Discount", my: "လျှော့ပေးငွေ" }} />
                  <PremiumInput
                    dark
                    type="number"
                    value={form.discount_mmks}
                    onChange={(value) => setField("discount_mmks", value)}
                    placeholder="0"
                  />
                  <ErrorText message={fieldErrors.discount_mmks} />
                </div>

                <div>
                  <FieldLabel tone="light" label={{ en: "COD Amount", my: "COD ငွေပမာဏ" }} />
                  <PremiumInput
                    dark
                    type="number"
                    value={form.cod_amount_mmks}
                    onChange={(value) => setField("cod_amount_mmks", value)}
                    placeholder="0"
                  />
                  <ErrorText message={fieldErrors.cod_amount_mmks} />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4">
                <MetricCard
                  label={{ en: "Charge Subtotal", my: "စုစုပေါင်းပို့ခ" }}
                  value={`${formatMoney(chargeSubtotal, currencyLocale)} Ks`}
                />
                <MetricCard
                  label={{ en: "Total to Collect", my: "စုစုပေါင်းကောက်ခံရန်" }}
                  value={`${formatMoney(totalToCollect, currencyLocale)} Ks`}
                />
              </div>
            </div>
          </DarkPremiumCard>

          <PremiumCard>
            <SectionHeader
              icon={<ShieldCheck size={18} />}
              title={{ en: "Proof & Dispatch Controls", my: "ပို့ဆောင်မှုထိန်းချုပ်မှု" }}
              subtitle={{
                en: "Set delivery proof, fallback behavior, and execution settings.",
                my: "ပို့ဆောင်ပြီးကြောင်း သက်သေ၊ ပြန်လည်လုပ်ဆောင်ရမည့်လုပ်ငန်းစဉ်နှင့် execution settings များကို သတ်မှတ်ပါ။",
              }}
            />

            <div className="space-y-5">
              <div>
                <FieldLabel label={{ en: "Proof of Delivery", my: "ပို့ဆောင်ပြီးကြောင်း သက်သေ" }} />
                <PremiumSelect
                  value={form.pod_type}
                  onChange={(value) => setField("pod_type", value as FormState["pod_type"])}
                  options={[
                    { value: "signature", label: "Signature Required" },
                    { value: "photo", label: "Photo Proof" },
                    { value: "pin", label: "OTP / PIN" },
                    { value: "barcode", label: "Barcode Scan" },
                    { value: "id_check", label: "ID Check" },
                    { value: "none", label: "No Proof" },
                  ]}
                />
                <ErrorText message={fieldErrors.pod_type} />
              </div>

              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <div>
                  <FieldLabel label={{ en: "Vehicle", my: "ယာဉ်အမျိုးအစား" }} />
                  <PremiumSelect
                    value={form.preferred_vehicle}
                    onChange={(value) =>
                      setField("preferred_vehicle", value as FormState["preferred_vehicle"])
                    }
                    options={[
                      { value: "bike", label: "Motorbike" },
                      { value: "car", label: "Car" },
                      { value: "van", label: "Van" },
                      ...(deliveryMode === "office_to_office"
                        ? [{ value: "office_transfer", label: "Office Transfer" }]
                        : []),
                    ]}
                  />
                  <ErrorText message={fieldErrors.preferred_vehicle} />
                </div>

                <div>
                  <FieldLabel label={{ en: "Dispatch", my: "ချထားပေးမှု" }} />
                  <PremiumSelect
                    value={form.dispatch_mode}
                    onChange={(value) => setField("dispatch_mode", value as FormState["dispatch_mode"])}
                    options={[
                      { value: "auto", label: "Auto-Assign" },
                      { value: "manual", label: "Manual Select" },
                    ]}
                  />
                  <ErrorText message={fieldErrors.dispatch_mode} />
                </div>
              </div>

              <div className="space-y-3">
                <ToggleRow
                  title={{ en: "Contactless drop-off", my: "လူမတွေ့ဘဲ ချထားနိုင်သည်" }}
                  description={{
                    en: "Allow handoff without face-to-face interaction when appropriate.",
                    my: "လိုအပ်သည့်အခါ လူမတွေ့ဘဲ ပို့ဆောင်ခွင့်ပြုပါ။",
                  }}
                  checked={form.contactless_ok}
                  onChange={(next) => setField("contactless_ok", next)}
                />
                <ToggleRow
                  title={{ en: "Return if delivery fails", my: "မအောင်မြင်လျှင် ပြန်ပို့မည်" }}
                  description={{
                    en: "Automatically instruct the rider to return the shipment when delivery cannot be completed.",
                    my: "ပို့ဆောင်မှုမအောင်မြင်ပါက rider ကို ပြန်ပို့ရန်ညွှန်ကြားပါ။",
                  }}
                  checked={form.return_if_failed}
                  onChange={(next) => setField("return_if_failed", next)}
                />
                <ToggleRow
                  title={{ en: "Send tracking SMS", my: "Tracking SMS ပို့မည်" }}
                  description={{
                    en: "Notify recipient and sender with tracking updates.",
                    my: "ပို့ဆောင်မှုအခြေအနေကို sender နှင့် recipient ထံသို့ SMS ဖြင့်ပို့ပါ။",
                  }}
                  checked={form.send_tracking_sms}
                  onChange={(next) => setField("send_tracking_sms", next)}
                />
                <ToggleRow
                  title={{ en: "Print label after save", my: "သိမ်းပြီး Label ထုတ်မည်" }}
                  description={{
                    en: "Open print flow immediately after a successful create action.",
                    my: "Create လုပ်ပြီးနောက် print flow ကို ချက်ချင်းဖွင့်ပါ။",
                  }}
                  checked={form.print_label_after_create}
                  onChange={(next) => setField("print_label_after_create", next)}
                />
              </div>
            </div>
          </PremiumCard>

          <PremiumCard>
            <div className="flex items-start justify-between gap-3 border-b border-slate-200/80 pb-5">
              <div>
                <BilingualText
                  text={{ en: "Ready to Save", my: "သိမ်းဆည်းရန်အဆင်သင့်" }}
                  className="text-xl font-black text-[#0d2c54]"
                  secondaryClassName="mt-2 text-sm font-medium leading-6 text-slate-500"
                />
              </div>
              <span className="rounded-2xl border border-slate-200 bg-white p-3 text-[#0d2c54] shadow-sm">
                <WalletCards size={18} />
              </span>
            </div>

            {fieldErrors.general ? (
              <div className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3">
                <p className="text-sm font-semibold text-rose-600">{fieldErrors.general}</p>
              </div>
            ) : null}

            <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className={loading ? "pointer-events-none opacity-60" : ""}>
                <ActionButton onClick={() => handleAction("draft")}>
                  <Save size={16} />
                  {loadingAction === "draft"
                    ? copyFor(language, "Saving...", "သိမ်းနေသည်...")
                    : copyFor(language, "Save Draft", "Draft သိမ်းမည်")}
                </ActionButton>
              </div>

              <div className={loading ? "pointer-events-none opacity-60" : ""}>
                <ActionButton onClick={() => handleAction(form.print_label_after_create ? "print" : "submit")}>
                  {form.print_label_after_create ? <Printer size={16} /> : <Truck size={16} />}
                  {loadingAction === "print" || loadingAction === "submit"
                    ? copyFor(language, "Creating...", "ဖန်တီးနေသည်...")
                    : form.print_label_after_create
                      ? copyFor(language, "Create & Print", "ဖန်တီးပြီး ထုတ်မည်")
                      : copyFor(language, "Create Order", "Order ဖန်တီးမည်")}
                </ActionButton>
              </div>
            </div>

            <div className="mt-4 rounded-2xl border border-slate-200 bg-white/80 p-4 shadow-sm">
              <div className="flex items-start gap-3">
                <AlertCircle size={18} className="mt-0.5 text-slate-400" />
                <div>
                  <BilingualText
                    text={{ en: "Operator Guidance", my: "အသုံးပြုသူညွှန်ကြားချက်" }}
                    className="text-sm font-bold text-[#0d2c54]"
                    secondaryClassName="mt-2 text-sm font-medium leading-6 text-slate-500"
                  />
                </div>
              </div>
            </div>
          </PremiumCard>
        </div>
      </div>
    </EnterprisePage>
  );
}