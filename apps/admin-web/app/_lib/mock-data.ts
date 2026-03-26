
export type DualText = { en: string; my: string };

export type DeliveryStage = {
  title: DualText;
  detail: DualText;
  eta: string;
};

export type RouteStop = {
  order: number;
  stopCode: string;
  township: string;
  shipmentCount: number;
  eta: string;
  status: "Ready" | "At Risk" | "Locked";
};

export type FinancialRow = {
  branch: string;
  bookedMmk: string;
  codMmk: string;
  settlementMmk: string;
  varianceMmk: string;
  status: "Balanced" | "Review" | "Delayed";
};

export type AddressCandidate = {
  code: string;
  labelEn: string;
  labelMy: string;
  township: string;
  zone: string;
  eta: string;
  confidence: string;
  serviceable: boolean;
};

export type CustomerRecord = {
  code: string;
  name: string;
  segment: string;
  phone: string;
  city: string;
  shipments30d: number;
  codMmk: string;
  status: "VIP" | "Active" | "Review";
};

export type QuoteOption = {
  code: string;
  labelEn: string;
  labelMy: string;
  feeMmk: string;
  eta: string;
  features: string[];
  featured?: boolean;
};

export type PrintMode = {
  key: string;
  title: string;
  subtitle: string;
  size: string;
  note: string;
};

export const deliveryStages: DeliveryStage[] = [
  {
    title: { en: "Address verified", my: "လိပ်စာ အတည်ပြုပြီး" },
    detail: { en: "Township, zone, and hub path validated before booking.", my: "Township၊ zone နှင့် hub လမ်းကြောင်းကို booking မတင်မီ စစ်ဆေးထားသည်။" },
    eta: "00:15"
  },
  {
    title: { en: "Waybill prepared", my: "Waybill အဆင်သင့်" },
    detail: { en: "QR payload, barcode, and print formats rendered from one source.", my: "QR payload၊ barcode နှင့် print format များကို source တစ်ခုတည်းမှ ထုတ်ပေးသည်။" },
    eta: "00:40"
  },
  {
    title: { en: "Pickup dispatched", my: "Pickup ပို့ဆောင်ရန် ချထားပြီး" },
    detail: { en: "Courier app receives pickup order with map guidance and scan checklist.", my: "Courier app တွင် map guidance နှင့် scan checklist ပါသော pickup order ရရှိမည်။" },
    eta: "01:05"
  }
];

export const routeStops: RouteStop[] = [
  { order: 1, stopCode: "YGN-HQ", township: "Bahan", shipmentCount: 26, eta: "08:15", status: "Locked" },
  { order: 2, stopCode: "YGN-SD", township: "South Dagon", shipmentCount: 13, eta: "09:05", status: "Ready" },
  { order: 3, stopCode: "YGN-NOK", township: "North Okkalapa", shipmentCount: 19, eta: "10:00", status: "At Risk" },
  { order: 4, stopCode: "MDY-CN1", township: "Chanayethazan", shipmentCount: 11, eta: "14:20", status: "Ready" }
];

export const financialRows: FinancialRow[] = [
  { branch: "Yangon HQ", bookedMmk: "54,200,000", codMmk: "21,400,000", settlementMmk: "20,980,000", varianceMmk: "420,000", status: "Review" },
  { branch: "Mandalay Hub", bookedMmk: "31,880,000", codMmk: "12,600,000", settlementMmk: "12,600,000", varianceMmk: "0", status: "Balanced" },
  { branch: "Naypyitaw Gateway", bookedMmk: "16,540,000", codMmk: "8,300,000", settlementMmk: "7,960,000", varianceMmk: "340,000", status: "Delayed" }
];

export const waybillEvents = [
  {
    time: "07:52",
    title: "WBX-240326-00081 generated",
    detail: "QR label rendered, A6 thermal print sent to counter printer."
  },
  {
    time: "08:06",
    title: "Pickup scan confirmed",
    detail: "Courier device BE-RIDER-09 captured parcel handoff with checksum validation."
  },
  {
    time: "09:14",
    title: "Route plan re-optimized",
    detail: "Mapbox optimization inserted urgent stop in North Okkalapa with 12 minute detour."
  },
  {
    time: "15:22",
    title: "Delivery proof closed",
    detail: "OTP accepted, signature vector stored, cash collection pending settlement."
  }
];

export const addressCandidates: AddressCandidate[] = [
  {
    code: "ADDR-YGN-001",
    labelEn: "No. 28, Kaba Aye Pagoda Road, Bahan Township, Yangon",
    labelMy: "အမှတ် ၂၈၊ ကမ္ဘာအေးဘုရားလမ်း၊ ဗဟန်းမြို့နယ်၊ ရန်ကုန်",
    township: "Bahan",
    zone: "Yangon Core A",
    eta: "Same day 4h",
    confidence: "98%",
    serviceable: true
  },
  {
    code: "ADDR-YGN-093",
    labelEn: "No. 56, Waizayantar Road, South Okkalapa, Yangon",
    labelMy: "အမှတ် ၅၆၊ ဝေဇယန္တာလမ်း၊ တောင်ဥက္ကလာပ၊ ရန်ကုန်",
    township: "South Okkalapa",
    zone: "Yangon East B",
    eta: "Next wave 6h",
    confidence: "92%",
    serviceable: true
  },
  {
    code: "ADDR-MDY-021",
    labelEn: "62nd Street, Chanayethazan, Mandalay",
    labelMy: "၆၂လမ်း၊ ချမ်းအေးသာစံမြို့နယ်၊ မန္တလေး",
    township: "Chanayethazan",
    zone: "Mandalay Grid 1",
    eta: "Next day 09:30",
    confidence: "87%",
    serviceable: true
  }
];

export const customerRecords: CustomerRecord[] = [
  {
    code: "CUS-00128",
    name: "Aung Min Trading Co., Ltd.",
    segment: "Merchant Gold",
    phone: "+95 9 421 112 233",
    city: "Yangon",
    shipments30d: 184,
    codMmk: "12,800,000",
    status: "VIP"
  },
  {
    code: "CUS-00844",
    name: "Daw Ei Mon",
    segment: "Retail",
    phone: "+95 9 798 221 445",
    city: "Yangon",
    shipments30d: 7,
    codMmk: "0",
    status: "Active"
  },
  {
    code: "CUS-00911",
    name: "Shwe Moe Fashion",
    segment: "Merchant Silver",
    phone: "+95 9 250 667 190",
    city: "Mandalay",
    shipments30d: 46,
    codMmk: "3,240,000",
    status: "Review"
  }
];

export const quoteOptions: QuoteOption[] = [
  {
    code: "SAME_DAY",
    labelEn: "Same Day Priority",
    labelMy: "နေ့ချင်းပြီး Priority",
    feeMmk: "9,500",
    eta: "4h promise",
    features: ["Real-time tracking", "2 delivery attempts", "Priority dispatch"],
    featured: true
  },
  {
    code: "NEXT_DAY",
    labelEn: "Next Day Standard",
    labelMy: "နောက်နေ့ Standard",
    feeMmk: "5,800",
    eta: "Next business day",
    features: ["Branch transfer", "QR track-and-trace", "Customer SMS alerts"]
  },
  {
    code: "ECONOMY",
    labelEn: "Economy Saver",
    labelMy: "Economy Saver",
    feeMmk: "4,200",
    eta: "2-3 business days",
    features: ["Batch routing", "Merchant optimized", "A4 manifest support"]
  }
];

export const printModes: PrintMode[] = [
  {
    key: "4x6-single",
    title: "4 x 6 in single waybill",
    subtitle: "Normal thermal label",
    size: "101.6mm x 152.4mm",
    note: "Best for counter printers and direct pouch application."
  },
  {
    key: "4x6-double",
    title: "2-up 4 x 3 in on 4 x 6 sheet",
    subtitle: "Two waybills on one label stock",
    size: "Each label 101.6mm x 76.2mm",
    note: "Split-cut mode for hard-to-source media."
  },
  {
    key: "a4-batch",
    title: "A4 single or batch",
    subtitle: "Office printer output",
    size: "210mm x 297mm",
    note: "Use for branch counters, merchant batch print, and archive packs."
  },
  {
    key: "a5-single",
    title: "A5 single or batch",
    subtitle: "Compact document print",
    size: "148mm x 210mm",
    note: "Good fallback for smaller office printers."
  }
];


export type DispatchJob = {
  code: string;
  merchant: string;
  township: string;
  service: string;
  pieces: number;
  codMmk: string;
  assignee: string;
  status: "Queued" | "Assigned" | "At Risk" | "Loaded";
};

export type DriverUnit = {
  id: string;
  name: string;
  vehicle: string;
  zone: "Zone A" | "Zone B" | "Zone C" | "Zone D";
  status: "On Route" | "Loading" | "Idle" | "Delayed";
  utilization: string;
  lastPing: string;
};

export type ChainEvent = {
  code: string;
  titleEn: string;
  titleMy: string;
  actor: string;
  place: string;
  time: string;
  status: "Completed" | "Active" | "Pending";
};

export type ManifestRow = {
  manifestNo: string;
  run: string;
  bags: number;
  pieces: number;
  branch: string;
  vehicle: string;
  status: "Ready to seal" | "In transfer" | "Awaiting receive" | "Closed";
};

export type BranchTransfer = {
  bagCode: string;
  from: string;
  to: string;
  seal: string;
  departure: string;
  arrival: string;
  status: "Loaded" | "In Transit" | "Received";
};

export const dispatchJobs: DispatchJob[] = [
  { code: "PICK-240326-091", merchant: "Mee Lay Fashion", township: "Kamayut / ကမာရွတ်", service: "Same Day", pieces: 12, codMmk: "2,950,000", assignee: "Van 1", status: "Assigned" },
  { code: "PICK-240326-103", merchant: "Shwe Nadi Cosmetics", township: "Botahtaung / ဗိုလ်တထောင်", service: "Next Day", pieces: 8, codMmk: "1,120,000", assignee: "Ahlone Rider", status: "Queued" },
  { code: "PICK-240326-118", merchant: "ABank VIP Campaign", township: "Zone B Cluster", service: "Batch Route", pieces: 68, codMmk: "0", assignee: "Driver Ko Thet", status: "Loaded" },
  { code: "PICK-240326-126", merchant: "North Dagon Pharmacy", township: "North Dagon / မြောက်ဒဂုံ", service: "COD Priority", pieces: 14, codMmk: "3,400,000", assignee: "HQ Rider 3", status: "At Risk" }
];

export const driverUnits: DriverUnit[] = [
  { id: "DRV-01", name: "Ko Thet Naing", vehicle: "Van - 3B/4421", zone: "Zone B", status: "On Route", utilization: "84%", lastPing: "2 min ago" },
  { id: "DRV-02", name: "Ko Kaung Myat", vehicle: "Van - 2K/1180", zone: "Zone C", status: "Loading", utilization: "61%", lastPing: "6 min ago" },
  { id: "RID-11", name: "Ma Ei Mon", vehicle: "Rider - Bike 11", zone: "Zone A", status: "On Route", utilization: "73%", lastPing: "35 sec ago" },
  { id: "RID-14", name: "Ko Sai Hein", vehicle: "Rider - Bike 14", zone: "Zone D", status: "Delayed", utilization: "90%", lastPing: "9 min ago" }
];

export const chainEvents: ChainEvent[] = [
  { code: "SCAN-01", titleEn: "Pickup scan", titleMy: "Pickup scan အတည်ပြု", actor: "Rider Ei Mon", place: "Merchant Counter - Kamayut", time: "08:12", status: "Completed" },
  { code: "SCAN-02", titleEn: "Origin branch received", titleMy: "မူလ branch လက်ခံပြီး", actor: "Yangon HQ sorter", place: "Yangon HQ", time: "08:44", status: "Completed" },
  { code: "SCAN-03", titleEn: "Bag sealed and loaded", titleMy: "Bag seal လုပ်ပြီး ယာဉ်တင်ထား", actor: "Dispatch supervisor", place: "Dispatch Gate 2", time: "09:05", status: "Active" },
  { code: "SCAN-04", titleEn: "Destination branch receive", titleMy: "သွားမည့် branch လက်ခံရန်စောင့်နေ", actor: "Mandalay Gateway", place: "Manifest lane", time: "13:40 ETA", status: "Pending" }
];

export const manifestRows: ManifestRow[] = [
  { manifestNo: "MF-YGN-B-240326-01", run: "Zone B ABank", bags: 6, pieces: 68, branch: "Yangon HQ", vehicle: "Van 1", status: "In transfer" },
  { manifestNo: "MF-YGN-A-240326-04", run: "Ahlone core bicycle", bags: 3, pieces: 35, branch: "Ahlone Branch", vehicle: "Rider pool", status: "Ready to seal" },
  { manifestNo: "MF-MDY-240326-02", run: "Mandalay intercity", bags: 10, pieces: 126, branch: "Mandalay Hub", vehicle: "Linehaul", status: "Awaiting receive" }
];

export const branchTransfers: BranchTransfer[] = [
  { bagCode: "BAG-YGN-240326-188", from: "Yangon HQ", to: "Ahlone Branch", seal: "SL-991884", departure: "09:20", arrival: "09:48", status: "Received" },
  { bagCode: "BAG-YGN-240326-204", from: "Yangon HQ", to: "Mandalay Gateway", seal: "SL-991902", departure: "10:15", arrival: "18:20 ETA", status: "In Transit" },
  { bagCode: "BAG-YGN-240326-219", from: "Yangon HQ", to: "Naypyitaw Gateway", seal: "SL-991955", departure: "10:42", arrival: "16:30 ETA", status: "Loaded" }
];

export const zoneStops = [
  { zone: "Zone A", color: "#2E7D32", count: 35, summary: "Ahlone core bicycle", townships: "Kyauktada, Pabedan, Lanmadaw" },
  { zone: "Zone B", color: "#1565C0", count: 68, summary: "Central-East van run", townships: "Kamayut, Bahan, Tamwe" },
  { zone: "Zone C", color: "#EF6C00", count: 41, summary: "North-West industrial", townships: "Mayangone, Hlaing, Insein" },
  { zone: "Zone D", color: "#C2185B", count: 12, summary: "High density rider overflow", townships: "Thingangyun, South Okkalapa" }
];
