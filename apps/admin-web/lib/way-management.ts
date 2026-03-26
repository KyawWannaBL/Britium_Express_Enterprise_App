import { createAdminClient } from "./admin-supabase";

export type WayManagementBoard = {
  mode: "live";
  branch: { id: string | null; code: string | null; latitude: number | null; longitude: number | null };
  summary: {
    activeShipments: number;
    activeAssignments: number;
    openManifests: number;
    activeTransfers: number;
  };
  dispatchRows: Array<{
    id: string;
    trackingNumber: string;
    customer: string;
    route: string;
    serviceType: string;
    status: string;
    codAmount: number;
    fee: number;
    assignedVehicle: string | null;
  }>;
  liveUnits: Array<{
    id: string;
    code: string;
    driverName: string;
    type: string;
    status: string;
    fuelLevel: number | null;
    branch: string | null;
    marker: number;
    latitude: number | null;
    longitude: number | null;
    lastSeenAt: string | null;
    speedKph: number | null;
  }>;
  chainRows: Array<{
    id: string;
    shipmentId: string;
    waybillId: string;
    scanType: string;
    scannerType: string;
    scannedAt: string;
    branchCode: string | null;
    latitude: number | null;
    longitude: number | null;
    codAmountMmks: number;
    metadata: Record<string, unknown>;
  }>;
  manifests: Array<{
    id: string;
    manifestNumber: string;
    status: string;
    bagCode: string | null;
    sealCode: string | null;
    totalShipments: number;
    totalCodMmks: number;
    destinationBranchCode: string | null;
  }>;
  transfers: Array<{
    id: string;
    transferNumber: string;
    transferStatus: string;
    bagCode: string | null;
    sealCode: string | null;
    shipmentCount: number;
    codTotalMmks: number;
    toBranchCode: string | null;
  }>;
  branchOptions: Array<{ id: string; code: string; label: string; latitude: number | null; longitude: number | null }>;
  vehicleOptions: Array<{ id: string; code: string; type: string; status: string }>;
};

export async function getWayManagementBoard(branchCode: string | null): Promise<WayManagementBoard> {
  const supabase = createAdminClient();
  let branchId: string | null = null;
  let normalizedBranch = branchCode?.trim().toUpperCase() ?? null;
  let branchLatitude: number | null = null;
  let branchLongitude: number | null = null;

  if (normalizedBranch) {
    const branchRes = await supabase
      .from("branches")
      .select("id, code, latitude, longitude")
      .eq("code", normalizedBranch)
      .maybeSingle();
    if (branchRes.data) {
      branchId = branchRes.data.id;
      normalizedBranch = branchRes.data.code;
      branchLatitude = branchRes.data.latitude ?? null;
      branchLongitude = branchRes.data.longitude ?? null;
    }
  }

  const summaryPromise = normalizedBranch
    ? supabase.from("branch_way_management_summary").select("*").eq("branch_code", normalizedBranch).maybeSingle()
    : Promise.resolve({ data: null, error: null } as any);

  const dispatchPromise = normalizedBranch
    ? supabase
        .from("shipments")
        .select("id, tracking_number, sender_name, recipient_name, origin_city, destination_city, service_type, status, cod_amount_mmks, quoted_fee_mmks")
        .eq("branch_id", branchId)
        .order("created_at", { ascending: false })
        .limit(18)
    : Promise.resolve({ data: [], error: null } as any);

  const assignmentsPromise = normalizedBranch
    ? supabase
        .from("dispatch_assignments")
        .select("shipment_id, assigned_vehicle_id, vehicles:assigned_vehicle_id (plate_number)")
        .eq("branch_id", branchId)
        .in("assignment_status", ["assigned", "accepted", "in_progress"])
    : Promise.resolve({ data: [], error: null } as any);

  const unitsPromise = normalizedBranch
    ? supabase
        .from("live_vehicle_positions")
        .select("id, plate_number, driver_name, vehicle_type, status, branch_code, latitude, longitude, last_seen_at, speed_kph")
        .eq("branch_code", normalizedBranch)
        .order("last_seen_at", { ascending: false })
        .limit(24)
    : Promise.resolve({ data: [], error: null } as any);

  const vehicleMetaPromise = normalizedBranch
    ? supabase
        .from("vehicles")
        .select("id, fuel_level")
        .eq("assigned_branch_id", branchId)
    : Promise.resolve({ data: [], error: null } as any);

  const scansPromise = normalizedBranch
    ? supabase
        .from("scan_events")
        .select("id, shipment_id, waybill_id, scan_type, scanner_type, scanned_at, branch_code, latitude, longitude, cod_amount_mmks, metadata")
        .eq("branch_code", normalizedBranch)
        .order("scanned_at", { ascending: false })
        .limit(24)
    : Promise.resolve({ data: [], error: null } as any);

  const manifestsPromise = normalizedBranch
    ? supabase
        .from("manifests")
        .select("id, manifest_number, status, bag_code, seal_code, total_shipments, total_cod_mmks, destination_branch:destination_branch_id (code)")
        .eq("branch_id", branchId)
        .order("created_at", { ascending: false })
        .limit(12)
    : Promise.resolve({ data: [], error: null } as any);

  const transfersPromise = normalizedBranch
    ? supabase
        .from("branch_transfers")
        .select("id, transfer_number, transfer_status, bag_code, seal_code, shipment_count, cod_total_mmks, to_branch:to_branch_id (code)")
        .eq("from_branch_id", branchId)
        .order("created_at", { ascending: false })
        .limit(12)
    : Promise.resolve({ data: [], error: null } as any);

  const branchOptionsPromise = supabase
    .from("branches")
    .select("id, code, name_en, latitude, longitude")
    .order("code", { ascending: true });

  const vehicleOptionsPromise = normalizedBranch
    ? supabase
        .from("vehicles")
        .select("id, plate_number, vehicle_type, status")
        .eq("assigned_branch_id", branchId)
        .order("plate_number", { ascending: true })
    : Promise.resolve({ data: [], error: null } as any);

  const [summaryRes, dispatchRes, assignmentsRes, unitsRes, vehicleMetaRes, scansRes, manifestsRes, transfersRes, branchOptionsRes, vehicleOptionsRes] = await Promise.all([
    summaryPromise,
    dispatchPromise,
    assignmentsPromise,
    unitsPromise,
    vehicleMetaPromise,
    scansPromise,
    manifestsPromise,
    transfersPromise,
    branchOptionsPromise,
    vehicleOptionsPromise
  ]);

  const vehicleMap = new Map<string, string | null>();
  for (const row of assignmentsRes.data ?? []) {
    vehicleMap.set(row.shipment_id, Array.isArray(row.vehicles) ? row.vehicles[0]?.plate_number ?? null : (row.vehicles as any)?.plate_number ?? null);
  }

  const fuelMap = new Map<string, number | null>();
  for (const row of vehicleMetaRes.data ?? []) {
    fuelMap.set(row.id, row.fuel_level ?? null);
  }

  return {
    mode: "live",
    branch: { id: branchId, code: normalizedBranch, latitude: branchLatitude, longitude: branchLongitude },
    summary: {
      activeShipments: Number((summaryRes.data as any)?.active_shipments ?? (dispatchRes.data?.length ?? 0)),
      activeAssignments: Number((summaryRes.data as any)?.active_assignments ?? 0),
      openManifests: Number((summaryRes.data as any)?.open_manifests ?? 0),
      activeTransfers: Number((summaryRes.data as any)?.active_transfers ?? 0)
    },
    dispatchRows: (dispatchRes.data ?? []).map((row: any) => ({
      id: row.id,
      trackingNumber: row.tracking_number,
      customer: row.sender_name,
      route: `${row.origin_city} → ${row.destination_city}`,
      serviceType: row.service_type,
      status: row.status,
      codAmount: Number(row.cod_amount_mmks ?? 0),
      fee: Number(row.quoted_fee_mmks ?? 0),
      assignedVehicle: vehicleMap.get(row.id) ?? null
    })),
    liveUnits: (unitsRes.data ?? []).map((row: any, index: number) => ({
      id: row.id,
      code: row.plate_number,
      driverName: row.driver_name ?? row.plate_number,
      type: row.vehicle_type,
      status: row.status,
      fuelLevel: fuelMap.get(row.id) ?? null,
      branch: row.branch_code ?? normalizedBranch,
      marker: index + 1,
      latitude: row.latitude ?? null,
      longitude: row.longitude ?? null,
      lastSeenAt: row.last_seen_at ?? null,
      speedKph: row.speed_kph ?? null
    })),
    chainRows: (scansRes.data ?? []).map((row: any) => ({
      id: row.id,
      shipmentId: row.shipment_id,
      waybillId: row.waybill_id,
      scanType: row.scan_type,
      scannerType: row.scanner_type,
      scannedAt: row.scanned_at,
      branchCode: row.branch_code ?? null,
      latitude: row.latitude ?? null,
      longitude: row.longitude ?? null,
      codAmountMmks: Number(row.cod_amount_mmks ?? 0),
      metadata: row.metadata ?? {}
    })),
    manifests: (manifestsRes.data ?? []).map((row: any) => ({
      id: row.id,
      manifestNumber: row.manifest_number,
      status: row.status,
      bagCode: row.bag_code ?? null,
      sealCode: row.seal_code ?? null,
      totalShipments: Number(row.total_shipments ?? 0),
      totalCodMmks: Number(row.total_cod_mmks ?? 0),
      destinationBranchCode: Array.isArray(row.destination_branch) ? row.destination_branch[0]?.code ?? null : row.destination_branch?.code ?? null
    })),
    transfers: (transfersRes.data ?? []).map((row: any) => ({
      id: row.id,
      transferNumber: row.transfer_number,
      transferStatus: row.transfer_status,
      bagCode: row.bag_code ?? null,
      sealCode: row.seal_code ?? null,
      shipmentCount: Number(row.shipment_count ?? 0),
      codTotalMmks: Number(row.cod_total_mmks ?? 0),
      toBranchCode: Array.isArray(row.to_branch) ? row.to_branch[0]?.code ?? null : row.to_branch?.code ?? null
    })),
    branchOptions: (branchOptionsRes.data ?? []).map((row: any) => ({
      id: row.id,
      code: row.code,
      label: `${row.code} · ${row.name_en}`,
      latitude: row.latitude ?? null,
      longitude: row.longitude ?? null
    })),
    vehicleOptions: (vehicleOptionsRes.data ?? []).map((row: any) => ({ id: row.id, code: row.plate_number, type: row.vehicle_type, status: row.status }))
  };
}

export function generateManifestNumber(branchCode: string) {
  return `MNF-${branchCode}-${new Date().toISOString().slice(0, 10).replace(/-/g, "")}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
}

export function generateTransferNumber(branchCode: string) {
  return `TRF-${branchCode}-${new Date().toISOString().slice(0, 10).replace(/-/g, "")}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
}
