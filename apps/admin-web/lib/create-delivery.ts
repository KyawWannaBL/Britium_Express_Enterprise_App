
export type LanguageCode = "en" | "my";
export type ServiceType = "same_day" | "next_day" | "standard";

export type AddressInput = {
  label?: string;
  contactName: string;
  phoneE164: string;
  addressLine1: string;
  addressLine2?: string;
  ward?: string;
  township: string;
  city: string;
  stateRegion?: string;
  postalCode?: string;
  landmark?: string;
  latitude?: number | null;
  longitude?: number | null;
};

export type CustomerInput = {
  fullName: string;
  phoneE164: string;
  companyName?: string;
  email?: string;
  preferredLanguage?: LanguageCode;
  customerType?: "individual" | "merchant" | "business";
  notes?: string;
};

export type QuoteRequestInput = {
  customer?: CustomerInput;
  senderAddress: AddressInput;
  recipientAddress: AddressInput;
  serviceType: ServiceType;
  parcelWeightKg: number;
  pieces?: number;
  parcelType?: string;
  codAmountMmks?: number;
  declaredValueMmks?: number;
  fragile?: boolean;
};

export type BookingInput = QuoteRequestInput & {
  customer: CustomerInput;
  preferredPickupDate?: string | null;
  preferredTimeSlot?: string | null;
  specialInstructions?: string | null;
  branchCode?: string | null;
  createdByProfileId?: string | null;
};

const CITY_ZONE_SURCHARGE: Record<string, number> = {
  Yangon: 0,
  Mandalay: 800,
  Naypyitaw: 1200
};

export function normalizePhone(phone: string) {
  const trimmed = phone.trim();
  if (trimmed.startsWith("+")) {
    return trimmed;
  }
  if (trimmed.startsWith("09")) {
    return `+959${trimmed.slice(2)}`;
  }
  if (trimmed.startsWith("959")) {
    return `+${trimmed}`;
  }
  return trimmed;
}

export function normalizeText(value: string) {
  return value.trim().replace(/\s+/g, " ");
}

export function estimateCreateDeliveryQuote(input: QuoteRequestInput) {
  const weight = Number(input.parcelWeightKg || 0);
  const pieces = Math.max(1, Number(input.pieces || 1));
  const baseByService = {
    same_day: 6500,
    next_day: 4500,
    standard: 3000
  } satisfies Record<ServiceType, number>;

  const pickupCity = normalizeText(input.senderAddress.city || "Yangon");
  const dropCity = normalizeText(input.recipientAddress.city || pickupCity);
  const crossCity = pickupCity.toLowerCase() !== dropCity.toLowerCase();
  const routeCode = `${pickupCity.slice(0, 3).toUpperCase()}-${dropCity.slice(0, 3).toUpperCase()}`;

  const base = baseByService[input.serviceType];
  const distanceSurcharge = crossCity ? 2000 : 0;
  const citySurcharge = (CITY_ZONE_SURCHARGE[dropCity] || 0) + (crossCity ? 500 : 0);
  const weightSurcharge = Math.max(0, Math.ceil(weight - 1)) * 700;
  const fragileFee = input.fragile ? 1000 : 0;
  const fuelSurcharge = Math.round((base + distanceSurcharge) * 0.08);
  const insuranceFee = Math.round(Number(input.declaredValueMmks || 0) * 0.005);
  const subtotal = base + distanceSurcharge + citySurcharge + weightSurcharge + fragileFee;
  const total = subtotal + fuelSurcharge + insuranceFee;

  return {
    serviceType: input.serviceType,
    currency: "MMK" as const,
    routeCode,
    pieces,
    parcelWeightKg: weight,
    baseFeeMmks: base,
    distanceSurchargeMmks: distanceSurcharge,
    citySurchargeMmks: citySurcharge,
    weightSurchargeMmks: weightSurcharge,
    fragileFeeMmks: fragileFee,
    fuelSurchargeMmks: fuelSurcharge,
    insuranceFeeMmks: insuranceFee,
    totalFeeMmks: total,
    expiresAt: new Date(Date.now() + 1000 * 60 * 15).toISOString()
  };
}

export function buildTrackingNumber(branchCode = "YGN", serviceType: ServiceType = "standard") {
  const stamp = Date.now().toString().slice(-8);
  const suffix = serviceType === "same_day" ? "SD" : serviceType === "next_day" ? "ND" : "ST";
  return `${branchCode.toUpperCase()}${stamp}${suffix}`;
}

export function buildWaybillNumber(trackingNumber: string) {
  return `WB-${trackingNumber}`;
}

export function buildQrPayload(
  input: string | { trackingNumber?: string; tracking_number?: string; waybillNumber?: string; waybill_number?: string; shipmentId?: string; shipment_id?: string },
  maybeWaybillNumber?: string
) {
  const trackingNumber =
    typeof input === "string"
      ? input
      : input.trackingNumber ?? input.tracking_number ?? "";
  const waybillNumber =
    typeof input === "string"
      ? maybeWaybillNumber ?? ""
      : input.waybillNumber ?? input.waybill_number ?? maybeWaybillNumber ?? "";

  return JSON.stringify({
    trackingNumber,
    waybillNumber
  });
}

export function buildAddressLabel(address: AddressInput) {
  return [address.contactName, address.addressLine1, address.township, address.city].filter(Boolean).join(", ");
}

export function inferBranchCode(city: string) {
  const normalized = normalizeText(city).toLowerCase();
  if (normalized.includes("mandalay")) return "MDY-HUB";
  if (normalized.includes("naypyitaw")) return "NPT-HUB";
  return "YGN-HQ";
}
