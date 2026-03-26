import { createServerClient } from "./server-supabase";

type ShipmentRow = {
  id: string;
  tracking_number: string;
  sender_name: string;
  sender_phone: string | null;
  recipient_name: string;
  recipient_phone_e164: string;
  recipient_address: string | null;
  origin_city: string;
  destination_city: string;
  service_type: string;
  status: string;
  cod_amount_mmks: number;
  quoted_fee_mmks: number;
  weight: number | null;
  pieces: number;
  remarks: string | null;
  created_at: string;
};

type BranchRow = {
  id: string;
  code: string;
  name_en: string;
  name_my: string;
  city: string;
  township: string;
  is_active: boolean;
};

type VehicleRow = {
  id: string;
  plate_number: string;
  vehicle_type: string;
  status: string;
  fuel_level: number | null;
  current_location: Record<string, unknown>;
  assigned_branch_id: string | null;
};

type TaskRow = {
  id: string;
  title: string;
  priority: string;
  status: string;
  due_at: string | null;
  branch_id: string | null;
};

type ScanEventRow = {
  id: string;
  shipment_id: string;
  waybill_id: string;
  scan_type: string;
  scanner_type: string;
  scanned_at: string;
  branch_code: string | null;
};

type WaybillRow = {
  id: string;
  shipment_id: string;
  waybill_number: string;
  qr_payload: string;
  printed_count: number;
  last_printed_at: string | null;
};

function hasSupabaseEnv() {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
}

export async function getDashboardData() {
  if (!hasSupabaseEnv()) {
    return {
      mode: "mock" as const,
      shipments: [],
      branches: [],
      vehicles: [],
      tasks: [],
      scanEvents: [],
      waybills: []
    };
  }

  const supabase = createServerClient();

  const [shipmentsRes, branchesRes, vehiclesRes, tasksRes, scansRes, waybillsRes] = await Promise.all([
    supabase.from("shipments").select("*").order("created_at", { ascending: false }).limit(24),
    supabase.from("branches").select("*").order("code", { ascending: true }),
    supabase.from("vehicles").select("*").order("created_at", { ascending: false }).limit(24),
    supabase.from("tasks").select("*").order("created_at", { ascending: false }).limit(24),
    supabase.from("scan_events").select("*").order("scanned_at", { ascending: false }).limit(30),
    supabase.from("waybills").select("*").order("created_at", { ascending: false }).limit(24)
  ]);

  return {
    mode: "live" as const,
    shipments: (shipmentsRes.data ?? []) as ShipmentRow[],
    branches: (branchesRes.data ?? []) as BranchRow[],
    vehicles: (vehiclesRes.data ?? []) as VehicleRow[],
    tasks: (tasksRes.data ?? []) as TaskRow[],
    scanEvents: (scansRes.data ?? []) as ScanEventRow[],
    waybills: (waybillsRes.data ?? []) as WaybillRow[],
    errors: [
      shipmentsRes.error,
      branchesRes.error,
      vehiclesRes.error,
      tasksRes.error,
      scansRes.error,
      waybillsRes.error
    ].filter(Boolean).map((value) => String(value))
  };
}

export async function getCreateDeliveryData() {
  const data = await getDashboardData();
  const shipments = data.shipments.slice(0, 8);
  const recentCustomers = shipments.map((item) => ({
    code: item.tracking_number,
    name: item.sender_name,
    phone: item.sender_phone ?? "-",
    city: item.origin_city,
    shipments30d: 1,
    codMmk: item.cod_amount_mmks,
    status: item.status
  }));

  return {
    ...data,
    recentCustomers
  };
}

export async function getWayManagementData() {
  const data = await getDashboardData();

  const branchById = new Map(data.branches.map((branch) => [branch.id, branch]));
  const liveUnits = data.vehicles.map((vehicle, index) => ({
    id: vehicle.id,
    code: vehicle.plate_number,
    type: vehicle.vehicle_type,
    status: vehicle.status,
    fuelLevel: vehicle.fuel_level ?? null,
    branch: vehicle.assigned_branch_id ? branchById.get(vehicle.assigned_branch_id)?.code ?? "Unassigned" : "Unassigned",
    marker: index + 1
  }));

  const dispatchRows = data.shipments.slice(0, 10).map((shipment) => ({
    id: shipment.id,
    trackingNumber: shipment.tracking_number,
    customer: shipment.sender_name,
    route: `${shipment.origin_city} → ${shipment.destination_city}`,
    serviceType: shipment.service_type,
    status: shipment.status,
    codAmount: shipment.cod_amount_mmks,
    fee: shipment.quoted_fee_mmks
  }));

  const chainRows = data.scanEvents.slice(0, 12).map((event) => ({
    id: event.id,
    scanType: event.scan_type,
    scannerType: event.scanner_type,
    branchCode: event.branch_code ?? "-",
    scannedAt: event.scanned_at
  }));

  return {
    ...data,
    liveUnits,
    dispatchRows,
    chainRows
  };
}

export async function getFinancialReportData() {
  const data = await getDashboardData();

  const branchMap = new Map<string, {
    branch: string;
    bookedMmk: number;
    codMmk: number;
    settlementMmk: number;
    varianceMmk: number;
    shipmentCount: number;
  }>();

  for (const branch of data.branches) {
    branchMap.set(branch.id, {
      branch: branch.name_en,
      bookedMmk: 0,
      codMmk: 0,
      settlementMmk: 0,
      varianceMmk: 0,
      shipmentCount: 0
    });
  }

  for (const shipment of data.shipments) {
    const key = (shipment as ShipmentRow & { branch_id?: string | null }).branch_id ?? "";
    if (!branchMap.has(key)) {
      branchMap.set(key, {
        branch: shipment.origin_city,
        bookedMmk: 0,
        codMmk: 0,
        settlementMmk: 0,
        varianceMmk: 0,
        shipmentCount: 0
      });
    }
    const row = branchMap.get(key)!;
    row.bookedMmk += shipment.quoted_fee_mmks || 0;
    row.codMmk += shipment.cod_amount_mmks || 0;
    row.shipmentCount += 1;

    if (shipment.status === "delivered") {
      row.settlementMmk += shipment.cod_amount_mmks || 0;
    }
  }

  for (const row of branchMap.values()) {
    row.varianceMmk = row.codMmk - row.settlementMmk;
  }

  return {
    ...data,
    branchSummary: Array.from(branchMap.values()).sort((a, b) => b.codMmk - a.codMmk)
  };
}
export const sections = [
  {
    slug: "create-delivery",
    title: "Create Delivery",
    titleMy: "ပစ္စည်းပို့ရန်ဖန်တီးခြင်း",
    description: "Booking, address lookup, quote engine, waybill preview, and print.",
    status: "active",
    referencePages: [1, 2, 3, 4, 5, 6],
    tags: ["Booking", "Waybill", "Quote", "Pickup"]
  },
  {
    slug: "way-management",
    title: "Way Management",
    titleMy: "လမ်းကြောင်းစီမံခန့်ခွဲမှု",
    description: "Dispatch board, map routing, manifests, transfers, and scan events.",
    status: "active",
    referencePages: [7, 8, 9, 10, 11, 12],
    tags: ["Dispatch", "Mapbox", "Manifest", "Scan"]
  },
  {
    slug: "financial-reports",
    title: "Financial Reports",
    titleMy: "ငွေကြေးအစီရင်ခံစာများ",
    description: "COD, settlement, variance, branch finance, and reporting.",
    status: "active",
    referencePages: [13, 14, 15, 16],
    tags: ["Finance", "COD", "Settlement", "Report"]
  },
  {
    slug: "operator-management",
    title: "Operator Management",
    titleMy: "ဝန်ထမ်းခွင့်ပြုချက်စီမံခန့်ခွဲမှု",
    description: "Roles, branches, memberships, invite/reset actions, and audit logs.",
    status: "active",
    referencePages: [17, 18, 19, 20],
    tags: ["RBAC", "Invite", "Reset", "Audit"]
  }
];
