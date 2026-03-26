export type WaybillFormat =
  | "4x6_single"
  | "4x3_two_up_on_4x6"
  | "a4_single"
  | "a4_batch"
  | "a5_single"
  | "a5_batch";

export type WaybillRecord = {
  shipmentId: string;
  trackingNumber: string;
  waybillNumber: string;
  merchantName: string;
  merchantPhone: string;
  merchantAddress: string;
  recipientName: string;
  recipientPhonePrimary: string;
  recipientPhoneSecondary?: string;
  recipientAddress: string;
  serviceLabelEn: string;
  serviceLabelMy: string;
  deliveryTypeLabelEn: string;
  deliveryTypeLabelMy: string;
  cbm: string;
  itemPriceMmks: number;
  weightKg: string;
  deliveryFeeMmks: number;
  prepaidToOsMmks: number;
  codAmountMmks: number;
  remarks: string;
  qrToken: string;
  printedAt: string;
};

export const waybillReference: WaybillRecord = {
  shipmentId: "shp_demo_001",
  trackingNumber: "YGN119874YGN",
  waybillNumber: "YGN119874YGN",
  merchantName: "Mee Lay",
  merchantPhone: "09796491867",
  merchantAddress: "Address",
  recipientName: "မေမြင့်စန္ဒာ",
  recipientPhonePrimary: "09792970776",
  recipientPhoneSecondary: "09792970776",
  recipientAddress: "Recipient Address Test 1",
  serviceLabelEn: "Normal",
  serviceLabelMy: "ပုံမှန်",
  deliveryTypeLabelEn: "COD",
  deliveryTypeLabelMy: "အရောက်ငွေချေ",
  cbm: "1",
  itemPriceMmks: 120000,
  weightKg: "≤5",
  deliveryFeeMmks: 5000,
  prepaidToOsMmks: 100000,
  codAmountMmks: 25000,
  remarks: "Input Any Remarks",
  qrToken: "YGN119874YGN",
  printedAt: "2026-03-02 01:26:07"
};

export const batchWaybills: WaybillRecord[] = [
  waybillReference,
  {
    ...waybillReference,
    shipmentId: "shp_demo_002",
    trackingNumber: "MDY448812MDY",
    waybillNumber: "MDY448812MDY",
    recipientName: "ကိုလင်းထက်",
    recipientAddress: "78 Street, Chanayethazan, Mandalay",
    recipientPhonePrimary: "09974400111",
    recipientPhoneSecondary: "09974400112",
    deliveryFeeMmks: 4500,
    codAmountMmks: 18000,
    qrToken: "MDY448812MDY"
  },
  {
    ...waybillReference,
    shipmentId: "shp_demo_003",
    trackingNumber: "NPT220118NPT",
    waybillNumber: "NPT220118NPT",
    recipientName: "ဒေါ်သီတာ",
    recipientAddress: "Zabuthiri Township, Naypyitaw",
    recipientPhonePrimary: "09771199220",
    recipientPhoneSecondary: "09771199221",
    deliveryFeeMmks: 5500,
    codAmountMmks: 40000,
    qrToken: "NPT220118NPT"
  }
];

export const printFormats: Array<{
  code: WaybillFormat;
  title: string;
  subtitle: string;
}> = [
  { code: "4x6_single", title: "4 x 6 in", subtitle: "Single thermal label" },
  { code: "4x3_two_up_on_4x6", title: "4 x 3 in × 2", subtitle: "Two labels on one 4 x 6 sheet" },
  { code: "a4_single", title: "A4 single", subtitle: "One full-page waybill" },
  { code: "a4_batch", title: "A4 batch", subtitle: "Paginated bulk printing" },
  { code: "a5_single", title: "A5 single", subtitle: "Half-page branch counter print" },
  { code: "a5_batch", title: "A5 batch", subtitle: "Two-up operational printing" }
];

export function estimateQuote(input: {
  pickupTownship: string;
  deliveryTownship: string;
  serviceType: "same_day" | "next_day" | "standard";
  parcelWeightKg: number;
  codAmountMmks?: number;
  fragile?: boolean;
}) {
  const zoneMultiplier = input.pickupTownship === input.deliveryTownship ? 1 : 1.24;
  const serviceBase =
    input.serviceType === "same_day" ? 5200 : input.serviceType === "next_day" ? 3700 : 2800;
  const weightFee = Math.max(0, Math.ceil(input.parcelWeightKg - 1)) * 800;
  const fragileFee = input.fragile ? 1500 : 0;
  const codFee = input.codAmountMmks ? Math.min(5000, Math.round(input.codAmountMmks * 0.0125)) : 0;
  const baseFeeMmks = Math.round((serviceBase + weightFee + fragileFee) * zoneMultiplier);
  const fuelSurchargeMmks = Math.round(baseFeeMmks * 0.08);
  const handlingFeeMmks = 500;
  const totalFeeMmks = baseFeeMmks + fuelSurchargeMmks + handlingFeeMmks + codFee;
  const etaLabel =
    input.serviceType === "same_day" ? "Today 14:00 - 18:00" :
    input.serviceType === "next_day" ? "Next business day" :
    "Standard 1-2 days";
  return { baseFeeMmks, fuelSurchargeMmks, handlingFeeMmks, codFeeMmks: codFee, totalFeeMmks, etaLabel };
}
