export type LanguageCode = "en" | "my";

export type ShipmentStatus =
  | "draft"
  | "quoted"
  | "booked"
  | "awaiting_assignment"
  | "assigned_for_pickup"
  | "picked_up"
  | "at_origin_branch"
  | "in_linehaul"
  | "at_destination_branch"
  | "assigned_for_delivery"
  | "out_for_delivery"
  | "delivered"
  | "delivery_failed"
  | "returned"
  | "cancelled";

export interface ShipmentSummary {
  id: string;
  trackingNumber: string;
  status: ShipmentStatus;
  senderName: string;
  recipientName: string;
  recipientPhone: string;
  serviceType: "same_day" | "next_day" | "standard";
  codAmountMmks: number;
  lastUpdatedAt: string;
}

export interface Dictionary {
  common: {
    appName: string;
    language: string;
    trackShipment: string;
    createShipment: string;
    logout: string;
  };
  customer: {
    heroTitle: string;
    heroSubtitle: string;
    enterTracking: string;
  };
  courier: {
    myJobs: string;
    scanWaybill: string;
    completeDelivery: string;
  };
  admin: {
    dashboard: string;
    dispatchBoard: string;
    printWaybill: string;
  };
}


export type WaybillPrintFormat =
  | "4x6_single"
  | "4x3_two_up_on_4x6"
  | "a4_single"
  | "a4_batch"
  | "a5_single"
  | "a5_batch";

export interface WaybillPrintJob {
  shipmentId: string;
  trackingNumber: string;
  waybillNumber: string;
  format: WaybillPrintFormat;
  copies: number;
  batchName?: string;
}

export interface QuoteRequest {
  pickupTownship: string;
  deliveryTownship: string;
  serviceType: "same_day" | "next_day" | "standard";
  parcelWeightKg: number;
  codAmountMmks?: number;
  declaredValueMmks?: number;
  fragile?: boolean;
}

export interface QuoteResponse {
  baseFeeMmks: number;
  fuelSurchargeMmks: number;
  handlingFeeMmks: number;
  codFeeMmks: number;
  totalFeeMmks: number;
  etaLabel: string;
}
