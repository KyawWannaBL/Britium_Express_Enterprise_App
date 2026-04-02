import * as XLSX from "xlsx";

export type WayPlanStop = {
  id: string;
  date: string;
  wayId: string;
  recipientName: string;
  township: string;
  address: string;
  phone1: string;
  phone2: string;
  paymentType: string;
  weightKg: number;
  weightCharge: number;
  itemPrice: number;
  deliveryCharge: number;
  total: number;
  riderName: string;
  driverName: string;
  helperName: string;
  carNo: string;
  remark: string;
  latitude: number | null;
  longitude: number | null;
  routeGroup: string;
  sequenceNo: number;
};

function toText(value: unknown): string {
  return String(value ?? "").trim();
}

function toNumber(value: unknown): number {
  const n = Number(String(value ?? "").replace(/,/g, "").trim());
  return Number.isFinite(n) ? n : 0;
}

export async function parseWayPlanWorkbook(file: File): Promise<WayPlanStop[]> {
  const buffer = await file.arrayBuffer();
  const workbook = XLSX.read(buffer, { type: "array" });
  const ws = workbook.Sheets[workbook.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json<unknown[]>(ws, {
    header: 1,
    defval: "",
    raw: false,
  });

  const out: WayPlanStop[] = [];

  for (let i = 3; i < rows.length; i++) {
    const row = rows[i] ?? [];
    const wayId = toText(row[2]);
    const recipientName = toText(row[3]);
    const township = toText(row[4]);
    const address = toText(row[5]);

    if (!wayId && !recipientName && !address) continue;

    const paymentType =
      toText(row[8]) ? "COD" :
      toText(row[9]) ? "PREPAID" :
      toText(row[10]) ? "ONLY_DELIVERY_CHARGES" :
      toText(row[11]) ? "GATE_DROP" :
      "";

    out.push({
      id: `stop-${i + 1}`,
      date: toText(row[1]),
      wayId,
      recipientName,
      township,
      address,
      phone1: toText(row[6]),
      phone2: toText(row[7]),
      paymentType,
      weightKg: toNumber(row[12]),
      weightCharge: toNumber(row[13]),
      itemPrice: toNumber(row[14]),
      deliveryCharge: toNumber(row[15]),
      total: toNumber(row[16]),
      riderName: toText(row[17]),
      driverName: toText(row[18]),
      helperName: toText(row[19]),
      carNo: toText(row[20]),
      remark: toText(row[21]),
      latitude: null,
      longitude: null,
      routeGroup: township || "Unassigned",
      sequenceNo: 0,
    });
  }

  return regroupStops(out, "township");
}

export function regroupStops(
  stops: WayPlanStop[],
  mode: "township" | "rider" | "car" | "payment"
): WayPlanStop[] {
  const copy = [...stops].map((s) => ({ ...s }));

  const groupValue = (s: WayPlanStop) => {
    if (mode === "rider") return s.riderName || "Unassigned Rider";
    if (mode === "car") return s.carNo || "Unassigned Car";
    if (mode === "payment") return s.paymentType || "Unassigned Payment";
    return s.township || "Unassigned Township";
  };

  copy.sort((a, b) => {
    const ga = groupValue(a).toLowerCase();
    const gb = groupValue(b).toLowerCase();
    if (ga !== gb) return ga.localeCompare(gb);
    return a.wayId.localeCompare(b.wayId);
  });

  const counters = new Map<string, number>();
  for (const stop of copy) {
    const group = groupValue(stop);
    const next = (counters.get(group) || 0) + 1;
    counters.set(group, next);
    stop.routeGroup = group;
    stop.sequenceNo = next;
  }

  return copy;
}

export function moveStopInGroup(
  stops: WayPlanStop[],
  stopId: string,
  direction: "up" | "down"
): WayPlanStop[] {
  const copy = [...stops].map((s) => ({ ...s }));
  const target = copy.find((s) => s.id === stopId);
  if (!target) return copy;

  const groupRows = copy
    .filter((s) => s.routeGroup === target.routeGroup)
    .sort((a, b) => a.sequenceNo - b.sequenceNo);

  const idx = groupRows.findIndex((s) => s.id === stopId);
  const swapIdx = direction === "up" ? idx - 1 : idx + 1;
  if (idx < 0 || swapIdx < 0 || swapIdx >= groupRows.length) return copy;

  const a = groupRows[idx];
  const b = groupRows[swapIdx];
  const temp = a.sequenceNo;
  a.sequenceNo = b.sequenceNo;
  b.sequenceNo = temp;

  return copy.sort((x, y) => {
    if (x.routeGroup !== y.routeGroup) return x.routeGroup.localeCompare(y.routeGroup);
    return x.sequenceNo - y.sequenceNo;
  });
}

export async function geocodeStops(
  stops: WayPlanStop[],
  token: string
): Promise<WayPlanStop[]> {
  const output: WayPlanStop[] = [];

  for (const stop of stops) {
    if (stop.latitude && stop.longitude) {
      output.push(stop);
      continue;
    }

    const query = [stop.address, stop.township, "Myanmar"].filter(Boolean).join(", ");
    if (!query) {
      output.push(stop);
      continue;
    }

    try {
      const url =
        `https://api.mapbox.com/search/geocode/v6/forward?q=${encodeURIComponent(query)}` +
        `&country=MM&limit=1&access_token=${encodeURIComponent(token)}`;

      const res = await fetch(url);
      const json = await res.json();
      const feature = json?.features?.[0];
      const coords = feature?.geometry?.coordinates;

      output.push({
        ...stop,
        longitude: Array.isArray(coords) ? Number(coords[0]) : null,
        latitude: Array.isArray(coords) ? Number(coords[1]) : null,
      });
    } catch {
      output.push(stop);
    }
  }

  return output;
}

export function downloadManifestWorkbook(stops: WayPlanStop[], filename = "Way_Plan_Manifest.xlsx") {
  const workbook = XLSX.utils.book_new();

  const rows = stops.map((s) => ({
    sequence_no: s.sequenceNo,
    route_group: s.routeGroup,
    way_id: s.wayId,
    recipient_name: s.recipientName,
    township: s.township,
    address: s.address,
    phone_1: s.phone1,
    phone_2: s.phone2,
    payment_type: s.paymentType,
    weight_kg: s.weightKg,
    item_price: s.itemPrice,
    delivery_charge: s.deliveryCharge,
    weight_charge: s.weightCharge,
    total: s.total,
    rider_name: s.riderName,
    driver_name: s.driverName,
    helper_name: s.helperName,
    car_no: s.carNo,
    remark: s.remark,
    latitude: s.latitude,
    longitude: s.longitude,
  }));

  const ws = XLSX.utils.json_to_sheet(rows);
  XLSX.utils.book_append_sheet(workbook, ws, "Manifest");
  XLSX.writeFile(workbook, filename);
}
